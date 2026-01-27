import React from "react";

const Search = ({ searchTerm, setsearchterm }) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" alt="search" />
        <input
          type="text"
          placeholder="Search through all movies"
          value={searchTerm}
          onChange={(e) => setsearchterm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Search;
