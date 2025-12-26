import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoAnalysisResult } from './photo-analysis-result.entity';
import { PhotoAnalysisResponse } from './types';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export interface SaveAnalysisResultDto {
  userId: number;
  description: string;
  location?: string;
  style?: string;
  feeling?: string;
}

export interface PaginatedResults<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PhotoAnalysisResultService {
  constructor(
    @InjectRepository(PhotoAnalysisResult)
    private readonly resultRepository: Repository<PhotoAnalysisResult>,
    @InjectPinoLogger(PhotoAnalysisResultService.name)
    private readonly logger: PinoLogger,
  ) {}

  async saveAnalysisResult(
    dto: SaveAnalysisResultDto,
  ): Promise<PhotoAnalysisResult> {
    this.logger.info({ userId: dto.userId }, 'Saving photo analysis result');

    const result = this.resultRepository.create({
      userId: dto.userId,
      description: dto.description,
      location: dto.location ?? null,
      style: dto.style ?? null,
      feeling: dto.feeling ?? null,
    });

    const savedResult = await this.resultRepository.save(result);
    this.logger.info(
      { resultId: savedResult?.id ?? 'unknown', userId: dto.userId },
      'Photo analysis result saved successfully',
    );

    return savedResult;
  }

  async saveFromAnalysisResponse(
    userId: number,
    response: PhotoAnalysisResponse,
  ): Promise<PhotoAnalysisResult> {
    const dto: SaveAnalysisResultDto = {
      userId,
      description: response.descricao_cena,
      location: response.local_ambiente,
      style: response.estilo_foto,
      feeling: response.sentimento_transmitido,
    };

    return this.saveAnalysisResult(dto);
  }

  async findByUserId(userId: number): Promise<PhotoAnalysisResult[]> {
    this.logger.info({ userId }, 'Finding analysis results by user');
    return this.resultRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIdPaginated(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResults<PhotoAnalysisResult>> {
    this.logger.info(
      { userId, page, limit },
      'Finding analysis results by user with pagination',
    );

    const skip = (page - 1) * limit;

    const [data, total] = await this.resultRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: number): Promise<PhotoAnalysisResult | null> {
    return this.resultRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<PhotoAnalysisResult[]> {
    return this.resultRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
