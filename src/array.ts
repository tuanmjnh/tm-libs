/**
 * Helper: Get value from object by path (supports "a.b.c")
 */
function getNestedValue<T extends Record<string, any>>(obj: T, path: keyof T | string): any {
  if (typeof path !== 'string' || !path.includes('.')) {
    return obj[path as keyof T];
  }
  return path.split('.').reduce((acc, key) => acc && acc[key] !== undefined ? acc[key] : undefined, obj);
}

/**
 * Helper: Assign value to object by path (supports "a.b.c")
 */
function setNestedValue<T extends Record<string, any>>(
  obj: T,
  path: keyof T | string,
  value: any
): void {
  if (typeof path !== 'string' || !path.includes('.')) {
    (obj as Record<string, any>)[path as string] = value;
    return;
  }

  const keys = path.split('.');
  const lastKey = keys.pop()!;
  // cast acc to Record<string, any> to avoid generic write errors
  const target = keys.reduce<Record<string, any>>((acc, key) => {
    if (!acc[key] || typeof acc[key] !== 'object') acc[key] = {};
    return acc[key];
  }, obj as Record<string, any>);

  target[lastKey] = value;
}

/**
 * Convert flat array to tree, support nested key
 */
export function arrayToTree<T extends Record<string, any>>(
  arr: T[],
  id: keyof T | string = "id",
  pid: keyof T | string = "pid"
): (T & { children?: (T & { children?: any[] })[] })[] {
  if (!Array.isArray(arr)) return [];

  const res: (T & { children?: any[] })[] = [];
  const map = new Map<any, T & { children?: any[] }>();

  // Step 1: clone each node into the map (avoid duplicate references)
  arr.forEach((item) => {
    const itemId = getNestedValue(item, id);
    // Dùng spread clone object để tách biệt khỏi object gốc
    map.set(itemId, { ...item, children: [] });
  });

  // Step 2: browse map to assign parent-child relationship
  map.forEach((node) => {
    const parentId = getNestedValue(node, pid);
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children!.push(node);
    } else {
      res.push(node);
    }
  });

  return res;
}

/**
* Convert tree to array,
* support nested key path and keep parent-child relationship.
 */
export function treeToArray<T extends Record<string, any>>(
  tree: (T & { children?: any[] })[],
  id: keyof T | string = "id",
  pid: keyof T | string = "pid",
  childrenKey: string = "children"
): T[] {
  const result: T[] = [];

  /**
   * Recursively flatten nodes
   */
  const traverse = (nodes: (T & { children?: any[] })[], parentId: any | null) => {
    for (const node of nodes) {
      // Clone node to not change original data
      const clone = JSON.parse(JSON.stringify(node));

      // Assign pid to clone (if there is a parent)
      if (parentId !== null) {
        setNestedValue(clone, pid, parentId);
      }

      // Clear the children field before adding it to the result.
      delete clone[childrenKey];
      result.push(clone);

      // Recursively handle children
      const children = node[childrenKey];
      if (Array.isArray(children) && children.length > 0) {
        const currentId = getNestedValue(node, id);
        traverse(children, currentId);
      }
    }
  };

  traverse(tree, null);
  return result;
}

/**
* Create graph structure from flat array.
* Allow 1 node to have many different parents.
 */
export function arrayToGraph<T extends Record<string, any>>(
  arr: T[],
  id: keyof T | string = "id",
  pid: keyof T | string = "pid"
): (T & { children?: any[]; parents?: any[] })[] {
  if (!Array.isArray(arr)) return [];

  // Map to quickly look up node by id
  const map = new Map<any, T & { children?: any[]; parents?: any[] }>();

  // Step 1: clone each node and put it into the map
  arr.forEach((item) => {
    const itemId = getNestedValue(item, id);
    if (itemId === undefined) return;
    const clone = { ...item, children: [], parents: [] };
    map.set(itemId, clone);
  });

  // Step 2: Create many-to-many relationship
  arr.forEach((item) => {
    const itemId = getNestedValue(item, id);
    let parentKeys = getNestedValue(item, pid);

    if (parentKeys == null) return;
    if (!Array.isArray(parentKeys)) parentKeys = [parentKeys];

    parentKeys.forEach((parentId: any) => {
      const parent = map.get(parentId);
      const node = map.get(itemId);
      if (!parent || !node) return;

      // push two-way relationship
      parent.children!.push(node);
      node.parents!.push(parent);
    });
  });

  // Step 3: find root nodes (no parent)
  const roots = Array.from(map.values()).filter((node) => !node.parents || node.parents.length === 0);

  return roots;
}

/**
 * Sort array by key (auto detect number/string)
 */
export const sortByKey = (arr: any[], key: string) => {
  return arr.sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    return typeof av === "number" && typeof bv === "number"
      ? av - bv
      : String(av).localeCompare(String(bv));
  });
};

/**
 * Push item(s) to array if not exist
 */
export const pushIfNotExist = <T>(array: T[], item: T | T[], key?: keyof T) => {
  const add = (el: T) => {
    if (key) {
      if (!array.some((x) => x[key] === el[key])) array.push(el);
    } else if (!array.includes(el)) {
      array.push(el);
    }
  };
  (Array.isArray(item) ? item : [item]).forEach(add);
};

/**
 * Push item(s) or update if exist (based on key)
 */
export const pushIfNotExistUpdate = <T>(
  array: T[],
  item: T | T[],
  key?: keyof T
) => {
  const updateOrAdd = (el: T) => {
    if (key) {
      const found = array.find((x) => x[key] === el[key]);
      if (found) {
        Object.assign(found, el);
      } else {
        array.push(el);
      }
    } else if (!array.includes(el)) {
      array.push(el);
    }
  };

  (Array.isArray(item) ? item : [item]).forEach(updateOrAdd);
};

/**
 * Return distinct primitive values
 */
export const distinctArray = <T>(array: T[]) => [...new Set(array)];

/**
 * Return distinct objects by key
 */
export const distinctArrayObject = <T extends Record<string, any>>(
  arr: T[],
  key: keyof T
): T[] => {
  const seen = new Set<any>();
  return arr.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
};

/**
 * Sum values in array
 */
export const sum = (array: any[], key?: string): number => {
  let total = 0;
  for (let i = 0; i < array.length; i++) {
    const val = key ? array[i][key] : array[i];
    const num = Number(val);
    if (!isNaN(num)) total += num;
  }
  return total;
};

/**
 * Return maximum value from array
 */
export const max = (array: any[]): number => Math.max(...array);

/**
 * Return minimum value from array
 */
export const min = (array: any[]): number => Math.min(...array);

/**
 * Shuffle array (Fisher-Yates)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Split array into random groups with min-max count
 */
export const splitRandomItems = <T>(
  items: T[],
  min: number,
  max: number,
  skipSmall = 0,
  shuffle = false
): T[][] => {
  const result: T[][] = [];

  if (!Array.isArray(items) || items.length === 0) return result;
  if (min <= 0 || max < min) return [items];

  let remain = [...items];
  if (shuffle) remain = shuffleArray(remain);

  while (remain.length > 0) {
    let count = Math.floor(Math.random() * (max - min + 1)) + min;
    if (count > remain.length) count = remain.length;

    const group = remain.splice(0, count);
    result.push(group);
  }

  return result.filter((g) => g.length >= skipSmall);
};

// store items helper
export const addItems = <T>(params: T | T[], list: T[]) =>
  list.push(...(Array.isArray(params) ? params : [params]))

export const updateItems = <T extends { _id: string }>(params: T | T[], list: T[]) =>
  (Array.isArray(params) ? params : [params]).forEach(u => {
    const i = list.findIndex(x => (x as any)._id === u._id)
    if (i > -1) list.splice(i, 1, u)
  })

export const removeItems = <T extends { _id: string }>(params: string | string[], list: T[]) =>
  (Array.isArray(params) ? params : [params]).forEach(id => {
    const i = list.findIndex(x => (x as any)._id === id)
    if (i > -1) list.splice(i, 1)
  })

export { };