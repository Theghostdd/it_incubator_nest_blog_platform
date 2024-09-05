import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BasicStrategy } from './guards/basic/basic-strategy';
import { BasicGuard } from './guards/basic/basic.guard';
import { JwtStrategy } from './guards/jwt/jwt-strategy';
import { VerifyUserGuard } from './guards/jwt/jwt-verify-user';
import { AuthJWTAccessGuard } from './guards/jwt/jwt.guard';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';

@Global()
@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
  ],
  providers: [
    JwtService,
    JwtService,
    BasicStrategy,
    BasicGuard,
    JwtStrategy,
    VerifyUserGuard,
    AuthJWTAccessGuard,
    CommandBus,
  ],
  exports: [
    JwtService,
    JwtService,
    BasicStrategy,
    BasicGuard,
    JwtStrategy,
    VerifyUserGuard,
    AuthJWTAccessGuard,
    CommandBus,
    ThrottlerModule,
    CqrsModule,
  ],
})
export class CoreModule {}
