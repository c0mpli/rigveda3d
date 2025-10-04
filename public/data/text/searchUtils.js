// Semantic search utilities for Rig Veda texts
// Auto-generated utility functions for React.js

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector  
 * @returns {number} - Cosine similarity score (0-1)
 */
export const cosineSimilarity = (a, b) => {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Semantic search in Rig Veda verses
 * @param {number[]} queryEmbedding - Embedding vector for search query
 * @param {number[][]} embeddingsMatrix - Matrix of all verse embeddings  
 * @param {Object[]} versesIndex - Array of verse metadata
 * @param {number} topK - Number of results to return
 * @returns {Object[]} - Array of search results with similarity scores
 */
export const semanticSearch = (queryEmbedding, embeddingsMatrix, versesIndex, topK = 5) => {
  // Calculate similarities
  const similarities = embeddingsMatrix.map(embedding => 
    cosineSimilarity(queryEmbedding, embedding)
  );
  
  // Create results with scores
  const results = similarities.map((score, index) => ({
    ...versesIndex[index],
    similarity: score
  }));
  
  // Sort by similarity and return top-k
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
};

/**
 * Get embedding from OpenAI API (for query text)
 * @param {string} text - Text to embed
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<number[]>} - Embedding vector
 */
export const getEmbedding = async (text, apiKey) => {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
      encoding_format: 'float'
    })
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data[0].embedding;
};

/**
 * Complete semantic search workflow
 * @param {string} query - Search query text
 * @param {number[][]} embeddingsMatrix - Matrix of all verse embeddings
 * @param {Object[]} versesIndex - Array of verse metadata  
 * @param {string} apiKey - OpenAI API key
 * @param {number} topK - Number of results to return
 * @returns {Promise<Object[]>} - Search results
 */
export const searchRigVeda = async (query, embeddingsMatrix, versesIndex, apiKey, topK = 5) => {
  try {
    // Get embedding for query
    const queryEmbedding = await getEmbedding(query, apiKey);
    
    // Perform semantic search
    const results = semanticSearch(queryEmbedding, embeddingsMatrix, versesIndex, topK);
    
    return {
      success: true,
      query,
      results,
      total: results.length
    };
  } catch (error) {
    return {
      success: false,
      query,
      error: error.message,
      results: []
    };
  }
};

/**
 * Fallback text-based search (when embeddings not available)
 * @param {string} query - Search query
 * @param {Object[]} versesIndex - Array of verse metadata
 * @param {number} topK - Number of results to return
 * @returns {Object[]} - Search results
 */
export const textSearch = (query, versesIndex, topK = 10) => {
  const lowerQuery = query.toLowerCase();
  
  return versesIndex
    .filter(verse => 
      verse.translation.toLowerCase().includes(lowerQuery) ||
      verse.transliteration.toLowerCase().includes(lowerQuery) ||
      verse.sanskrit.includes(query)
    )
    .slice(0, topK)
    .map(verse => ({ ...verse, similarity: 0.5 })); // Dummy similarity score
};

/**
 * React hook for Rig Veda search
 * Usage: const { search, loading, results, error } = useRigVedaSearch(embeddingsMatrix, versesIndex, apiKey);
 */
export const useRigVedaSearch = (embeddingsMatrix, versesIndex, apiKey) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  
  const search = async (query, topK = 5) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchRigVeda(query, embeddingsMatrix, versesIndex, apiKey, topK);
      
      if (searchResults.success) {
        setResults(searchResults.results);
      } else {
        setError(searchResults.error);
        // Fallback to text search
        const fallbackResults = textSearch(query, versesIndex, topK);
        setResults(fallbackResults);
      }
    } catch (err) {
      setError(err.message);
      // Fallback to text search
      const fallbackResults = textSearch(query, versesIndex, topK);
      setResults(fallbackResults);
    } finally {
      setLoading(false);
    }
  };
  
  return { search, loading, results, error };
};

// Example React component usage:
/*
import React, { useState } from 'react';
import { EMBEDDINGS_MATRIX, VERSES_INDEX } from './data/text/embeddings.js';
import { useRigVedaSearch } from './data/text/searchUtils.js';

const RigVedaSearch = () => {
  const [query, setQuery] = useState('');
  const { search, loading, results, error } = useRigVedaSearch(
    EMBEDDINGS_MATRIX, 
    VERSES_INDEX, 
    process.env.REACT_APP_OPENAI_API_KEY
  );
  
  const handleSearch = () => {
    if (query.trim()) {
      search(query);
    }
  };
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Rig Veda verses..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      
      {error && <p>Error: {error}</p>}
      
      {results.map(verse => (
        <div key={verse.id}>
          <h3>{verse.title}</h3>
          <p><strong>Sanskrit:</strong> {verse.sanskrit}</p>
          <p><strong>Translation:</strong> {verse.translation}</p>
          <p><strong>Similarity:</strong> {(verse.similarity * 100).toFixed(1)}%</p>
        </div>
      ))}
    </div>
  );
};
*/
