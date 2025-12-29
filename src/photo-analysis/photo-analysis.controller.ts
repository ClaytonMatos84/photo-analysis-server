import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoAnalysisService } from './photo-analysis.service';
import { PhotoAnalysisResultService } from './photo-analysis-result.service';
import { PaginatedAnalysisResultsDto, PhotoAnalysisResponse } from './types';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Controller('photo-analysis')
export class PhotoAnalysisController {
  constructor(
    private readonly photoAnalysisService: PhotoAnalysisService,
    private readonly resultService: PhotoAnalysisResultService,
    @InjectPinoLogger(PhotoAnalysisController.name)
    private readonly logger: PinoLogger,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  @UseInterceptors(FileInterceptor('imagem'))
  async analyze(
    @UploadedFile() file: { originalname: string; buffer: Buffer },
    @Request() req: { user: { userId: string } },
    @Query('saveResult', new ParseBoolPipe({ optional: true }))
    saveResult = true,
  ): Promise<PhotoAnalysisResponse> {
    if (!file) {
      this.logger.error('No file uploaded');
      throw new HttpException('Arquivo não enviado', HttpStatus.BAD_REQUEST);
    }
    this.logger.info(
      { filename: file.originalname, userId: req.user.userId },
      'Image received for analysis',
    );

    const analysisResult = await this.photoAnalysisService.analyzeImage(
      file.buffer,
      file.originalname,
    );

    // Salvar resultado automaticamente se saveResult = true
    if (saveResult) {
      try {
        await this.resultService.saveFromAnalysisResponse(
          parseInt(req.user.userId, 10),
          analysisResult,
        );
        this.logger.info(
          { userId: req.user.userId },
          'Analysis result saved automatically',
        );
      } catch (error) {
        this.logger.error(
          { error: error as unknown, userId: req.user.userId },
          'Failed to save analysis result',
        );
      }
    }

    return analysisResult;
  }

  @UseGuards(JwtAuthGuard)
  @Post('results')
  async saveResult(
    @Request() req: { user: { userId: string } },
    @Body()
    body: {
      description: string;
      location?: string;
      style?: string;
      feeling?: string;
    },
  ) {
    this.logger.info({ userId: req.user.userId }, 'Saving analysis result');

    return this.resultService.saveAnalysisResult({
      userId: parseInt(req.user.userId, 10),
      ...body,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('results')
  async getMyResults(
    @Request() req: { user: { userId: string } },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedAnalysisResultsDto> {
    this.logger.info(
      { userId: req.user.userId, page, limit },
      'Fetching user results with pagination',
    );

    // Validar parâmetros
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

    const paginatedResults = await this.resultService.findByUserIdPaginated(
      parseInt(req.user.userId, 10),
      page,
      limit,
    );

    return {
      data: paginatedResults.data.map((result) => ({
        id: result.id,
        description: result.description,
        location: result.location ?? undefined,
        style: result.style ?? undefined,
        feeling: result.feeling ?? undefined,
      })),
      total: paginatedResults.total,
      page: paginatedResults.page,
      limit: paginatedResults.limit,
      totalPages: paginatedResults.totalPages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('results/:id')
  async getResultById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: string } },
  ) {
    const result = await this.resultService.findById(id);

    if (!result) {
      throw new HttpException('Resultado não encontrado', HttpStatus.NOT_FOUND);
    }

    if (result.userId !== parseInt(req.user.userId, 10)) {
      throw new HttpException('Acesso negado', HttpStatus.FORBIDDEN);
    }

    return result;
  }
}
