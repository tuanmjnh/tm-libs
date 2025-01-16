/**
* @license nested-property https://github.com/cosmosio/nested-property
*
* The MIT License (MIT)
*
* Copyright (c) 2014-2020 Olivier Scherrer <pode.fr@gmail.com>
*/

const ARRAY_WILDCARD = "+";
const PATH_DELIMITER = ".";

class ObjectPrototypeMutationError extends Error {
  constructor(params: string) {
    super(params);
    this.name = "ObjectPrototypeMutationError";
  }
}

interface NestedPropertyOptions {
  own?: boolean;
  validPath?: boolean;
}

interface NestedPropertyModule {
  set: typeof setNestedProperty;
  get: typeof getNestedProperty;
  has: typeof hasNestedProperty;
  hasOwn: (object: any, property: string | number, options?: NestedPropertyOptions) => boolean;
  isIn: typeof isInNestedProperty;
  ObjectPrototypeMutationError: typeof ObjectPrototypeMutationError;
}

export const module: NestedPropertyModule = {
  set: setNestedProperty,
  get: getNestedProperty,
  has: hasNestedProperty,
  hasOwn: function (object: any, property: string | number, options?: NestedPropertyOptions): boolean {
    return this.has(object, property, options || { own: true });
  },
  isIn: isInNestedProperty,
  ObjectPrototypeMutationError
};

export default module;

/**
 * Get the property of an object nested in one or more objects or array
 * Given an object such as a.b.c.d = 5, getNestedProperty(a, "b.c.d") will return 5.
 * It also works through arrays. Given a nested array such as a[0].b = 5, getNestedProperty(a, "0.b") will return 5.
 * For accessing nested properties through all items in an array, you may use the array wildcard "+".
 * For instance, getNestedProperty([{a:1}, {a:2}, {a:3}], "+.a") will return [1, 2, 3]
 */
function getNestedProperty(object: any, property?: string | number): any {
  if (typeof object != "object" || object === null) {
    return object;
  }

  if (typeof property == "undefined") {
    return object;
  }

  if (typeof property == "number") {
    return object[property];
  }

  try {
    return traverse(object, property, function _getNestedProperty(currentObject: any, currentProperty: string | number): any {
      return currentObject[currentProperty];
    });
  } catch (err) {
    return object;
  }
}

/**
 * Tell if a nested object has a given property (or array a given index)
 * given an object such as a.b.c.d = 5, hasNestedProperty(a, "b.c.d") will return true.
 * It also returns true if the property is in the prototype chain.
 */
function hasNestedProperty(object: any, property: string | number, options: NestedPropertyOptions = {}): boolean {
  if (typeof object != "object" || object === null) {
    return false;
  }

  if (typeof property == "undefined") {
    return false;
  }

  if (typeof property == "number") {
    return property in object;
  }

  try {
    let has = false;

    traverse(object, property, function _hasNestedProperty(currentObject: any, currentProperty: string | number, segments: string[], index: number): any {
      if (isLastSegment(segments, index)) {
        if (options.own) {
          has = Object.prototype.hasOwnProperty.call(currentObject, currentProperty);
        } else {
          has = currentProperty in currentObject;
        }
      } else {
        return currentObject && currentObject[currentProperty];
      }
    });

    return has;
  } catch (err) {
    return false;
  }
}

/**
 * Set the property of an object nested in one or more objects
 * If the property doesn't exist, it gets created.
 */
function setNestedProperty(object: any, property: string | number, value: any): any {
  if (typeof object != "object" || object === null) {
    return object;
  }

  if (typeof property == "undefined") {
    return object;
  }

  if (typeof property == "number") {
    object[property] = value;
    return object[property];
  }

  try {
    return traverse(object, property, function _setNestedProperty(currentObject: any, currentProperty: string | number, segments: string[], index: number): any {
      if (currentObject === Object.getPrototypeOf({})) {
        throw new ObjectPrototypeMutationError("Attempting to mutate Object.prototype");
      }

      if (!currentObject[currentProperty]) {
        const nextPropIsNumber = Number.isInteger(Number(segments[index + 1]));
        const nextPropIsArrayWildcard = segments[index + 1] === ARRAY_WILDCARD;

        if (nextPropIsNumber || nextPropIsArrayWildcard) {
          currentObject[currentProperty] = [];
        } else {
          currentObject[currentProperty] = {};
        }
      }

      if (isLastSegment(segments, index)) {
        currentObject[currentProperty] = value;
      }

      return currentObject[currentProperty];
    });
  } catch (err) {
    if (err instanceof ObjectPrototypeMutationError) {
      throw err;
    } else {
      return object;
    }
  }
}

/**
 * Tell if an object is on the path to a nested property
 * If the object is on the path, and the path exists, it returns true, and false otherwise.
 */
function isInNestedProperty(object: any, property: string | number, objectInPath: any, options: NestedPropertyOptions = {}): boolean {
  if (typeof object != "object" || object === null) {
    return false;
  }

  if (typeof property == "undefined") {
    return false;
  }

  try {
    let isIn = false;
    let pathExists = false;

    traverse(object, property, function _isInNestedProperty(currentObject: any, currentProperty: string | number, segments: string[], index: number): any {
      isIn = isIn ||
        currentObject === objectInPath ||
        (!!currentObject && currentObject[currentProperty] === objectInPath);

      pathExists = isLastSegment(segments, index) &&
        typeof currentObject === "object" &&
        currentProperty in currentObject;

      return currentObject && currentObject[currentProperty];
    });

    if (options.validPath) {
      return isIn && pathExists;
    } else {
      return isIn;
    }
  } catch (err) {
    return false;
  }
}

type TraverseCallback = (currentObject: any, currentProperty: string | number, segments: string[], index: number) => any;

function traverse(object: any, path: string | number, callback: TraverseCallback = () => { }): any {
  const segments = String(path).split(PATH_DELIMITER);
  const length = segments.length;

  for (let idx = 0; idx < length; idx++) {
    const currentSegment = segments[idx];

    if (!object) {
      return;
    }

    if (currentSegment === ARRAY_WILDCARD) {
      if (Array.isArray(object)) {
        return object.map((value, index) => {
          const remainingSegments = segments.slice(idx + 1);

          if (remainingSegments.length > 0) {
            return traverse(value, remainingSegments.join(PATH_DELIMITER), callback);
          } else {
            return callback(object, index, segments, idx);
          }
        });
      } else {
        const pathToHere = segments.slice(0, idx).join(PATH_DELIMITER);
        throw new Error(`Object at wildcard (${pathToHere}) is not an array`);
      }
    } else {
      object = callback(object, currentSegment, segments, idx);
    }
  }

  return object;
}

function isLastSegment(segments: string[], index: number): boolean {
  return segments.length === (index + 1);
}
