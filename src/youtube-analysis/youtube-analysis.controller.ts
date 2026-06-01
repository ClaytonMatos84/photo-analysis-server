import {
  Controller,
  DefaultValuePipe,
  Get,
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
      throw new HttpException('Parametro url e obrigatorio', HttpStatus.BAD_REQUEST);
    }

    const normalizedUrl = youtubeUrl.trim();
    if (!this.isValidYoutubeUrl(normalizedUrl)) {
      throw new HttpException('URL do YouTube invalida', HttpStatus.BAD_REQUEST);
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

    return this.youtubeAnalysisResultService.findByUserIdPaginated(userId, page, limit);
  }

  @Get('results/:id')
  async getResultById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: string } },
  ): Promise<YoutubeAnalysisSummary> {
    const userId = parseInt(req.user.userId, 10);
    const result = await this.youtubeAnalysisResultService.findByIdForUser(userId, id);

    if (!result) {
      throw new HttpException('Resultado nao encontrado', HttpStatus.NOT_FOUND);
    }

    return result;
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
}
