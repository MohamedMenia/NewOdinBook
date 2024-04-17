import { NextFunction, Response, Request } from "express";
import PostsModel from "../models/postsModel";
import UsersModel from "../models/usersModel";
import CustomError from "../utils/customErorr";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const text = req.body.text;

    const post = await PostsModel.create({ authorId: userId, text });
    const user = await UsersModel.findByIdAndUpdate(
      userId,
      { $push: { posts: post.id } },
      { new: true, runValidators: true }
    );

    res.status(201).json({
      status: "success",
      data: {
        post,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.postId;
    const userId = req.user?.id;
    const commentText = req.body.text;

    const result = await PostsModel.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            authorId: userId,
            text: commentText,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!result) {
      throw new CustomError("Post not found", 404);
    }

    res.status(201).json({
      status: "success",
      data: {
        result,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.postId;
    const userId = req.user?.id;

    const isLiked = await PostsModel.exists({
      _id: postId,
      likes: userId,
    });

    const updateOperation = isLiked
      ? { $pull: { likes: userId } }
      : { $push: { likes: userId } };

    const result = await PostsModel.findByIdAndUpdate(postId, updateOperation, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


