export interface PessoasInfo {
  quantidade: string;
  descricao: string;
}

export interface PhotoAnalysisResponse {
  descricao_cena: string;
  objetos_identificados: string[];
  pessoas: PessoasInfo;
  local_ambiente: string;
  estilo_foto: string;
  sentimento_transmitido: string;
  observacoes_adicionais: string;
}

export interface PhotoAnalysisError {
  message: string;
  status?: number;
  details?: unknown;
}

export interface PhotoAnalysisOptions {
  /**
   * Endpoint base URL, e.g. "http://localhost:3001" or full URL.
   * If not provided, will use process.env.PHOTO_ANALYSIS_URL.
   */
  baseUrl?: string;
  /**
   * Path of the analysis endpoint, default "/analyze".
   */
  path?: string;
  /**
   * Optional extra form fields to send alongside the image.
   */
  extraFormFields?: Record<string, string | number | boolean>;
  /**
   * Optional headers to merge.
   */
  headers?: Record<string, string>;
  /**
   * Request timeout in ms. Default 30000.
   */
  timeoutMs?: number;
}
