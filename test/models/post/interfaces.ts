export interface IPostCreateModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export interface IPostUpdateModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export interface IPostInsertModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
  blogName: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
  __v: number;
}
