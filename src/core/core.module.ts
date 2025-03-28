import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BasicStrategy } from './guards/basic/basic-strategy';
import { BasicGuard } from './guards/basic/basic.guard';
import { JwtStrategy } from './guards/jwt/jwt-strategy';
import { VerifyUserGuard } from './guards/jwt/jwt-verify-user';
import { AuthJWTAccessGuard } from './guards/jwt/jwt.guard';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { RefreshJWTAccessGuard } from './guards/jwt/jwt-refresh-toke.guard';
import { JwtRefreshTokenStrategyStrategy } from './guards/jwt/jwt-refresh-token-strategy';
import { AccessControlModule } from '../features/access-control/access-control.module';
import { UsersModule } from '../features/users/users.module';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [
    AccessControlModule,
    UsersModule,
    CqrsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 9999,
      },
    ]),
    ScheduleModule.forRoot(),
  ],
  providers: [
    JwtService,
    BasicStrategy,
    BasicGuard,
    JwtStrategy,
    VerifyUserGuard,
    AuthJWTAccessGuard,
    RefreshJWTAccessGuard,
    JwtRefreshTokenStrategyStrategy,
  ],
  exports: [
    CqrsModule,
    JwtService,
    BasicStrategy,
    BasicGuard,
    JwtStrategy,
    VerifyUserGuard,
    AuthJWTAccessGuard,
    RefreshJWTAccessGuard,
    JwtRefreshTokenStrategyStrategy,
    ThrottlerModule,
  ],
})
export class CoreModule {}
