import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './features/user/api/user-controller';
import { UserRepositories } from './features/user/infrastructure/user-repositories';
import { UserQueryRepositories } from './features/user/infrastructure/user-query-repositories';
import { UserService } from './features/user/application/user-service';
import { User, UserSchema } from './features/user/domain/user.entity';
import { UserMapperOutputModel } from './features/user/api/models/output/user-output.model';
import { AuthService } from './features/auth/application/auth-application';
import { UserSortingQuery } from './features/user/api/models/input/user-input.model';
import { TestingRepositories } from './features/testing/infrastructure/testing-repositories';
import { TestingService } from './features/testing/application/testing-application';
import { TestingController } from './features/testing/api/testing-controller';
import { BlogRepository } from './features/blog/infrastructure/blog-repositories';
import { BlogQueryRepository } from './features/blog/infrastructure/blog-query-repositories';
import { BlogService } from './features/blog/application/blog-service';
import { BlogController } from './features/blog/api/blog-controller';
import { BlogMapperOutputModel } from './features/blog/api/models/output/blog-output.model';
import { Blog, BlogSchema } from './features/blog/domain/blog.entity';
import { BlogSortingQuery } from './features/blog/api/models/input/blog-input.model';
import { PostRepository } from './features/post/infrastructure/post-repositories';
import { PostQueryRepository } from './features/post/infrastructure/post-query-repositories';
import { PostService } from './features/post/application/post-service';
import { PostMapperOutputModel } from './features/post/api/models/output/post-output.model';
import { BaseSorting } from './base/sorting/base-sorting';
import { PostController } from './features/post/api/post-controller';
import { Post, PostSchema } from './features/post/domain/post.entity';
import { CommentController } from './features/comment/api/comment-controller';
import { CommentQueryRepositories } from './features/comment/infrastructure/comment-query-repositories';
import {
  Comment,
  CommentSchema,
} from './features/comment/domain/comment.entity';
import { CommentMapperOutputModel } from './features/comment/api/model/output/comment-output.model';
import { AuthController } from './features/auth/api/auth.controller';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { MailerModule } from '@nestjs-modules/mailer';
import { NodeMailerService } from './features/nodemailer/application/nodemailer-application';
import { MailTemplateService } from './features/mail-template/application/template-application';
import { RecoveryPasswordSessionRepositories } from './features/auth/infrastructure/recovery-password-session-repositories';
import {
  RecoveryPasswordSession,
  RecoveryPasswordSessionSchema,
} from './features/auth/domain/recovery-session.entity';
import { configModule } from './settings/configuration/config.module';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './settings/configuration/configuration';
import { AuthJWTAccessGuard } from './core/guards/jwt/jwt.guard';
import { JwtStrategy } from './core/guards/jwt/jwt-strategy';
import { BasicGuard } from './core/guards/basic/basic.guard';
import {
  RequestLimiter,
  RequestLimiterSchema,
} from './core/guards/request-limiter/domain/request-limiter.entity';
import { RequestLimiterRepositories } from './core/guards/request-limiter/infrastructure/request-limiter-repositories';
import { RequestLimiterService } from './core/guards/request-limiter/application/request-limiter-application';
import { RequestLimiterStrategy } from './core/guards/request-limiter/request-limiter';
import { LimitRequestGuard } from './core/guards/request-limiter/request-limiter.guard';
import { BasicStrategy } from './core/guards/basic/basic-strategy';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserCommandHandler } from './features/user/application/command/create-user.command';
import { ApplicationObjectResult } from './base/application-object-result/application-object-result';
import { UpdateByIdHandler } from './features/post/application/command/update-post.command';
import { DeletePostByIdHandler } from './features/post/application/command/delete-post.command';
import { CreatePostHandler } from './features/post/application/command/create-post.command';
import { DeleteUserByIdHandler } from './features/user/application/command/delete-user.command';
import { CreateBlogHandler } from './features/blog/application/command/create-blog.command';
import { DeleteBlogByIdHandler } from './features/blog/application/command/delete-blog.command';
import { UpdateBlogByIdHandler } from './features/blog/application/command/update-blog.command';
import { LoginHandler } from './features/auth/application/command/login.command';
import { ConfirmUserEmailHandler } from './features/auth/application/command/confirm-user-email.command';
import { ChangeUserPasswordHandler } from './features/auth/application/command/change-user-password.command';
import { ResendConfirmationCodeHandler } from './features/auth/application/command/resend-confirmation-code.command';
import { PasswordRecoveryHandler } from './features/auth/application/command/password-recovery.command';
import { RegistrationHandler } from './features/auth/application/command/registration.command';
import { CreateCommentByPostIdHandler } from './features/comment/application/command/create-comment';
import { CommentRepositories } from './features/comment/infrastructure/comment-repositories';
import { UpdatePostLikeStatusHandler } from './features/like/application/command/update-post-like-status';
import { LikeService } from './features/like/application/like-service';
import { LikeRepositories } from './features/like/infrastructure/like-repositories';
import { Like, LikeSchema } from './features/like/domain/like.entity';
import { VerifyUserGuard } from './core/guards/jwt/jwt-verify-user';

const testingProviders = [TestingRepositories, TestingService];
const userProviders = [
  UserRepositories,
  UserQueryRepositories,
  UserService,
  UserMapperOutputModel,
  UserSortingQuery,
  DeleteUserByIdHandler,
  CreateUserCommandHandler,
];

const commentProviders = [
  CommentQueryRepositories,
  CommentMapperOutputModel,
  CreateCommentByPostIdHandler,
  CommentRepositories,
];
const postProviders = [
  PostService,
  PostRepository,
  PostQueryRepository,
  PostMapperOutputModel,
  UpdateByIdHandler,
  DeletePostByIdHandler,
  CreatePostHandler,
];
const blogProviders = [
  BlogRepository,
  BlogQueryRepository,
  BlogService,
  BlogMapperOutputModel,
  BlogSortingQuery,
  CreateBlogHandler,
  DeleteBlogByIdHandler,
  UpdateBlogByIdHandler,
];
const authProviders = [
  AuthService,
  LoginHandler,
  ConfirmUserEmailHandler,
  ChangeUserPasswordHandler,
  ResendConfirmationCodeHandler,
  PasswordRecoveryHandler,
  RegistrationHandler,
];

export const UUIDProvider = {
  provide: 'UUID',
  useValue: uuidv4,
};

const requestLimiterProvider = [
  RequestLimiterRepositories,
  RequestLimiterService,
  RequestLimiterStrategy,
  LimitRequestGuard,
];

const likeProviders = [
  UpdatePostLikeStatusHandler,
  LikeService,
  LikeRepositories,
];

@Module({
  imports: [
    CqrsModule,
    configModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const envSettings = configService.get('environmentSettings', {
          infer: true,
        });
        return { uri: envSettings.MONGO_CONNECTION_URI };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      {
        name: RecoveryPasswordSession.name,
        schema: RecoveryPasswordSessionSchema,
      },
      { name: RequestLimiter.name, schema: RequestLimiterSchema },
    ]),
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
  ],
  controllers: [
    UserController,
    TestingController,
    BlogController,
    PostController,
    CommentController,
    AuthController,
  ],
  providers: [
    ...authProviders,
    ...userProviders,
    ...postProviders,
    UUIDProvider,
    ...testingProviders,
    ...blogProviders,
    ...commentProviders,
    BasicStrategy,
    BasicGuard,
    NodeMailerService,
    MailTemplateService,
    RecoveryPasswordSessionRepositories,
    ...requestLimiterProvider,
    AuthJWTAccessGuard,
    JwtStrategy,
    JwtService,
    ApplicationObjectResult,
    BaseSorting,
    ...likeProviders,
    VerifyUserGuard,
  ],
})
export class AppModule {}
