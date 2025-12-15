import axios, { AxiosInstance } from 'axios';
// import * as fs from 'node:fs';
// import * as path from 'node:path';
import FormData from 'form-data';
import {
  PhotoAnalysisOptions,
  PhotoAnalysisResponse,
  PhotoAnalysisError,
} from './types';

export class PhotoAnalysisClient {
  private readonly axios: AxiosInstance;
  private readonly baseUrl: string;
  private readonly path: string;
  private readonly timeoutMs: number;

  constructor(
    options: PhotoAnalysisOptions = {
      baseUrl: process.env.PHOTO_ANALYSIS_URL,
      path: '/analise-foto',
      timeoutMs: 30000,
    },
  ) {
    this.baseUrl = options.baseUrl ?? '';
    this.path = options.path ?? '';
    this.timeoutMs = options.timeoutMs ?? 30000;

    if (!this.baseUrl) {
      throw new Error(
        'PhotoAnalysisClient: baseUrl is required (set PHOTO_ANALYSIS_URL or pass in options.baseUrl).',
      );
    }

    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeoutMs,
      headers: options.headers,
    });
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
      throw Object.assign(new Error(error.message), { error });
    }
  }
}

export default PhotoAnalysisClient;
