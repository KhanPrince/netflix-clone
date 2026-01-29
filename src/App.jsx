import { useEffect, useState, useRef, useCallback } from "react";
import { useDebounce } from "react-use";

import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/movieCard";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3/";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Constants
const DEBOUNCE_DELAY = 900; // ms
const TIMEOUT_DELAY = 200; // ms
const SCROLL_THRESHOLD = 500; // px from bottom

//api method ,headers and auth
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
const App = () => {
  // searching states
  const [debounceSearchTerm, setDebounceSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  //fetch states
  const [movieList, setMovieList] = useState([]);
  const [fetchErrorMessage, setFetchErrorMessage] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  //trending states
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingErrorMessage, setTrendingErrorMessage] = useState("");
  const [trendingLoading, setTrendingLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // to cancel previous search requests  // cleanup
  const abortControllerRef = useRef(new AbortController());
  const scrollTimeoutRef = useRef(null);

  //debounce the search term to prevent making too many api requests

  useDebounce(() => setDebounceSearchTerm(searchTerm), DEBOUNCE_DELAY, [
    searchTerm,
  ]);

  // fetching popular movies
  const fetchMovies = useCallback(
    async (query = "", page = 1, append = false) => {
      // Cancel previous requests
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      if (page === 1) {
        setFetchLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setFetchErrorMessage("");

      try {
        const endpoint = query
          ? // Search Movies URL
            `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
          : // Popular Movies URL
            `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

        const response = await fetch(endpoint, {
          ...API_OPTIONS,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to Load Movies.");
        }
        const data = await response.json();

        if (!data.results) {
          setFetchErrorMessage("No movies found");
          if (page === 1) setMovieList([]);
          return;
        }

        // Append new results to existing list if loading more, otherwise replace
        if (append) {
          setMovieList((prevList) => [...prevList, ...(data.results || [])]);
        } else {
          setMovieList(data.results || []);
        }

        setTotalPages(data.total_pages || 0);
        setCurrentPage(page);

        // Updating search count in appwrite if it exists and creating search count if it not exists
        if (query && data.results.length > 0 && page === 1) {
          await updateSearchCount(query, data.results[0]);
        }
      } catch (error) {
        if (error.name === "AbortError") return; // Ignore aborted requests
        console.error("Error fetching movies:", error);
        setFetchErrorMessage("Error fetching movies. Please try again later.");
      } finally {
        setFetchLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  // trending movies
  const loadTrendingMovies = useCallback(async () => {
    setTrendingLoading(true);
    setTrendingErrorMessage("");

    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      setTrendingErrorMessage(error || "Error while fetching trending movies");
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  // calling fetchMovies on every debounceSearchTerm
  useEffect(() => {
    setCurrentPage(1);
    setFetchErrorMessage(""); //clear errors of previous fetch
    fetchMovies(debounceSearchTerm, 1, false);
  }, [debounceSearchTerm, fetchMovies]);

  // calling loadingMovies on initial load
  useEffect(() => {
    loadTrendingMovies();
  }, [loadTrendingMovies]);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        // Check if user scrolled to bottom

        if (
          window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.scrollHeight - SCROLL_THRESHOLD
        ) {
          // Load next page if available and not already loading
          if (currentPage < totalPages && !isLoadingMore && !fetchLoading) {
            fetchMovies(debounceSearchTerm, currentPage + 1, true);
          }
        }
      }, TIMEOUT_DELAY);
    };
    // Cleanup : Removing listner and clear timeout
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [
    currentPage,
    totalPages,
    isLoadingMore,
    fetchLoading,
    debounceSearchTerm,
    fetchMovies,
  ]);

  return (
    <main>
      <div className="pattern"></div>

      <div className="wrapper">
        <header>
          <img src="./hero.WebP" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {searchTerm && <p className="text-white">{searchTerm}</p>}

        <section className="trending ">
          <h2>Trending Movies</h2>
          {trendingLoading ? (
            <Spinner />
          ) : trendingErrorMessage ? (
            <p className="text-white">{trendingErrorMessage}</p>
          ) : trendingMovies.length > 0 ? (
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white">No trending movies available</p>
          )}
        </section>

        <section className="all-movies">
          <h2>All Movies</h2>

          {fetchLoading ? (
            <Spinner />
          ) : fetchErrorMessage ? (
            <p className="text-white">{fetchErrorMessage}</p>
          ) : movieList.length > 0 ? (
            <>
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
              {isLoadingMore && <Spinner />}
            </>
          ) : (
            <p className="text-white">
              {" "}
              No movie found. Try a different Search
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
