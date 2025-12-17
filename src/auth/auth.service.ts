import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export interface JwtUser {
  userId: number;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<JwtUser | null> {
    this.logger.debug({ username }, 'Validating user credentials');
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      this.logger.info({ userId: user.id, username }, 'User validated');
      return { userId: user.id, username: user.username };
    }
    this.logger.warn({ username }, 'Invalid credentials');
    return null;
  }

  login(user: JwtUser) {
    const payload = { username: user.username, sub: user.userId };
    this.logger.info(
      { userId: user.userId, username: user.username },
      'Issuing JWT',
    );
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createUser(username: string, password: string) {
    this.logger.info({ username }, 'Creating user');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(username)) {
      this.logger.warn({ username }, 'Invalid email format');
      throw new BadRequestException('O username deve ser um email válido.');
    }
    const exists = await this.userRepository.findOne({ where: { username } });
    if (exists) {
      this.logger.warn({ username }, 'User already exists');
      throw new BadRequestException('Usuário já cadastrado.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      password: passwordHash,
    });
    await this.userRepository.save(user);
    this.logger.info({ userId: user.id, username }, 'User created');
    return { userId: user.id, username: user.username };
  }
  async getAllUsers() {
    this.logger.debug('Listing users');
    const users = await this.userRepository.find();
    this.logger.info({ count: users.length }, 'Users fetched');
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }
}
