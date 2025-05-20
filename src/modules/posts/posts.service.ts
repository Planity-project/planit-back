import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostHashtag } from './entities/postHashtags.entity';
import { PostImage } from './entities/postImage.entity';
import { Trip } from '../trips/entities/trips.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../location/entities/location.entity';
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
        'comments',
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

  async getAllPosts(): Promise<Post[]> {
    return await this.postRepository.find({
      relations: ['user', 'trip', 'location', 'images', 'hashtags'],
      order: { createdAt: 'DESC' }, // 최신순 정렬 (원하신다면)
    });
  }

  async getOnePosts(
    postId: number,
    userId: number,
  ): Promise<{ dayData: any; postData: any }> {
    console.log(postId, userId, 'getOnePosts');
    const result = await this.postRepository.findOne({
      where: { id: postId },
      relations: [
        'user',
        'trip',
        'location',
        'images',
        'hashtags',
        'comments',
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
        startTime: result.trip.tripDays[0].date, // 만약 Place에 시간 정보가 있다면
        endTime: result.trip.tripDays[result.trip.tripDays.length - 1].date,
        lat: place.lat,
        lng: place.lng,
      }));
    }

    const data = {
      id: result.id,
      createdAt: result.createdAt,
      startDate: result.trip.startDate,
      endDate: result.trip.endDate,
      title: result.trip.title,
      postTitle: result.title,
      comment: result.content,
      like: likeCheck ? true : false,
      likeCnt: result.likes.length,
      image: result.images,
      ...dayData,
    };

    return { dayData: data, postData: postData };
  }

  async createPostWithDetails(
    title: string,
    content: string,
    tripId: number,
    hashtags: string[],
    fileUrls: string[], // 예: 파일 저장 후 URL 배열
    userId: number,
  ): Promise<Post> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const trip = await this.tripRepository.findOneBy({ id: tripId });
    const location = await this.locationRepository.findOne({
      where: { name: trip?.title },
    });
    const post = new Post();
    if (!trip || !user || !location) {
      throw new BadRequestException(
        '해당 trip 혹은 user,location이 존재하지 않습니다.',
      );
    }
    post.title = title;
    post.content = content;
    post.user = user;
    post.trip = trip;
    post.location = location;
    // Post 저장 (id 확보)
    const savedPost = await this.postRepository.save(post);

    // 해시태그 저장
    const tags = hashtags.map((tag) => {
      const h = new PostHashtag();
      h.hashtag = tag;
      h.post = savedPost;
      return h;
    });
    await this.postHashtagRepository.save(tags);

    // 이미지 저장
    const images = fileUrls.map((url) => {
      const i = new PostImage();
      i.url = url;
      i.post = savedPost;
      return i;
    });
    await this.postImageRepository.save(images);

    return savedPost;
  }
}
