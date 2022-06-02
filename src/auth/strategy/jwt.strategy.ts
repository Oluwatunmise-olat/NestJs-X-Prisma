import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prismaOrm: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate<T extends { email: string; user_id: number }>(payload: T) {
    const user = await this.prismaOrm.users.findUnique({
      where: { id: payload.user_id },
    });

    if (user) {
      delete user.password;
    }

    return !!user ? user : null;
  }
}
