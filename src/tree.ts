// import property from 'nested-property'
import property from './nested-property'
import keyBy from 'lodash.keyby'

interface ITreeOptions {
  id?: string
  parentId?: string
  children?: string
  rootID?: string,
  order?: string
}

const createTree = (array: Array<any>, rootNodes: Array<any>, options: any) => {
  const tree = [] as any
  // if (order) array = array.sort((a, b) => a[order] - b[order])
  // console.log(array)
  for (const rootNode of rootNodes) {
    // const node = rootNodes[rootNode]
    const childNode = array[rootNode[options.id]]
    if (!rootNode && !rootNodes.hasOwnProperty(rootNode)) {
      continue
    }

    if (childNode) {
      rootNode[options.children] = createTree(array, childNode, options)
    }

    tree.push(rootNode)
  }
  return options.order ? tree.sort((a: any, b: any) => a[options.order] - b[options.order]) : tree
}

const groupByParents = (array: Array<any>, options: any) => {
  const arrayByID = keyBy(array, options.id)
  return array.reduce(function (prev, item) {
    let parentID = property.get(item, options.parentId)
    if (!parentID || !arrayByID.hasOwnProperty(parentID)) {
      parentID = options.rootID
    }

    if (parentID && prev.hasOwnProperty(parentID)) {
      prev[parentID].push(item)
      return prev
    }

    prev[parentID] = [item]
    return prev
  }, {})
}

function isObject(o: any) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function deepClone(data: any) {
  if (Array.isArray(data)) {
    return data.map(deepClone)
  } else if (isObject(data)) {
    return Object.keys(data).reduce(function (o: any, k: any) {
      o[k] = deepClone(data[k])
      return o
    }, {})
  } else {
    return data
  }
}

/**
 * arrayToTree
 * Convert a plain array of nodes (with pointers to parent nodes) to a nested
 * data structure
 *
 * @name arrayToTree
 * @function
 *
 * @param {Array} data An array of data
 * @param {Object} options An object containing the following fields:
 *
 *  - `parentId` (String): A name of a property where a link to
 * a parent node could be found. Default: 'parent_id'
 *  - `id` (String): An unique node identifier. Default: 'id'
 *  - `children` (String): A name of a property where children nodes
 * are going to be stored. Default: 'children'.
 *
 * @return {Array} Result of transformation
 */

export const arrayToTree = (data: Array<any>, options?: ITreeOptions) => {
  options = Object.assign(
    {
      id: 'id',
      parentId: 'parent',
      children: 'children',
      rootID: '0',
      order: null
    },
    options
  )
  if (!Array.isArray(data)) {
    throw new TypeError('Expected an array but got an invalid argument')
  }

  const grouped = groupByParents(deepClone(data), options)
  // const grouped = groupByParents(JSON.parse(JSON.stringify(data)), options)
  return createTree(grouped, grouped[options?.rootID || '0'], options)
}

export function generateRoutes(nodes: any) {
  const rs = [] as any
  try {
    nodes.forEach((_e: any) => {
      const e = { ..._e }
      if (!e.meta.hidden) {
        if (e.children) {
          const child = generateRoutes(e.children)
          if (child.length > 0) e.children = child
        }
        // console.log(e)
        rs.push(e)
      }
    })
  } catch (e) {
    // console.log(e)
  }
  return rs
}

export async function generateRoutes2(nodes: any, dependent = null) {
  const rs = [] as any
  try {
    const childrens = nodes.filter((x: any) => x.dependent !== null)
    for await (const e of nodes) {
      // nodes.forEach(async e => {
      if (e.dependent === dependent) {
        if (e.meta.length) {
          for await (const x of e.meta) {
            if (x.key === 'title') e.label = x.value// i18n.t(`route.${x.value}`)
            if (x.key === 'icon') e.icon = x.value
            if (x.key === 'hidden') e.hidden = x.value
          }
        }
        if (!e.label) e.label = e.name
        // const title = e.meta.find(x => x.key === 'title')
        // if (title) e.label = title.value ? i18n.t(`route.${title.value}`) : e.name
        // e.label = e.meta && e.meta.title ? i18n.t(`route.${e.meta.title}`) : e.name
        const child = await generateRoutes2(childrens, e._id.toString())
        if (child.length > 0) e.children = child
        rs.push(e)
      }
    }
  } catch (e) {
    // console.log(e)
  }
  return rs
}

export function generateRoutesRoles(nodes: any) {
  const rs = [] as any
  try {
    nodes.forEach((_e: any) => {
      const e = { ..._e }
      if (!e.meta.constant) {
        e.label = e.meta.title
        e.icon = e.meta.icon
        if (e.children) {
          const child = generateRoutesRoles(e.children)
          if (child.length > 0) e.children = child
        }
        // console.log(e)
        rs.push(e)
      }
    })
  } catch (e) {
    // console.log(e)
  }
  return rs
}

export function generateCategory(nodes: any, dependent = null) {
  const rs = [] as any
  try {
    const childrens = nodes.filter((x: any) => x.dependent !== null)
    nodes.forEach((e: any) => {
      if (e.dependent === dependent) {
        e.label = e.meta && e.meta.label ? e.meta.label : e.title //i18n.t(`category.${e.meta.label}`)
        e.ticked = false
        const child = generateCategory(childrens, e._id)
        if (child.length > 0) e.children = child
        else e.children = []
        rs.push(e)
      }
    })
  } catch (e) {
    // console.log(e)
  }
  return rs
}

export function findNode(nodes: any, nodeId: any, nodeKey = 'id') {
  try {
    for (const e of nodes) {
      if (!nodeId) {
        if (e[nodeKey] === nodeId) return e
      } else {
        if (e[nodeKey] === nodeId) return e
      }
      if (e.children && e.children.length) {
        const child = findNode(e.children, nodeId, nodeKey) as any
        if (child) return child
      }
    }
  } catch (e) {
    // console.log(e)
  }
}

export function findNodes(nodes: any, nodeId: any, nodeKey = 'id') {
  let rs = [] as any
  try {
    nodes.forEach((e: any) => {
      if (nodeId.includes(e[nodeKey])) rs.push(e)

      if (e.children && e.children.length) {
        const child = findNode(e.children, nodeId, nodeKey)
        if (child.length) rs = [...rs, ...child]
      }
    })
  } catch (e) {
    // console.log(e)
  }
  // console.log(rs)
  return rs
}

export function findNodesIfExist(nodes: any, nodeIds: any, nodeKey = 'id') {
  let rs = [] as any
  // console.log(nodeIds)
  try {
    nodes.forEach((e: any) => {
      if (nodeIds.includes(e[nodeKey])) rs.push(e[nodeKey])

      if (e.children && e.children.length) {
        const child = findNodesIfExist(e.children, nodeIds, nodeKey)
        if (child.length) rs = [...rs, ...child]
      }
    })
  } catch (e) {
    // console.log(e)
  }
  // console.log(rs)
  return rs
}

export function getParent(nodes: any, node: any, nodeKey = 'id') {
  let rs = [] as any
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i][nodeKey] === node[nodeKey]) {
      rs.push(nodes[i])
      break;
    }
    else {
      if (nodes[i].children) {
        const child = getParent(nodes[i].children, node, nodeKey)
        if (child && child.length) {
          rs.push(nodes[i])
          rs = rs.concat(child)
        }
      }
    }
  }
  return rs
}
