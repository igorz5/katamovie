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
    const data = await request<SearchMoviesData>(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}&page=${page}`
    );

    const total = data.total_results;

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
