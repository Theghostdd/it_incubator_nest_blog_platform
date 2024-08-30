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

  getCommentInsertModel() {
    return {
      content: this.content,
      commentatorInfo: {
        userId: this.commentatorInfo.userId,
        userLogin: this.commentatorInfo.userLogin,
      },
      postInfo: {
        postId: this.postInfo.postId,
      },
      blogInfo: {
        blogId: this.blogInfo.blogId,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
      createdAt: new Date().toISOString(),
      __v: 0,
    };
  }

  getCommentUpdateModel() {
    return {
      content: 'this is new comment content for update comment by id',
    };
  }

  getCommentInsertManyModel() {
    return [
      {
        content: this.content,
        commentatorInfo: {
          userId: '66c5d451de17090f93186261',
          userLogin: this.commentatorInfo.userLogin,
        },
        postInfo: {
          postId: '66c5d451de17090f93186262',
        },
        blogInfo: {
          blogId: '66c5d451de17090f93186261',
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
      {
        content: 'other content',
        commentatorInfo: {
          userId: '66c5d451de17090f93186261',
          userLogin: this.commentatorInfo.userLogin,
        },
        postInfo: {
          postId: '66c5d451de17090f93186262',
        },
        blogInfo: {
          blogId: '66c5d451de17090f93186261',
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
      {
        content: 'this.content',
        commentatorInfo: {
          userId: '66c5d451de17090f93186261',
          userLogin: this.commentatorInfo.userLogin,
        },
        postInfo: {
          postId: '66c5d451de17090f93186262',
        },
        blogInfo: {
          blogId: '66c5d451de17090f93186261',
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
      {
        content: 'about me',
        commentatorInfo: {
          userId: '66c5d451de17090f93186261',
          userLogin: this.commentatorInfo.userLogin,
        },
        postInfo: {
          postId: '66c5d451de17090f93186262',
        },
        blogInfo: {
          blogId: '66c5d451de17090f93186261',
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
      {
        content: 'good',
        commentatorInfo: {
          userId: '66c5d451de17090f93186261',
          userLogin: this.commentatorInfo.userLogin,
        },
        postInfo: {
          postId: '66c5d451de17090f93186262',
        },
        blogInfo: {
          blogId: '66c5d451de17090f93186261',
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
      {
        content: 'like',
        commentatorInfo: {
          userId: '66c5d451de17090f93186261',
          userLogin: this.commentatorInfo.userLogin,
        },
        postInfo: {
          postId: '66c5d451de17090f93186262',
        },
        blogInfo: {
          blogId: '66c5d451de17090f93186261',
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
      {
        content: 'ou',
        commentatorInfo: {
          userId: '66c5d451de17090f93186261',
          userLogin: this.commentatorInfo.userLogin,
        },
        postInfo: {
          postId: '66c5d451de17090f93186262',
        },
        blogInfo: {
          blogId: '66c5d451de17090f93186261',
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
      {
        content: 'hello',
        commentatorInfo: {
          userId: '66c5d451de17090f93186261',
          userLogin: this.commentatorInfo.userLogin,
        },
        postInfo: {
          postId: '66c5d451de17090f93186262',
        },
        blogInfo: {
          blogId: '66c5d451de17090f93186261',
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
      {
        content: 'lol',
        commentatorInfo: {
          userId: '66c5d451de17090f93186261',
          userLogin: this.commentatorInfo.userLogin,
        },
        postInfo: {
          postId: '66c5d451de17090f93186262',
        },
        blogInfo: {
          blogId: '66c5d451de17090f93186261',
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
      {
        content: 'me',
        commentatorInfo: {
          userId: '66c5d451de17090f93186261',
          userLogin: this.commentatorInfo.userLogin,
        },
        postInfo: {
          postId: '66c5d451de17090f93186262',
        },
        blogInfo: {
          blogId: '66c5d451de17090f93186261',
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
      {
        content: 'not',
        commentatorInfo: {
          userId: '66c5d451de17090f93186261',
          userLogin: this.commentatorInfo.userLogin,
        },
        postInfo: {
          postId: '66c5d451de17090f93186262',
        },
        blogInfo: {
          blogId: '66c5d451de17090f93186261',
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        createdAt: new Date().toISOString(),
        __v: 0,
      },
    ];
  }
}
