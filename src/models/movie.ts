import { ObjectId } from "mongodb";
export default class Movie {
  constructor(
    tconst: string,
    titleType: string,
    primaryTitle: string,
    originalTitle: string,
    isAdult: number,
    startYear: number,
    endYear: number,
    runtimeMinutes: number,
    genres: string[],
    averageRating: number,
    numVotes: number,
    id?: ObjectId
  ) {}
}
