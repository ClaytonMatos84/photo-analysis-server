import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

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
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<JwtUser | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return { userId: user.id, username: user.username };
    }
    return null;
  }

  login(user: JwtUser) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createUser(username: string, password: string) {
    // Validar email
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(username)) {
      throw new BadRequestException('O username deve ser um email válido.');
    }
    // Verificar se já existe
    const exists = await this.userRepository.findOne({ where: { username } });
    if (exists) {
      throw new BadRequestException('Usuário já cadastrado.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      password: passwordHash,
    });
    await this.userRepository.save(user);
    return { userId: user.id, username: user.username };
  }
  async getAllUsers() {
    const users = await this.userRepository.find();
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }
}
