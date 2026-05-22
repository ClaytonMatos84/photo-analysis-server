import axios, { AxiosInstance } from 'axios';
import { PinoLogger } from 'nestjs-pino';
import {
  AdAnalysisError,
  AdAnalysisOptions,
  AdAnalysisResponseService,
} from './types';

type LoggerLike = Pick<PinoLogger, 'info' | 'warn' | 'error' | 'debug'>;

export class AdAnalysisClient {
  private readonly axios: AxiosInstance;
  private readonly baseUrl: string;
  private readonly path: string;
  private readonly timeoutMs: number;
  private readonly logger: LoggerLike;

  constructor(
    options: AdAnalysisOptions = {
      baseUrl: process.env.PHOTO_ANALYSIS_URL,
      path: '/analise-anuncio',
      timeoutMs: Number(process.env.AD_ANALYSIS_TIMEOUT_MS ?? 120000),
    },
    logger?: LoggerLike,
  ) {
    this.baseUrl = options.baseUrl ?? '';
    this.path = options.path ?? '';
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.logger =
      logger ??
      ({
        info: console.info.bind(console) as LoggerLike['info'],
        warn: console.warn.bind(console) as LoggerLike['warn'],
        error: console.error.bind(console) as LoggerLike['error'],
        debug: console.debug.bind(console) as LoggerLike['debug'],
      } satisfies LoggerLike);

    if (!this.baseUrl) {
      this.logger.error(
        'AdAnalysisClient initialization failed: baseUrl is required.',
      );
      throw new Error(
        'AdAnalysisClient: baseUrl is required (set PHOTO_ANALYSIS_URL or pass in options.baseUrl).',
      );
    }

    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeoutMs,
      headers: options.headers,
    });

    this.logger.info(
      {
        baseUrl: this.baseUrl,
        path: this.path,
        timeoutMs: this.timeoutMs,
        hasCustomHeaders: Boolean(options.headers),
      },
      'AdAnalysisClient initialized',
    );
  }

  async analyzeAdByImageUrl(
    imageUrl: string,
  ): Promise<AdAnalysisResponseService> {
    this.logger.info({ imageUrl }, 'Sending ad image URL to analysis service');

    try {
      const res = await this.axios.get<AdAnalysisResponseService>(this.path, {
        params: {
          image_url: imageUrl,
        },
      });

      this.logger.info(
        { imageUrl, status: res.status },
        'Ad image analyzed successfully',
      );
      return res.data;
    } catch (err: unknown) {
      const maybeAxiosError = err as
        | { message?: string; response?: { status?: number; data?: unknown } }
        | undefined;

      const error: AdAnalysisError = {
        message: maybeAxiosError?.message ?? 'Unknown error',
        status: maybeAxiosError?.response?.status,
        details: maybeAxiosError?.response?.data,
      };

      this.logger.error(
        { imageUrl, status: error.status, details: error.details },
        'Ad image analysis failed',
      );
      throw Object.assign(new Error(error.message), { error });
    }
  }
}

export default AdAnalysisClient;
