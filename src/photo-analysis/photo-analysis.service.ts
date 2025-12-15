import { Injectable } from '@nestjs/common';
import { PhotoAnalysisClient } from './photo-analysis.client';
import type { PhotoAnalysisResponse, PhotoAnalysisOptions } from './types';

@Injectable()
export class PhotoAnalysisService {
  private readonly client: PhotoAnalysisClient;

  constructor() {
    this.client = new PhotoAnalysisClient();
  }

  analyzeImage(
    image: Buffer,
    filename: string,
    extra?: PhotoAnalysisOptions['extraFormFields'],
  ): Promise<PhotoAnalysisResponse> {
    return this.client.analyzeImage(image, filename, extra);
  }
}
