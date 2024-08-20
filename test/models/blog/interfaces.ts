export interface IBlogCreateModel {
  name: string;
  description: string;
  websiteUrl: string;
}

export interface IBlogUpdateModel {
  name: string;
  description: string;
  websiteUrl: string;
}

export interface IBlogInsertModel {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  __v: number;
}
