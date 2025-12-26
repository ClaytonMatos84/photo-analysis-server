import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';

@Entity('photo_analysis_results')
export class PhotoAnalysisResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'varchar', nullable: true })
  style: string | null;

  @Column({ type: 'varchar', nullable: true })
  feeling: string | null;

  @CreateDateColumn({
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
