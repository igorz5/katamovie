import React from "react";

import "./App.scss";
import MovieList from "./components/MovieList/MovieList";
import { IMovie } from "./types/IMovie";
import MovieDB from "./services/MovieDB";

const defaultMovies: IMovie[] = [
  {
    id: 0,
    title: "Film 1",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum, amet.",
    genreIds: [1, 2],
    posterPath: "",
    averageRating: 1,
    releaseDate: new Date(),
  },
  {
    id: 1,
    title: "Film 1",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum, amet.",
    genreIds: [1, 2],
    posterPath: "",
    averageRating: 1,
    releaseDate: new Date(),
  },
];

interface AppState {
  movies: IMovie[];
}

export default class App extends React.Component<{}, AppState> {
  movieDB: MovieDB;

  constructor(props: {}) {
    super(props);

    this.movieDB = new MovieDB();
    this.state = {
      movies: defaultMovies,
    };
  }

  componentDidMount() {
    this.searchMovies("return");
  }

  async searchMovies(query: string, page = 1) {
    const res = await this.movieDB.searchMovies(query, page);
    this.setState({
      movies: res.movies,
    });
  }

  render() {
    const { movies } = this.state;
    return (
      <div className="app">
        <div className="app__container">
          <MovieList movies={movies} />
        </div>
      </div>
    );
  }
}
