export class BlogTestModel {
  private readonly name: string;
  private readonly description: string;
  private readonly websiteUrl: string;
  constructor() {
    this.name = 'Blog1';
    this.description = 'description blog';
    this.websiteUrl = 'www.google.com';
  }

  getBlogCreateModel() {
    return {
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
    };
  }
}
