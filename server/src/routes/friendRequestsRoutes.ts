import { Router } from "express";
import * as friendsRequestsController from "../controllers/friendsRequestsController";
import * as timelineController from "../controllers/timelineController";

import { protect } from "../controllers/authController";

const friendsRequestsRouter = Router();
friendsRequestsRouter
  .route("/:receiverId/friendRequest")
  .post(protect, friendsRequestsController.sendFriendReq);
friendsRequestsRouter
  .route("/friendRequest/:friendRequestId")
  .patch(protect, friendsRequestsController.acceptFriendReq)
  .delete(protect, friendsRequestsController.deleteFriendReq);

export default friendsRequestsRouter;
