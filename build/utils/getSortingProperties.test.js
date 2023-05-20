"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const movieDataUtils_1 = require("./movieDataUtils");
const movieDataUtils_2 = require("./movieDataUtils");
const node_querystring_1 = __importDefault(require("node:querystring"));
const ExpressError_1 = __importDefault(require("./ExpressError"));
describe("Valid query key maps to valid movie key for", () => {
    test("rating", () => {
        const result = (0, movieDataUtils_1.convertToMovieKey)("rating");
        expect(result).toBe("averageRating");
    });
    test("title", () => {
        const result = (0, movieDataUtils_1.convertToMovieKey)("title");
        expect(result).toBe("primaryTitle");
    });
    test("runtime", () => {
        const result = (0, movieDataUtils_1.convertToMovieKey)("runtime");
        expect(result).toBe("runtimeMinutes");
    });
    test("year", () => {
        const result = (0, movieDataUtils_1.convertToMovieKey)("year");
        expect(result).toBe("startYear");
    });
});
test("Invalid query key maps to null", () => {
    const result = (0, movieDataUtils_1.convertToMovieKey)("invalidKey");
    expect(result).toBe(null);
});
describe("valid query maps to valid sort instruction for", () => {
    test("rating,descending", () => {
        const result = (0, movieDataUtils_2.getSortingProperties)(node_querystring_1.default.decode("sort_by=desc(rating)"));
        expect(result).toStrictEqual({ averageRating: -1 });
    });
    test("runtime,ascending", () => {
        const result = (0, movieDataUtils_2.getSortingProperties)(node_querystring_1.default.decode("sort_by=asc(runtime)"));
        expect(result).toStrictEqual({ runtimeMinutes: 1 });
    });
});
describe("invalid query maps throws error for", () => {
    test("sorting direction", () => {
        const callGetSortingPros = () => {
            (0, movieDataUtils_2.getSortingProperties)(node_querystring_1.default.decode("sort_by=invalidDirection(runtime)"));
        };
        expect(callGetSortingPros).toThrowError(new ExpressError_1.default("Invalid field", 400));
    });
    test("sorting instruction", () => {
        const callGetSortingPros = () => {
            (0, movieDataUtils_2.getSortingProperties)(node_querystring_1.default.decode("sort_by=asc(invalidKey)"));
        };
        expect(callGetSortingPros).toThrowError(new ExpressError_1.default("Invalid field", 400));
    });
});
test("empty query maps to default instructions", () => {
    const result = (0, movieDataUtils_2.getSortingProperties)(node_querystring_1.default.decode(""));
    expect(result).toStrictEqual({ startYear: -1, numVotes: -1 });
});
