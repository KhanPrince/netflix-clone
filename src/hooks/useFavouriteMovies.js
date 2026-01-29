import { useState, useEffect, useCallback } from "react";
import { getFavouriteMovies } from "../appwrite";

const useFavouriteMovies = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadFavouriteMovies = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const favouriteMovies = await getFavouriteMovies();
      setMovies(favouriteMovies);
    } catch (err) {
      setError(err.message || "Error fetching favourite movies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavouriteMovies();
  }, [loadFavouriteMovies]);

  return { movies, isLoading, error, refetch: loadFavouriteMovies };
};

export default useFavouriteMovies;
