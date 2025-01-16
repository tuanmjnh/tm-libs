/**
* Convert the given array to a tree structure.
* @param arr - the original array, where each element contains the id and pid attributes, and pid represents the parent id.
* @returns Returns the converted tree structure array.
*/
export function toTreeOfArray(arr: any[]) {
  // Initialize the result array
  const res: any = []
  // Use Map to store array elements, with id as the key and the element itself as the value
  const map = new Map()

  // Traverse the array and store each element in the Map with id as the key
  arr.forEach((item) => {
    map.set(item.id, item)
  })

  // Traverse the array again and organize the elements into a tree structure according to pid
  arr.forEach((item) => {
    // Get the parent element of the current element
    const parent = item.pid && map.get(item.pid)
    // If there is a parent element
    if (parent) {
      // If the parent element already has child elements, append the current element to the child element array
      if (parent?.children)
        parent.children.push(item)
      // If the parent element has no child elements, create a child element array and use the current element as the first element
      else
        parent.children = [item]
    }
    // If there is no parent element, add the current element directly to the result array
    else {
      res.push(item)
    }
  })
  // Return the organized tree structure array
  return res
}

export const sortByKey = (arr: any[], key: string) => {
  arr.sort((a, b) => a[key] - b[key])
}

export const pushIfNotExist = function (array: Array<any>, item: any, key?: string) {
  if (Array.isArray(item)) {
    item.forEach(e => {
      if (key) {
        if (array.findIndex(x => x[key] === e[key]) < 0) array.push(e)
      } else {
        if (array.indexOf(e) < 0) array.push(e)
      }
    })
  } else {
    if (key) {
      if (array.findIndex(x => x[key] === item[key]) < 0) array.push(item)
    } else {
      if (array.indexOf(item) < 0) array.push(item)
    }
  }
}
export const pushIfNotExistUpdate = function (array: Array<any>, item: any, key?: string) {
  if (Array.isArray(item)) {
    item.forEach(e => {
      if (key) {
        const arr = array.find(x => x[key] === e[key])
        if (arr) {
          Object.keys(arr).forEach(k => {
            arr[k] = e[k]
          })
        } else array.push(e)
      } else {
        if (array.indexOf(e) < 0) array.push(e)
      }
    })
  } else {
    if (key) {
      const arr = array.find(x => x[key] === item[key])
      if (arr) {
        Object.keys(arr).forEach(k => {
          arr[k] = item[k]
        })
      } else array.push(item)
      // if (array.findIndex(x => x[key] === element[key]) < 0) array.push(element)
    } else {
      if (array.indexOf(item) < 0) array.push(item)
    }
  }
}
export const distinctArray = function (array: Array<any>) {
  return [...new Set(array)] as any
}
export const distinctArrayObject = function (array: Array<any>, key: string) {
  return [...new Set(array.map(x => x[key]))] as any
}
export const sum = function (array: Array<any>, key?: string) {
  let total = 0
  if (key) {
    for (let i = 0, length = array.length; i < length; i++) {
      const number = parseInt(array[i][key])
      if (number) total = total + number
    }
  } else {
    for (let i = 0, length = array.length; i < length; i++) {
      const number = parseInt(array[i])
      if (number) total = total + number
    }
  }
  return total
}
export const max = function (array: Array<any>) {
  return Math.max.apply(null, array)
}
export const min = function (array: Array<any>) {
  return Math.min.apply(null, array)
}