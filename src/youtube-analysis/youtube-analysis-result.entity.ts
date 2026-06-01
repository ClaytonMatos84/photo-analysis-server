import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';

@Entity('youtube_analysis_results')
export class YoutubeAnalysisResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'youtube_url', type: 'text' })
  youtubeUrl!: string;

  @Column({ name: 'video_id', type: 'varchar', nullable: true })
  videoId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({ name: 'length_seconds', type: 'varchar', nullable: true })
  lengthSeconds!: string | null;

  @Column({ name: 'channel_id', type: 'varchar', nullable: true })
  channelId!: string | null;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription!: string | null;

  @Column({ name: 'view_count', type: 'varchar', nullable: true })
  viewCount!: string | null;

  @Column({ type: 'varchar', nullable: true })
  author!: string | null;

  @Column({ name: 'is_live_content', type: 'boolean', default: false })
  isLiveContent!: boolean;

  @Column({ name: 'like_count', type: 'varchar', nullable: true })
  likeCount!: string | null;

  @Column({ type: 'varchar', nullable: true })
  category!: string | null;

  @Column({ name: 'owner_profile_url', type: 'text', nullable: true })
  ownerProfileUrl!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
