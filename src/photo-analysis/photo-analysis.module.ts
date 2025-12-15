import { Module } from '@nestjs/common';
import { PhotoAnalysisController } from './photo-analysis.controller';
import { PhotoAnalysisService } from './photo-analysis.service';

@Module({
  controllers: [PhotoAnalysisController],
  providers: [PhotoAnalysisService],
  exports: [PhotoAnalysisService],
})
export class PhotoAnalysisModule {}
