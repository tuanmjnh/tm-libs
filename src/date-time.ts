import moment from 'moment'

export const stringTimeToSecond = (timeHMS: string) => {
  try {
    const arr = timeHMS.split(':')
    return (+arr[0]) * 60 * 60 + (+arr[1]) * 60 + (+arr[2])
  } catch (e) {
    return 0
  }
}
export const ArrayTimeToSecond = (timeArr: Array<number>) => {
  try {
    return (timeArr[0]) * 60 * 60 + (timeArr[1]) * 60 + (timeArr[2])
  } catch (e) {
    return 0
  }
}

export const secondToTime = (seconds: number, format = 'HH:mm:ss') => {
  try {
    return moment.utc(seconds * 1000).format(format)
  } catch (e) {
    return ''
  }
}

export const timeToArray = (date: Date, format = 'HH:mm:ss', split = ':') => {
  try {
    return moment(date).format(format).split(split)
  } catch (e) {
    return []
  }
}

export const timeToArrayNumber = (date: Date, format = 'HH:mm:ss', split = ':') => {
  try {
    return timeToArray(date, format, split).map(Number)
  } catch (e) {
    return []
  }
}

export const toTimestamp = (date: string) => {
  const datum = Date.parse(date)
  return datum / 1000
}

export const randomDate = function (start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

export const toDate = function (timestamp: string, format?: string) {
  const ts = parseInt(timestamp)
  if (format)
    return moment(ts).format(format)
  else
    return moment(ts).toDate()
}