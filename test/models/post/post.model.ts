export class PostTestModel {
  private readonly title: string;
  private readonly shortDescription: string;
  private readonly content: string;
  private readonly blogId: string;
  private readonly blogName: string;
  private readonly updatePostTitle: string;
  private readonly updatePostShortDescription: string;
  private readonly updatePostContent: string;

  constructor() {
    this.title = 'user1';
    this.shortDescription = 'user1@example.com';
    this.content = 'myPassword';
    this.blogId = '';
    this.blogName = '';
    this.updatePostTitle = 'user2';
    this.updatePostShortDescription = 'new description';
    this.updatePostContent = 'new content';
  }

  getPostCreateModel() {
    return {
      title: this.title,
      shortDescription: this.shortDescription,
      content: this.content,
      blogId: this.blogId,
    };
  }

  getPostUpdateModel() {
    return {
      title: this.updatePostTitle,
      shortDescription: this.updatePostShortDescription,
      content: this.updatePostContent,
      blogId: this.blogId,
    };
  }

  getPostInsertModel() {
    return {
      title: this.title,
      shortDescription: this.shortDescription,
      content: this.content,
      blogId: '66c4e15b0520745731561266',
      createdAt: new Date().toISOString(),
      blogName: 'Some blog',
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
      __v: 0,
    };
  }

  getPostInsertModels() {
    return [
      {
        title: this.title,
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: '66c4e15b0520745731561266',
        createdAt: new Date().toISOString(),
        blogName: 'Some blog',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: 0,
      },
      {
        title: this.title + 'p1',
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: '66c4e15b0520745731561266',
        createdAt: new Date().toISOString(),
        blogName: 'Some blog',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: 0,
      },
      {
        title: this.title + 'p2',
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: '66c4e15b0520745731561266',
        createdAt: new Date().toISOString(),
        blogName: 'Some blog',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: 0,
      },
      {
        title: this.title + 'p3',
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: '66c4e15b0520745731561266',
        createdAt: new Date().toISOString(),
        blogName: 'Some blog',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: 0,
      },
      {
        title: this.title + 'p4',
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: '66c4e15b0520745731561266',
        createdAt: new Date().toISOString(),
        blogName: 'Some blog',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: 0,
      },
      {
        title: this.title + 'p5',
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: '66c4e15b0520745731561266',
        createdAt: new Date().toISOString(),
        blogName: 'Some blog',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: 0,
      },
      {
        title: this.title + 'p6',
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: '66c4e15b0520745731561266',
        createdAt: new Date().toISOString(),
        blogName: 'Some blog',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: 0,
      },
      {
        title: this.title + 'p7',
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: '66c4e15b0520745731561266',
        createdAt: new Date().toISOString(),
        blogName: 'Some blog',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: 0,
      },
      {
        title: this.title + 'p8',
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: '66c4e15b0520745731561266',
        createdAt: new Date().toISOString(),
        blogName: 'Some blog',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: 0,
      },
      {
        title: this.title + 'p9',
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: '66c4e15b0520745731561266',
        createdAt: new Date().toISOString(),
        blogName: 'Some blog',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: 0,
      },
      {
        title: this.title + 'p10',
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: '66c4e15b0520745731561266',
        createdAt: new Date().toISOString(),
        blogName: 'Some blog',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
        },
        __v: 0,
      },
    ];
  }
}
