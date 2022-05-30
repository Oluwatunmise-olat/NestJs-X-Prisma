import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async signUp() {
    return await this.authService.signUp();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn() {
    return await this.authService.login();
  }
}
