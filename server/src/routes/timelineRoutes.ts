import { Router } from "express";
import * as timelineController from "../controllers/timelineController";
import {protect} from "../controllers/authController";


const postsRouter = Router();

postsRouter
  .route("/")
  .get(protect,timelineController.timeline);

  postsRouter
  .route("/search/:str")
  .get(protect,timelineController.search);

  postsRouter
  .route("/profile/:userId")
  .get(protect,timelineController.profile);
  postsRouter
  .route("/profile")
  .get(protect,timelineController.profile);


export default postsRouter;