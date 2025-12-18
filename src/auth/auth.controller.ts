import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

interface LoginDto {
  username: string;
  password: string;
}

interface RegisterDto {
  username: string;
  password: string;
}

interface JwtUser {
  userId: number;
  username: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectPinoLogger(AuthController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    this.logger.info({ username: body.username }, 'Login attempt');
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) {
      this.logger.warn({ username: body.username }, 'Invalid login');
      throw new HttpException(
        { error: 'Usuário ou senha inválidos' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const tokens = this.authService.login(user);
    this.logger.info(
      { userId: user.userId, username: user.username },
      'Login success',
    );
    return tokens;
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    this.logger.info({ username: body.username }, 'Register attempt');
    const userData = await this.authService.createUser(
      body.username,
      body.password,
    );
    this.logger.info(
      { userId: userData.userId, username: userData.username },
      'Register success',
    );
    return userData;
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req: { user: JwtUser }) {
    this.logger.info(
      { userId: req.user?.userId, username: req.user?.username },
      'Profile requested',
    );
    return req.user;
  }

  @Get('users')
  async getUsers() {
    this.logger.debug('Listing users via controller');
    return this.authService.getAllUsers();
  }
}
