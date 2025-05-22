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

  // 댓글 생성 + 총 댓글 수 반환
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

    const savedComment = await this.commentRepository.save(newComment);

    // 댓글 수 카운트
    const totalCount = await this.commentRepository.count({
      where: { albumImage: { id: albumImageId } },
    });

    return {
      comment: savedComment,
      totalCount,
    };
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

  async findByUser(userId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { user: { id: userId } },
      relations: ['albumImage'],
      order: { createdAt: 'DESC' },
    });
  }
}
