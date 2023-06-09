"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Environment variables
require("dotenv").config();
//Custom Error
const ExpressError_1 = __importDefault(require("./utils/ExpressError"));
//wrapAsync
const catchAsync_1 = __importDefault(require("./utils/catchAsync"));
//Express
const express_1 = __importDefault(require("express"));
var cors = require("cors");
//Db connect interface
const database_service_1 = require("./services/database/database.service");
//*********************************************
//Database init
//*********************************************
let moviesCollection;
(0, database_service_1.connectToDatabase)()
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
const app = (0, express_1.default)();
const whiteList = [
    "http://localhost:5173",
    "https://imdb-fullstack-app.netlify.app",
];
app.use(cors({ origin: whiteList }));
app.use(express_1.default.urlencoded({ extended: true })); //to parse req.body
//*********************************************
//****************************************************************************
// Routing
//                 Route                                      ---> Name
//----------------------------------------------------------------------------
// GET /movies - List all movies with pagination              ---> Index
// GET /movies/:id - Get one movie (using ID)                 ---> Show
//*****************************************************************************
const movieDataUtils_1 = require("./utils/movieDataUtils");
app.get("/", (req, res) => {
    res.send("Welcome");
});
app.get("/movies", (0, catchAsync_1.default)(async (_req, res) => {
    const queryObject = _req.query;
    //to do: process and runtime and rating from queryObject
    const { limit, page } = (0, movieDataUtils_1.getPaginationProperties)(queryObject);
    const mainFilter = (0, movieDataUtils_1.convertToFilter)(queryObject);
    const runtimeAndRatingFilter = (0, movieDataUtils_1.getFilterByRuntimeAndRating)(queryObject);
    const filter = { ...mainFilter, ...runtimeAndRatingFilter };
    const sort = (0, movieDataUtils_1.getSortingProperties)(queryObject);
    const skip = (page - 1) * limit;
    const cursor = moviesCollection
        .find(filter)
        .sort(sort)
        .limit(limit)
        .skip(skip);
    const result = (await cursor.toArray());
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
}));
// *************************************************************
// 404->route doesn't exist
// **************************************************************
app.all("*", (req, res, next) => {
    next(new ExpressError_1.default("Page not found", 404));
});
// ***********************************************************************
// ******************* ERROR HANDLING CHAIN ******************************
// ***********************************************************************
app.use((err, _req, res, _next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).json(message);
});
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map