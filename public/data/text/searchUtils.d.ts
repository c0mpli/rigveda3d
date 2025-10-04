// TypeScript definitions for Rig Veda search utilities

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
