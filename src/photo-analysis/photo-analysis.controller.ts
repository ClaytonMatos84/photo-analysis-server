import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoAnalysisService } from './photo-analysis.service';
import { PhotoAnalysisResponse } from './types';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Controller('photo-analysis')
export class PhotoAnalysisController {
  constructor(
    private readonly photoAnalysisService: PhotoAnalysisService,
    @InjectPinoLogger(PhotoAnalysisController.name)
    private readonly logger: PinoLogger,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  @UseInterceptors(FileInterceptor('imagem'))
  async analyze(
    @UploadedFile() file: { originalname: string; buffer: Buffer },
  ): Promise<PhotoAnalysisResponse> {
    if (!file) {
      this.logger.error('No file uploaded');
      throw new HttpException('Arquivo não enviado', HttpStatus.BAD_REQUEST);
    }
    this.logger.info(
      { filename: file.originalname },
      'Image received for analysis',
    );
    return this.photoAnalysisService.analyzeImage(
      file.buffer,
      file.originalname,
    );
  }
}
