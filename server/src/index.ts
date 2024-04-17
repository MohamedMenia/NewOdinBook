import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import env from "./utils/validateEnv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes";
import timelineRouter from "./routes/timelineRoutes";

import postsRouter from "./routes/postsRoutes";
import custoumErorr from "./utils/customErorr";
import errorHandler from "./utils/errorHandeller";
import friendsRequestsRouter from "./routes/friendRequestsRoutes";
const app = express();
const port = env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/", timelineRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/requests", friendsRequestsRouter);

app.use((req, res, next) => {
  next(new custoumErorr("Endpoint not found", 404));
});
app.use(errorHandler);

mongoose
  .connect(env.MONGO_CONN)
  .then(() => {
    console.log("Mongoose Connected");
    app.listen(port, () => {
      console.log("server running on port :" + port);
    });
  })
  .catch(console.error);
