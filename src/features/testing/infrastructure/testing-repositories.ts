import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../user/domain/user.entity';
import { Injectable } from '@nestjs/common';
import { Blog, BlogModelType } from '../../blog/domain/blog.entity';
import { Post, PostModelType } from '../../post/domain/post.entity';
import { Comment, CommentModelType } from '../../comment/domain/comment.entity';
@Injectable()
export class TestingRepositories {
  constructor(
    @InjectModel(User.name) private readonly userModel: UserModelType,
    @InjectModel(Blog.name) private readonly blogModel: BlogModelType,
    @InjectModel(Post.name) private readonly postModel: PostModelType,
    @InjectModel(Comment.name) private readonly commentModel: CommentModelType,
  ) {}

  async clearDb(): Promise<void> {
    await Promise.all([
      this.userModel.deleteMany(),
      this.blogModel.deleteMany(),
      this.postModel.deleteMany(),
      this.commentModel.deleteMany(),
    ]);
  }
}
