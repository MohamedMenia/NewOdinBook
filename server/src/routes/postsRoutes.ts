import { Router } from "express";
import * as postsController from "../controllers/postsController";
import {protect} from "../controllers/authController";


const postsRouter = Router();

postsRouter
  .route("/")
  .post(protect,postsController.createPost);

  postsRouter
  .route("/:postId/comments")
  .post(protect,postsController.addComment)

  postsRouter
  .route("/:postId/likes")
  .post(protect,postsController.toggleLike)

export default postsRouter;