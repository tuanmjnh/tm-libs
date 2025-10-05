interface IOptions {
  items: Array<any>
  offset: number
  limit: number
}
interface IPagination {
  items: Array<any>
  limit: number
  page: number
  total: number
  totalPage: number
}
export function TMPagination({ items, offset = 0, limit = 10 }: IOptions): IPagination {
  if (!items || items.length < 1) return { items: items, page: 0, limit: 0, total: 0, totalPage: 0 }
  const total = items.length
  const totalPage = Math.ceil(total / limit)
  const result = items.slice((offset - 1) * limit, offset * limit)
  return { items: result, page: offset, limit: limit, total: total, totalPage: totalPage }
}
export { };