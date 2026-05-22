import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { AdAnalysisClient } from './ad-analysis.client';
import { AdAnalysisResultService } from './ad-analysis-result.service';
import { AdAnalysisExecutionResult } from './types';

@Injectable()
export class AdAnalysisService {
  private readonly client: AdAnalysisClient;

  constructor(
    private readonly resultService: AdAnalysisResultService,
    @InjectPinoLogger(AdAnalysisService.name)
    private readonly logger: PinoLogger,
  ) {
    this.client = new AdAnalysisClient(undefined, this.logger);
  }

  async analyzeByImageUrl(
    userId: number,
    imageUrl: string,
  ): Promise<AdAnalysisExecutionResult> {
    const analysisId = randomUUID();
    this.logger.info(
      { userId, imageUrl, analysisId },
      'Starting ad analysis by image URL',
    );

    const response = await this.client.analyzeAdByImageUrl(imageUrl);
    const validation = this.resultService.validateResponseForSave(response);

    if (!validation.isValid) {
      this.logger.error(
        {
          userId,
          imageUrl,
          analysisId,
          validation,
        },
        'Upstream ad analysis payload is incomplete; skipping save',
      );
      throw new BadGatewayException(
        'Resposta de analise invalida: comparador, estrategia e melhoria devem conter dados.',
      );
    }

    const saved = await this.resultService.saveFromAnalysisResponse(
      userId,
      analysisId,
      response,
    );

    return {
      analysisId,
      dataAnalise: saved.comparador.createdAt,
      comparador: {
        marcaAnalisada: saved.comparador.marcaAnalisada,
        resumoPosicionamentoMarca: saved.comparador.resumoPosicionamentoMarca,
        quantidadeConcorrentes: saved.comparador.quantidadeConcorrentes,
        forcasDaMarca: saved.comparador.forcasDaMarca,
        fraquezasDaMarca: saved.comparador.fraquezasDaMarca,
        oportunidadesDeMercado: saved.comparador.oportunidadesDeMercado,
        ameacas: saved.comparador.ameacas,
        insightFinal: saved.comparador.insightFinal,
        createdAt: saved.comparador.createdAt,
      },
      estrategia: {
        posicionamentoSugerido: saved.estrategia.posicionamentoSugerido,
        propostaDeValorReforcada: saved.estrategia.propostaDeValorReforcada,
        mensagemPrincipal: saved.estrategia.mensagemPrincipal,
        tomDeVozSugerido: saved.estrategia.tomDeVozSugerido,
        createdAt: saved.estrategia.createdAt,
      },
      melhoria: {
        principalConcorrente: saved.melhoria.principalConcorrente,
        criterioDeEscolhaDoConcorrente:
          saved.melhoria.criterioDeEscolhaDoConcorrente,
        pontosFortesDoCliente: saved.melhoria.pontosFortesDoCliente,
        pontosFortesDoConcorrente: saved.melhoria.pontosFortesDoConcorrente,
        oportunidadesDeMelhoriaParaOCliente:
          saved.melhoria.oportunidadesDeMelhoriaParaOCliente,
        mensagem: saved.melhoria.mensagem,
        elementosVisuais: saved.melhoria.elementosVisuais,
        tomDeVoz: saved.melhoria.tomDeVoz,
        callToAction: saved.melhoria.callToAction,
        propostaDeValorReforcada: saved.melhoria.propostaDeValorReforcada,
        exemploResumidoDeReformulacao:
          saved.melhoria.exemploResumidoDeReformulacao,
        url: saved.melhoria.url,
        createdAt: saved.melhoria.createdAt,
      },
    };
  }
}
