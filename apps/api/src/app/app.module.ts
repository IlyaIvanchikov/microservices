import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './configs/rmq.config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getJwtConfig } from './configs/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'envs/.api.env', isGlobal: true
    }),
    RMQModule.forRootAsync(getRMQConfig()),
    JwtModule.registerAsync(getJwtConfig()),
    PassportModule
  ],
  controllers: [AuthController]
})
export class AppModule {}
