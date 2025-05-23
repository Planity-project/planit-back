import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Album } from './entities/album.entity';
import { AlbumGroup } from './entities/albumGroup.entity';
import { AlbumImage } from './entities/albumImage';
import { User } from '../user/entities/user.entity';
import { Comment } from '../comment/entities/comment.entity';
import { AlbumPhotoDetailResponseDto } from './dto/getAlbumPhotoData.dto';
import { Like } from '../like/entities/like.entity';
@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
    @InjectRepository(AlbumImage)
    private albumImageRepository: Repository<AlbumImage>,
    @InjectRepository(AlbumGroup)
    private albumGroupRepository: Repository<AlbumGroup>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
  ) {}

  // 앨범 등록
  async submitAlbum(
    userId: number,
    title: string,
    inviteLink: string,
  ): Promise<{ result: boolean; id: number }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('해당 유저를 찾을 수 없습니다.');
      }

      const album = this.albumRepository.create({
        user,
        title,
        inviteLink,
      });

      const savedAlbum = await this.albumRepository.save(album);

      const albumGroup = this.albumGroupRepository.create({
        user,
        albums: savedAlbum,
        role: 'OWNER',
        type: 'FREE', // 기본 값이므로 생략 가능하지만 명시 가능
        memberCount: 1,
      });

      await this.albumGroupRepository.save(albumGroup);

      return { result: true, id: savedAlbum.id };
    } catch (error) {
      console.error('앨범 생성 중 에러:', error);
      throw new Error('앨범 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // 앨범 찾기
  async findAll(): Promise<Album[]> {
    return await this.albumRepository.find();
  }

  // 앨범 디테일
  async findDetailData(albumId: number): Promise<{
    link: string[];
    title: string;
    titleImg: string;
    group: {
      id: number;
      userId: number;
      img: string;
      nickname: string;
      role: string;
    }[];
    image: {
      id: number;
      img: string;
      likeCnt: number;
      commentCnt: number;
    }[];
  }> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['groups', 'groups.user', 'images'],
    });

    if (!album) throw new NotFoundException('앨범을 찾을 수 없습니다');

    const group = album.groups.map((g) => ({
      id: g.id,
      userId: g.user.id,
      img: g.user.profile_img || '/defaultImage.png',
      nickname: g.user.nickname,
      role: g.role, // 'OWNER' → 'owner'
    }));

    const image = album.images.map((img) => ({
      id: img.id,
      img: img.images[0] || '/defaultImage.png', // 첫 번째 이미지 또는 기본값
      likeCnt: img.likeCnt ?? 0,
      commentCnt: img.commentCnt ?? 0,
    }));

    return {
      link: [album.inviteLink],
      title: album.title,
      titleImg: album.titleImg || '/defaultImage.png',
      group,
      image,
    };
  }

  // 앨범 그룹 목록
  async getAlbumList() {
    const groups = await this.albumGroupRepository.find({
      relations: ['user', 'albums', 'payments'],
      order: { createdAt: 'DESC' },
    });

    return groups.map((group) => ({
      id: group.id,
      album_title: group.albums?.title,
      leader: group.user?.nickname,
      is_paid: group.type === 'PAID',
      created_at: group.createdAt,
    }));
  }
  // 앨범 권한 확인
  async getAlbumRole(AlbumId: number, userId: number): Promise<string> {
    const albumGroup = await this.albumGroupRepository.findOne({
      where: {
        albums: { id: AlbumId },
        user: { id: userId },
      },
      relations: ['albums', 'user'],
    });

    if (!albumGroup) {
      throw new NotFoundException('해당 유저는 이 앨범에 속해있지 않습니다');
    }

    return albumGroup.role; // 'OWNER' 또는 'MEMBER'
  }

  //앨범 타이틀 정보 4개씩 전달
  async findPaginated(page: number, limit: number) {
    const [items, total] = await this.albumRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  //앨범 이미지 등록
  async albumSubmitImage(
    albumId: number,
    userId: number,
    fileArr: string[],
  ): Promise<boolean> {
    const albumImage = this.albumImageRepository.create({
      images: fileArr,
      album: { id: albumId }, // 관계만 연결
      user: { id: userId },
      likeCnt: 0,
      commentCnt: 0,
    });

    await this.albumImageRepository.save(albumImage);
    return true;
  }

  //앨범 대표 이미지 변경 or 타이틀 변경
  async albumUpdateHead(
    albumId: number,
    userId: number,
    fileUrl?: string | null,
    title?: string | null,
  ): Promise<{ result: boolean; message: string }> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId, user: { id: userId } },
    });

    if (!album) {
      return { result: false, message: '앨범을 찾을 수 없습니다.' };
    }

    // 아무것도 안 들어온 경우
    if (!fileUrl && (!title || title.trim().length === 0)) {
      return { result: false, message: '수정할 정보가 없습니다.' };
    }

    // title이 들어오면 수정
    if (title && title.trim().length > 0) {
      album.title = title.trim();
    }

    // fileUrl이 들어오면 수정
    if (fileUrl) {
      album.titleImg = fileUrl;
    }

    await this.albumRepository.save(album);
    return { result: true, message: '앨범이 성공적으로 업데이트되었습니다.' };
  }

  async albumPhotoDetail(
    albumImageId: number,
    userId: number,
  ): Promise<AlbumPhotoDetailResponseDto> {
    const image = await this.albumImageRepository.findOne({
      where: { id: albumImageId },
      relations: ['user'],
    });

    if (!image) throw new NotFoundException('이미지를 찾을 수 없습니다.');

    const comments = await this.commentRepository.find({
      where: {
        albumImage: { id: albumImageId },
        parentComments: IsNull(), // ✅ null 비교는 이렇게 해야 함
      },
      relations: ['user', 'childComments', 'childComments.user', 'likes'],
    });

    // 로그인한 유저가 이미지에 좋아요 눌렀는지
    const isLiked = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        albumImage: { id: albumImageId },
      },
    });

    return {
      id: image.id,
      titleImg: image.images,
      user: image.user.nickname,
      userImg: image.user.profile_img
        ? image.user.profile_img
        : '/defaultImage.png',
      like: !!isLiked,
      likeCnt: image.likes?.length || 0,
      comment: comments.map((c) => ({
        id: c.id,
        userId: c.user.id,
        profileImg: c.user.profile_img,
        nickname: c.user.nickname,
        chat: c.content,
        likeCnt: c.likes?.length || 0,
        like: c.likes?.some((l) => l.user.id === userId) || false,
        miniComment:
          c.childComments?.map((m) => ({
            userId: m.user.id,
            profileImg: m.user.profile_img,
            nickname: m.user.nickname,
            chat: m.content,
          })) || [],
      })),
    };
  }
}
