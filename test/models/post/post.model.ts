export class PostTestModel {
  private readonly title: string;
  private readonly shortDescription: string;
  private readonly content: string;
  private blogId: string;
  constructor() {
    this.title = 'user1';
    this.shortDescription = 'user1@example.com';
    this.content = 'myPassword';
    this.blogId = '';
  }

  getUserCreateModel() {
    return {
      title: this.title,
      shortDescription: this.shortDescription,
      content: this.content,
      blogId: this.blogId,
    };
  }

  setBlogId(id: string) {
    this.blogId = id;
  }
}
