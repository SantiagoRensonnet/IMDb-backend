"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterByRuntimeAndRating = exports.convertToMongoFilterRule = exports.convertToFilter = exports.getPaginationProperties = exports.getSortingProperties = exports.convertToMovieKey = void 0;
const ExpressError_1 = __importDefault(require("./ExpressError"));
/*Sorting */
/******************************************************************* */
/**

    Auxiliary function to convert query string parameters to keys of the class "movie" compatible with those in the database.
    @param {string} key - The key to be converted. ("title", "rating", "year", "runtime")
    @returns {string|null} - The converted key or null if the parameter key is not recognized.
    */
const convertToMovieKey = (key) => {
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
exports.convertToMovieKey = convertToMovieKey;
/**

    Retrieves the sorting properties based on the provided query string parameters.
    If the query string is empty, the default sorting properties for trending sort are returned.
    @param {QueryString.ParsedQs} query - The parsed query string parameters.
    @returns {Sort} - The sorting properties object. Default sorting properties: { rating: -1}.
    @throws {ExpressError} - If an invalid field is provided.
    */
const getSortingProperties = (query) => {
    let sort = { averageRating: -1 }; //Top Rating Sort
    // let sort: Sort = { startYear: -1, numVotes: -1 }; //Trending sort
    if (typeof query.sort_by === "string") {
        const field = (0, exports.convertToMovieKey)(query.sort_by.split("(")[1].split(")")[0]);
        const direction = query.sort_by.split("(")[0];
        if (!field) {
            throw new ExpressError_1.default("Invalid field", 400);
        }
        if (direction !== "asc" && direction !== "desc") {
            throw new ExpressError_1.default("Invalid field", 400);
        }
        const order = direction === "asc" ? 1 : -1;
        sort = {};
        sort[field] = order;
    }
    return sort;
};
exports.getSortingProperties = getSortingProperties;
/******************************************************************* */
const getPaginationProperties = (query) => {
    const paginationProps = { page: 1, limit: 10 }; //default values
    if (typeof query.page === "string") {
        paginationProps.page = parseInt(query.page);
    }
    if (typeof query.limit === "string") {
        paginationProps.limit = parseInt(query.limit);
    }
    return paginationProps;
};
exports.getPaginationProperties = getPaginationProperties;
const convertToFilter = (query) => {
    const filter = {
        startYear: { $lte: 2023 },
        primaryTitle: { $regex: /^[\x00-\x7F]*$/ },
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
exports.convertToFilter = convertToFilter;
const convertToMongoFilterRule = (queryCriteria) => {
    const parsedCriteria = {};
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
exports.convertToMongoFilterRule = convertToMongoFilterRule;
const getFilterByRuntimeAndRating = (query) => {
    const filter = {};
    // numVotes: { $gt: 1000 }
    if (typeof query.runtime === "object") {
        const runtimeCriteria = (0, exports.convertToMongoFilterRule)(query.runtime);
        filter.runtimeMinutes = runtimeCriteria;
    }
    if (typeof query.rating === "object") {
        const ratingCriteria = (0, exports.convertToMongoFilterRule)(query.rating);
        filter.averageRating = ratingCriteria;
    }
    return filter;
};
exports.getFilterByRuntimeAndRating = getFilterByRuntimeAndRating;
