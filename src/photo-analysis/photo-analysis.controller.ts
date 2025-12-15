import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoAnalysisService } from './photo-analysis.service';
import { PhotoAnalysisResponse } from './types';

@Controller('photo-analysis')
export class PhotoAnalysisController {
  constructor(private readonly photoAnalysisService: PhotoAnalysisService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('imagem'))
  async analyze(
    @UploadedFile() file: { originalname: string; buffer: Buffer },
  ): Promise<PhotoAnalysisResponse> {
    if (!file) {
      throw new HttpException('Arquivo não enviado', HttpStatus.BAD_REQUEST);
    }

    return this.photoAnalysisService.analyzeImage(
      file.buffer,
      file.originalname,
    );
  }
}
