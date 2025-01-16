export const toLowerCaseObj = (arg: any) => {
  const rs = {} as any
  Object.keys(arg).forEach(e => {
    rs[e.toLowerCase()] = arg[e]
  })
  return rs
}
export const toUpperCaseObj = (arg: any) => {
  const rs = {} as any
  Object.keys(arg).forEach(e => {
    rs[e.toUpperCase()] = arg[e]
  })
  return rs
}

export const getBody = (obj: any, body: any) => {
  const rs = {} as any
  Object.keys(obj).forEach(e => {
    if (body && body[e] !== undefined) rs[e] = body[e]
  })
  return rs
}