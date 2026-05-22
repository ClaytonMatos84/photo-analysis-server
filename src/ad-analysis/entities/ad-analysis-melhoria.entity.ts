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

@Entity('ad_analysis_melhoria')
@Index('idx_ad_analysis_melhoria_analysis_id', ['analysisId'])
@Index('idx_ad_analysis_melhoria_user_id', ['userId'])
export class AdAnalysisMelhoria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'analysis_id', type: 'varchar', length: 64 })
  analysisId!: string;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'principal_concorrente', type: 'text', nullable: true })
  principalConcorrente!: string | null;

  @Column({
    name: 'criterio_de_escolha_do_concorrente',
    type: 'text',
    nullable: true,
  })
  criterioDeEscolhaDoConcorrente!: string | null;

  @Column({ name: 'pontos_fortes_do_cliente', type: 'text', nullable: true })
  pontosFortesDoCliente!: string | null;

  @Column({ name: 'pontos_fortes_do_concorrente', type: 'text', nullable: true })
  pontosFortesDoConcorrente!: string | null;

  @Column({
    name: 'oportunidades_de_melhoria_para_o_cliente',
    type: 'text',
    nullable: true,
  })
  oportunidadesDeMelhoriaParaOCliente!: string | null;

  @Column({ name: 'mensagem', type: 'text', nullable: true })
  mensagem!: string | null;

  @Column({ name: 'elementos_visuais', type: 'text', nullable: true })
  elementosVisuais!: string | null;

  @Column({ name: 'tom_de_voz', type: 'text', nullable: true })
  tomDeVoz!: string | null;

  @Column({ name: 'call_to_action', type: 'text', nullable: true })
  callToAction!: string | null;

  @Column({ name: 'proposta_de_valor_reforcada', type: 'text', nullable: true })
  propostaDeValorReforcada!: string | null;

  @Column({
    name: 'exemplo_resumido_de_reformulacao',
    type: 'text',
    nullable: true,
  })
  exemploResumidoDeReformulacao!: string | null;

  @Column({ name: 'url', type: 'text', nullable: true })
  url!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
