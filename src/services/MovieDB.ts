import { IGenre } from "../types/IGenre";
import { IMovie } from "../types/IMovie";

interface SearchMoviesData {
  total_results: number;
  results: {
    id: number;
    title: string;
    poster_path: string;
    genre_ids: number[];
    release_date: string;
    overview: string;
    vote_average: number;
  }[];
}

interface GetGenresData {
  genres: {
    id: number;
    name: string;
  }[];
}

interface CreateGuestSessionData {
  success: boolean;
  guest_session_id: string;
  expires_at: string;
}

interface RateMovieData {
  status_message: string;
  status_code: number;
}

type GetRatedMoviesData = SearchMoviesData;
type DeleteRatingData = RateMovieData;

const request = async <T>(
  url: string,
  config: RequestInit = {}
): Promise<T> => {
  const res = await fetch(url, config);
  if (!res.ok) {
    throw Error(res.statusText);
  }

  return (await res.json()) as T;
};

export default class MovieDB {
  private apiKey = process.env.REACT_APP_MOVIEDB_KEY;
  private baseUrl = "https://api.themoviedb.org/3";
  private baseImageUrl = "https://image.tmdb.org/t/p/original";

  async searchMovies(
    query: string,
    page = 1
  ): Promise<{ movies: IMovie[]; total: number }> {
    if (query.length === 0) {
      return { movies: [], total: 0 };
    }

    const data = await request<SearchMoviesData>(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}&page=${page}`
    );

    const total = data.total_results;
    if (total === 0) {
      throw new Error("Not found");
    }

    const movies: IMovie[] = data.results.map((res) => ({
      id: res.id,
      title: res.title,
      posterPath: res.poster_path
        ? `${this.baseImageUrl}${res.poster_path}`
        : null,
      genreIds: res.genre_ids,
      releaseDate: res.release_date ? new Date(res.release_date) : null,
      description: res.overview,
      averageRating: res.vote_average,
    }));

    return { movies, total };
  }

  async getGenres(): Promise<IGenre[]> {
    const data = await request<GetGenresData>(
      `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}`
    );

    return data.genres.map((genre) => ({
      id: genre.id,
      name: genre.name,
    }));
  }

  async createGuestSession(): Promise<{ id: string; expiresAt: Date }> {
    const data = await request<CreateGuestSessionData>(
      `${this.baseUrl}/authentication/guest_session/new?api_key=${this.apiKey}`
    );

    if (!data.success) {
      throw new Error("Failed to create guest session");
    }

    const expiresAt = data.expires_at.replace(" UTC", ""); // somehow it works

    return {
      id: data.guest_session_id,
      expiresAt: new Date(expiresAt),
    };
  }

  async rateMovie(
    guestSessionId: string,
    movieId: number,
    value: number
  ): Promise<void> {
    if (value <= 0 || value > 10) {
      throw new RangeError(
        "The rating value should be in the range from 1 to 10 inclusive"
      );
    }
    await request<RateMovieData>(
      `${this.baseUrl}/movie/${movieId}/rating?api_key=${this.apiKey}&guest_session_id=${guestSessionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({ value }),
      }
    );
  }

  async deleteRating(guestSessionId: string, movieId: number): Promise<void> {
    await request<DeleteRatingData>(
      `${this.baseUrl}/movie/${movieId}/rating?api_key=${this.apiKey}&guest_session_id=${guestSessionId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      }
    );
  }

  async getRatedMovies(
    guestSessionId: string,
    page = 1
  ): Promise<{ movies: IMovie[]; total: number }> {
    const data = await request<GetRatedMoviesData>(
      `${this.baseUrl}/guest_session/${guestSessionId}/rated/movies?api_key=${this.apiKey}&page=${page}`
    );

    const total = data.total_results;
    if (total === 0) {
      throw new Error("Not found");
    }

    const movies: IMovie[] = data.results.map((res) => ({
      id: res.id,
      title: res.title,
      posterPath: res.poster_path
        ? `${this.baseImageUrl}${res.poster_path}`
        : null,
      genreIds: res.genre_ids,
      releaseDate: res.release_date ? new Date(res.release_date) : null,
      description: res.overview,
      averageRating: res.vote_average,
    }));

    return { movies, total };
  }
}
