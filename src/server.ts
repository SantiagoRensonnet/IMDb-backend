//Environment variables
require("dotenv").config();
//Types
import { PosterMap, PosterObject, UpdateOperation } from "./types/types";
//Models
import Movie from "./models/movie";
//Custom Error
import ExpressError from "./utils/ExpressError";
//wrapAsync
import catchAsync from "./utils/catchAsync";

//Express
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
var cors = require("cors");
//Db connect interface
import { connectToDatabase } from "./services/database/database.service";
//Db Collection
import { Collection, ObjectId } from "mongodb";
//*********************************************
//Database init
//*********************************************
let moviesCollection: Collection;
connectToDatabase()
  .then((movies) => {
    moviesCollection = movies;
    //Text Index Init
    //this process should be done in the initial setup,
    //but since the database is read-only, i only had to it once
    // moviesCollection.createIndex({ primaryTitle: "text" }).then(() => {
    //   console.log("indexing finished");
    // });
  })

  .catch((err) => {
    console.log("connection error");
    console.log(err);
  });
//*********************************************
//Express init
//*********************************************
const port = process.env.PORT || 5000;
const app = express();
const whiteList = [
  "http://localhost:5173",
  "https://imdb-fullstack-app.netlify.app",
];
app.use(cors({ origin: whiteList }));
app.use(express.json());
app.use(express.urlencoded());

//*****************************************************************************************
//********************************** Middleware  ******************************************
//*****************************************************************************************
const validatePosters = (req: Request, res: Response, next: NextFunction) => {
  const data: any = req.body;

  // Check if the data is an object
  if (typeof data !== "object" || Array.isArray(data)) {
    throw new ExpressError("Invalid data format", 400);
  }

  // Check each key-value pair in the data object
  for (const key in data) {
    const posterObject = data[key];

    // Validate the movie object structure
    if (
      typeof posterObject !== "object" ||
      Array.isArray(posterObject) ||
      typeof posterObject.mongoId !== "string" ||
      typeof posterObject.posterURL !== "string"
    ) {
      throw new ExpressError("Invalid poster data", 400);
    }
  }
  // Data is valid, proceed to the next middleware or route handler
  next();
};

//****************************************************************************************
//****************************************************************************************
// Routing
//                 Route                                                       ---> Name
//-----------------------------------------------------------------------------------------
// GET /movies - List all movies with pagination,sorting and filtering         ---> Index
// PUT /movies/updatePosters - Update poster paths                             ---> Update

//*****************************************************************************************
import {
  convertToFilter,
  getPaginationProperties,
  getSortingProperties,
  getFilterByRuntimeAndRating,
} from "./utils/movieDataUtils";

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome");
});
// *************************************************************
// INDEX - list all movies with pagination,sorting and filtering
// *************************************************************
app.get(
  "/movies",
  catchAsync(async (_req: Request, res: Response) => {
    const queryObject = _req.query;

    //to do: process and runtime and rating from queryObject

    const { limit, page } = getPaginationProperties(queryObject);

    const mainFilter = convertToFilter(queryObject);
    const runtimeAndRatingFilter = getFilterByRuntimeAndRating(queryObject);
    const filter = { ...mainFilter, ...runtimeAndRatingFilter };

    const sort = getSortingProperties(queryObject);
    const skip = (page - 1) * limit;

    const cursor = moviesCollection
      .find(filter)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const result = (await cursor.toArray()) as Movie[];
    const previousPage = page === 1 ? null : page - 1;

    res.status(200).send({
      result,
      previousPage,
      currentPage: page,
      nextPage: page + 1,
      limit,
    });
  })
);

// *************************************************************
// UPDATE - Update poster paths
// *************************************************************
app.put(
  "/updatePosters",
  validatePosters,
  catchAsync(async (req: Request, res: Response) => {
    const data = req.body as PosterMap;
    // Update the documents based on the validated data
    const updateOperations: UpdateOperation[] = [];

    for (const key in data) {
      const posterObject = data[key];

      updateOperations.push({
        updateOne: {
          filter: { _id: new ObjectId(posterObject.mongoId) },
          update: { $set: { posterURL: posterObject.posterURL } },
        },
      });
    }
    const result = await moviesCollection.bulkWrite(updateOperations);

    res.status(200).send(result);
  })
);
// *************************************************************
// 404->route doesn't exist
// **************************************************************
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});
// ***********************************************************************
// ******************* ERROR HANDLING CHAIN ******************************
// ***********************************************************************
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json(message);
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${port}`);
});
