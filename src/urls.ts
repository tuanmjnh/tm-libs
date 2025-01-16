export const getUrl = (val: string) => {
  return new URL(val)
}
export const matchUrl = (val: string) => {
  const regex = /^(?:(?:(([^:\/#\?]+:)?(?:(?:\/\/)(?:(?:(?:([^:@\/#\?]+)(?:\:([^:@\/#\?]*))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/
  return val.match(regex)
}
export const matchUrls = (val: string) => {
  const regex = /[A-Za-z]+:\/\/[A-Za-z0-9-]+.[A-Za-z0-9-:%&;?#/.=_]+/g
  return val.match(regex)
}