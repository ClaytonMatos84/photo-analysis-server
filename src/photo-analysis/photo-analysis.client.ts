import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import {
  PhotoAnalysisOptions,
  PhotoAnalysisResponse,
  PhotoAnalysisError,
} from './types';
import { PinoLogger } from 'nestjs-pino';

type LoggerLike = Pick<PinoLogger, 'info' | 'warn' | 'error' | 'debug'>;

export class PhotoAnalysisClient {
  private readonly axios: AxiosInstance;
  private readonly baseUrl: string;
  private readonly path: string;
  private readonly timeoutMs: number;
  private readonly logger: LoggerLike;

  constructor(
    options: PhotoAnalysisOptions = {
      baseUrl: process.env.PHOTO_ANALYSIS_URL,
      path: '/analise-foto',
      timeoutMs: 30000,
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
        'PhotoAnalysisClient initialization failed: baseUrl is required.',
      );
      throw new Error(
        'PhotoAnalysisClient: baseUrl is required (set PHOTO_ANALYSIS_URL or pass in options.baseUrl).',
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
      'PhotoAnalysisClient initialized',
    );
  }

  /**
   * Analyze an image buffer by sending it as multipart/form-data.
   * @param image Buffer da imagem
   * @param filename Nome do arquivo original
   * @returns PhotoAnalysisResponse
   */
  async analyzeImage(
    image: Buffer,
    filename: string,
    extra?: PhotoAnalysisOptions['extraFormFields'],
  ): Promise<PhotoAnalysisResponse> {
    const form = new FormData();
    form.append('data', image, { filename });

    if (extra) {
      Object.entries(extra).forEach(([key, value]) =>
        form.append(key, String(value)),
      );
    }

    this.logger.info(
      {
        filename,
        extraKeys: extra ? Object.keys(extra) : [],
        size: image.length,
      },
      'Sending image to analysis service',
    );

    try {
      const res = await this.axios.post<PhotoAnalysisResponse>(
        this.path,
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
        },
      );
      this.logger.info(
        { filename, status: res.status },
        'Image analyzed successfully',
      );
      return res.data;
    } catch (err: unknown) {
      const maybeAxiosError = err as
        | { message?: string; response?: { status?: number; data?: unknown } }
        | undefined;
      const error: PhotoAnalysisError = {
        message: maybeAxiosError?.message ?? 'Unknown error',
        status: maybeAxiosError?.response?.status,
        details: maybeAxiosError?.response?.data,
      };
      this.logger.error(
        { filename, status: error.status, details: error.details },
        'Image analysis failed',
      );
      throw Object.assign(new Error(error.message), { error });
    }
  }
}

export default PhotoAnalysisClient;
