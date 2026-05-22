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
import { AdAnalysisResultService } from './ad-analysis-result.service';
import { AdAnalysisService } from './ad-analysis.service';
import {
  AdAnalysisExecutionResult,
  PaginatedAdAnalysisResultsDto,
} from './types';

@Controller('ad-analysis')
@UseGuards(JwtAuthGuard)
export class AdAnalysisController {
  constructor(
    private readonly adAnalysisService: AdAnalysisService,
    private readonly adAnalysisResultService: AdAnalysisResultService,
    @InjectPinoLogger(AdAnalysisController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get('analyze')
  async analyze(
    @Query('image_url') imageUrl: string,
    @Request() req: { user: { userId: string } },
  ): Promise<AdAnalysisExecutionResult> {
    if (!imageUrl || imageUrl.trim().length === 0) {
      throw new HttpException(
        'Parametro image_url e obrigatorio',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userId = parseInt(req.user.userId, 10);
    this.logger.info(
      { userId, imageUrl },
      'Received ad analysis request by image URL',
    );

    return this.adAnalysisService.analyzeByImageUrl(userId, imageUrl);
  }

  @Get('results')
  async getMyResults(
    @Request() req: { user: { userId: string } },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedAdAnalysisResultsDto> {
    const userId = parseInt(req.user.userId, 10);

    this.logger.info(
      { userId, page, limit },
      'Fetching ad analysis results with pagination',
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

    return this.adAnalysisResultService.findByUserIdPaginated(userId, page, limit);
  }

  @Get('results/:analysisId')
  async getResultByAnalysisId(
    @Param('analysisId') analysisId: string,
    @Request() req: { user: { userId: string } },
  ): Promise<AdAnalysisExecutionResult> {
    const userId = parseInt(req.user.userId, 10);
    const result = await this.adAnalysisResultService.findByAnalysisIdForUser(
      userId,
      analysisId,
    );

    if (!result) {
      throw new HttpException('Resultado não encontrado', HttpStatus.NOT_FOUND);
    }

    return result;
  }
}
