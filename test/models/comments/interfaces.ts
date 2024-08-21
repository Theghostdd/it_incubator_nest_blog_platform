export interface ICommentInsertModel {
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  postInfo: {
    postId: string;
  };
  blogInfo: {
    blogId: string;
  };
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
  createdAt: string;
  __v: number;
}
