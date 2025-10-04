#!/usr/bin/env python3
"""
Script to generate OpenAI embeddings for Rig Veda texts for semantic search.
Uses the provided API keys and processes the Rig Veda JSON data.
"""

import json
import os
import time
from typing import List, Dict, Any
import numpy as np
from datetime import datetime
from openai import OpenAI

# Configuration - Using OpenAI package
API_KEY = "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"
RIG_VEDA_DATA_PATH = "/Users/compli/Documents/codes/personal/rigveda3d/public/data/text/rig_veda_texts.json"
OUTPUT_DIR = "/Users/compli/Documents/codes/personal/rigveda3d/public/data/text/"

class RigVedaEmbeddingGenerator:
    def __init__(self):
        self.client = OpenAI(api_key=API_KEY)
        self.embeddings_cache = []
        self.processed_count = 0
        
    def load_rig_veda_data(self) -> Dict[str, Any]:
        """Load the Rig Veda JSON data."""
        try:
            with open(RIG_VEDA_DATA_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading Rig Veda data: {e}")
            return None
    
    def create_text_chunks(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Create text chunks from the Rig Veda data for embedding generation.
        Each chunk will contain verse-level information with context.
        """
        chunks = []
        
        for mandala in data.get('mandalas', []):
            mandala_num = mandala.get('number')
            
            for hymn in mandala.get('hymns', []):
                hymn_num = hymn.get('number')
                hymn_title = hymn.get('title', f'Rig Veda Mandala {mandala_num} Hymn {hymn_num}')
                
                for verse in hymn.get('verses', []):
                    verse_num = verse.get('number')
                    sanskrit = verse.get('sanskrit', '')
                    transliteration = verse.get('transliteration', '')
                    translation = verse.get('translation', '')
                    
                    # Create a comprehensive text for embedding
                    # Include Sanskrit, transliteration, and English translation
                    combined_text = f"""
                    Title: {hymn_title}
                    Mandala: {mandala_num}, Hymn: {hymn_num}, Verse: {verse_num}
                    
                    Sanskrit: {sanskrit}
                    Transliteration: {transliteration}
                    Translation: {translation}
                    """.strip()
                    
                    # Create metadata for the chunk
                    chunk = {
                        'id': f"M{mandala_num:02d}H{hymn_num:03d}V{verse_num:03d}",
                        'mandala': mandala_num,
                        'hymn': hymn_num,
                        'verse': verse_num,
                        'title': hymn_title,
                        'sanskrit': sanskrit,
                        'transliteration': transliteration,
                        'translation': translation,
                        'combined_text': combined_text,
                        'text_for_embedding': f"{translation} {transliteration}",  # Focus on searchable content
                        'embedding': None
                    }
                    
                    chunks.append(chunk)
        
        return chunks
    
    def get_embedding(self, text: str, retries: int = 3) -> List[float]:
        """
        Get embedding for a single text using OpenAI client.
        """
        for attempt in range(retries):
            try:
                response = self.client.embeddings.create(
                    input=text,
                    model='text-embedding-3-small',
                    encoding_format='float'
                )
                
                if response.data and len(response.data) > 0:
                    return response.data[0].embedding
                else:
                    print(f"No embedding data in response")
                    return None
                    
            except Exception as e:
                error_msg = str(e)
                print(f"Error getting embedding (attempt {attempt + 1}): {error_msg}")
                
                # Handle rate limiting
                if "rate_limit" in error_msg.lower() or "429" in error_msg:
                    wait_time = 2 ** attempt
                    print(f"Rate limited. Waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                
                if attempt == retries - 1:
                    return None
                time.sleep(1)
        
        return None
    
    def generate_embeddings_batch(self, chunks: List[Dict[str, Any]], batch_size: int = 10) -> List[Dict[str, Any]]:
        """
        Generate embeddings for all chunks in batches with progress tracking.
        """
        total_chunks = len(chunks)
        print(f"Generating embeddings for {total_chunks} text chunks...")
        
        for i in range(0, total_chunks, batch_size):
            batch = chunks[i:i + batch_size]
            
            for chunk in batch:
                if chunk['text_for_embedding']:
                    embedding = self.get_embedding(chunk['text_for_embedding'])
                    if embedding:
                        chunk['embedding'] = embedding
                        self.processed_count += 1
                    else:
                        print(f"Failed to get embedding for chunk {chunk['id']}")
                
                # Small delay to avoid overwhelming the API
                time.sleep(0.1)
            
            # Progress update
            progress = min(i + batch_size, total_chunks)
            print(f"Progress: {progress}/{total_chunks} ({progress/total_chunks*100:.1f}%)")
            
            # Save intermediate results every 100 chunks
            if progress % 100 == 0:
                self.save_embeddings(chunks[:progress], f"intermediate_{progress}")
        
        print(f"Successfully generated embeddings for {self.processed_count} chunks")
        return chunks
    
    def save_embeddings(self, chunks: List[Dict[str, Any]], filename_suffix: str = "") -> None:
        """
        Save the embeddings optimized for React.js usage.
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Prepare data for React.js
        valid_chunks = [chunk for chunk in chunks if chunk.get('embedding')]
        
        # Create embeddings matrix as separate file for efficient loading
        embeddings_matrix = [chunk['embedding'] for chunk in valid_chunks]
        
        # Create index file with verse data (without embeddings for smaller size)
        verses_index = []
        for i, chunk in enumerate(valid_chunks):
            verses_index.append({
                'id': chunk['id'],
                'index': i,  # Index in embeddings matrix
                'mandala': chunk['mandala'],
                'hymn': chunk['hymn'],
                'verse': chunk['verse'],
                'title': chunk['title'],
                'sanskrit': chunk['sanskrit'],
                'transliteration': chunk['transliteration'],
                'translation': chunk['translation']
            })
        
        # Save as JavaScript modules for direct import in React
        embeddings_js_path = os.path.join(OUTPUT_DIR, "embeddings.js")
        with open(embeddings_js_path, 'w', encoding='utf-8') as f:
            f.write("// Auto-generated embeddings matrix\n")
            f.write("// Use this for semantic search calculations\n\n")
            f.write("export const EMBEDDINGS_MATRIX = ")
            json.dump(embeddings_matrix, f, separators=(',', ':'))
            f.write(";\n\n")
            f.write(f"export const EMBEDDING_DIMENSION = {len(embeddings_matrix[0]) if embeddings_matrix else 0};\n")
            f.write(f"export const TOTAL_VERSES = {len(embeddings_matrix)};\n")
        
        # Save verses index as JavaScript module
        verses_js_path = os.path.join(OUTPUT_DIR, "verses_index.js")
        with open(verses_js_path, 'w', encoding='utf-8') as f:
            f.write("// Auto-generated verses index\n")
            f.write("// Contains all verse metadata without embeddings\n\n")
            f.write("export const VERSES_INDEX = ")
            json.dump(verses_index, f, ensure_ascii=False, separators=(',', ':'))
            f.write(";\n\n")
            f.write("// Helper functions for React components\n")
            f.write("export const getVerseById = (id) => VERSES_INDEX.find(v => v.id === id);\n")
            f.write("export const getVersesByMandala = (mandala) => VERSES_INDEX.filter(v => v.mandala === mandala);\n")
            f.write("export const searchVersesByText = (query) => {\n")
            f.write("  const lowerQuery = query.toLowerCase();\n")
            f.write("  return VERSES_INDEX.filter(v => \n")
            f.write("    v.translation.toLowerCase().includes(lowerQuery) ||\n")
            f.write("    v.transliteration.toLowerCase().includes(lowerQuery) ||\n")
            f.write("    v.sanskrit.includes(query)\n")
            f.write("  );\n")
            f.write("};\n")
        
        # Also save as JSON for flexibility
        verses_json_path = os.path.join(OUTPUT_DIR, "verses_index.json")
        with open(verses_json_path, 'w', encoding='utf-8') as f:
            json.dump(verses_index, f, ensure_ascii=False, indent=2)
        
        embeddings_json_path = os.path.join(OUTPUT_DIR, "embeddings.json")
        with open(embeddings_json_path, 'w', encoding='utf-8') as f:
            json.dump(embeddings_matrix, f, separators=(',', ':'))
        
        # Create metadata for React app
        metadata = {
            'created_at': timestamp,
            'total_verses': len(valid_chunks),
            'embedding_model': 'text-embedding-3-small',
            'embedding_dimension': len(embeddings_matrix[0]) if embeddings_matrix else 0,
            'description': 'OpenAI embeddings for Rig Veda texts optimized for React.js',
            'files': {
                'embeddings_js': 'embeddings.js',
                'verses_js': 'verses_index.js',
                'embeddings_json': 'embeddings.json',
                'verses_json': 'verses_index.json'
            },
            'usage': {
                'react_import': "import { EMBEDDINGS_MATRIX, VERSES_INDEX } from './data/text/embeddings.js'",
                'search_function': "Use cosineSimilarity to compare query embedding with EMBEDDINGS_MATRIX"
            }
        }
        
        metadata_path = os.path.join(OUTPUT_DIR, "embeddings_metadata.json")
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Saved embeddings optimized for React.js:")
        print(f"   📁 {embeddings_js_path}")
        print(f"   📁 {verses_js_path}")
        print(f"   📁 {embeddings_json_path}")
        print(f"   📁 {verses_json_path}")
        print(f"   📁 {metadata_path}")
    
    def create_react_search_utils(self, chunks: List[Dict[str, Any]]) -> None:
        """
        Create React.js utilities for semantic search.
        """
        
        # Create React utility file
        react_utils = '''// Semantic search utilities for Rig Veda texts
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
'''
        
        utils_path = os.path.join(OUTPUT_DIR, "searchUtils.js")
        with open(utils_path, 'w', encoding='utf-8') as f:
            f.write(react_utils)
        
        # Create TypeScript definitions
        ts_definitions = '''// TypeScript definitions for Rig Veda search utilities

export interface VerseData {
  id: string;
  index: number;
  mandala: number;
  hymn: number;
  verse: number;  
  title: string;
  sanskrit: string;
  transliteration: string;
  translation: string;
  similarity?: number;
}

export interface SearchResult {
  success: boolean;
  query: string;
  results: VerseData[];
  total: number;
  error?: string;
}

export interface SearchHookReturn {
  search: (query: string, topK?: number) => Promise<void>;
  loading: boolean;
  results: VerseData[];
  error: string | null;
}

declare export function cosineSimilarity(a: number[], b: number[]): number;
declare export function semanticSearch(
  queryEmbedding: number[], 
  embeddingsMatrix: number[][], 
  versesIndex: VerseData[], 
  topK?: number
): VerseData[];
declare export function getEmbedding(text: string, apiKey: string): Promise<number[]>;
declare export function searchRigVeda(
  query: string, 
  embeddingsMatrix: number[][], 
  versesIndex: VerseData[], 
  apiKey: string, 
  topK?: number
): Promise<SearchResult>;
declare export function textSearch(query: string, versesIndex: VerseData[], topK?: number): VerseData[];
declare export function useRigVedaSearch(
  embeddingsMatrix: number[][], 
  versesIndex: VerseData[], 
  apiKey: string
): SearchHookReturn;
'''
        
        ts_path = os.path.join(OUTPUT_DIR, "searchUtils.d.ts")
        with open(ts_path, 'w', encoding='utf-8') as f:
            f.write(ts_definitions)
        
        print(f"✅ Created React.js search utilities:")
        print(f"   📁 {utils_path}")
        print(f"   📁 {ts_path}")

def main():
    """Main function to generate embeddings for Rig Veda texts."""
    print("🕉️  Rig Veda Embedding Generator")
    print("=" * 50)
    
    generator = RigVedaEmbeddingGenerator()
    
    # Load data
    print("Loading Rig Veda data...")
    rig_veda_data = generator.load_rig_veda_data()
    if not rig_veda_data:
        print("Failed to load Rig Veda data. Exiting.")
        return
    
    # Create text chunks
    print("Creating text chunks...")
    chunks = generator.create_text_chunks(rig_veda_data)
    print(f"Created {len(chunks)} text chunks")
    
    # Generate embeddings
    print("Generating embeddings...")
    print("This may take a while depending on API rate limits...")
    chunks_with_embeddings = generator.generate_embeddings_batch(chunks)
    
    # Save results
    print("Saving embeddings...")
    generator.save_embeddings(chunks_with_embeddings)
    
    # Create React utilities
    generator.create_react_search_utils(chunks_with_embeddings)
    
    print("\n✅ Embedding generation complete!")
    print(f"Successfully processed {generator.processed_count} verses")
    print("\n📂 Files created for React.js integration:")
    print("- embeddings.js: Embeddings matrix as JS module")
    print("- verses_index.js: Verse metadata with helper functions")
    print("- searchUtils.js: Complete semantic search utilities")
    print("- *.json: JSON versions for flexibility")
    print("- searchUtils.d.ts: TypeScript definitions")
    
    print("\n🔍 React.js Integration Examples:")
    print("Import: import { EMBEDDINGS_MATRIX, VERSES_INDEX } from './data/text/embeddings.js'")
    print("Search: import { useRigVedaSearch } from './data/text/searchUtils.js'")
    print("\nExample searches:")
    print("- 'fire sacrifice ritual'")
    print("- 'Indra thunder victory'") 
    print("- 'cosmic creation universe'")
    print("- 'devotion prayer worship'")
    print("\n⚡ Ready for direct use in your React components!")

if __name__ == "__main__":
    main()