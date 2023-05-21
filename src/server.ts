//Environment variables
require("dotenv").config();
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
import { Collection } from "mongodb";
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
    //  console.log("indexing finished");
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
app.use(express.urlencoded({ extended: true })); //to parse req.body
var allowedOrigins = [
  "http://localhost:5173",
  "https://imdb-fullstack-app.netlify.app",
];
app.use(cors());
//*********************************************

//****************************************************************************
// Routing
//                 Route                                      ---> Name
//----------------------------------------------------------------------------
// GET /movies - List all movies with pagination              ---> Index
// GET /movies/:id - Get one movie (using ID)                 ---> Show

//*****************************************************************************
import {
  convertToFilter,
  getPaginationProperties,
  getSortingProperties,
  getFilterByRuntimeAndRating,
} from "./utils/movieDataUtils";
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome");
});
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

    //Finding one movie
    // const movie = (await moviesCollection.findOne({
    //   originalTitle: "Apocalypse Now",
    // })) as Movie;
    // console.log(movie);

    // res.status(200).send(movie);
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
