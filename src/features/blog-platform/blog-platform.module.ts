import { Module } from '@nestjs/common';
import { BlogQueryRepository } from './blog/infrastructure/blog-query-repositories';
import { BlogMapperOutputModel } from './blog/api/models/output/blog-output.model';
import { BlogSortingQuery } from './blog/api/models/input/blog-input.model';
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
import { BlogController } from './blog/api/blog-controller';
import { PostController } from './post/api/post-controller';
import { CommentController } from './comment/api/comment-controller';
import { CalculateLike } from './like/domain/calculate-like';
import { Post } from './post/domain/post.entity';
import { Comment, CommentFactory } from './comment/domain/comment.entity';
import {
  CommentLike,
  Like,
  LikeFactory,
  PostLike,
} from './like/domain/like.entity';
import { FindBlogConstraint } from '../../core/decorators/find-blog';
import { BlogAdminController } from './blog/api/blog-sa-controller';
import { BlogService } from './blog/application/blog-service';
import { UsersModule } from '../users/users.module';
import { BlogRepository } from './blog/infrastructure/blog-repositories';
import { CreateBlogHandler } from './blog/application/command/create-blog.command';
import { Blog } from './blog/domain/blog.entity';
import { UpdateBlogByIdHandler } from './blog/application/command/update-blog.command';
import { DeleteBlogByIdHandler } from './blog/application/command/delete-blog.command';
import { TypeOrmModule } from '@nestjs/typeorm';

export const BlogProvider = {
  provide: 'Blog',
  useValue: Blog,
};

export const PostProvider = {
  provide: 'Post',
  useValue: Post,
};

export const LikeProvider = {
  provide: 'Like',
  useValue: Like,
};

export const CommentProvider = {
  provide: 'Comment',
  useValue: Comment,
};

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Blog, Post, Comment, PostLike, CommentLike]),
  ],
  controllers: [
    BlogController,
    PostController,
    CommentController,
    BlogAdminController,
  ],
  providers: [
    BlogProvider,
    PostProvider,
    LikeProvider,
    BlogQueryRepository,
    BlogMapperOutputModel,
    BlogSortingQuery,
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
    CalculateLike,
    CommentFactory,
    LikeFactory,
    BlogService,
    BlogRepository,
    CreateBlogHandler,
    UpdateBlogByIdHandler,
    DeleteBlogByIdHandler,
  ],
  exports: [],
})
export class BlogPlatformModule {}
