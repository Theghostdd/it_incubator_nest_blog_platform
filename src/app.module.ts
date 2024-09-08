import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { configModule } from './settings/configuration/config.module';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './settings/configuration/configuration';
import { BlogPlatformModule } from './features/blog-platform/blog-platform.module';
import { ApplicationObjectResultModule } from './base/application-object-result/application-object-result.module';
import { BaseSortingModule } from './base/sorting/base-sorting.module';
import { BasePaginationModule } from './base/pagination/base-pagination.module';
import { AccessControlModule } from './features/access-control/access-control.module';
import { TestingModule } from './features/testing/testing.module';
import { UsersModule } from './features/users/users.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    CoreModule,
    configModule,
    ApplicationObjectResultModule,
    BaseSortingModule,
    BasePaginationModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const envSettings = configService.get('environmentSettings', {
          infer: true,
        });
        return { uri: envSettings.MONGO_CONNECTION_URI };
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
    TestingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
