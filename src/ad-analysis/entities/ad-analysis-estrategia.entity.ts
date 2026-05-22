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

@Entity('ad_analysis_estrategia')
@Index('idx_ad_analysis_estrategia_analysis_id', ['analysisId'])
@Index('idx_ad_analysis_estrategia_user_id', ['userId'])
export class AdAnalysisEstrategia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'analysis_id', type: 'varchar', length: 64 })
  analysisId!: string;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'posicionamento_sugerido', type: 'text', nullable: true })
  posicionamentoSugerido!: string | null;

  @Column({ name: 'proposta_de_valor_reforcada', type: 'text', nullable: true })
  propostaDeValorReforcada!: string | null;

  @Column({ name: 'mensagem_principal', type: 'text', nullable: true })
  mensagemPrincipal!: string | null;

  @Column({ name: 'tom_de_voz_sugerido', type: 'text', nullable: true })
  tomDeVozSugerido!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
