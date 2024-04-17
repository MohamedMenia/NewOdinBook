import { NextFunction, Response, Request } from "express";
import CustomError from "../utils/customErorr";
import { CastError, ErrorHandlingMiddlewareFunction } from "mongoose";
import  env  from "../utils/validateEnv";


const devErrors = (res: Response, error: CustomError) => {
  res.status(error.statusCode).json({
    message: error.message,
    status: error.status,
    stackTrace: error.stack,
    error: error,
  });
};

const prodErrors = (res: Response, error: CustomError) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "something went wrong ! Please try again later",
    });
  }
};

const castErrorHandler = (err: Error) => {
  const msg = `Invalid value for ${err.path}: ${err.value}!`;
  return new CustomError(msg, 400);
};

const dubKeyErrorHandler = (err: Error) => {
  const msg = `This Email already used`;
  return new CustomError(msg, 400);
};

const validationErrorHandler = (err: Error) => {
  const errors = err.errors
    ? Object.values(err.errors).map((val) => val.message)
    : [];
  const errorMessages = errors.join(` ,`);
  const msg = `${errorMessages}`;
  return new CustomError(msg, 400);
};
const jwtExpiredErrorHandler = () => {
  return new CustomError("JWT has expird. please login again", 401);
};
const jwtErrorHandler = () => {
  return new CustomError("Invalid token. please login again", 401);
};

const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let finalErr: CustomError = new CustomError("", 0);
  finalErr.statusCode = error.statusCode || 500;
  finalErr.message=error.message 
  if (env.NODE_ENV === "development") {
    devErrors(res, finalErr);
  } else {
    if (error.code === 11000) finalErr = dubKeyErrorHandler(error);
    if (error.name === "CastError") finalErr = castErrorHandler(error);
    if (error.name === "ValidationError")
      finalErr = validationErrorHandler(error);
    if (error.name === "TokenExpiredError") finalErr = jwtExpiredErrorHandler();
    if (error.name === "JsonWebTokenError") finalErr = jwtErrorHandler();

    prodErrors(res, finalErr);
  }
};

export default errorHandler