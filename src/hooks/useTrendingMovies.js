import { useState, useEffect, useCallback } from "react";
import { getTrendingMovies } from "../appwrite";

const useTrendingMovies = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTrendingMovies = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const trendingMovies = await getTrendingMovies();
      setMovies(trendingMovies);
    } catch (err) {
      setError(err.message || "Error fetching trending movies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrendingMovies();
  }, [loadTrendingMovies]);

  return { movies, isLoading, error, refetch: loadTrendingMovies };
};

export default useTrendingMovies;
