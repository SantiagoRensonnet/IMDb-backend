import QueryString, { ParsedQs } from "qs";
import { Sort } from "mongodb";
import ExpressError from "./ExpressError";

/*Sorting */
/******************************************************************* */
/**

    Auxiliary function to convert query string parameters to keys of the class "movie" compatible with those in the database.
    @param {string} key - The key to be converted. ("title", "rating", "year", "runtime")
    @returns {string|null} - The converted key or null if the parameter key is not recognized.
    */
export const convertToMovieKey = (key: string): string | null => {
  switch (key) {
    case "title":
      return "primaryTitle";
    case "rating":
      return "averageRating";
    case "year":
      return "startYear";
    case "runtime":
      return "runtimeMinutes";
    default:
      return null;
  }
};
/**

    Retrieves the sorting properties based on the provided query string parameters.
    If the query string is empty, the default sorting properties for trending sort are returned.
    @param {QueryString.ParsedQs} query - The parsed query string parameters.
    @returns {Sort} - The sorting properties object. Default sorting properties: { rating: -1}.
    @throws {ExpressError} - If an invalid field is provided.
    */
export const getSortingProperties = (query: QueryString.ParsedQs): Sort => {
  let sort: Sort = { averageRating: -1 }; //Top Rating Sort

  // let sort: Sort = { startYear: -1, numVotes: -1 }; //Trending sort
  if (typeof query.sort_by === "string") {
    const field = convertToMovieKey(query.sort_by.split("(")[1].split(")")[0]);
    const direction = query.sort_by.split("(")[0];
    if (!field) {
      throw new ExpressError("Invalid field", 400);
    }
    if (direction !== "asc" && direction !== "desc") {
      throw new ExpressError("Invalid field", 400);
    }
    const order = direction === "asc" ? 1 : -1;
    sort = {};
    sort[field] = order;
  }
  return sort;
};
/******************************************************************* */
export const getPaginationProperties = (query: QueryString.ParsedQs) => {
  const paginationProps = { page: 1, limit: 10 }; //default values
  if (typeof query.page === "string") {
    paginationProps.page = parseInt(query.page);
  }
  if (typeof query.limit === "string") {
    paginationProps.limit = parseInt(query.limit);
  }
  return paginationProps;
};
export const convertToFilter = (query: QueryString.ParsedQs) => {
  type FilterType = {
    startYear: Object;
    primaryTitle: Object;
    originalTitle: Object;
    numVotes: Object;
    genres?: Object;
    $text?: {
      $search: string;
      $language?: string | undefined;
      $caseSensitive?: boolean | undefined;
    };
  };

  const filter: FilterType = {
    startYear: { $lte: 2023 },
    primaryTitle: { $regex: /^[\x00-\x7F]*$/ }, //Exclude ASCII extended characters
    originalTitle: { $regex: /^[\x00-\x7F]*$/ },
    numVotes: { $gt: 50000 },
  };
  if (typeof query.genre === "string") {
    filter.genres = { $in: [query.genre] };
  }
  if (typeof query.title === "string" && query.title) {
    filter.$text = {
      $search: `\"${query.title.split("+").join(" ")}\"`,
    };
  }
  return filter;
};

export const convertToMongoFilterRule = (queryCriteria: any) => {
  type parsedCriteria = {
    $eq?: number | null;
    $gt?: number | null;
    $gte?: number | null;
    $lt?: number | null;
    $lte?: number | null;
    $ne?: number | null;
  };
  const parsedCriteria: parsedCriteria = {};
  //keys are operators, values are strings to be parsed to integers
  switch (Object.keys(queryCriteria)[0]) {
    case "eq":
      parsedCriteria.$eq = queryCriteria.eq
        ? parseFloat(queryCriteria.eq)
        : null;
      return parsedCriteria;

    case "gt":
      parsedCriteria.$gt = queryCriteria.gt
        ? parseFloat(queryCriteria.gt)
        : null;
      return parsedCriteria;
    case "gte":
      parsedCriteria.$gte = queryCriteria.gte
        ? parseInt(queryCriteria.gte)
        : null;
      return parsedCriteria;
    case "lt":
      parsedCriteria.$lt = queryCriteria.lt
        ? parseFloat(queryCriteria.lt)
        : null;
      return parsedCriteria;
    case "lte":
      parsedCriteria.$lte = queryCriteria.lte
        ? parseInt(queryCriteria.lte)
        : null;
      return parsedCriteria;
    case "ne":
      parsedCriteria.$ne = queryCriteria.ne
        ? parseFloat(queryCriteria.ne)
        : null;
      return parsedCriteria;
    default:
      return parsedCriteria;
  }
};

export const getFilterByRuntimeAndRating = (query: QueryString.ParsedQs) => {
  type FilterType = {
    runtimeMinutes?: Object;
    averageRating?: Object;
  };
  const filter: FilterType = {};
  // numVotes: { $gt: 1000 }
  if (typeof query.runtime === "object") {
    const runtimeCriteria = convertToMongoFilterRule(query.runtime);
    filter.runtimeMinutes = runtimeCriteria;
  }
  if (typeof query.rating === "object") {
    const ratingCriteria = convertToMongoFilterRule(query.rating);
    filter.averageRating = ratingCriteria;
  }
  return filter;
};
