import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EntityManager, Not, IsNull } from 'typeorm';
import { Like } from './entities/like.entity';
import { User } from '../user/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comment/entities/comment.entity';

@Injectable()
export class LikeService {
  constructor(private readonly entityManager: EntityManager) {}

  // ✅ 게시글 좋아요 토글
  async togglePostLike(
    userId: number,
    postId: number,
  ): Promise<{ liked: boolean }> {
    const existing = await this.entityManager.findOne(Like, {
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    if (existing) {
      await this.entityManager.remove(existing);
      return { liked: false };
    } else {
      const user = await this.findUserById(userId);
      const post = await this.findPostById(postId);
      const like = this.entityManager.create(Like, {
        user,
        post,
        target_type: 'post',
      });

      try {
        await this.entityManager.save(like);
        return { liked: true };
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('이미 좋아요한 소설입니다.');
        }
        throw error;
      }
    }
  }

  // ✅ 댓글 좋아요 토글
  async toggleCommentLike(
    userId: number,
    commentId: number,
  ): Promise<{ liked: boolean }> {
    const existing = await this.entityManager.findOne(Like, {
      where: {
        user: { id: userId },
        comment: { id: commentId },
      },
    });

    if (existing) {
      await this.entityManager.remove(existing);
      return { liked: false };
    } else {
      const user = await this.findUserById(userId);
      const comment = await this.findCommentById(commentId);
      const like = this.entityManager.create(Like, {
        user,
        comment,
        target_type: 'comment',
      });

      try {
        await this.entityManager.save(like);
        return { liked: true };
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('이미 좋아요한 댓글입니다.');
        }
        throw error;
      }
    }
  }

  // ✅ 게시글 좋아요 수
  async countPostLikes(postId: number): Promise<number> {
    return await this.entityManager.count(Like, {
      where: { post: { id: postId } },
    });
  }

  // ✅ 댓글 좋아요 수
  async countCommentLikes(commentId: number): Promise<number> {
    return await this.entityManager.count(Like, {
      where: { comment: { id: commentId } },
    });
  }

  // ✅ 내가 찜한 게시글 목록 조회
  async findLikedPosts(userId: number): Promise<any[]> {
    const likes = await this.entityManager.find(Like, {
      where: {
        user: { id: userId },
        post: Not(IsNull()),
      },
      relations: ['post'],
    });

    const posts = likes.map((like) => like.post).filter(Boolean) as Post[];

    return await Promise.all(
      posts.map(async (post) => {
        const likeCount = await this.countPostLikes(post.id);
        return {
          id: post.id,
          title: post.title,
          views: (post as any).views,
          created_at: post.createdAt,
          likes: likeCount,
        };
      }),
    );
  }

  // 📌 유저 조회
  private async findUserById(userId: number): Promise<User> {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }
    return user;
  }

  // 📌 게시글 조회
  private async findPostById(postId: number): Promise<Post> {
    const post = await this.entityManager.findOne(Post, {
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    return post;
  }

  // 📌 댓글 조회
  private async findCommentById(commentId: number): Promise<Comment> {
    const comment = await this.entityManager.findOne(Comment, {
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }
    return comment;
  }
}
