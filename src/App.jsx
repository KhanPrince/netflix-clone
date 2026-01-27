import { useEffect, useState } from "react";
import { useDebounce } from "react-use";

import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/movieCard";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
const API_BASE_URL = "https://api.themoviedb.org/3/";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

//api method ,headers and auth
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
const App = () => {
  const [debounceSearchTerm, setDebounceSearchTerm] = useState("");
  const [searchTerm, setsearchterm] = useState("");

  const [movieList, setMovieList] = useState([]);
  const [fetchErrorMessage, setFetchErrorMessage] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingErrorMessage, setTrendingErrorMessage] = useState("");
  const [trendingLoading, setTrendingLoading] = useState(false);

  //debounce the search term to prevent making too many api requests
  useDebounce(() => setDebounceSearchTerm(searchTerm), 900, [searchTerm]);

  // fetching popular movies
  const fetchMovies = async (query = "") => {
    setFetchLoading(true);
    setFetchErrorMessage("");

    try {
      const endpoint = query
        ? // Search Movies URL
          `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : // Popular Movies URL
          `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to Load Movies.");
      }
      const data = await response.json();

      if (data.response === "false") {
        setFetchErrorMessage(data.Error || "Error while fetching movies.");
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);
      setFetchLoading(false);

      // Updating search count in appwrite if it exists and creating search count if it not exists
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch {
      setFetchErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setFetchLoading(false);
    }
  };

  // trending movies
  const loadTrendingMovies = async () => {
    setTrendingLoading(true);
    setTrendingErrorMessage("");

    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      setFetchErrorMessage(error || "Error while fetching trending movies");
    } finally {
      setTrendingLoading(false);
    }
  };

  // calling fetchMovies on every debounceSearchTerm
  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm]);
  // calling loadingMovies on initial load
  useEffect(() => {
    loadTrendingMovies();
  }, []);

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
          <Search searchTerm={searchTerm} setsearchterm={setsearchterm} />
        </header>

        <section className="trending ">
          <h2>Trending Movies</h2>
          {trendingMovies.length > 0 && trendingLoading ? (
            <Spinner />
          ) : trendingErrorMessage ? (
            <p className="text-white">{trendingErrorMessage}</p>
          ) : (
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="all-movies">
          <h2>All Movies</h2>

          {fetchLoading ? (
            <Spinner />
          ) : fetchErrorMessage ? (
            <p className="text-white">{fetchErrorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>

        <h1 className="text-white">{searchTerm}</h1>
      </div>
    </main>
  );
};

export default App;
