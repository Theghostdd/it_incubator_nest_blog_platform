import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../users/user/domain/user.entity';
import { Injectable } from '@nestjs/common';
import {
  Blog,
  BlogModelType,
} from '../../blog-platform/blog/domain/blog.entity';
import {
  Post,
  PostModelType,
} from '../../blog-platform/post/domain/post.entity';
import {
  Comment,
  CommentModelType,
} from '../../blog-platform/comment/domain/comment.entity';
import {
  Like,
  LikeModelType,
} from '../../blog-platform/like/domain/like.entity';
@Injectable()
export class TestingRepositories {
  constructor(
    @InjectModel(User.name) private readonly userModel: UserModelType,
    @InjectModel(Blog.name) private readonly blogModel: BlogModelType,
    @InjectModel(Post.name) private readonly postModel: PostModelType,
    @InjectModel(Comment.name) private readonly commentModel: CommentModelType,
    @InjectModel(Like.name) private readonly likeModel: LikeModelType,
  ) {}

  async clearDb(): Promise<void> {
    await Promise.all([
      this.userModel.deleteMany(),
      this.blogModel.deleteMany(),
      this.postModel.deleteMany(),
      this.commentModel.deleteMany(),
      this.likeModel.deleteMany(),
    ]);
  }
}
