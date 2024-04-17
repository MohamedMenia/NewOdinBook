import { Document, InferSchemaType, Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import isEmail from "validator/lib/isEmail";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: [isEmail, "invalid email"],
    },
    password: { type: String, required: [true, "Password is required"] },
    bio: { type: String },
    posts: [{ type: Schema.Types.ObjectId, ref: "Posts" }],
  },
  { timestamps: true }
);
export type TUser = Document & InferSchemaType<typeof userSchema>;
userSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
});

userSchema.pre<TUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  if (this.password && typeof this.password == "string")
    this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const comparePassword = async function (
  password: string,
  dpPassword: string
): Promise<Boolean> {
  return await bcrypt.compare(password, dpPassword);
};

const UsersModel = model("Users", userSchema);
export default UsersModel;
