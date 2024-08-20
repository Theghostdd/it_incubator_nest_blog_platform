export class BlogTestModel {
  private readonly name: string;
  private readonly description: string;
  private readonly websiteUrl: string;
  private readonly updateBlogName: string;
  private readonly updateBlogDescription: string;
  private readonly updateBlogWebsiteUrl: string;
  constructor() {
    this.name = 'Blog1';
    this.description = 'description blog';
    this.websiteUrl = 'www.google.com';
    this.updateBlogName = 'Blog2';
    this.updateBlogDescription = 'description blog for update';
    this.updateBlogWebsiteUrl = 'www.yandex.com';
  }

  getBlogCreateModel() {
    return {
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
    };
  }

  getBlogInsertModel() {
    return {
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
      __v: 0,
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
