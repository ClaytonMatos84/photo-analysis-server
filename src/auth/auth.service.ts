import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface JwtUser {
  userId: number;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private users = [
    {
      userId: 1,
      username: process.env.USER_NAME as string,
      passwordHash: process.env.PASS_HASH as string,
    },
  ];

  async validateUser(
    username: string,
    password: string,
  ): Promise<JwtUser | null> {
    const user = this.users.find((u) => u.username === username);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return { userId: user.userId, username: user.username };
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
    const passwordHash = await bcrypt.hash(password, 10);
    return {
      username,
      passwordHash,
    };
  }
}
