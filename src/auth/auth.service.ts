import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Users } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';

import { AuthRegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaOrm: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(data: AuthRegisterDto) {
    const user = await this.getUserByEmail(data.email);

    if (!user)
      throw new NotFoundException({
        hasError: true,
        errors: [
          { message: 'Resource Not Found', code: 404, title: 'Sign In' },
        ],
      });

    if (!(await this.compareHash(data.password, user.password)))
      throw new UnauthorizedException({
        hasError: true,
        errors: [
          { message: 'InValid Credentials', code: 401, title: 'Sign In' },
        ],
      });

    return [
      this.userToJson(user),
      await this.generateAccessToken({ user_id: user.id, email: user.email }),
    ];
  }

  async signUp(data: AuthRegisterDto) {
    const { password, ...extra } = data;
    const hash_password = await this.generateHash(password);
    try {
      const user = await this.prismaOrm.users.create({
        data: { ...extra, password: hash_password },
      });

      return this.userToJson(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ForbiddenException({
          hasError: true,
          errors: [
            { message: 'Email Taken', code: 403, title: 'Registration' },
          ],
        });
      }
    }
  }

  async getUserByEmail(email: string) {
    return await this.prismaOrm.users.findFirst({ where: { email } });
  }

  userToJson(user: Users) {
    delete user.password;
    return user;
  }

  async generateAccessToken(payload: { user_id: number; email: string }) {
    return await this.jwt.signAsync(payload, {
      expiresIn: 60 * 60,
      secret: this.config.get('JWT_SECRET'),
    });
  }

  isUniqueConstraintError(error) {
    console.log(error.code);
    return (
      error instanceof PrismaClientKnownRequestError && error.code === 'P2002'
    );
  }

  async generateHash(value: string) {
    return await argon.hash(value);
  }

  async compareHash(rawValue: string, hashValue: string) {
    return await argon.verify(hashValue, rawValue);
  }
}
