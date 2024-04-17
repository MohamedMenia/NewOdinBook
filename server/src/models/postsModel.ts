import { InferSchemaType, Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: "Users",
    },
    text: { type: String, required: [true, "Please provide post text"] },
    comments: [
      new Schema(
        {
          text: { type: String, required: [true, "Please provide post comment text"] },
          authorId: {
            type: Schema.Types.ObjectId,
            ref: "Users",
          },
        },
        { timestamps: true }
      ),
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
export type TPost = Document & InferSchemaType<typeof postSchema>;

const PostsModel = model("Posts", postSchema);
export default PostsModel;
