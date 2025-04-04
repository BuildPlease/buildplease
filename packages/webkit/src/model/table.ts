export interface TableDataModel<T> {
  items: T[];
  pagination: TablePaginationModel;
}

export interface TablePaginationModel {
  current: number;
  pageSize: number;
  total?: number;
  pageSizeOptions?: number[];
}
