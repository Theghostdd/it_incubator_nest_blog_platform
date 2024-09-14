export interface IBlogCreateModel {
  name: string;
  description: string;
  websiteUrl: string;
}

export interface IBlogPostCreateModel {
  title: string;
  shortDescription: string;
  content: string;
}

export interface IBlogUpdateModel {
  name: string;
  description: string;
  websiteUrl: string;
}
