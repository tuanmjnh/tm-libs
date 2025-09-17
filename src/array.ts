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

export const pushIfNotExist = function (array: any[], item: any, key?: string) {
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
export const pushIfNotExistUpdate = function (array: any[], item: any, key?: string) {
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
export const distinctArray = function (array: any[]) {
  return [...new Set(array)] as any
}
export const distinctArrayObject = function (array: any[], key: string) {
  return [...new Set(array.map(x => x[key]))] as any
}
export const sum = function (array: any[], key?: string) {
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
export const max = function (array: any[]) {
  return Math.max.apply(null, array)
}
export const min = function (array: any[]) {
  return Math.min.apply(null, array)
}

// Simple shuffle function (Fisher-Yates)
export const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const splitRandomItems = <T>(items: T[], min: number, max: number, skipSmall: number = 0, shuffle: boolean = false): T[][] => {
  const result: T[][] = []

  if (!items || items.length === 0) return result

  // Copy the array
  let remain = [...items]

  // Shuffle if needed
  if (shuffle) remain = shuffleArray(remain)


  // If min > total items then take all
  if (min > remain.length) {
    result.push(remain)
  } else {
    while (remain.length > 0) {
      let count = Math.floor(Math.random() * (max - min + 1)) + min
      if (count > remain.length) count = remain.length

      const group = remain.splice(0, count)
      result.push(group)
    }
  }

  // Skip Smaller Groups skipSmall
  return result.filter(group => group.length >= skipSmall)
}