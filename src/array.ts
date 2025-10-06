/**
 * Helper: Finds a deeply nested value within an object using a dot-separated path.
 * This is necessary to support keys like 'details.id'.
 * @param obj The object to query.
 * @param path The dot-separated key path (e.g., "user.name").
 */
function getNestedValue<T extends Record<string, any>>(obj: T, path: keyof T | string): any {
  // If the path is a top-level key, access it directly.
  if (typeof path !== 'string' || !path.includes('.')) {
    return obj[path as keyof T];
  }

  // If the path is nested (e.g., 'details.id'), traverse the object.
  const keys = path.split('.');
  return keys.reduce((acc, key) => {
    // Check if acc is a valid object and the key exists
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, obj);
}


export function arrayToTree<T extends Record<string, any>>(
  arr: T[],
  // The id and pid parameters can now be strings representing nested paths (e.g. "details.uid")
  id: keyof T | string = "id",
  pid: keyof T | string = "pid"
): (T & { children?: (T & { children?: any[] })[] })[] {
  if (!Array.isArray(arr)) return [];

  const res: (T & { children?: (T & { children?: any[] })[] })[] = [];
  // The key in the map is id (can be string, number,...)
  const map = new Map<any, T & { children?: (T & { children?: any[] })[] }>();

  // 1. Map all nodes by ID
  arr.forEach((item) => {
    // Sử dụng helper để lấy giá trị ID, hỗ trợ nested key
    const itemId = getNestedValue(item, id);
    map.set(itemId, item);
  });

  // 2. Building the tree structure
  arr.forEach((item) => {
    // Use helper to get Parent ID value, supports nested key
    const parentKey = getNestedValue(item, pid);

    // Check the validity of parentKey and make sure it exists in the map
    if (parentKey != null && map.has(parentKey)) {
      const parent = map.get(parentKey)!;
      // Initialize children if not present and push item into them
      parent.children = parent.children || [];
      parent.children.push(item);
    } else {
      // If there is no parent (or parent is not found), this is the root node
      res.push(item);
    }
  });

  return res;
}

/**
 * Flattens a tree structure back into a flat array, retaining the parent-child relationship via 'pid'.
 * * @param tree The array of root nodes (the tree structure).
 * @param id The property name (or nested path) used for the current node's unique ID. Defaults to "id".
 * @param pid The property name (or nested path) used for the parent's ID. Defaults to "pid".
 * @param childrenKey The property name where child nodes are stored. Defaults to "children".
 * @returns A flat array of objects (T), where each object has a defined 'pid'.
 */
export function treeToArray<T extends Record<string, any>>(
  tree: (T & { children?: any[] })[],
  id: keyof T | string = "id",
  pid: keyof T | string = "pid",
  childrenKey: string = "children"
): T[] {
  if (!Array.isArray(tree)) return [];

  const result: T[] = [];

  // Helper function to get nested value (reused from arrayToTree logic)
  const getNestedValue = (obj: T, path: keyof T | string): any => {
    if (typeof path !== 'string' || !path.includes('.')) {
      return obj[path as keyof T];
    }
    const keys = path.split('.');
    return keys.reduce((acc, key) => acc && acc[key] !== undefined ? acc[key] : undefined, obj);
  };

  /**
   * Recursive function to traverse the tree and flatten the nodes.
   * @param nodes The current array of nodes to process.
   * @param parentId The ID of the parent node.
   */
  const traverse = (nodes: (T & { children?: any[] })[], parentId: any | null) => {
    nodes.forEach((node) => {
      // 1. Assign pid to current node
      // Use direct update logic, don't use setNested to keep it simple
      // of the flatten function (it should only affect the pid/id properties).
      if (pid && parentId !== null) {
        // Gán trực tiếp giá trị parentId vào thuộc tính pid của node
        node[pid as keyof T] = parentId;
      }

      // 2. Add node to result array
      // Clone node to remove children array before adding to result
      const { [childrenKey]: children, ...rest } = node;
      result.push(rest as T);

      // 3. Process child nodes recursively
      if (children && children.length > 0) {
        // Get the ID of the current node to make the Parent ID for the child node
        const currentId = getNestedValue(node, id);
        traverse(children, currentId);
      }
    });
  };

  // Start iterating from the root array (root nodes) with Parent ID being null
  traverse(tree, null);

  return result;
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

export { };