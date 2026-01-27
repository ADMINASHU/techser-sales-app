/**
 * Efficiently serializes a plain Mongoose document (lean) or object
 * by converting ObjectIds and Dates to strings.
 * This avoids the slow JSON.parse(JSON.stringify(...)) pattern.
 *
 * @param {Object} doc - The document to serialize
 * @returns {Object} - The serialized document
 */
export function serializeMongoDocument(doc) {
  if (!doc) return null;

  const serialized = { ...doc };

  if (serialized._id) {
    serialized._id = serialized._id.toString();
  }

  if (serialized.userId) {
    serialized.userId = serialized.userId.toString();
  }

  if (serialized.createdAt) {
    serialized.createdAt = serialized.createdAt.toISOString();
  }

  if (serialized.updatedAt) {
    serialized.updatedAt = serialized.updatedAt.toISOString();
  }

  // Handle specific nested fields for Customer/Entry models if needed
  // For example, if location has an _id (usually it doesn't in subdocs unless specified)

  // Handle nested arrays if they contain ObjectIds or Dates
  // This is a basic implementation; extend for deep nesting if specific models require it.

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
