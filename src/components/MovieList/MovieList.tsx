import React from "react";

import { IMovie } from "../../types/IMovie";
import MovieCard from "../MovieCard/MovieCard";

import "./MovieList.scss";

interface MovieListProps {
  movies: IMovie[];
  onRate?: (movieId: number, value: number) => void;
}

export default class MovieList extends React.PureComponent<MovieListProps> {
  static defaultProps: Partial<MovieListProps> = {
    onRate: () => {},
  };

  render(): React.ReactNode {
    const { movies, onRate } = this.props;
    return (
      <ul className="movie-list">
        {movies.map((movie) => (
          <li className="movie-list__item" key={movie.id}>
            <MovieCard
              data={movie}
              onRate={(value: number): void => onRate?.(movie.id, value)}
            />
          </li>
        ))}
      </ul>
    );
  }
}
