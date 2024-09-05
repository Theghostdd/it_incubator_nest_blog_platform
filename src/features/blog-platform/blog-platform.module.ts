import { Module } from '@nestjs/common';
import { BlogRepository } from './blog/infrastructure/blog-repositories';
import { BlogQueryRepository } from './blog/infrastructure/blog-query-repositories';
import { BlogService } from './blog/application/blog-service';
import { BlogMapperOutputModel } from './blog/api/models/output/blog-output.model';
import { BlogSortingQuery } from './blog/api/models/input/blog-input.model';
import { CreateBlogHandler } from './blog/application/command/create-blog.command';
import { DeleteBlogByIdHandler } from './blog/application/command/delete-blog.command';
import { UpdateBlogByIdHandler } from './blog/application/command/update-blog.command';
import { PostService } from './post/application/post-service';
import { PostRepository } from './post/infrastructure/post-repositories';
import { PostQueryRepository } from './post/infrastructure/post-query-repositories';
import { PostMapperOutputModel } from './post/api/models/output/post-output.model';
import { UpdateByIdHandler } from './post/application/command/update-post.command';
import { DeletePostByIdHandler } from './post/application/command/delete-post.command';
import { CreatePostHandler } from './post/application/command/create-post.command';
import { CommentQueryRepositories } from './comment/infrastructure/comment-query-repositories';
import { CommentMapperOutputModel } from './comment/api/model/output/comment-output.model';
import { CreateCommentByPostIdHandler } from './comment/application/command/create-comment';
import { CommentRepositories } from './comment/infrastructure/comment-repositories';
import { UpdateCommentHandler } from './comment/application/command/update-comment';
import { CommentService } from './comment/application/comment-service';
import { DeleteCommentHandler } from './comment/application/command/delete-comment';
import { UpdateCommentLikeStatusHandler } from './like/application/command/update-comment-like-status';
import { UpdatePostLikeStatusHandler } from './like/application/command/update-post-like-status';
import { LikeService } from './like/application/like-service';
import { LikeRepositories } from './like/infrastructure/like-repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './post/domain/post.entity';
import { Blog, BlogSchema } from './blog/domain/blog.entity';
import { Comment, CommentSchema } from './comment/domain/comment.entity';
import { Like, LikeSchema } from './like/domain/like.entity';
import { UsersModule } from '../users/users.module';
import { BlogController } from './blog/api/blog-controller';
import { PostController } from './post/api/post-controller';
import { CommentController } from './comment/api/comment-controller';
import { FindBlogConstraint } from '../../core/decorators/find-blog';
import { CoreModule } from '../../core/core.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
  ],
  controllers: [BlogController, PostController, CommentController],
  providers: [
    BlogRepository,
    BlogQueryRepository,
    BlogService,
    BlogMapperOutputModel,
    BlogSortingQuery,
    CreateBlogHandler,
    DeleteBlogByIdHandler,
    UpdateBlogByIdHandler,
    PostService,
    PostRepository,
    PostQueryRepository,
    PostMapperOutputModel,
    UpdateByIdHandler,
    DeletePostByIdHandler,
    CreatePostHandler,
    CommentQueryRepositories,
    CommentMapperOutputModel,
    CreateCommentByPostIdHandler,
    CommentRepositories,
    UpdateCommentHandler,
    CommentService,
    DeleteCommentHandler,
    UpdateCommentLikeStatusHandler,
    UpdatePostLikeStatusHandler,
    LikeService,
    LikeRepositories,
    FindBlogConstraint,
  ],
  exports: [MongooseModule],
})
export class BlogPlatformModule {}
