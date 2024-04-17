import { InferSchemaType, Schema, model, Document } from "mongoose";

const friendRequestsSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: "Users",
    },
    recipient: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: "Users",
    },
    status: { type: String, enum: ["pending", "friends"] },
  },
  { timestamps: true }
);

export type TFriendRequests = InferSchemaType<typeof friendRequestsSchema> & Document;

const FriendRequestsModel = model<TFriendRequests>("FriendRequests", friendRequestsSchema);

export default FriendRequestsModel;
