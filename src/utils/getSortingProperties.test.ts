import { convertToMovieKey } from "./movieDataUtils";
import { getSortingProperties } from "./movieDataUtils";
import querystring from "node:querystring";
import ExpressError from "./ExpressError";

describe("Valid query key maps to valid movie key for", () => {
  test("rating", () => {
    const result = convertToMovieKey("rating");
    expect(result).toBe("averageRating");
  });
  test("title", () => {
    const result = convertToMovieKey("title");
    expect(result).toBe("primaryTitle");
  });
  test("runtime", () => {
    const result = convertToMovieKey("runtime");
    expect(result).toBe("runtimeMinutes");
  });
  test("year", () => {
    const result = convertToMovieKey("year");
    expect(result).toBe("startYear");
  });
});
test("Invalid query key maps to null", () => {
  const result = convertToMovieKey("invalidKey");
  expect(result).toBe(null);
});

describe("valid query maps to valid sort instruction for", () => {
  test("rating,descending", () => {
    const result = getSortingProperties(
      querystring.decode("sort_by=desc(rating)")
    );
    expect(result).toStrictEqual({ averageRating: -1 });
  });
  test("runtime,ascending", () => {
    const result = getSortingProperties(
      querystring.decode("sort_by=asc(runtime)")
    );
    expect(result).toStrictEqual({ runtimeMinutes: 1 });
  });
});
describe("invalid query maps throws error for", () => {
  test("sorting direction", () => {
    const callGetSortingPros = () => {
      getSortingProperties(
        querystring.decode("sort_by=invalidDirection(runtime)")
      );
    };
    expect(callGetSortingPros).toThrowError(
      new ExpressError("Invalid field", 400)
    );
  });
  test("sorting instruction", () => {
    const callGetSortingPros = () => {
      getSortingProperties(querystring.decode("sort_by=asc(invalidKey)"));
    };
    expect(callGetSortingPros).toThrowError(
      new ExpressError("Invalid field", 400)
    );
  });
});

test("empty query maps to default instructions", () => {
  const result = getSortingProperties(querystring.decode(""));
  expect(result).toStrictEqual({ startYear: -1, numVotes: -1 });
});
