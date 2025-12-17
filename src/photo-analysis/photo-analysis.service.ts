import { Injectable } from '@nestjs/common';
import { PhotoAnalysisClient } from './photo-analysis.client';
import type { PhotoAnalysisResponse, PhotoAnalysisOptions } from './types';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class PhotoAnalysisService {
  private readonly client: PhotoAnalysisClient;

  constructor(
    @InjectPinoLogger(PhotoAnalysisService.name)
    private readonly logger: PinoLogger,
  ) {
    this.client = new PhotoAnalysisClient(undefined, this.logger);
  }

  analyzeImage(
    image: Buffer,
    filename: string,
    extra?: PhotoAnalysisOptions['extraFormFields'],
  ): Promise<PhotoAnalysisResponse> {
    this.logger.info({ filename }, 'Sending image to Photo Analysis Client');
    return this.client.analyzeImage(image, filename, extra);
  }
}
