export type BaseSortingType = {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
};

export class BaseSorting {
  private sortByParams: string[] = [
    'createdAt',
    'updatedAt',
    'lastUpdateAt',
    'name',
    'title',
    'login',
    'email',
    'content',
    'blogName',
  ];

  constructor(
    public readonly sortBy: string,
    public readonly sortDirection: string,
    public readonly pageNumber: number,
    public readonly pageSize: number,
  ) {}

  public createBaseQuery(query: BaseSorting): BaseSortingType {
    return query
      ? {
          sortBy: this.sortByParams.includes(query.sortBy)
            ? query.sortBy
            : 'createdAt',
          sortDirection:
            query.sortDirection === 'asc' || query.sortDirection === 'desc'
              ? query.sortDirection.toUpperCase()
              : 'DESC',
          pageNumber: query.pageNumber ? Number(query.pageNumber) : 1,
          pageSize: query.pageSize ? Number(query.pageSize) : 10,
        }
      : {
          sortBy: 'createdAt',
          sortDirection: 'DESC',
          pageNumber: 1,
          pageSize: 10,
        };
  }
}
