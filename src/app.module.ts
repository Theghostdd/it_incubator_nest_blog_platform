import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { configModule } from './settings/configuration/config.module';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './settings/configuration/configuration';
import { ApplicationObjectResultModule } from './base/application-object-result/application-object-result.module';
import { BaseSortingModule } from './base/sorting/base-sorting.module';
import { BasePaginationModule } from './base/pagination/base-pagination.module';
import { TestingModule } from './features/testing/testing.module';
import { CoreModule } from './core/core.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPlatformModule } from './features/blog-platform/blog-platform.module';
import { AccessControlModule } from './features/access-control/access-control.module';
import { UsersModule } from './features/users/users.module';
import { EnvState } from './settings/types/enum';
import { QuizGameModule } from './features/quiz-game/quiz-game.module';

@Module({
  imports: [
    CoreModule,
    configModule,
    ApplicationObjectResultModule,
    BaseSortingModule,
    BasePaginationModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const envSettings = configService.get('environmentSettings', {
          infer: true,
        });
        return {
          type: 'postgres',
          host: envSettings.POSTGRES_CONNECTION_URI,
          port: envSettings.POSTGRES_PORT,
          username: envSettings.POSTGRES_USER,
          password: envSettings.POSTGRES_USER_PASSWORD,
          database:
            envSettings.ENV === EnvState.TESTING
              ? 'blog_platform_test'
              : envSettings.DATABASE_NAME,
          autoLoadEntities: true,
          synchronize:
            envSettings.ENV !== EnvState.PRODUCTION &&
            envSettings.ENV !== EnvState.DEVELOPMENT,
          logger: 'advanced-console',
          logging: envSettings.ENV === EnvState.DEVELOPMENT,
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const apiSettings = configService.get('apiSettings', { infer: true });
        return {
          transport: {
            service: apiSettings.NODEMAILER.MAIL_SERVICE,
            host: apiSettings.NODEMAILER.MAIL_HOST,
            port: apiSettings.NODEMAILER.MAIL_PORT,
            ignoreTLS: apiSettings.NODEMAILER.MAIL_IGNORE_TLS,
            secure: apiSettings.NODEMAILER.MAIL_SECURE,
            auth: {
              user: apiSettings.NODEMAILER.MAIL_AGENT_SETTINGS.address,
              pass: apiSettings.NODEMAILER.MAIL_AGENT_SETTINGS.password,
            },
          },
          defaults: {
            from: `"${apiSettings.NODEMAILER.MAIL_AGENT_SETTINGS.name}" <${apiSettings.NODEMAILER.MAIL_AGENT_SETTINGS.address}>`,
          },
        };
      },
      inject: [ConfigService],
    }),
    BlogPlatformModule,
    AccessControlModule,
    UsersModule,
    QuizGameModule,
    TestingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
