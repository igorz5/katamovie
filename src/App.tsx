import React from "react";
import { Alert, Spin, Pagination, Tabs } from "antd";

import MovieList from "./components/MovieList/MovieList";
import Search from "./components/Search/Search";
import { IMovie } from "./types/IMovie";
import MovieDB from "./services/MovieDB";
import { debounce } from "./utils/debounce";
import { IGenre } from "./types/IGenre";
import GenresContext from "./components/GenresContext/GenresContext";

import "./App.scss";

interface AppState {
  movies: IMovie[];
  total: number;
  lastQuery: string | null;
  currentPage: number;
  isLoading: boolean;
  error: Error | null;
  genres: IGenre[];
  ratedMovies: IMovie[];
  ratedTotal: number;
  currentRatedPage: number;
}

export default class App extends React.Component<{}, AppState> {
  movieDB: MovieDB;
  guestSessionId: string;
  debouncedSearchMovies: (
    query: string,
    page?: number | undefined
  ) => Promise<Promise<{ movies: IMovie[]; total: number }>>;

  constructor(props: {}) {
    super(props);

    this.movieDB = new MovieDB();
    this.guestSessionId = "";
    this.debouncedSearchMovies = debounce(
      async (query: string, page?: number) => {
        return this.movieDB.searchMovies(query, page);
      },
      3000
    );

    this.state = {
      movies: [],
      total: 0,
      lastQuery: null,
      currentPage: 1,
      isLoading: false,
      error: null,
      genres: [],
      ratedMovies: [],
      ratedTotal: 0,
      currentRatedPage: 1,
    };
  }

  componentDidMount(): void {
    this.createGuestSession();
    this.loadGenres();
    this.searchMovies("return");
  }

  onSearchChange = (value: string): void => {
    this.searchMovies(value);
  };

  onPaginationChange = (page: number): void => {
    this.setState({ currentPage: page });

    const { lastQuery } = this.state;
    if (lastQuery) {
      this.searchMovies(lastQuery, page);
    }
  };

  onRatedPaginationChange = (page: number): void => {
    this.setState({ currentRatedPage: page });
    this.loadRatedMovies(page);
  };

  onRate = async (movieId: number, value: number): Promise<void> => {
    try {
      if (value > 0) {
        this.movieDB.rateMovie(this.guestSessionId, movieId, value);
      } else {
        this.movieDB.deleteRating(this.guestSessionId, movieId);

        const { ratedMovies } = this.state;
        const newRatedMovies = [...ratedMovies].filter(
          (movie) => movie.id !== movieId
        );

        this.setState({ ratedMovies: newRatedMovies });
      }
    } catch (err) {
      console.error(err);
    }
  };

  onTabsChange = (active: string): void => {
    this.setState({ isLoading: false, error: null });
    if (active === "rated") {
      this.loadRatedMovies(1);
      return;
    }

    const { lastQuery } = this.state;

    if (active === "search" && lastQuery) {
      this.searchMovies(lastQuery);
    }
  };

  async loadRatedMovies(page?: number): Promise<void> {
    this.setState({
      isLoading: false,
      error: null,
      ratedMovies: [],
      ratedTotal: 0,
    });
    try {
      this.setState({ isLoading: true });
      const res = await this.movieDB.getRatedMovies(this.guestSessionId, page);
      this.setState({
        ratedMovies: res.movies,
        ratedTotal: res.total,
      });
    } catch (err) {
      if (err instanceof Error) {
        this.setState({
          error: err,
        });
      }
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async loadGenres(): Promise<void> {
    const res = await this.movieDB.getGenres();

    this.setState({ genres: res });
  }

  async searchMovies(query: string, page?: number): Promise<void> {
    this.setState({
      isLoading: false,
      error: null,
      movies: [],
      total: 0,
      currentPage: 1,
      lastQuery: query,
    });
    try {
      if (query.length > 0) {
        this.setState({ isLoading: true });
      }
      const res = await this.debouncedSearchMovies(query, page);
      this.setState({
        movies: res.movies,
        total: res.total,
      });
    } catch (err) {
      if (err instanceof Error) {
        this.setState({
          error: err,
        });
      }
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async createGuestSession(): Promise<void> {
    const item = localStorage.getItem("guest_session");

    if (item) {
      try {
        const data: { id: string; expires_at: string } = JSON.parse(item);
        const expiresDate = new Date(data.expires_at);

        if (expiresDate > new Date()) {
          this.guestSessionId = data.id;
          return;
        }
      } catch {
        console.error("Failed to parse local guest session");
      }
    }

    try {
      localStorage.removeItem("ratings"); // reset local ratings since they're not valid anymore

      const res = await this.movieDB.createGuestSession();
      this.guestSessionId = res.id;

      localStorage.setItem(
        "guest_session",
        JSON.stringify({
          id: res.id,
          expires_at: res.expiresAt.toUTCString(),
        })
      );
    } catch (err) {
      console.error(err);
    }
  }

  renderStatus(): React.ReactNode {
    const { isLoading, error } = this.state;
    const showStatus = error != null || isLoading;
    return (
      showStatus && (
        <div className="app__status">
          {error && <Alert type="error" message={error.message} />}
          {isLoading && <Spin size="large" />}
        </div>
      )
    );
  }

  renderSearch(): React.ReactNode {
    const { movies, total, currentPage } = this.state;
    return (
      <>
        <Search
          placeholder="Type to search..."
          className="app__search"
          onChange={this.onSearchChange}
        />
        {this.renderStatus()}
        <MovieList movies={movies} onRate={this.onRate} />
        <Pagination
          className="app__pagination"
          total={total}
          pageSize={20}
          current={currentPage}
          onChange={this.onPaginationChange}
          showSizeChanger={false}
          size="small"
          hideOnSinglePage
        />
      </>
    );
  }

  renderRated(): React.ReactNode {
    const { ratedMovies, ratedTotal, currentRatedPage } = this.state;
    return (
      <>
        {this.renderStatus()}
        <MovieList movies={ratedMovies} onRate={this.onRate} />
        <Pagination
          className="app__pagination"
          total={ratedTotal}
          pageSize={20}
          current={currentRatedPage}
          onChange={this.onRatedPaginationChange}
          showSizeChanger={false}
          size="small"
          hideOnSinglePage
        />
      </>
    );
  }

  render(): React.ReactNode {
    const { genres } = this.state;
    return (
      <div className="app">
        <div className="app__container">
          <GenresContext.Provider value={genres}>
            <Tabs
              className="app__tabs"
              defaultActiveKey="search"
              onChange={this.onTabsChange}
              items={[
                {
                  label: "Search",
                  key: "search",
                  children: this.renderSearch(),
                },
                {
                  label: "Rated",
                  key: "rated",
                  children: this.renderRated(),
                },
              ]}
            />
          </GenresContext.Provider>
        </div>
      </div>
    );
  }
}
