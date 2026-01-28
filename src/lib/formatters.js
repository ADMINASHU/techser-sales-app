/**
 * Efficiently serializes a plain Mongoose document (lean) or object
 * by recursively converting ObjectIds and Dates to strings.
 * This handles nested objects and arrays generically.
 *
 * @param {any} obj - The object/document to serialize
 * @returns {any} - The serialized object
 */
export function serializeMongoDocument(obj) {
  if (obj === null || obj === undefined) return obj;

  // Handle primitives
  if (typeof obj !== "object") return obj;

  // Handle Date
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle ObjectId (check for toString method and typical hex string behavior, or specific Mongoose type check if available, but duck typing is safer here)
  if (
    obj.toString &&
    typeof obj.toString === "function" &&
    /^[0-9a-fA-F]{24}$/.test(obj.toString())
  ) {
    return obj.toString();
  }
  // Mongoose ObjectId sometimes doesn't have constructor name straightforwardly in all envs, but usually it does.
  // A simpler check: if it has _bsontype === 'ObjectID'
  if (obj._bsontype === "ObjectId") {
    return obj.toString();
  }

  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeMongoDocument(item));
  }

  // Handle Object (recursive)
  // Ensure it's a plain object or something we want to traverse
  const serialized = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Skip internal Mongoose/BSON properties if necessary, but usually deep clone is fine.
      serialized[key] = serializeMongoDocument(value);
    }
  }

  return serialized;
}

/**
 * Serializes a list of documents.
 * @param {Array} docs
 * @returns {Array}
 */
export function serializeMongoList(docs) {
  if (!Array.isArray(docs)) return [];
  return docs.map(serializeMongoDocument);
}

/**
 * Formats user roles into human-readable labels.
 * @param {string} role - The user role (e.g., 'admin', 'super_user', 'user')
 * @returns {string} - The formatted label
 */
export function formatRole(role) {
  const roles = {
    admin: "Administrator",
    super_user: "Super User",
    user: "Standard User",
  };
  return roles[role] || role;
}
