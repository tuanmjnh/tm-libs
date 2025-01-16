interface IOptions {
  items: Array<any>
  offset: number
  limit: number
}
interface IPagination {
  data: Array<any>
  rowsPerPage: number
  page: number
  rowsNumber: number
  totalPage: number
}
export function Pagination({ items, offset = 0, limit = 10 }: IOptions): IPagination {
  if (!items || items.length < 1) return { data: items, page: 0, rowsPerPage: 0, rowsNumber: 0, totalPage: 0 }
  const rowsNumber = items.length
  const totalPage = Math.ceil(rowsNumber / limit)
  const result = items.slice((offset - 1) * limit, offset * limit)
  return { data: result, page: offset, rowsPerPage: limit, rowsNumber: rowsNumber, totalPage: totalPage }
}
