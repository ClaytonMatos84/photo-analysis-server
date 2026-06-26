import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  PaginatedYoutubeAnalysisResultsDto,
  YoutubeAnalysisSummary,
  YoutubeTopVideosRankingResponseDto,
} from './types';
import { YoutubeAnalysisResultService } from './youtube-analysis-result.service';
import { YoutubeAnalysisService } from './youtube-analysis.service';

@Controller('youtube-analysis')
@UseGuards(JwtAuthGuard)
export class YoutubeAnalysisController {
  constructor(
    private readonly youtubeAnalysisService: YoutubeAnalysisService,
    private readonly youtubeAnalysisResultService: YoutubeAnalysisResultService,
    @InjectPinoLogger(YoutubeAnalysisController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get('analyze')
  async analyze(
    @Query('url') youtubeUrl: string,
    @Request() req: { user: { userId: string } },
  ): Promise<YoutubeAnalysisSummary> {
    if (!youtubeUrl || youtubeUrl.trim().length === 0) {
      throw new HttpException(
        'Parametro url e obrigatorio',
        HttpStatus.BAD_REQUEST,
      );
    }

    const normalizedUrl = youtubeUrl.trim();
    if (!this.isValidYoutubeUrl(normalizedUrl)) {
      throw new HttpException(
        'URL do YouTube invalida',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userId = parseInt(req.user.userId, 10);
    this.logger.info(
      { userId, youtubeUrl: normalizedUrl },
      'Received YouTube analysis request',
    );

    return this.youtubeAnalysisService.analyzeByVideoUrl(userId, normalizedUrl);
  }

  @Get('results')
  async getMyResults(
    @Request() req: { user: { userId: string } },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedYoutubeAnalysisResultsDto> {
    const userId = parseInt(req.user.userId, 10);
    this.logger.info(
      { userId, page, limit },
      'Fetching YouTube analysis results with pagination',
    );

    if (page < 1) {
      throw new HttpException(
        'Page must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (limit < 1 || limit > 100) {
      throw new HttpException(
        'Limit must be between 1 and 100',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.youtubeAnalysisResultService.findByUserIdPaginated(
      userId,
      page,
      limit,
    );
  }

  @Get('top-views')
  async getTopByViews(
    @Request() req: { user: { userId: string } },
    @Query('limit') limit?: string,
  ): Promise<YoutubeTopVideosRankingResponseDto> {
    const userId = parseInt(req.user.userId, 10);
    const parsedLimit = this.parseOptionalLimit(limit);

    return this.youtubeAnalysisService.getTopVideosByViews(userId, parsedLimit);
  }

  @Get('top-likes')
  async getTopByLikes(
    @Request() req: { user: { userId: string } },
    @Query('limit') limit?: string,
  ): Promise<YoutubeTopVideosRankingResponseDto> {
    const userId = parseInt(req.user.userId, 10);
    const parsedLimit = this.parseOptionalLimit(limit);

    return this.youtubeAnalysisService.getTopVideosByLikes(userId, parsedLimit);
  }

  @Get('results/:id')
  async getResultById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: string } },
  ): Promise<YoutubeAnalysisSummary> {
    const userId = parseInt(req.user.userId, 10);
    const result = await this.youtubeAnalysisResultService.findByIdForUser(
      userId,
      id,
    );

    if (!result) {
      throw new HttpException('Resultado nao encontrado', HttpStatus.NOT_FOUND);
    }

    return result;
  }

  @Delete('results/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteResultById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: string } },
  ): Promise<void> {
    const userId = parseInt(req.user.userId, 10);
    const deleted = await this.youtubeAnalysisResultService.deleteByIdForUser(
      userId,
      id,
    );

    if (!deleted) {
      throw new HttpException('Resultado nao encontrado', HttpStatus.NOT_FOUND);
    }
  }

  private isValidYoutubeUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();

      if (host === 'youtu.be') {
        return parsed.pathname.length > 1;
      }

      if (host === 'www.youtube.com' || host === 'youtube.com') {
        if (parsed.pathname === '/watch') {
          return Boolean(parsed.searchParams.get('v'));
        }

        return parsed.pathname.startsWith('/shorts/');
      }

      return false;
    } catch {
      return false;
    }
  }

  private parseOptionalLimit(limit?: string): number | undefined {
    if (typeof limit !== 'string' || limit.trim().length === 0) {
      return undefined;
    }

    const parsed = Number.parseInt(limit, 10);
    if (Number.isNaN(parsed)) {
      throw new BadRequestException(
        'Parametro limit deve ser um numero inteiro.',
      );
    }

    return parsed;
  }
}
