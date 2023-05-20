import { NextFunction, Request, Response } from "express";

function catchAsync(fn:Function){
    return function(req:Request,res:Response,next:NextFunction){
        fn(req,res,next).catch(next); //se llama a next cuando la promesa es rechazada
    }
}

export default catchAsync;