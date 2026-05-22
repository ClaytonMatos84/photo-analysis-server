import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../auth/user.entity';

@Entity('ad_analysis_comparador')
@Index('idx_ad_analysis_comparador_analysis_id', ['analysisId'])
@Index('idx_ad_analysis_comparador_user_id', ['userId'])
export class AdAnalysisComparador {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'analysis_id', type: 'varchar', length: 64 })
  analysisId!: string;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'marca_analisada', type: 'text', nullable: true })
  marcaAnalisada!: string | null;

  @Column({ name: 'resumo_posicionamento_marca', type: 'text', nullable: true })
  resumoPosicionamentoMarca!: string | null;

  @Column({ name: 'quantidade_concorrentes', type: 'integer', default: 0 })
  quantidadeConcorrentes!: number;

  @Column({ name: 'forcas_da_marca', type: 'text', nullable: true })
  forcasDaMarca!: string | null;

  @Column({ name: 'fraquezas_da_marca', type: 'text', nullable: true })
  fraquezasDaMarca!: string | null;

  @Column({ name: 'oportunidades_de_mercado', type: 'text', nullable: true })
  oportunidadesDeMercado!: string | null;

  @Column({ name: 'ameacas', type: 'text', nullable: true })
  ameacas!: string | null;

  @Column({ name: 'insight_final', type: 'text', nullable: true })
  insightFinal!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
