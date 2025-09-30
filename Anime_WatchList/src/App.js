import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [watchLater, setWatchLater] = useState([]);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const savedWatchLater =
      JSON.parse(localStorage.getItem("watchLater")) || [];
    const savedCompleted = JSON.parse(localStorage.getItem("completed")) || [];
    setWatchLater(savedWatchLater);
    setCompleted(savedCompleted);
  }, []);

  // !Save to localStorage whenever lists change
  useEffect(() => {
    localStorage.setItem("watchLater", JSON.stringify(watchLater));
  }, [watchLater]);

  useEffect(() => {
    localStorage.setItem("completed", JSON.stringify(completed));
  }, [completed]);

  // !Search anime
  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    //! If query is empty, clear results and exit
    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
          trimmedQuery
        )}&limit=10`
      );
      const data = await response.json();
      setResults(data.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
    }
  }, [searchQuery]);

  // *Add anime to list

  const addToWatchList = (anime, list) => {
    if (
      list === "watchLater" &&
      !watchLater.some((a) => a.mal_id === anime.mal_id)
    ) {
      setWatchLater((prev) => [...prev, anime]);
    } else if (
      list === "completed" &&
      !completed.some((a) => a.mal_id === anime.mal_id)
    ) {
      setCompleted((prev) => [...prev, anime]);
    }
  };

  // ?Move or remove from list
  const handleListAction = (id, action, targetList) => {
    const anime =
      watchLater.find((a) => a.mal_id === id) ||
      completed.find((a) => a.mal_id === id);

    if (action === "remove") {
      setWatchLater((prev) => prev.filter((a) => a.mal_id !== id));
      setCompleted((prev) => prev.filter((a) => a.mal_id !== id));
    } else if (action === "move") {
      setWatchLater((prev) => prev.filter((a) => a.mal_id !== id));
      setCompleted((prev) => prev.filter((a) => a.mal_id !== id));

      if (targetList === "completed") {
        setCompleted((prev) => [...prev, anime]);
      } else {
        setWatchLater((prev) => [...prev, anime]);
      }
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Anime Watchlist</h1>
      </header>

      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for an anime..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      <section className="results">
        <h2>Search Results</h2>
        <div className="anime-grid">
          {results.length === 0 ? (
            <p>No results found. Try searching for an anime.</p>
          ) : (
            results.map((anime) => (
              <div className="anime-card cursor-pointer" key={anime.mal_id}>
                <img
                  src={anime.images?.webp?.large_image_url}
                  alt={anime.title}
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/200x300")
                  }
                />
                <div className="info">
                  <h3>{anime.title}</h3>
                  <p>Episodes: {anime.episodes || "?"}</p>
                  <p>Score: {anime.score || "N/A"}</p>
                  <div className="actions">
                    <button
                      onClick={() => addToWatchList(anime, "watchLater")}
                      disabled={watchLater.some(
                        (a) => a.mal_id === anime.mal_id
                      )}
                      className="btn-watch-later"
                    >
                      {watchLater.some((a) => a.mal_id === anime.mal_id)
                        ? "Added"
                        : "Watch Later"}
                    </button>
                    <button
                      onClick={() => addToWatchList(anime, "completed")}
                      disabled={completed.some(
                        (a) => a.mal_id === anime.mal_id
                      )}
                      className="btn-completed"
                    >
                      {completed.some((a) => a.mal_id === anime.mal_id)
                        ? "Added"
                        : "Completed"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      
      <section className="lists">
        <div className="list">
          <h2>Watch Later</h2>
          {watchLater.length === 0 ? (
            <p className="no-items">No anime added yet.</p>
          ) : (
            <div className="list-items">
              {watchLater.map((anime) => (
                <div className="list-item" key={anime.mal_id}>
                  <img
                    src={anime.images?.webp?.large_image_url}
                    alt={anime.title}
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/60x80")
                    }
                  />
                  <div className="list-info">
                    <h4>{anime.title}</h4>
                    <p>Ep: {anime.episodes || "?"}</p>
                  </div>
                  <div className="list-actions">
                    <button
                      className="action-btn move"
                      onClick={() =>
                        handleListAction(anime.mal_id, "move", "completed")
                      }
                    >
                      Mark Completed
                    </button>
                    <button
                      className="action-btn remove"
                      onClick={() => handleListAction(anime.mal_id, "remove")}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="list">
          <h2>Completed</h2>
          {completed.length === 0 ? (
            <p className="no-items">No anime completed yet.</p>
          ) : (
            <div className="list-items">
              {completed.map((anime) => (
                <div className="list-item" key={anime.mal_id}>
                  <img
                    src={anime.images?.webp?.large_image_url}
                    alt={anime.title}
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/60x80")
                    }
                  />
                  <div className="list-info">
                    <h4>{anime.title}</h4>
                    <p>Ep: {anime.episodes || "?"}</p>
                  </div>
                  <div className="list-actions">
                    <button
                      className="action-btn move"
                      onClick={() =>
                        handleListAction(anime.mal_id, "move", "watchLater")
                      }
                    >
                      Move to Watch Later
                    </button>
                    <button
                      className="action-btn remove"
                      onClick={() => handleListAction(anime.mal_id, "remove")}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
