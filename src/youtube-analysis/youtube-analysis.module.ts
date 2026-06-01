import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeAnalysisController } from './youtube-analysis.controller';
import { YoutubeAnalysisResult } from './youtube-analysis-result.entity';
import { YoutubeAnalysisResultService } from './youtube-analysis-result.service';
import { YoutubeAnalysisService } from './youtube-analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([YoutubeAnalysisResult])],
  controllers: [YoutubeAnalysisController],
  providers: [YoutubeAnalysisService, YoutubeAnalysisResultService],
  exports: [YoutubeAnalysisService, YoutubeAnalysisResultService],
})
export class YoutubeAnalysisModule {}
