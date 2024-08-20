export type BaseSortingType = {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
};

export class BaseSorting {
  constructor(
    public readonly sortBy: string,
    public readonly sortDirection: string,
    public readonly pageNumber: number,
    public readonly pageSize: number,
  ) {}

  public createBaseQuery(query: BaseSorting): BaseSortingType {
    return query
      ? {
          sortBy: query.sortBy ? query.sortBy : 'createdAt',
          sortDirection:
            query.sortDirection === 'asc' || query.sortDirection === 'desc'
              ? query.sortDirection
              : 'desc',
          pageNumber: query.pageNumber ? Number(query.pageNumber) : 1,
          pageSize: query.pageSize ? Number(query.pageSize) : 10,
        }
      : {
          sortBy: 'createdAt',
          sortDirection: 'desc',
          pageNumber: 1,
          pageSize: 10,
        };
  }
}
