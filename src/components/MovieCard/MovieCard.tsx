import React from "react";

import { IMovie } from "../../types/IMovie";
import { formatDate, truncateText } from "../../utils/format";

import "./MovieCard.scss";

interface MovieCardProps {
  data: IMovie;
}

export default class MovieCard extends React.PureComponent<MovieCardProps> {
  render(): React.ReactNode {
    const { data } = this.props;
    return (
      <div className="movie-card">
        <div className="movie-card__left">
          <img
            src={data.posterPath ? data.posterPath : ""}
            alt="Poster"
            className="movie-card__poster"
          />
        </div>
        <div className="movie-card__right">
          <div className="movie-card__header">
            <h5 className="movie-card__title">{data.title}</h5>
            <div className="movie-card__date">
              <span>{data.releaseDate && formatDate(data.releaseDate)}</span>
            </div>
            <ul className="movie-card__genres-list">
              <li className="movie-card__genre-item">Fantasy</li>
              <li className="movie-card__genre-item">Action</li>
            </ul>
          </div>
          <div className="movie-card__body">
            <p className="movie-card__description">
              {truncateText(data.description, 100, "...")}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
