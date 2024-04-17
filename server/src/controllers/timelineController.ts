import { Request, Response, NextFunction } from "express";
import UsersModel from "../models/usersModel";
import PostsModel from "../models/postsModel";
import { Types } from "mongoose";
import FriendRequestsModel, { TFriendRequests } from "../models/friendRequests";

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchStr = req.params.str;
    const result = await UsersModel.find({ $text: { $search: searchStr } });

    res.status(200).json({
      status: "success",
      data: {
        result,
      },
    });
  } catch (error) {
    next(error);
  }
};
interface IuniqueAuthorsIds {
  id: null;
  uniqueAuthors: Types.ObjectId[];
}

const fetchPosts = async (
  matchQuery: Types.ObjectId[],
  lastSeenCreatedAt: string | globalThis.Date
) => {
  const uniqueAuthorsIds: IuniqueAuthorsIds = await PostsModel.aggregate([
    {
      $match: {
        authorId: { $in: matchQuery },
        createdAt: { $lt: lastSeenCreatedAt },
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: 8 },
    {
      $project: {
        authorId: 1,
        combinedArray: { $setUnion: ["$comments.authorId", "$likes"] },
      },
    },
    { $unwind: "$combinedArray" },
    {
      $group: {
        _id: null,
        authorId: { $addToSet: "$authorId" },
        combinedArray: { $addToSet: "$combinedArray" },
      },
    },
    {
      $project: {
        uniqueAuthors: { $setUnion: ["$authorId", "$combinedArray"] },
      },
    },
  ]).then(([result]) => result);
  const [uniqueAuthorsData, posts] = await Promise.all([
    UsersModel.find({ _id: { $in: uniqueAuthorsIds.uniqueAuthors } }).select("-password"),
    PostsModel.aggregate([
      {
        $match: {
          authorId: { $in: matchQuery },
          createdAt: { $lt: lastSeenCreatedAt },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
    ]),
  ]);
  return [uniqueAuthorsData, posts];
};
export const profile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userId = req.params.userId || req.user?.id;
    userId = new Types.ObjectId(userId);
    const lastSeenCreatedAt = req.params.lastSeenCreatedAt || new Date();
    const [user, [uniqueAuthorsData, posts]] = await Promise.all([
      await UsersModel.findById(userId).select("-password"),
      await fetchPosts([userId], lastSeenCreatedAt),
    ]);
    res.status(200).json({
      status: "success",
      data: {
        user,
        uniqueAuthorsData,
        posts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const timeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const lastSeenCreatedAt = req.params.lastSeenCreatedAt || new Date();

    const autherIds = await FriendRequestsModel.find({
      $or: [
        { sender: userId, status: "friends" },
        { recipient: userId, status: "friends" },
      ],
    }).then((requests: TFriendRequests[]) =>
      requests.map((request) =>
        request.sender?.toString() === userId
          ? new Types.ObjectId(request.recipient as Types.ObjectId)
          : new Types.ObjectId(request.sender as Types.ObjectId)
      )
    );
    const [uniqueAuthorsData, posts] = await fetchPosts(autherIds as [], lastSeenCreatedAt);
    res.status(200).json({
      status: "success",
      data: {
        uniqueAuthorsData,
        posts,
      },
    });
  } catch (error) {
    next(error);
  }
};
