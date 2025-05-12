import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  ManyToMany,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Album } from './album.entity';
@Entity('album_groups')
export class AlbumGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['FREE', 'PAID'], default: 'FREE' })
  type: string;

  @Column({ default: 0 })
  reportCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ['OWNER', 'MEMBER'],
    default: 'OWNER',
  })
  role: string;

  // 📚 관계 설정

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Album, (album) => album.groups)
  @JoinColumn({ name: 'albumId' })
  albums: Album;
}

// 앨범 사진 갯수(20장 까지는 무료 -> 아무나 결제(type), 결제 이후 무제한)
// 결제 -> 앨범 타이틀 아이콘 추가
// 20장 넘어가면 결제 창 띄워주기
// 멤버 삭제
// 링크 생성 후 앨범 초대(수락하기) 된 확인
// 링크 들어가면 '수락 하기'버튼 로그인x -> 로그인 페이지 or 모달 -> 로그인 후 -> 수락 페이지로 이동
