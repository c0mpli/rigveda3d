// Semantic search utilities for Rig Veda texts
// Using pre-generated embeddings stored in public/data/text/

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} - Cosine similarity score (0-1)
 */
export const cosineSimilarity = (a, b) => {
  if (a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

/**
 * Semantic search in Rig Veda verses
 * @param {number[]} queryEmbedding - Embedding vector for search query
 * @param {number[][]} embeddingsMatrix - Matrix of all verse embeddings
 * @param {Object[]} versesIndex - Array of verse metadata
 * @param {number} topK - Number of results to return
 * @param {Object} filters - Optional filters to apply
 * @returns {Object[]} - Array of search results with similarity scores
 */
export const semanticSearch = (
  queryEmbedding,
  embeddingsMatrix,
  versesIndex,
  topK = 5,
  filters = {}
) => {
  // Apply filters first to get eligible verses
  const filteredVerses = applyFilters(versesIndex, filters);
  const filteredIndices = filteredVerses.map((verse) => verse.index);

  // Calculate similarities only for filtered verses
  const similarities = embeddingsMatrix.map((embedding, index) => ({
    similarity: filteredIndices.includes(index)
      ? cosineSimilarity(queryEmbedding, embedding)
      : -1,
    index,
  }));

  // Create results with scores for filtered verses only
  const results = similarities
    .filter((item) => item.similarity >= 0)
    .map((item) => ({
      ...versesIndex[item.index],
      similarity: item.similarity,
    }));

  // Sort by similarity and return top-k (or all if topK is Infinity)
  const sorted = results.sort((a, b) => b.similarity - a.similarity);
  return topK === Infinity ? sorted : sorted.slice(0, topK);
};

/**
 * Get embedding from OpenAI API (for query text)
 * @param {string} text - Text to embed
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<number[]>} - Embedding vector
 */
export const getEmbedding = async (text, apiKey) => {
  try {
    // Import OpenAI package dynamically to avoid build issues
    const { OpenAI } = await import("openai");

    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("OpenAI embedding error:", error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
};

/**
 * Complete semantic search workflow
 * @param {string} query - Search query text
 * @param {number[][]} embeddingsMatrix - Matrix of all verse embeddings
 * @param {Object[]} versesIndex - Array of verse metadata
 * @param {string} apiKey - OpenAI API key
 * @param {number} topK - Number of results to return
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Object>} - Search results
 */
export const searchRigVeda = async (
  query,
  embeddingsMatrix,
  versesIndex,
  apiKey,
  topK = 5,
  filters = {}
) => {
  try {
    // Get embedding for query
    const queryEmbedding = await getEmbedding(query, apiKey);

    // Perform semantic search with filters
    const results = semanticSearch(
      queryEmbedding,
      embeddingsMatrix,
      versesIndex,
      topK,
      filters
    );

    return {
      success: true,
      query,
      results,
      total: results.length,
      filters,
    };
  } catch (error) {
    return {
      success: false,
      query,
      error: error.message,
      results: [],
    };
  }
};

/**
 * Apply filters to verses dataset
 * @param {Object[]} versesIndex - Array of verse metadata
 * @param {Object} filters - Filter criteria
 * @returns {Object[]} - Filtered verses
 */
export const applyFilters = (versesIndex, filters) => {
  return versesIndex.filter((verse) => {
    // Filter by mandala
    if (
      filters.mandala &&
      filters.mandala !== "all" &&
      verse.mandala !== parseInt(filters.mandala)
    ) {
      return false;
    }

    // Filter by hymn range
    if (filters.hymnFrom && verse.hymn < parseInt(filters.hymnFrom)) {
      return false;
    }
    if (filters.hymnTo && verse.hymn > parseInt(filters.hymnTo)) {
      return false;
    }

    // Filter by deity (case-insensitive partial match)
    if (filters.deity && filters.deity !== "all") {
      const deityLower = filters.deity.toLowerCase();
      const deityMatch =
        (verse.translation && verse.translation.toLowerCase().includes(deityLower)) ||
        (verse.transliteration && verse.transliteration.toLowerCase().includes(deityLower)) ||
        (verse.sanskrit && verse.sanskrit.includes(filters.deity));
      if (!deityMatch) return false;
    }

    return true;
  });
};

/**
 * Get all unique values for filtering
 * @param {Object[]} versesIndex - Array of verse metadata
 * @returns {Object} - Object with arrays of unique values
 */
export const getFilterOptions = (versesIndex) => {
  const mandalas = [...new Set(versesIndex.map((v) => v.mandala))].sort(
    (a, b) => a - b
  );

  // Common deity names for filtering
  const commonDeities = [
    "Agni",
    "Indra",
    "Soma",
    "Varuna",
    "Mitra",
    "Vishnu",
    "Rudra",
    "Sarasvati",
    "Ushas",
    "Ashvins",
    "Maruts",
    "Pushan",
    "Surya",
    "Vayu",
    "Ribhus",
    "Apah",
    "Prithvi",
    "Dyaus",
  ];

  return {
    mandalas,
    deities: commonDeities,
    hymnRange: {
      min: Math.min(...versesIndex.map((v) => v.hymn)),
      max: Math.max(...versesIndex.map((v) => v.hymn)),
    },
  };
};

/**
 * Fallback text-based search (when embeddings not available)
 * @param {string} query - Search query
 * @param {Object[]} versesIndex - Array of verse metadata
 * @param {number} topK - Number of results to return
 * @param {Object} filters - Optional filters to apply
 * @returns {Object[]} - Search results
 */
export const textSearch = (query, versesIndex, topK = 10, filters = {}) => {
  const lowerQuery = query.toLowerCase();

  // Apply filters first
  let filteredVerses = applyFilters(versesIndex, filters);

  const results = filteredVerses
    .filter(
      (verse) =>
        (verse.translation && verse.translation.toLowerCase().includes(lowerQuery)) ||
        (verse.transliteration && verse.transliteration.toLowerCase().includes(lowerQuery)) ||
        (verse.sanskrit && verse.sanskrit.includes(query))
    )
    .map((verse) => ({ ...verse, similarity: 0.5 })); // Dummy similarity score

  // Return all results if topK is Infinity, otherwise slice
  return topK === Infinity ? results : results.slice(0, topK);
};
