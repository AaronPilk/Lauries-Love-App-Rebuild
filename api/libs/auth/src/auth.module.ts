import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { AuthConfig } from './auth/auth.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './groups.guard';
@Module({
  imports: [PassportModule.register({ strategy: 'jwt' })],
  providers: [
    AuthConfig,
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
