import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { DataSource, In, Repository } from 'typeorm';
import { AdAnalysisComparador } from './entities/ad-analysis-comparador.entity';
import { AdAnalysisEstrategia } from './entities/ad-analysis-estrategia.entity';
import { AdAnalysisMelhoria } from './entities/ad-analysis-melhoria.entity';
import {
  AdAnalysisExecutionResult,
  AdAnalysisResponseService,
  PaginatedAdAnalysisResultsDto,
} from './types';

export interface SavedAdAnalysisEntities {
  comparador: AdAnalysisComparador;
  estrategia: AdAnalysisEstrategia;
  melhoria: AdAnalysisMelhoria;
}

interface MappedComparadorData {
  marcaAnalisada: string | null;
  resumoPosicionamentoMarca: string | null;
  quantidadeConcorrentes: number;
  forcasDaMarca: string | null;
  fraquezasDaMarca: string | null;
  oportunidadesDeMercado: string | null;
  ameacas: string | null;
  insightFinal: string | null;
}

interface MappedEstrategiaData {
  posicionamentoSugerido: string | null;
  propostaDeValorReforcada: string | null;
  mensagemPrincipal: string | null;
  tomDeVozSugerido: string | null;
}

interface MappedMelhoriaData {
  principalConcorrente: string | null;
  criterioDeEscolhaDoConcorrente: string | null;
  pontosFortesDoCliente: string | null;
  pontosFortesDoConcorrente: string | null;
  oportunidadesDeMelhoriaParaOCliente: string | null;
  mensagem: string | null;
  elementosVisuais: string | null;
  tomDeVoz: string | null;
  callToAction: string | null;
  propostaDeValorReforcada: string | null;
  exemploResumidoDeReformulacao: string | null;
  url: string | null;
}

export interface AdAnalysisPayloadValidation {
  isComparadorValid: boolean;
  isEstrategiaValid: boolean;
  isMelhoriaValid: boolean;
  isValid: boolean;
}

@Injectable()
export class AdAnalysisResultService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AdAnalysisComparador)
    private readonly comparadorRepository: Repository<AdAnalysisComparador>,
    @InjectRepository(AdAnalysisEstrategia)
    private readonly estrategiaRepository: Repository<AdAnalysisEstrategia>,
    @InjectRepository(AdAnalysisMelhoria)
    private readonly melhoriaRepository: Repository<AdAnalysisMelhoria>,
    @InjectPinoLogger(AdAnalysisResultService.name)
    private readonly logger: PinoLogger,
  ) {}

  async saveFromAnalysisResponse(
    userId: number,
    analysisId: string,
    response: AdAnalysisResponseService,
  ): Promise<SavedAdAnalysisEntities> {
    this.logger.info(
      { userId, analysisId },
      'Saving ad analysis response to database',
    );

    const comparadorData = this.mapComparadorData(response);
    const estrategiaData = this.mapEstrategiaData(response);
    const melhoriaData = this.mapMelhoriaData(response);

    return this.dataSource.transaction(async (manager) => {
      const comparador = manager.create(AdAnalysisComparador, {
        analysisId,
        userId,
        ...comparadorData,
      });

      const estrategia = manager.create(AdAnalysisEstrategia, {
        analysisId,
        userId,
        ...estrategiaData,
      });

      const melhoria = manager.create(AdAnalysisMelhoria, {
        analysisId,
        userId,
        ...melhoriaData,
      });

      const savedComparador = await manager.save(comparador);
      const savedEstrategia = await manager.save(estrategia);
      const savedMelhoria = await manager.save(melhoria);

      this.logger.info(
        {
          userId,
          analysisId,
          comparadorId: savedComparador.id,
          estrategiaId: savedEstrategia.id,
          melhoriaId: savedMelhoria.id,
        },
        'Ad analysis response saved successfully',
      );

      return {
        comparador: savedComparador,
        estrategia: savedEstrategia,
        melhoria: savedMelhoria,
      };
    });
  }

  validateResponseForSave(
    response: AdAnalysisResponseService,
  ): AdAnalysisPayloadValidation {
    const comparadorData = this.mapComparadorData(response);
    const estrategiaData = this.mapEstrategiaData(response);
    const melhoriaData = this.mapMelhoriaData(response);

    const isComparadorValid =
      this.hasAnyTextValue([
        comparadorData.marcaAnalisada,
        comparadorData.resumoPosicionamentoMarca,
        comparadorData.forcasDaMarca,
        comparadorData.fraquezasDaMarca,
        comparadorData.oportunidadesDeMercado,
        comparadorData.ameacas,
        comparadorData.insightFinal,
      ]) || comparadorData.quantidadeConcorrentes > 0;

    const isEstrategiaValid = this.hasAnyTextValue([
      estrategiaData.posicionamentoSugerido,
      estrategiaData.propostaDeValorReforcada,
      estrategiaData.mensagemPrincipal,
      estrategiaData.tomDeVozSugerido,
    ]);

    const isMelhoriaValid = this.hasAnyTextValue([
      melhoriaData.principalConcorrente,
      melhoriaData.criterioDeEscolhaDoConcorrente,
      melhoriaData.pontosFortesDoCliente,
      melhoriaData.pontosFortesDoConcorrente,
      melhoriaData.oportunidadesDeMelhoriaParaOCliente,
      melhoriaData.mensagem,
      melhoriaData.elementosVisuais,
      melhoriaData.tomDeVoz,
      melhoriaData.callToAction,
      melhoriaData.propostaDeValorReforcada,
      melhoriaData.exemploResumidoDeReformulacao,
      melhoriaData.url,
    ]);

    return {
      isComparadorValid,
      isEstrategiaValid,
      isMelhoriaValid,
      isValid: isComparadorValid && isEstrategiaValid && isMelhoriaValid,
    };
  }

  async findByUserIdPaginated(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedAdAnalysisResultsDto> {
    this.logger.info(
      { userId, page, limit },
      'Finding ad analysis results by user with pagination',
    );

    const skip = (page - 1) * limit;

    const [comparadores, total] = await this.comparadorRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    if (comparadores.length === 0) {
      return {
        data: [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    const analysisIds = comparadores.map((comparador) => comparador.analysisId);

    const [estrategias, melhorias] = await Promise.all([
      this.estrategiaRepository.find({
        where: {
          userId,
          analysisId: In(analysisIds),
        },
      }),
      this.melhoriaRepository.find({
        where: {
          userId,
          analysisId: In(analysisIds),
        },
      }),
    ]);

    const estrategiasByAnalysisId = new Map(
      estrategias.map((estrategia) => [estrategia.analysisId, estrategia]),
    );
    const melhoriasByAnalysisId = new Map(
      melhorias.map((melhoria) => [melhoria.analysisId, melhoria]),
    );

    const data = comparadores.flatMap((comparador) => {
      const estrategia = estrategiasByAnalysisId.get(comparador.analysisId);
      const melhoria = melhoriasByAnalysisId.get(comparador.analysisId);

      if (!estrategia || !melhoria) {
        this.logger.warn(
          {
            userId,
            analysisId: comparador.analysisId,
            hasEstrategia: Boolean(estrategia),
            hasMelhoria: Boolean(melhoria),
          },
          'Incomplete ad analysis entities found; skipping result',
        );
        return [];
      }

      return [this.toExecutionResult(comparador, estrategia, melhoria)];
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByAnalysisIdForUser(
    userId: number,
    analysisId: string,
  ): Promise<AdAnalysisExecutionResult | null> {
    this.logger.info({ userId, analysisId }, 'Finding ad analysis result by analysisId');

    const [comparador, estrategia, melhoria] = await Promise.all([
      this.comparadorRepository.findOne({
        where: { userId, analysisId },
      }),
      this.estrategiaRepository.findOne({
        where: { userId, analysisId },
      }),
      this.melhoriaRepository.findOne({
        where: { userId, analysisId },
      }),
    ]);

    if (!comparador || !estrategia || !melhoria) {
      return null;
    }

    return this.toExecutionResult(comparador, estrategia, melhoria);
  }

  private normalizeText(value?: string | null): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private countCompetitors(response: AdAnalysisResponseService): number {
    const competitors = response.comparador?.comparativo_concorrentes;
    return Array.isArray(competitors) ? competitors.length : 0;
  }

  private hasAnyTextValue(values: Array<string | null>): boolean {
    return values.some((value) => Boolean(value));
  }

  private mapComparadorData(
    response: AdAnalysisResponseService,
  ): MappedComparadorData {
    return {
      marcaAnalisada: this.normalizeText(response.comparador?.marca_analisada),
      resumoPosicionamentoMarca: this.normalizeText(
        response.comparador?.resumo_posicionamento_marca,
      ),
      quantidadeConcorrentes: this.countCompetitors(response),
      forcasDaMarca: this.normalizeText(
        response.comparador?.analise_geral?.forcas_da_marca,
      ),
      fraquezasDaMarca: this.normalizeText(
        response.comparador?.analise_geral?.fraquezas_da_marca,
      ),
      oportunidadesDeMercado: this.normalizeText(
        response.comparador?.analise_geral?.oportunidades_de_mercado,
      ),
      ameacas: this.normalizeText(response.comparador?.analise_geral?.ameacas),
      insightFinal: this.normalizeText(response.comparador?.insight_final),
    };
  }

  private mapEstrategiaData(
    response: AdAnalysisResponseService,
  ): MappedEstrategiaData {
    return {
      posicionamentoSugerido: this.normalizeText(
        response.estrategia?.estrategia_recomendada?.posicionamento_sugerido,
      ),
      propostaDeValorReforcada: this.normalizeText(
        response.estrategia?.estrategia_recomendada?.[
          'proposta_de_valor_refor\u00e7ada'
        ],
      ),
      mensagemPrincipal: this.normalizeText(
        response.estrategia?.estrategia_recomendada?.mensagem_principal,
      ),
      tomDeVozSugerido: this.normalizeText(
        response.estrategia?.estrategia_recomendada?.tom_de_voz_sugerido,
      ),
    };
  }

  private mapMelhoriaData(response: AdAnalysisResponseService): MappedMelhoriaData {
    return {
      principalConcorrente: this.normalizeText(
        response.melhoria?.principal_concorrente,
      ),
      criterioDeEscolhaDoConcorrente: this.normalizeText(
        response.melhoria?.criterio_de_escolha_do_concorrente,
      ),
      pontosFortesDoCliente: this.normalizeText(
        response.melhoria?.comparativo_entre_anuncios?.pontos_fortes_do_cliente,
      ),
      pontosFortesDoConcorrente: this.normalizeText(
        response.melhoria?.comparativo_entre_anuncios
          ?.pontos_fortes_do_concorrente,
      ),
      oportunidadesDeMelhoriaParaOCliente: this.normalizeText(
        response.melhoria?.comparativo_entre_anuncios
          ?.oportunidades_de_melhoria_para_o_cliente,
      ),
      mensagem: this.normalizeText(response.melhoria?.sugestoes_de_melhoria?.mensagem),
      elementosVisuais: this.normalizeText(
        response.melhoria?.sugestoes_de_melhoria?.elementos_visuais,
      ),
      tomDeVoz: this.normalizeText(
        response.melhoria?.sugestoes_de_melhoria?.tom_de_voz,
      ),
      callToAction: this.normalizeText(
        response.melhoria?.sugestoes_de_melhoria?.call_to_action,
      ),
      propostaDeValorReforcada: this.normalizeText(
        response.melhoria?.sugestoes_de_melhoria?.[
          'proposta_de_valor_refor\u00e7ada'
        ],
      ),
      exemploResumidoDeReformulacao: this.normalizeText(
        response.melhoria?.sugestoes_de_melhoria
          ?.exemplo_resumido_de_reformulacao,
      ),
      url: this.normalizeText(response.melhoria?.url),
    };
  }

  private toExecutionResult(
    comparador: AdAnalysisComparador,
    estrategia: AdAnalysisEstrategia,
    melhoria: AdAnalysisMelhoria,
  ): AdAnalysisExecutionResult {
    return {
      analysisId: comparador.analysisId,
      dataAnalise: comparador.createdAt,
      comparador: {
        marcaAnalisada: comparador.marcaAnalisada,
        resumoPosicionamentoMarca: comparador.resumoPosicionamentoMarca,
        quantidadeConcorrentes: comparador.quantidadeConcorrentes,
        forcasDaMarca: comparador.forcasDaMarca,
        fraquezasDaMarca: comparador.fraquezasDaMarca,
        oportunidadesDeMercado: comparador.oportunidadesDeMercado,
        ameacas: comparador.ameacas,
        insightFinal: comparador.insightFinal,
        createdAt: comparador.createdAt,
      },
      estrategia: {
        posicionamentoSugerido: estrategia.posicionamentoSugerido,
        propostaDeValorReforcada: estrategia.propostaDeValorReforcada,
        mensagemPrincipal: estrategia.mensagemPrincipal,
        tomDeVozSugerido: estrategia.tomDeVozSugerido,
        createdAt: estrategia.createdAt,
      },
      melhoria: {
        principalConcorrente: melhoria.principalConcorrente,
        criterioDeEscolhaDoConcorrente: melhoria.criterioDeEscolhaDoConcorrente,
        pontosFortesDoCliente: melhoria.pontosFortesDoCliente,
        pontosFortesDoConcorrente: melhoria.pontosFortesDoConcorrente,
        oportunidadesDeMelhoriaParaOCliente:
          melhoria.oportunidadesDeMelhoriaParaOCliente,
        mensagem: melhoria.mensagem,
        elementosVisuais: melhoria.elementosVisuais,
        tomDeVoz: melhoria.tomDeVoz,
        callToAction: melhoria.callToAction,
        propostaDeValorReforcada: melhoria.propostaDeValorReforcada,
        exemploResumidoDeReformulacao: melhoria.exemploResumidoDeReformulacao,
        url: melhoria.url,
        createdAt: melhoria.createdAt,
      },
    };
  }
}
