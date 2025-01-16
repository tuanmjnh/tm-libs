const getScreenHeight = () => {
  return window.screen.height
}

const getScrollHeight = () => {
  return document.body.scrollHeight
}

const getCurrentScrollX = () => {
  // horizontal scrolling amount
  // return window.pageXOffset
  return window.scrollX
}

const getCurrentScrollY = () => {
  // vertical scrolling amount
  // return window.pageYOffset
  return window.scrollY
}

const scrollTo = (x = 0, y = 0) => {
  window.scrollTo(x, y)
}

const scrollRandomScreen = (x = 0, min: number, max: number) => {
  if (!max) max = getScreenHeight()
  if (min < 0) min = 0
  const rdHeight = Math.floor(Math.random() * (max - min + 1)) + min
  scrollTo(x, rdHeight)
}

export const scrollRandomY = (type: any, i = 0, args: any, timeout: number) => {
  try {
    return new Promise(resolve => {
      // const to = setTimeout((z) => {
      if (!args.heightMax) args.heightMax = window.screen.height
      // const rdHeight = Math.floor(Math.random() * (max - (-max) + 1)) + (-max)
      // const rdHeight = Math.floor(Math.random() * max)
      const rdHeight = Math.floor(Math.random() * (args.heightMax - args.heightMin + 1)) + args.heightMin
      const scrollToHeight = i * rdHeight
      window.scrollTo(0, scrollToHeight)
      console.log(`${type}: height ${scrollToHeight} - timeout: ${Math.floor(timeout / 1000)}s`)
      return resolve(true)
      // }, timeout)
    })
  } catch (e) {
    console.log(e)
    return false
  }
}

export const scrollElement = (type: any, args: any, index: number, timeout: number) => {
  try {
    return new Promise(resolve => {
      const els = document.querySelectorAll(args.el)
      if (els.length < 1) {
        console.log(`Can't find any element - ${args.el}`)
        return resolve(true)
      }
      // console.log(`Run ${type}: ${index} of ${els.length} - timeout: ${Math.floor(timeout / 1000)}s - ${el}`)
      const to = setTimeout((y) => {
        els[index].scrollIntoView()
        clearTimeout(to)
        console.log(`[${to}]Moved ${type}: ${index} of ${els.length} - timeout: ${Math.floor(timeout / 1000)}s`)
        // console.log(`Index ${index} focus - Id ${to}: done`)
        return resolve(true)
      }, timeout)
      return resolve(true)
    })
  } catch (e) {
    console.log(e)
    return false
  }
}
