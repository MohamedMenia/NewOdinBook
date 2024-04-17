import { Schema } from "mongoose";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import UsersModel, { TUser, comparePassword } from "../models/usersModel";
import env from "../utils/validateEnv";
import CustomError from "../utils/customErorr";

const signToken = (res: Response, id: Schema.Types.ObjectId, next: NextFunction) => {
  try {
    const token = jwt.sign({ id }, env.JWT_KEY, {
      expiresIn: "30d",
    });

    res.cookie("JWT", `Bearer ${token}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser: TUser = await UsersModel.create(req.body);
    signToken(res, newUser.id, next);

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new CustomError("Please provide an email address", 400);
    }

    if (!password) {
      throw new CustomError("Please provide a password", 400);
    }

    const user = await UsersModel.findOne({ email });

    if (!user) {
      throw new CustomError("Invalid credentials", 401);
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      throw new CustomError("Invalid credentials", 401);
    }

    signToken(res, user.id, next);

    res.status(201).json({
      status: "success",
      message: "User logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies.JWT;

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1];
    } else {
      throw new CustomError("You are not logged in!", 401);
    }
    const decodedtoken = jwt.verify(token as string, env.JWT_KEY) as JwtPayload;
    const user = (await UsersModel.findById(decodedtoken.id)) as TUser;

    if (!user) {
      throw new CustomError("The user with the given ID does not exist", 404);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
