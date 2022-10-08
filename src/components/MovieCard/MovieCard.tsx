import React from "react";
import { Image, Rate } from "antd";

import { IMovie } from "../../types/IMovie";
import { formatDate, truncateText } from "../../utils/format";
import GenresContext from "../GenresContext/GenresContext";
import { IGenre } from "../../types/IGenre";
import noPoster from "../../assets/no-poster.png";

import "./MovieCard.scss";

interface MovieCardProps {
  data: IMovie;
  onRate?: (value: number) => void;
}

interface MovieCardState {
  rating: number;
}

export default class MovieCard extends React.Component<
  MovieCardProps,
  MovieCardState
> {
  static defaultProps: Partial<MovieCardProps> = {
    onRate: () => {},
  };

  static getGenreName(genres: IGenre[], id: number): string {
    const genre = genres.find((item) => item.id === id);

    return genre ? genre.name : "Unknown";
  }

  static getAverageRatingColor(rating: number): string {
    if (rating >= 0 && rating < 3) {
      return "#E90000";
    }

    if (rating >= 3 && rating < 5) {
      return "#E97E00";
    }

    if (rating >= 5 && rating < 7) {
      return "#E9D100";
    }

    return "#66E900";
  }

  constructor(props: MovieCardProps) {
    super(props);

    this.state = {
      rating: 0,
    };
  }

  componentDidMount(): void {
    this.loadRating();
  }

  onRateChange = (value: number): void => {
    this.setState({ rating: value });
    this.saveRating(value);

    const { onRate } = this.props;
    onRate?.(value);
  };

  saveRating(value: number): void {
    const item = localStorage.getItem("ratings");
    let ratings: { [key: string]: number } = {};
    if (item) {
      try {
        ratings = JSON.parse(item);
      } catch {
        console.error("Failed to parse local ratings");
      }
    }

    const { data } = this.props;
    if (value > 0) {
      ratings[data.id] = value;
    } else {
      delete ratings[data.id];
    }

    localStorage.setItem("ratings", JSON.stringify(ratings));
  }

  loadRating(): void {
    const item = localStorage.getItem("ratings");
    const { data } = this.props;
    let rating = 0;
    if (item) {
      try {
        const ratings: { [key: string]: number } = JSON.parse(item);
        rating = ratings[data.id] ? ratings[data.id] : 0;
      } catch {
        console.error("Failed to parse local ratings");
      }
    }

    this.setState({ rating });
  }

  render(): React.ReactNode {
    const { data } = this.props;
    const { rating } = this.state;

    return (
      <GenresContext.Consumer>
        {(genres: IGenre[]): React.ReactNode => (
          <div className="movie-card">
            <div className="movie-card__left">
              <Image
                src={data.posterPath ? data.posterPath : ""}
                alt="Poster"
                className="movie-card__poster-img"
                rootClassName="movie-card__poster"
                fallback={noPoster}
                preview={false}
              />
            </div>
            <div className="movie-card__right">
              <div className="movie-card__header">
                <h5 className="movie-card__title">{data.title}</h5>
                <div
                  className="movie-card__average-rating"
                  style={{
                    borderColor: MovieCard.getAverageRatingColor(
                      data.averageRating
                    ),
                  }}
                >
                  <span>{data.averageRating.toFixed(1)}</span>
                </div>
                <div className="movie-card__date">
                  {data.releaseDate && formatDate(data.releaseDate)}
                </div>
                <ul className="movie-card__genres-list">
                  {data.genreIds.map((id) => {
                    return (
                      <li key={id} className="movie-card__genres-item">
                        {MovieCard.getGenreName(genres, id)}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="movie-card__body">
                <p className="movie-card__description">
                  {truncateText(data.description, 130, "...")}
                </p>
              </div>
              <div className="movie-card__footer">
                <Rate
                  count={10}
                  allowHalf
                  value={rating}
                  onChange={this.onRateChange}
                />
              </div>
            </div>
          </div>
        )}
      </GenresContext.Consumer>
    );
  }
}
