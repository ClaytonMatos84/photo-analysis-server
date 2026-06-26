import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { YoutubeAnalysisResult } from './youtube-analysis-result.entity';
import {
  PaginatedYoutubeAnalysisResultsDto,
  YoutubeRankingMetric,
  YoutubeAnalysisSummary,
  YoutubeTopVideoSummary,
} from './types';

interface SaveYoutubeAnalysisInput {
  userId: number;
  youtubeUrl: string;
  videoId: string | null;
  title: string | null;
  lengthSeconds: string | null;
  channelId: string | null;
  shortDescription: string | null;
  viewCount: string | null;
  author: string | null;
  isLiveContent: boolean;
  likeCount: string | null;
  category: string | null;
  ownerProfileUrl: string | null;
}

@Injectable()
export class YoutubeAnalysisResultService {
  constructor(
    @InjectRepository(YoutubeAnalysisResult)
    private readonly repository: Repository<YoutubeAnalysisResult>,
    @InjectPinoLogger(YoutubeAnalysisResultService.name)
    private readonly logger: PinoLogger,
  ) {}

  async saveSummary(
    input: SaveYoutubeAnalysisInput,
  ): Promise<YoutubeAnalysisSummary> {
    this.logger.info(
      {
        userId: input.userId,
        youtubeUrl: input.youtubeUrl,
        videoId: input.videoId,
      },
      'Saving YouTube analysis summary',
    );

    const entity = this.repository.create(input);
    const saved = await this.repository.save(entity);

    return this.toSummary(saved);
  }

  async findByUserIdPaginated(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedYoutubeAnalysisResultsDto> {
    this.logger.info(
      { userId, page, limit },
      'Finding YouTube analysis results by user with pagination',
    );

    const skip = (page - 1) * limit;
    const [results, total] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: results.map((result) => this.toSummary(result)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByIdForUser(
    userId: number,
    id: number,
  ): Promise<YoutubeAnalysisSummary | null> {
    this.logger.info(
      { userId, id },
      'Finding YouTube analysis result by id for user',
    );

    const result = await this.repository.findOne({
      where: { id, userId },
    });

    if (!result) {
      return null;
    }

    return this.toSummary(result);
  }

  async deleteByIdForUser(userId: number, id: number): Promise<boolean> {
    this.logger.info(
      { userId, id },
      'Deleting YouTube analysis result by id for user',
    );

    const deleteResult = await this.repository.delete({ id, userId });

    return (deleteResult.affected ?? 0) > 0;
  }

  async findTopByUserIdAndMetric(
    userId: number,
    metric: YoutubeRankingMetric,
    limit: number,
  ): Promise<YoutubeTopVideoSummary[]> {
    const metricColumnByField: Record<YoutubeRankingMetric, string> = {
      viewCount: 'view_count',
      likeCount: 'like_count',
    };

    const metricColumn = metricColumnByField[metric];

    this.logger.info(
      { userId, metric, limit },
      'Finding top YouTube analysis results by metric',
    );

    const results = await this.repository
      .createQueryBuilder('result')
      .where('result.user_id = :userId', { userId })
      .orderBy(
        `CAST(COALESCE(NULLIF(result.${metricColumn}, ''), '0') AS INTEGER)`,
        'DESC',
      )
      .addOrderBy('result.created_at', 'DESC')
      .take(limit)
      .getMany();

    return results.map((result) => this.toTopVideoSummary(result));
  }

  private toSummary(saved: YoutubeAnalysisResult): YoutubeAnalysisSummary {
    return {
      id: saved.id,
      youtubeUrl: saved.youtubeUrl,
      videoId: saved.videoId,
      title: saved.title,
      lengthSeconds: saved.lengthSeconds,
      channelId: saved.channelId,
      shortDescription: saved.shortDescription,
      viewCount: saved.viewCount,
      author: saved.author,
      isLiveContent: saved.isLiveContent,
      likeCount: saved.likeCount,
      category: saved.category,
      ownerProfileUrl: saved.ownerProfileUrl,
      createdAt: saved.createdAt,
    };
  }

  private toTopVideoSummary(
    saved: YoutubeAnalysisResult,
  ): YoutubeTopVideoSummary {
    return {
      id: saved.id,
      youtubeUrl: saved.youtubeUrl,
      videoId: saved.videoId,
      title: saved.title,
      author: saved.author,
      viewCount: this.toNonNegativeInt(saved.viewCount),
      likeCount: this.toNonNegativeInt(saved.likeCount),
      createdAt: saved.createdAt,
    };
  }

  private toNonNegativeInt(value: string | null): number {
    if (!value) {
      return 0;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      return 0;
    }

    return parsed;
  }
}
