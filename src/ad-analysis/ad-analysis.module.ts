import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdAnalysisController } from './ad-analysis.controller';
import { AdAnalysisService } from './ad-analysis.service';
import { AdAnalysisComparador } from './entities/ad-analysis-comparador.entity';
import { AdAnalysisEstrategia } from './entities/ad-analysis-estrategia.entity';
import { AdAnalysisMelhoria } from './entities/ad-analysis-melhoria.entity';
import { AdAnalysisResultService } from './ad-analysis-result.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdAnalysisComparador,
      AdAnalysisEstrategia,
      AdAnalysisMelhoria,
    ]),
  ],
  controllers: [AdAnalysisController],
  providers: [AdAnalysisService, AdAnalysisResultService],
  exports: [AdAnalysisService, AdAnalysisResultService],
})
export class AdAnalysisModule {}
