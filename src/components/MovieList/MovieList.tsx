import React from "react";

import { IMovie } from "../../types/IMovie";
import MovieCard from "../MovieCard/MovieCard";

import "./MovieList.scss";

interface MovieListProps {
  movies: IMovie[];
}

export default class MovieList extends React.PureComponent<MovieListProps> {
  render(): React.ReactNode {
    const { movies } = this.props;
    return (
      <ul className="movie-list">
        {movies.map((movie) => (
          <li className="movie-list__item" key={movie.id}>
            <MovieCard data={movie} />
          </li>
        ))}
      </ul>
    );
  }
}
