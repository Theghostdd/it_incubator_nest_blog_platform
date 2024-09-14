export class CommentsTestModel {
  private readonly content: string;
  private readonly commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  private readonly postInfo: { postId: string };
  private readonly blogInfo: { blogId: string };
  constructor(userLogin: string) {
    this.content = 'content to comment fkjrfnjfrnjfrnjfjrfrrffrfr';
    this.commentatorInfo = {
      userId: '',
      userLogin: userLogin,
    };
    this.postInfo = {
      postId: '',
    };
    this.blogInfo = {
      blogId: '',
    };
  }

  getCommentCreateModel() {
    return {
      content: this.content,
    };
  }

  getCommentUpdateModel() {
    return {
      content: 'this is new comment content for update comment by id',
    };
  }
}
