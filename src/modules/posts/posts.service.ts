import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostHashtag } from './entities/postHashtags.entity';
import { PostImage } from './entities/postImage.entity';
import { Trip } from '../trips/entities/trips.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../location/entities/location.entity';
import { Like } from '../like/entities/like.entity';
import { Notification } from '../notification/entities/notification.entity';

import { GetMyPostDto } from './dto/getMyPost.dto';
import { GetLikePostDto } from './dto/getLikesPost.dto';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(PostHashtag)
    private readonly postHashtagRepository: Repository<PostHashtag>,
    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async getPosts(id: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { user: { id } },
      relations: ['user', 'location'],
    });
  }

  async getDetail(
    postId: number,
  ): Promise<
    { result: boolean; post: Post } | { result: boolean; message: string }
  > {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: [
        'user',
        'location',
        'notification',
        'likes',
        'reports',
        'trip',
        'trip.tripDays',
        'trip.tripDays.scheduleItems',
        'trip.tripDays.place',
      ],
    });
    return post
      ? { result: true, post }
      : { result: false, message: '유효하지 않은 아이디입니다.' };
  }

  async getAllPosts(
    page = 1,
    limit = 4,
  ): Promise<{ items: Post[]; total: number }> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.postRepository.findAndCount({
      where: { type: true }, // 🔥 type === true 조건 추가
      relations: ['user', 'trip', 'location', 'images', 'hashtags'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  async getAllPostsTransformed(page = 1, limit = 4) {
    const { items, total } = await this.getAllPosts(page, limit);

    const itemsArr = items.map((post) => ({
      id: post.id,
      userid: post.user.id,
      nickName: post.user.nickname,
      title: post.title,
      img: post.images?.map((img) => img.url) ?? [],
      content: post.content,
      hashtag: [
        `#${post.trip?.title ?? '위치없음'}`,
        ...(post.hashtags?.map((tag) =>
          tag.hashtag.startsWith('#') ? tag.hashtag : `#${tag.hashtag}`,
        ) ?? []),
      ],
    }));

    return { items: itemsArr, total };
  }

  async getOnePosts(
    postId: number,
    userId: number,
  ): Promise<{ dayData: any; postData: any }> {
    const result = await this.postRepository.findOne({
      where: { id: postId },
      relations: [
        'user',
        'trip',
        'location',
        'images',
        'hashtags',
        'likes',
        'likes.user',
        'trip.tripDays',
        'trip.tripDays.scheduleItems',
        'trip.tripDays.place',
      ],
    });
    if (!result) {
      throw new BadRequestException('post를 찾을 수 없습니다.');
    }
    const likeCheck = result.likes.find((x) => x.user.id === userId);
    const postData = {
      id: result.id,
      titleImg: result.images[0]?.url ?? '/defaultImage.png',
      user: result.user.nickname,
      userImg: result.user.profile_img ?? '/defaultImage.png',
      like: likeCheck ? true : false,
      likeCnt: result.likes.length,
    };

    const dayData: Record<string, any[]> = {};
    for (const tripDay of result.trip.tripDays) {
      const dayKey = `day${tripDay.todayOrder}`;

      dayData[dayKey] = tripDay.place.map((place, i) => ({
        id: place.id,
        todayOrder: i + 1,
        name: place.name,
        category: place.category,
        image: place.image ?? '/defaultImage.png',
        startTime: tripDay.scheduleItems[i].startTime, // 만약 Place에 시간 정보가 있다면
        endTime: tripDay.scheduleItems[i].endTime,
        lat: place.lat,
        lng: place.lng,
        rating: place.rating,
        reviewCount: place.reviewCount,
      }));
    }

    const data = {
      id: result.id,
      userId: result.user.id,
      createdAt: result.createdAt,
      startDate: result.trip.startDate,
      endDate: result.trip.endDate,
      title: result.trip.title,
      postTitle: result.title,
      comment: result.content,
      like: likeCheck ? true : false,
      likeCnt: result.likes.length,
      image: result.images,
      type: result.type,
      ...dayData,
    };

    return { dayData: data, postData: postData };
  }

  async updatePostWithDetails(
    title: string,
    content: string,
    tripId: number,
    parsedHashtags: string[],
    fileUrls: string[], // 예: 파일 저장 후 URL 배열
    userId: number,
    rating: number,
  ): Promise<Post> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const trip = await this.tripRepository.findOne({
      where: { id: tripId },
      relations: ['post'],
    });

    if (!trip || !user) {
      console.error('❌ trip 또는 user가 존재하지 않음');
      throw new BadRequestException('해당 trip 또는 user가 존재하지 않습니다.');
    }

    const location = await this.locationRepository.findOne({
      where: { name: trip.title },
    });

    if (!location) {
      console.error('❌ location 찾을 수 없음');
      throw new BadRequestException('해당 location이 존재하지 않습니다.');
    }

    const PostData = await this.postRepository.findOne({
      where: { trip: { id: tripId } },
      relations: ['hashtags', 'images'],
    });

    if (!PostData) {
      console.error('❌ post를 찾을 수 없음');
      throw new BadRequestException(
        '해당 trip에 연결된 post가 존재하지 않습니다.',
      );
    }

    // ✏️ 업데이트
    PostData.title = title;
    PostData.content = content;
    PostData.user = user;
    PostData.trip = trip;
    PostData.location = location;
    PostData.type = true;
    PostData.rating = rating;

    await this.postHashtagRepository.remove(PostData.hashtags || []);
    await this.postImageRepository.remove(PostData.images || []);

    const updatedPost = await this.postRepository.save(PostData);
    const newHashtags = parsedHashtags.map((tag) => {
      const h = new PostHashtag();
      h.hashtag = tag;
      h.post = updatedPost;
      return h;
    });

    const newImages = fileUrls.map((url) => {
      const i = new PostImage();
      i.url = url;
      i.post = updatedPost;
      return i;
    });

    await this.postHashtagRepository.save(newHashtags);

    await this.postImageRepository.save(newImages);

    await this.notificationRepository.delete({ trip: { id: tripId } });

    return updatedPost;
  }

  async likePosts(userId: number): Promise<GetLikePostDto[]> {
    const likes = await this.likeRepository.find({
      where: {
        user: { id: userId },
        type: 'POST',
      },
      relations: ['post', 'post.user'],
    });

    return likes
      .filter((like): like is Like & { post: Post } => like.post !== null)
      .map((like) => ({
        userId: userId,
        postId: like.post.id,
        title: like.post.title,
        nickname: like.post.user.nickname,
      }));
  }

  async myPosts(userId: number): Promise<GetMyPostDto[]> {
    const posts = await this.postRepository.find({
      where: { user: { id: userId } },
      relations: ['trip'], // trip 정보 같이 조회
      order: { createdAt: 'DESC' },
    });

    return posts.map((post) => ({
      userId,
      postId: post.id,
      title: post.trip?.title,
      endDate: post.trip.endDate ? post.trip.endDate : null,
    }));
  }

  async deletePosts(id: number): Promise<boolean> {
    const result = await this.postRepository.delete(id);
    return result.affected !== 0; // 삭제된 row가 있다면 true
  }

  async statePost(postId: number, userId: number): Promise<boolean> {
    const likes = await this.likeRepository.find({
      where: {
        user: { id: userId },
        type: 'POST',
      },
      relations: ['post', 'post.user'],
    });

    const postCheck = likes.find((i) => i.post?.id === postId);

    if (postCheck) {
      return true;
    }
    return false;
  }
}
