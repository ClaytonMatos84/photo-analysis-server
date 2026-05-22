export interface ComparadorAnaliseGeralPayload {
  forcas_da_marca?: string;
  fraquezas_da_marca?: string;
  oportunidades_de_mercado?: string;
  ameacas?: string;
}

export interface ComparadorPayload {
  marca_analisada?: string;
  resumo_posicionamento_marca?: string;
  comparativo_concorrentes?: unknown[];
  analise_geral?: ComparadorAnaliseGeralPayload;
  insight_final?: string;
}

export interface EstrategiaRecomendadaPayload {
  posicionamento_sugerido?: string;
  ['proposta_de_valor_refor\u00e7ada']?: string;
  mensagem_principal?: string;
  tom_de_voz_sugerido?: string;
}

export interface EstrategiaPayload {
  estrategia_recomendada?: EstrategiaRecomendadaPayload;
}

export interface MelhoriaComparativoEntreAnunciosPayload {
  pontos_fortes_do_cliente?: string;
  pontos_fortes_do_concorrente?: string;
  oportunidades_de_melhoria_para_o_cliente?: string;
}

export interface MelhoriaSugestoesPayload {
  mensagem?: string;
  elementos_visuais?: string;
  tom_de_voz?: string;
  call_to_action?: string;
  ['proposta_de_valor_refor\u00e7ada']?: string;
  exemplo_resumido_de_reformulacao?: string;
}

export interface MelhoriaPayload {
  principal_concorrente?: string;
  criterio_de_escolha_do_concorrente?: string;
  comparativo_entre_anuncios?: MelhoriaComparativoEntreAnunciosPayload;
  sugestoes_de_melhoria?: MelhoriaSugestoesPayload;
  url?: string;
}

export interface AdAnalysisResponseService {
  comparador?: ComparadorPayload;
  estrategia?: EstrategiaPayload;
  melhoria?: MelhoriaPayload;
}

export interface AdAnalysisOptions {
  baseUrl?: string;
  path?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export interface AdAnalysisError {
  message: string;
  status?: number;
  details?: unknown;
}

export interface SavedComparadorDto {
  marcaAnalisada: string | null;
  resumoPosicionamentoMarca: string | null;
  quantidadeConcorrentes: number;
  forcasDaMarca: string | null;
  fraquezasDaMarca: string | null;
  oportunidadesDeMercado: string | null;
  ameacas: string | null;
  insightFinal: string | null;
  createdAt: Date;
}

export interface SavedEstrategiaDto {
  posicionamentoSugerido: string | null;
  propostaDeValorReforcada: string | null;
  mensagemPrincipal: string | null;
  tomDeVozSugerido: string | null;
  createdAt: Date;
}

export interface SavedMelhoriaDto {
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
  createdAt: Date;
}

export interface AdAnalysisExecutionResult {
  analysisId: string;
  dataAnalise: Date;
  comparador: SavedComparadorDto;
  estrategia: SavedEstrategiaDto;
  melhoria: SavedMelhoriaDto;
}

export interface PaginatedAdAnalysisResultsDto {
  data: AdAnalysisExecutionResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
