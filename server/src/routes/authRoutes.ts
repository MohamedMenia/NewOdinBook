import { Router } from "express";
import * as authContoller from "../controllers/authController";

const authRouter = Router();

authRouter
  .route("/")
  .post(authContoller.signup )

  authRouter
  .route("/login")
  .post(authContoller.login)


export default authRouter;