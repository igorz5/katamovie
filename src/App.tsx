import React from "react";
import { Alert, Spin, Pagination } from "antd";

import MovieList from "./components/MovieList/MovieList";
import Search from "./components/Search/Search";
import { IMovie } from "./types/IMovie";
import MovieDB from "./services/MovieDB";
import { debounce } from "./utils/debounce";

import "./App.scss";

interface AppState {
  movies: IMovie[];
  total: number;
  lastQuery: string | null;
  currentPage: number;
  isLoading: boolean;
  error: Error | null;
}

export default class App extends React.Component<{}, AppState> {
  movieDB: MovieDB;
  debouncedSearchMovies: (
    query: string,
    page?: number | undefined
  ) => Promise<Promise<{ movies: IMovie[]; total: number }>>;

  constructor(props: {}) {
    super(props);

    this.movieDB = new MovieDB();
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
    };
  }

  componentDidMount(): void {
    this.searchMovies("return");
  }

  searchMovies = async (query: string, page?: number): Promise<void> => {
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
        this.setState({ isLoading: true, error: null });
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
  };

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

  render(): React.ReactNode {
    const { movies, total, isLoading, currentPage, error } = this.state;
    const showStatus = error != null || isLoading;
    return (
      <div className="app">
        <div className="app__container">
          <Search
            placeholder="Type to search..."
            className="app__search"
            onChange={this.onSearchChange}
          />
          {showStatus && (
            <div className="app__status">
              {error && <Alert type="error" message={error.message} />}
              {isLoading && <Spin size="large" />}
            </div>
          )}
          <MovieList movies={movies} />
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
        </div>
      </div>
    );
  }
}
