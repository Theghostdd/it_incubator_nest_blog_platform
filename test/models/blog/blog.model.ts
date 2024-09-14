export class BlogTestModel {
  private readonly name: string;
  private readonly description: string;
  private readonly websiteUrl: string;
  private readonly updateBlogName: string;
  private readonly updateBlogDescription: string;
  private readonly updateBlogWebsiteUrl: string;
  private readonly postTitle: string;
  private readonly postShortDescription: string;
  private readonly postContent: string;
  constructor() {
    this.name = 'Blog1';
    this.description = 'description blog';
    this.websiteUrl = 'https://www.google.com';
    this.updateBlogName = 'Blog2';
    this.updateBlogDescription = 'description blog for update';
    this.updateBlogWebsiteUrl = 'https://www.yandex.com';
    this.postTitle = 'postTitle';
    this.postShortDescription = 'post description';
    this.postContent = 'post content';
  }

  getBlogCreateModel() {
    return {
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
    };
  }

  getBlogPostCreateModel() {
    return {
      title: this.postTitle,
      shortDescription: this.postShortDescription,
      content: this.postContent,
    };
  }

  getBlogUpdateModel() {
    return {
      name: this.updateBlogName,
      description: this.updateBlogDescription,
      websiteUrl: this.updateBlogWebsiteUrl,
    };
  }
}
