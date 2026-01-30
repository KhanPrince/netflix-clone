import { useEffect, useState } from "react";
import { useDebounce } from "react-use";

import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";

import useFetchMovies from "./hooks/useFetchMovies";
import useFavouriteMovies from "./hooks/useFavouriteMovies";
import useInfiniteScroll from "./hooks/useInfiniteScroll";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Custom Hook to fetch movies
  const {
    movieList,
    isLoading: moviesLoading,
    error: moviesError,
    currentPage,
    totalPages,
    fetchMovies,
  } = useFetchMovies();
  // Custom Hook to fetchfavourite movies
  const {
    movies: favouriteMovies,
    isLoading: favouriteLoading,
    error: favouriteError,
    refetch, // refetch favouriteMovies to be used while debouncedSearchTerm
  } = useFavouriteMovies();

  // Debounce search
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 900, [searchTerm]);

  // Fetch on search change
  useEffect(() => {
    fetchMovies(debouncedSearchTerm, 1, false);
    refetch(); // refetch is the fetchfavourites provided by usefavourite hook
  }, [debouncedSearchTerm, fetchMovies]);

  // Infinite scroll
  useInfiniteScroll(
    () => {
      if (currentPage < totalPages && !moviesLoading) {
        fetchMovies(debouncedSearchTerm, currentPage + 1, true);
      }
    },
    { threshold: 500, delay: 200 },
  );

  const isSearching = debouncedSearchTerm.trim().length > 0;

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

        {!isSearching && (
          <section className="favourite">
            <h2>Favourite List</h2>
            {favouriteLoading ? (
              <Spinner />
            ) : favouriteError ? (
              <p className="text-white">{favouriteError}</p>
            ) : (
              <ul>
                {favouriteMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="all-movies">
          <h2>{isSearching ? "Search Results" : "All Movies"}</h2>

          {moviesLoading ? (
            <Spinner />
          ) : moviesError ? (
            <p className="text-white">{moviesError}</p>
          ) : movieList.length > 0 ? (
            <>
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
              {currentPage >= totalPages && (
                <p style={{ textAlign: "center" }}>No more movies</p>
              )}
            </>
          ) : (
            <p className="text-white">No movies found</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
