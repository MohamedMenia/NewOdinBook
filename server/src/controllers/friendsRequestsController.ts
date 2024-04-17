import { NextFunction, Response, Request } from "express";
import UsersModel from "../models/usersModel";
import CustomError from "../utils/customErorr";
import FriendRequestsModel from "../models/friendRequests";

export const sendFriendReq = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const receiverId = req.params.receiverId;
    if (receiverId === userId) {
      throw new CustomError("you can't send friend request to yourself", 400);
    }

    const receiverExists = await UsersModel.exists({
      _id: receiverId,
    });

    if (!receiverExists) throw new CustomError("User Not Found", 404);

    await FriendRequestsModel.create({
      sender: userId,
      recipient: receiverId,
      status: "pending",
    });
    res.status(201).json({
      status: "success",
      message: "Friend request sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFriendReq = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const friendRequestId = req.params.friendRequestId;
    const friendRequest = await FriendRequestsModel.findById(friendRequestId);
    if (friendRequest?.sender !== req.user?.id && friendRequest?.recipient !== req.user?.id) {
      throw new CustomError("Unauthorized", 401);
    }

    const deletionResult = await FriendRequestsModel.findByIdAndDelete(friendRequestId);

    if (!deletionResult) {
      throw new CustomError("Friend request not found", 404);
    }

    res.status(204).json({
      status: "success",
      message: "Friend request deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
export const acceptFriendReq = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const friendRequestId = req.params.friendRequestId;
    const friendRequest = await FriendRequestsModel.findById(friendRequestId);

    if (friendRequest?.recipient != req.user?.id) {
      throw new CustomError("Unauthorized", 401);
    }

    const updateResult = await FriendRequestsModel.findByIdAndUpdate(
      friendRequestId,
      { status: "friends" },
      { new: true, runValidators: true }
    );

    if (!updateResult) {
      throw new CustomError("Friend request not found", 404);
    }

    res.status(200).json({
      status: "success",
      message: "Friend request accepted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
