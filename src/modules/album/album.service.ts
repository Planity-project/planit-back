import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';

import { Album } from './entities/album.entity';
import { AlbumGroup } from './entities/albumGroup.entity';
import { AlbumImage } from './entities/albumImage';
import { User } from '../user/entities/user.entity';
import { Comment } from '../comment/entities/comment.entity';
import { AlbumPhotoDetailResponseDto } from './dto/getAlbumPhotoData.dto';
import { Like } from '../like/entities/like.entity';
import { Notification } from '../notification/entities/notification.entity';

import { NotificationService } from '../notification/notification.service';
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
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly notificationService: NotificationService,
  ) {}

  // 앨범 등록
  async submitAlbum(
    userId: number,
    title: string,
    inviteLink: string,
    fileUrl: string,
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
        titleImg: fileUrl,
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
    state: boolean;
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
      relations: [
        'groups',
        'groups.user',
        'images',
        'images.likes',
        'images.comments',
      ],
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
      likeCnt: img.likes.filter((l) => l.type === 'ALBUM').length ?? 0,
      commentCnt: img.comments.filter((c) => c.type === 'ALBUM').length ?? 0,
    }));

    return {
      link: [album.inviteLink],
      title: album.title,
      titleImg: album.titleImg || '/defaultImage.png',
      state: album.type === 'FREE' ? false : true,
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
  async findPaginated(page: number, limit: number, userId: number) {
    // 1) userId가 속한 그룹의 앨범들 찾기
    const albumGroups = await this.albumGroupRepository.find({
      where: { user: { id: userId } },
      relations: ['albums'],
    });
    const albumIds = albumGroups.map((group) => group.albums.id);

    if (albumIds.length === 0) {
      return { items: [], total: 0 };
    }

    // 2) albumIds로 페이징해서 앨범 조회
    const [items, total] = await this.albumRepository.findAndCount({
      where: { id: In(albumIds) },
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

  //앨범 이미지 상세 데이터
  async albumPhotoDetail(
    albumImageId: number,
    userId: number,
  ): Promise<AlbumPhotoDetailResponseDto> {
    const image = await this.albumImageRepository.findOne({
      where: { id: albumImageId },
      relations: [
        'album',
        'user',
        'likes',
        'likes.user',
        'comments',
        'comments.user',
        'comments.likes',
        'comments.likes.user',
        'comments.childComments',
        'comments.childComments.user',
        'comments.parentComments',
      ],
    });

    if (!image) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }

    const isLiked =
      image.likes?.some((l) => Number(l.user.id) === Number(userId)) || false;

    const parentComments =
      image.comments?.filter((c) => c.parentComments === null) || [];

    return {
      id: image.id,
      titleImg: image.images ?? [],
      user: image.user.nickname,
      userImg: image.user.profile_img ?? '/defaultImage.png',
      like: isLiked,
      likeCnt: image.likes?.length || 0,
      comment: parentComments.map((c) => ({
        id: c.id,
        userId: c.user.id,
        profileImg: c.user.profile_img ?? '/defaultImage.png',
        nickname: c.user.nickname,
        chat: c.content,
        likeCnt: c.likes?.length || 0,
        like:
          c.likes?.some(
            (l) => Number(l.user.id) === Number(userId) && l.type === 'COMMENT',
          ) || false,
        miniComment:
          c.childComments?.map((m) => ({
            userId: m.user.id,
            profileImg: m.user.profile_img ?? '/defaultImage.png',
            nickname: m.user.nickname,
            chat: m.content,
          })) || [],
      })),
    };
  }

  //앨범 그룹 강퇴
  async albumGroupDestroy(
    albumId: number,
    userId: number,
  ): Promise<{ result: boolean; message: string }> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['groups', 'groups.user'], // 👈 유저까지 불러옴
    });

    if (!album) {
      return { result: false, message: '앨범을 찾을 수 없습니다.' };
    }

    const targetGroup = album.groups.find((group) => group.user.id === userId);

    if (!targetGroup) {
      return {
        result: false,
        message: '해당 유저는 이 앨범에 속해 있지 않습니다.',
      };
    }

    if (targetGroup.role === 'OWNER') {
      return { result: false, message: '그룹장은 강퇴할 수 없습니다.' };
    }

    await this.notificationService.createNotification(
      targetGroup.user,
      `회원님은 앨범 "${album.title}"에서 강퇴되었습니다.`,
      'ALBUM',
      userId,
      album,
    );

    await this.albumGroupRepository.remove(targetGroup);

    return { result: true, message: '유저를 성공적으로 강퇴했습니다.' };
  }

  //앨범 그룹 사용자 권한 변경
  async albumDelegationRole(
    currentOwnerId: number,
    albumId: number,
    newOwnerId: number,
  ): Promise<{ result: boolean; message: string }> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['groups', 'groups.user'],
    });

    if (!album) {
      return { result: false, message: '앨범을 찾을 수 없습니다.' };
    }

    const currentOwnerGroup = album.groups.find(
      (group) => group.user.id === currentOwnerId && group.role === 'OWNER',
    );

    if (!currentOwnerGroup) {
      return {
        result: false,
        message: '현재 유저는 이 앨범의 OWNER가 아닙니다.',
      };
    }

    const newOwnerGroup = album.groups.find(
      (group) => group.user.id === newOwnerId,
    );

    if (!newOwnerGroup) {
      return {
        result: false,
        message: '새로운 유저가 이 앨범에 속해 있지 않습니다.',
      };
    }

    currentOwnerGroup.role = 'MEMBER';
    newOwnerGroup.role = 'OWNER';

    await this.albumGroupRepository.save([currentOwnerGroup, newOwnerGroup]);
    const newOwnerNickname = newOwnerGroup.user.nickname;
    const notifyText = `앨범 "${album.title}"의 소유자가 ${newOwnerNickname}님으로 변경되었습니다.`;
    console.log(notifyText, 'text');
    for (const group of album.groups) {
      await this.notificationService.createNotification(
        currentOwnerGroup.user, // sender: 현재 소유자
        notifyText,
        'ALBUM',
        group.user.id, // 각 구성원에게 알림
        album, // 관련 앨범 객체
      );
    }

    return { result: true, message: 'OWNER 권한이 성공적으로 위임되었습니다.' };
  }

  // 앨범 이미지 좋아요
  async albumLikesImage(
    userId: number,
    albumImageId: number,
  ): Promise<{ result: boolean; liked: boolean; message: string }> {
    const albumImage = await this.albumImageRepository.findOne({
      where: { id: albumImageId },
      relations: ['user'],
    });
    if (!albumImage) {
      return {
        result: false,
        liked: false,
        message: '앨범 이미지를 찾을 수 없습니다.',
      };
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return {
        result: false,
        liked: false,
        message: '유저를 찾을 수 없습니다.',
      };
    }

    // 이미 좋아요 했는지 확인
    const existingLike = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        albumImage: { id: albumImageId },
        type: 'ALBUM',
      },
      relations: ['user', 'albumImage'],
    });

    if (existingLike) {
      // 이미 좋아요 했다면 → 취소
      await this.likeRepository.remove(existingLike);
      return {
        result: true,
        liked: false,
        message: '좋아요가 취소되었습니다.',
      };
    } else {
      // 안했다면 → 좋아요 추가
      const newLike = this.likeRepository.create({
        type: 'ALBUM',
        user,
        albumImage,
      });
      await this.likeRepository.save(newLike);

      if (albumImage.user && albumImage.user.id !== user.id) {
        await this.notificationService.createNotification(
          user,
          `${user.nickname}님이 회원님의 게시글을 좋아합니다.`,
          'ALBUM',
          albumImage.user.id,
          albumImage,
        );
      }

      return { result: true, liked: true, message: '좋아요가 추가되었습니다.' };
    }
  }

  async inviteAlbumFind(invite: string): Promise<{
    id: number | undefined;
    title: string | undefined;
    titleImg: string | undefined;
    owner: string | undefined;
  }> {
    const data = await this.albumRepository.findOne({
      where: { inviteLink: invite },
      relations: ['user'],
    });
    const result = {
      id: data?.id,
      title: data?.title,
      titleImg: data?.titleImg,
      owner: data?.user.nickname,
    };
    return result;
  }

  async albumImageDelete(
    imageId: number,
  ): Promise<{ result: boolean; message: string }> {
    const deleteResult = await this.albumImageRepository.delete(imageId);

    if (deleteResult.affected && deleteResult.affected > 0) {
      return {
        result: true,
        message: '이미지가 성공적으로 삭제되었습니다.',
      };
    } else {
      return {
        result: false,
        message:
          '이미지 삭제에 실패했습니다. 해당 ID의 이미지가 존재하지 않습니다.',
      };
    }
  }

  async albumDelete(
    albumId: number,
  ): Promise<{ result: boolean; message: string }> {
    const deleteResult = await this.albumRepository.delete(albumId);

    if (deleteResult.affected && deleteResult.affected > 0) {
      return {
        result: true,
        message: '앨범이 성공적으로 삭제되었습니다.',
      };
    } else {
      return {
        result: false,
        message: '앨범 삭제에 실패했습니다. 해당 앨범ID가 존재하지 않습니다.',
      };
    }
  }

  async albumGroupJoinUser(
    userId: number,
    albumId: number,
  ): Promise<{ result: boolean; message: string; albumId?: number }> {
    // 1. 유저, 앨범 조회 (groups + groups.user 포함)
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['groups', 'groups.user'],
    });

    if (!user || !album) {
      return {
        result: false,
        message: '유저 또는 앨범을 찾을 수 없습니다.',
      };
    }

    // 2. 이미 그룹에 가입했는지 확인
    const existingGroup = await this.albumGroupRepository.findOne({
      where: {
        user: { id: userId },
        albums: { id: albumId },
      },
    });

    if (existingGroup) {
      return {
        result: false,
        message: '이미 그룹에 참여되어 있는 사용자입니다.',
      };
    }

    // 3. 새 그룹 멤버 생성 및 저장
    const newGroup = this.albumGroupRepository.create({
      user,
      albums: album,
      role: 'MEMBER',
      type: album.type,
    });

    await this.albumGroupRepository.save(newGroup);

    // 4. 저장 후, 최신 그룹 멤버 목록 다시 조회
    const updatedAlbum = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['groups', 'groups.user'],
    });

    if (!updatedAlbum) {
      return {
        result: false,
        message: '앨범 정보를 불러오는 데 실패했습니다.',
      };
    }

    // 5. 기존 그룹 멤버(가입한 사용자 제외)에게 알림 전송
    for (const group of updatedAlbum.groups) {
      const targetUser = group.user;
      if (targetUser && targetUser.id !== user.id) {
        await this.notificationService.createNotification(
          user,
          `${user.nickname}님이 ${album.title} 앨범에 참여했습니다.`,
          'ALBUM',
          targetUser.id,
          album,
        );
      }
    }

    // 6. 성공 응답 반환
    return {
      result: true,
      message: '그룹에 성공적으로 참여했습니다.',
      albumId: album.id,
    };
  }
}
