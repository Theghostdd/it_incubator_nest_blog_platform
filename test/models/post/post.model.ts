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
}
