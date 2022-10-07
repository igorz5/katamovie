import React from "react";
import { Alert, Spin } from "antd";

import "./App.scss";
import MovieList from "./components/MovieList/MovieList";
import { IMovie } from "./types/IMovie";
import MovieDB from "./services/MovieDB";

interface AppState {
  movies: IMovie[];
  isLoading: boolean;
  error: Error | null;
}

export default class App extends React.Component<{}, AppState> {
  movieDB: MovieDB;

  constructor(props: {}) {
    super(props);

    this.movieDB = new MovieDB();
    this.state = {
      movies: [],
      isLoading: false,
      error: null,
    };
  }

  componentDidMount(): void {
    this.searchMovies("return");
  }

  async searchMovies(query: string, page = 1): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });
      const res = await this.movieDB.searchMovies(query, page);
      this.setState({
        movies: res.movies,
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

  render(): React.ReactNode {
    const { movies, isLoading, error } = this.state;
    const showStatus = error != null || isLoading;
    return (
      <div className="app">
        <div className="app__container">
          {showStatus && (
            <div className="app__status">
              {error && <Alert type="error" message={error.message} />}
              {isLoading && <Spin size="large" />}
            </div>
          )}
          <MovieList movies={movies} />
        </div>
      </div>
    );
  }
}
