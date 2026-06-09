import {
  BadGatewayException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import axios, { AxiosInstance } from 'axios';
import { Agent as HttpsAgent } from 'node:https';
import { existsSync, readFileSync } from 'node:fs';
import {
  YoutubeAnalysisSummary,
  YoutubeInitialPlayerResponse,
  YoutubePlayerMicroformatRenderer,
  YoutubePlayerResponseVideoDetails,
} from './types';
import { YoutubeAnalysisResultService } from './youtube-analysis-result.service';

@Injectable()
export class YoutubeAnalysisService {
  private readonly http: AxiosInstance;

  constructor(
    private readonly resultService: YoutubeAnalysisResultService,
    @InjectPinoLogger(YoutubeAnalysisService.name)
    private readonly logger: PinoLogger,
  ) {
    this.http = axios.create({
      timeout: Number(process.env.YOUTUBE_FETCH_TIMEOUT_MS ?? 30000),
      maxRedirects: 5,
      httpsAgent: this.buildHttpsAgent(),
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
      },
    });
  }

  async analyzeByVideoUrl(
    userId: number,
    youtubeUrl: string,
  ): Promise<YoutubeAnalysisSummary> {
    this.logger.info({ userId, youtubeUrl }, 'Starting YouTube video analysis');

    const html = await this.fetchVideoPage(youtubeUrl);
    const initialPlayerResponse = this.extractInitialPlayerResponse(html);
    const summary = this.mapToSummary(initialPlayerResponse);
    this.validateSummaryOrThrow(summary, youtubeUrl);

    return this.resultService.saveSummary({
      userId,
      youtubeUrl,
      ...summary,
    });
  }

  private async fetchVideoPage(youtubeUrl: string): Promise<string> {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await this.http.get<string>(youtubeUrl, {
          responseType: 'text',
        });

        if (response.status < 200 || response.status >= 300) {
          this.logger.error(
            {
              status: response.status,
              youtubeUrl,
              finalUrl: response.request?.res?.responseUrl,
              attempt,
            },
            'Failed to fetch YouTube video page',
          );
          throw new BadGatewayException(
            'Falha ao buscar pagina do YouTube para analise.',
          );
        }

        const html = response.data;
        this.logger.debug(
          {
            youtubeUrl,
            finalUrl: response.request?.res?.responseUrl,
            contentType: response.headers['content-type'],
            htmlLength: html.length,
            attempt,
          },
          'YouTube page fetched successfully',
        );

        return html;
      } catch (error: unknown) {
        if (error instanceof BadGatewayException) {
          throw error;
        }

        const err = error as {
          message?: string;
          cause?: unknown;
          stack?: string;
          code?: string;
          response?: { status?: number; data?: unknown };
        };
        const httpStatus = err?.response?.status;
        const isLastAttempt = attempt === maxAttempts;

        this.logger.error(
          {
            youtubeUrl,
            attempt,
            status: httpStatus,
            code: err?.code,
            message: err?.message,
            cause: err?.cause,
            stack: err?.stack,
          },
          'Error while fetching YouTube page',
        );

        if (isLastAttempt) {
          if (httpStatus === 429) {
            throw new BadGatewayException(
              'YouTube esta limitando as requisicoes (429). Tente novamente em alguns minutos.',
            );
          }
          throw new BadGatewayException(
            'Falha de comunicacao com YouTube para analise do video.',
          );
        }

        // Use exponential backoff for 429; short delay for other transient errors
        const delayMs = httpStatus === 429
          ? 5000 * Math.pow(2, attempt - 1)
          : 1000 * attempt;
        await this.wait(delayMs);
      }
    }

    throw new BadGatewayException(
      'Falha de comunicacao com YouTube para analise do video.',
    );
  }

  private extractInitialPlayerResponse(html: string): YoutubeInitialPlayerResponse {
    const markers = [
      'ytInitialPlayerResponse =',
      'var ytInitialPlayerResponse =',
      'window["ytInitialPlayerResponse"] =',
    ];

    const raw = markers
      .map((marker) => this.extractJsonObjectAfterMarker(html, marker))
      .find((value) => value !== null);

    if (!raw) {
      this.logger.error(
        {
          hasConsentMarker: html.includes('consent.youtube.com'),
          hasPlayerResponseText: html.includes('ytInitialPlayerResponse'),
          htmlSample: html.slice(0, 600),
        },
        'YouTube HTML did not contain a parsable player response',
      );
      throw new UnprocessableEntityException(
        'Nao foi possivel extrair os dados do player do YouTube.',
      );
    }

    try {
      return JSON.parse(raw) as YoutubeInitialPlayerResponse;
    } catch (error: unknown) {
      this.logger.error(
        {
          error: error as unknown,
          payloadSample: raw.slice(0, 600),
        },
        'Failed to parse ytInitialPlayerResponse payload',
      );
      throw new UnprocessableEntityException(
        'Formato invalido do payload retornado pelo YouTube.',
      );
    }
  }

  private mapToSummary(response: YoutubeInitialPlayerResponse): Omit<
    YoutubeAnalysisSummary,
    'id' | 'youtubeUrl' | 'createdAt'
  > {
    const videoDetails: YoutubePlayerResponseVideoDetails = response.videoDetails ?? {};
    const microformat: YoutubePlayerMicroformatRenderer =
      response.microformat?.playerMicroformatRenderer ?? {};

    return {
      videoId: this.normalizeText(videoDetails.videoId),
      title: this.normalizeText(videoDetails.title),
      lengthSeconds: this.normalizeText(videoDetails.lengthSeconds),
      channelId: this.normalizeText(videoDetails.channelId),
      shortDescription: this.normalizeText(videoDetails.shortDescription),
      viewCount: this.normalizeText(videoDetails.viewCount),
      author: this.normalizeText(videoDetails.author),
      isLiveContent: Boolean(videoDetails.isLiveContent),
      likeCount: this.normalizeText(microformat.likeCount),
      category: this.normalizeText(microformat.category),
      ownerProfileUrl: this.normalizeText(microformat.ownerProfileUrl),
    };
  }

  private validateSummaryOrThrow(
    summary: Omit<YoutubeAnalysisSummary, 'id' | 'youtubeUrl' | 'createdAt'>,
    youtubeUrl: string,
  ): void {
    const missingAttributes = Object.entries(summary)
      .filter(([, value]) => value === null || value === undefined)
      .map(([key]) => key)
      .sort();

    if (missingAttributes.length === 0) {
      return;
    }

    this.logger.error(
      {
        youtubeUrl,
        missingAttributes,
      },
      'YouTube analysis summary has missing attributes and will not be saved',
    );

    throw new UnprocessableEntityException({
      message:
        'Nao foi possível concluir a analise do video. Alguns dados obrigatórios nao foram retornados pelo YouTube.',
      missingAttributes,
    });
  }

  private normalizeText(value?: string | null): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private extractJsonObjectAfterMarker(
    html: string,
    marker: string,
  ): string | null {
    const markerIndex = html.indexOf(marker);
    if (markerIndex < 0) {
      return null;
    }

    const objectStart = html.indexOf('{', markerIndex + marker.length);
    if (objectStart < 0) {
      return null;
    }

    let depth = 0;
    let inString = false;
    let stringQuote = '';
    let escaped = false;

    for (let i = objectStart; i < html.length; i += 1) {
      const ch = html[i];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }

        if (ch === '\\') {
          escaped = true;
          continue;
        }

        if (ch === stringQuote) {
          inString = false;
          stringQuote = '';
        }

        continue;
      }

      if (ch === '"' || ch === "'") {
        inString = true;
        stringQuote = ch;
        continue;
      }

      if (ch === '{') {
        depth += 1;
        continue;
      }

      if (ch === '}') {
        depth -= 1;

        if (depth === 0) {
          return html.slice(objectStart, i + 1);
        }
      }
    }

    return null;
  }

  private buildHttpsAgent(): HttpsAgent | undefined {
    const insecureTls = process.env.YOUTUBE_INSECURE_TLS === 'true';
    const certPath = process.env.YOUTUBE_CA_CERT_PATH?.trim();

    if (insecureTls) {
      this.logger.warn(
        'YOUTUBE_INSECURE_TLS is enabled. TLS certificate validation is disabled for YouTube requests.',
      );
      return new HttpsAgent({ rejectUnauthorized: false });
    }

    if (!certPath) {
      return undefined;
    }

    if (!existsSync(certPath)) {
      this.logger.warn({ certPath }, 'YOUTUBE_CA_CERT_PATH not found; using default TLS store');
      return undefined;
    }

    try {
      const cert = readFileSync(certPath);
      this.logger.info({ certPath }, 'Using custom CA certificate for YouTube requests');
      return new HttpsAgent({ ca: cert, rejectUnauthorized: true });
    } catch (error: unknown) {
      this.logger.warn(
        { certPath, error: error as unknown },
        'Failed to load custom CA certificate; using default TLS store',
      );
      return undefined;
    }
  }
}
