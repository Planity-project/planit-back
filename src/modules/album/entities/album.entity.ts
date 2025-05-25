import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { AlbumGroup } from './albumGroup.entity';
import { AlbumImage } from './albumImage';
import { Notification } from 'src/modules/notification/entities/notification.entity';

@Entity('albums')
export class Album {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  @Column({ nullable: true })
  titleImg: string | undefined;

  @ApiProperty({ example: '제주도 여행 앨범', nullable: true })
  @Column({ type: 'text', nullable: true })
  title: string;

  @ApiProperty({ example: '2025-05-22T12:34:56.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '초대링크', nullable: true })
  @Column({ nullable: true })
  inviteLink: string;

  @ApiProperty({ enum: ['FREE', 'PAID'], example: 'FREE' })
  @Column({ type: 'enum', enum: ['FREE', 'PAID'], default: 'FREE' })
  type: string;

  // 📚 관계 설정

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.albums, { onDelete: 'CASCADE' })
  user: User;

  @ApiProperty({ type: () => [AlbumGroup] })
  @OneToMany(() => AlbumGroup, (group) => group.albums)
  groups: AlbumGroup[];

  @ApiProperty({ type: () => [AlbumImage] })
  @OneToMany(() => AlbumImage, (image) => image.album)
  images: AlbumImage[];

  @ApiProperty({ type: () => [Notification] })
  @OneToMany(() => Notification, (notification) => notification.album)
  notifications: Notification[];
}
