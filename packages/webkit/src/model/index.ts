// MARK: - Table & Pagination
export interface TableDataModel<T> {
  items: T[];
  pagination: TablePaginationModel;
}

export interface TablePaginationModel {
  currentPage: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
}
