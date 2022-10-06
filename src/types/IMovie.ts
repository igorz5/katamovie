export interface IMovie {
  id: number;
  title: string;
  posterPath: string | null;
  description: string;
  releaseDate: Date | null;
  genreIds: number[];
  averageRating: number;
}
