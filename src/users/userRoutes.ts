import {
  createUser,
  deleteUser,
  forgotPassword,
  getUser,
  loginUser,
  resetPassword,
  updateUser,
  verifyUserToken,
} from "./userAPIs";

import express from "express";

import {jwtDecoder} from "@www/custom.middelewares";

export const userRouter = express.Router();

userRouter.route("/verify").post(verifyUserToken);
userRouter.route("/register").post(createUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/forgotPassword").post(forgotPassword);
userRouter.route("/resetPassword").post(resetPassword);

// Requires Authentication
userRouter.use(jwtDecoder);
userRouter.route("/").get(getUser).patch(updateUser).delete(deleteUser);
