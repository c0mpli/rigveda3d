import { useState, useCallback, useEffect } from "react";
import {
  searchRigVeda,
  textSearch,
  getFilterOptions,
  applyFilters,
} from "../utils/searchUtils.js";

const useRigVedaSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [embeddingsMatrix, setEmbeddingsMatrix] = useState(null);
  const [versesIndex, setVersesIndex] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);

  // Initialize search data
  useEffect(() => {
    const initializeSearch = async () => {
      try {
        console.log("Loading Rig Veda search data...");

        // Load verses data and embeddings
        const [versesData, embeddingsData] = await Promise.all([
          fetch("/data/text/verses_index.json").then((res) => {
            if (!res.ok)
              throw new Error(`Failed to load verses: ${res.status}`);
            return res.json();
          }),
          fetch("/data/text/embeddings.json")
            .then((res) => {
              if (!res.ok)
                throw new Error(`Failed to load embeddings: ${res.status}`);
              return res.json();
            })
            .catch((err) => {
              console.warn("Embeddings not available:", err.message);
              return null;
            }),
        ]);

        setVersesIndex(versesData);
        setEmbeddingsMatrix(embeddingsData);
        setFilterOptions(getFilterOptions(versesData));
        setIsInitialized(true);

        console.log(
          `Loaded ${versesData?.length || 0} verses and ${
            embeddingsData?.length || 0
          } embeddings`
        );
      } catch (err) {
        console.error("Failed to initialize search:", err);
        setError("Failed to initialize search functionality");
      }
    };

    initializeSearch();
  }, []);

  const search = useCallback(
    async (query, topK = 8, filters = {}) => {
      if (!query || !query.trim()) {
        setResults([]);
        setError(null);
        return;
      }

      if (!isInitialized || !versesIndex) {
        setError("Search not initialized yet");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

        // Try semantic search first if we have embeddings and API key
        if (embeddingsMatrix && apiKey) {
          const searchResults = await searchRigVeda(
            query,
            embeddingsMatrix,
            versesIndex,
            apiKey,
            topK,
            filters
          );

          if (searchResults.success) {
            setResults(searchResults.results);
            return;
          } else {
            // If semantic search fails, show error but still fall back to text search
            console.error("Semantic search error:", searchResults.error);
            setError(`Semantic search failed: ${searchResults.error}`);
          }
        }

        // Fallback to text-based search
        const textResults = textSearch(query, versesIndex, topK, filters);
        setResults(textResults);
      } catch (err) {
        console.error("Search error:", err);
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [isInitialized, embeddingsMatrix, versesIndex]
  );

  // Add a filter-only function for browsing without search
  const browseFiltered = useCallback(
    (filters = {}, limit = 50) => {
      if (!isInitialized || !versesIndex) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const filtered = applyFilters(versesIndex, filters);
        const browsedResults = filtered
          .slice(0, limit)
          .map((verse) => ({ ...verse, similarity: 1.0 }));
        setResults(browsedResults);
      } catch (err) {
        console.error("Browse error:", err);
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [isInitialized, versesIndex]
  );

  return {
    search,
    browseFiltered,
    loading,
    results,
    error,
    isInitialized,
    filterOptions,
    versesIndex,
  };
};

export default useRigVedaSearch;
