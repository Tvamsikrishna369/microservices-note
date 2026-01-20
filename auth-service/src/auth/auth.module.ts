// auth-service/src/auth/auth.module.ts

import { Controller, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtGuard } from './guards/jwt.guard';

@Module({
  imports:[
    ConfigModule.forRoot({isGlobal: true}),
    JwtModule.registerAsync({
      inject:[ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {expiresIn: '1m'}
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard]
})
export class AuthModule {}
