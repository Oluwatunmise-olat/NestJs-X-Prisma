import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async signUp(@Body() body: AuthRegisterDto) {
    return {
      hasError: false,
      title: 'Registration',
      code: HttpStatus.CREATED,
      message: 'User Registration Success',
      data: await this.authService.signUp(body),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async signIn(@Body() body: AuthRegisterDto) {
    const [user, access_token] = await this.authService.login(body);

    return {
      hasError: false,
      code: HttpStatus.OK,
      title: 'SignIn',
      message: 'User Sign In Success',
      data: { user, access_token },
    };
  }
}
