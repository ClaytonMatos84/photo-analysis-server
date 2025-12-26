import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoAnalysisController } from './photo-analysis.controller';
import { PhotoAnalysisService } from './photo-analysis.service';
import { PhotoAnalysisResult } from './photo-analysis-result.entity';
import { PhotoAnalysisResultService } from './photo-analysis-result.service';

@Module({
  imports: [TypeOrmModule.forFeature([PhotoAnalysisResult])],
  controllers: [PhotoAnalysisController],
  providers: [PhotoAnalysisService, PhotoAnalysisResultService],
  exports: [PhotoAnalysisService, PhotoAnalysisResultService],
})
export class PhotoAnalysisModule {}
