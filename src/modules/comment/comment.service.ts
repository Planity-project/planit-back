import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../user/entities/user.entity';
import { Report, TargetType } from '../reports/entities/report.entity';
import { AlbumImage } from '../album/entities/albumImage';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AlbumImage)
    private readonly albumImageRepository: Repository<AlbumImage>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  // 댓글 생성
  async createComment({
    userId,
    content,
    albumImageId,
    parentId,
  }: {
    userId: number;
    content: string;
    albumImageId?: number;
    parentId?: number;
  }) {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const albumImage = await this.albumImageRepository.findOneByOrFail({
      id: albumImageId,
    });
    const parent = parentId
      ? await this.commentRepository.findOneBy({ id: parentId })
      : null;

    const newComment = this.commentRepository.create({
      user,
      albumImage,
      content,
      parentComments: parent,
      type: 'ALBUM',
    });

    return await this.commentRepository.save(newComment);
  }

  // 댓글 조회
  async getComments(albumImageId: number, currentUserId?: number) {
    const rootComments = await this.commentRepository.find({
      where: {
        parentComments: IsNull(),
        albumImage: { id: albumImageId },
      },
      relations: [
        'user',
        'likes',
        'likes.user',
        'childComments',
        'childComments.user',
        'childComments.likes',
        'childComments.likes.user',
        'childComments.parentComments',
      ],
      order: { createdAt: 'ASC' },
    });

    const formatComment = (comment: Comment) => {
      const createdAt =
        comment.createdAt instanceof Date
          ? comment.createdAt.toISOString()
          : null;

      const isLikedByUser = currentUserId
        ? comment.likes?.some((like) => like.user?.id === currentUserId)
        : false;

      return {
        id: comment.id,
        writer: comment.user?.nickname ?? comment.user?.email ?? '익명',
        writerId: comment.user?.id ?? null,
        comment: comment.content,
        date: createdAt,
        likeNum: comment.likes?.length ?? 0,
        isliked: isLikedByUser,
        parentId: comment.parentComments?.id ?? null,
      };
    };

    return rootComments.flatMap((root) => {
      const rootFormatted = formatComment(root);
      const childFormatted = (root.childComments ?? []).map(formatComment);
      return [rootFormatted, ...childFormatted];
    });
  }

  // 댓글 삭제
  async deleteComment(id: number, userId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['childComments', 'user'],
    });

    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    if (comment.user.id !== userId) {
      throw new Error('본인의 댓글만 삭제할 수 있습니다.');
    }

    if (comment.childComments?.length) {
      await this.commentRepository.remove(comment.childComments);
    }

    await this.commentRepository.remove(comment);
    return { message: '댓글 및 대댓글이 삭제되었습니다.' };
  }

  // 댓글 신고
  async reportComment(commentId: number, userId: number, reason: string) {
    const alreadyReported = await this.reportRepository.findOne({
      where: {
        reporter: { id: userId },
        target_type: TargetType.COMMENT,
        target_id: commentId,
      },
    });

    if (alreadyReported) {
      throw new Error('이미 신고한 댓글입니다.');
    }

    const reporter = await this.userRepository.findOneByOrFail({ id: userId });

    const report = this.reportRepository.create({
      reporter,
      target_type: TargetType.COMMENT,
      target_id: commentId,
      reason,
    });

    await this.reportRepository.save(report);

    return { message: '댓글 신고가 접수되었습니다.' };
  }

  async findByUser(userId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { user: { id: userId } },
      relations: ['albumImage'],
      order: { createdAt: 'DESC' },
    });
  }
}
