export const getIp = function (request: any) {
  // const ip = req.headers['x-real-ip'] || req.connection.remoteAddress
  // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  // console.log(req.connection.remoteAddress)
  // console.log(req.connection.remotePort)
  // console.log(req.connection.localAddress)
  // console.log(req.connection.localPort)
  // ::ffff:127.0.0.1
  const ip = request.ip
  return ip === '::1' || !ip ? '127.0.0.1' : (ip === '::ffff:127.0.0.1' ? '127.0.0.1' : ip)
}

export const getHost = function (request: any) {
  if (request) return `${request.protocol}://${request.get('host')}`
  return 'http://127.0.0.1/'
}

export const getHostUrl = function (request: any) {
  if (request) return `${request.protocol}://${request.get('host')}${request.originalUrl}`
  return 'http://127.0.0.1/'
}

export const getUserAgent = function (request: any) {
  if (request) return request.headers['user-agent']
  else return 'undefined'
}
