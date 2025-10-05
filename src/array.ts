// ===================== ARRAY & TREE UTILITIES ===================== //

/**
 * Convert a flat array to a tree structure.
 */
export function arrayToTree<T extends Record<string, any>>(
  arr: T[],
  id: keyof T = "id" as keyof T,
  key: keyof T = "pid" as keyof T
): (T & { children?: (T & { children?: any[] })[] })[] {
  if (!Array.isArray(arr)) return [];

  const res: (T & { children?: (T & { children?: any[] })[] })[] = [];
  const map = new Map<any, T & { children?: (T & { children?: any[] })[] }>();

  // map all nodes by id
  arr.forEach((item) => {
    map.set(item[id], item);
  });

  arr.forEach((item) => {
    const parentKey = item[key];
    if (parentKey != null && map.has(parentKey)) {
      const parent = map.get(parentKey)!;
      parent.children = parent.children || [];
      parent.children.push(item);
    } else {
      res.push(item);
    }
  });

  return res;
}

/**
 * Convert a tree structure back to flat array.
 */
export function treeToArray<T extends Record<string, any>>(
  tree: (T & { children?: T[] })[],
  id: keyof T = "id" as keyof T,
  key: keyof T = "pid" as keyof T
): T[] {
  if (!Array.isArray(tree)) return [];

  const result: T[] = [];

  function traverse(nodes: (T & { children?: T[] })[], parentId?: any) {
    for (const node of nodes) {
      const item = { ...node };

      if (parentId !== undefined) {
        (item as any)[key] = parentId;
      }

      delete (item as any).children;
      result.push(item);

      if (node.children?.length) {
        traverse(node.children, node[id]);
      }
    }
  }

  traverse(tree);
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