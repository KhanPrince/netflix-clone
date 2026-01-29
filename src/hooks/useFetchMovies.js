import { useState, useRef, useCallback } from "react";

const API_BASE_URL = "https://api.themoviedb.org/3/";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function useFetchMovies() {
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const abortControllerRef = useRef(new AbortController());

  const fetchMovies = useCallback(
    async (query = "", page = 1, append = false) => {
      // Cancel previous request
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      if (page === 1) {
        setIsLoading(true);
        setError("");
      }

      try {
        const endpoint = query
          ? `${API_BASE_URL}search/movie?query=${encodeURIComponent(query)}&page=${page}`
          : `${API_BASE_URL}discover/movie?sort_by=popularity.desc&page=${page}`;

        const response = await fetch(endpoint, {
          ...API_OPTIONS,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }

        const data = await response.json();

        if (!data.results) {
          setError("No movies found");
          if (page === 1) setMovieList([]);
          return;
        }

        // Append or replace
        if (append) {
          setMovieList((prev) => [...prev, ...data.results]);
        } else {
          setMovieList(data.results);
        }

        setTotalPages(data.total_pages);
        setCurrentPage(page);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        setError(err.message || "Failed to fetch movies");
        if (page === 1) setMovieList([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    movieList,
    isLoading,
    error,
    currentPage,
    totalPages,
    fetchMovies,
  };
}

export default useFetchMovies;
