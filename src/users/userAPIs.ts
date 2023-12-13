import UserService from "./userModels";

import url from "url";
import fs from "fs";
import jwt, {JwtPayload} from "jsonwebtoken";
import env from "../../lib/env";
import {PATCHUserUpdate, POSTUserLogin, POSTUserPasswordReset, POSTUserRegister} from "../../lib/schema/userAPISchemas";
import {
  CreateUserInterface,
  LoginUserInterface,
  PasswordResetUser,
  UpdateUserInterface
} from "../../lib/interfaces/users/userModel";
import {verifyToken} from "@www/custom.middelewares";

const userService = new UserService();

export const createUser = async (request, response) => {
  try {
    let payload;
    if (typeof request.body === "string") {
      payload = JSON.parse(request.body);
    } else {
      payload = request.body as unknown as CreateUserInterface
    }
    const validate = POSTUserRegister.validate(payload);
    if (validate.error) {
      const error = new Error(
          `Validation Error : ${validate.error.details[0].message}`
      ) as any;
      error.errorCode = "generalError"
      throw error
    }
    const newUser = await userService.createUser(payload);
    userService.sendVerificationEmail(newUser);
    const {
      email,
      firstName,
      lastName,
      createdAt,
      active,
      _id,
    } = newUser;
    const data = {
      email,
      firstName,
      lastName,
      createdAt,
      active,
      _id,
    };
    return response.status(201).json(data);
  } catch (err) {
    return response.status(400).json({ status: "Failed", errorCode: err.errCode, message: err.message });
  }
};

export const verifyUser = async (request, response) => {
  const parsedUrl = url.parse(request.url);
  const slug = parsedUrl.pathname?.split("/").pop();
  if (!slug) {
    return response.status(400).send("User verification failed");
  }
  const user = await userService.findAndUpdateUserData(slug, { active: true });
  if (user && user.active) {
    fs.readFile("./templates/user-verified.html", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return response.status(500).send("Internal Server Error");
      } else {
        return response.status(200).send(data);
      }
    });
  } else {
    return response.status(400).send("User verification failed");
  }
};

export const loginUser = async (request, response) => {
  try {
    let payload: LoginUserInterface;
    if (typeof request.body === "string") {
      payload = JSON.parse(request.body);
    } else {
      payload = request.body as unknown as LoginUserInterface
    }
    const validate = POSTUserLogin.validate(payload);
    if (validate.error) {
      const error = new Error(
          `Validation Error : ${validate.error.details[0].message}`
      ) as any;
      error.errorCode = "generalError"
      throw error
    }

    const user = await userService.loginUser(payload);
    const {
      email,
      firstName,
      lastName,
      createdAt,
      active,
      _id,
      jwtToken,
    } = user;
    const data = {
      email,
      firstName,
      lastName,
      createdAt,
      active,
      _id,
      jwtToken,
    };
    return response.status(200).json(data);
  } catch (err) {
    console.log(err);
    return response.status(400).json({ status: "Failed", errorCode: err.errCode, message: err.message });
  }
};

export const forgotPassword = async (request, response) => {
  try {
    const user = await userService.findByEmail(request.body.email);
    if (user === null) {
      return response
        .status(400)
        .json({ status: "Failed", data: "User with this email not found!" });
    }
    userService.sendResetPasswordEmail(user);
    return response
      .status(200)
      .json({ status: "Success", message: "Email Sent!" });
  } catch (err) {
    console.log(err);
    return response.status(400).json({ status: "Failed", message: err.message });
  }
};

export const resetPassword = async (request, response) => {
  try {
    let payload: PasswordResetUser;
    if (typeof request.body === "string") {
      payload = JSON.parse(request.body);
    } else {
      payload = request.body as unknown as PasswordResetUser
    }
    const validate = POSTUserPasswordReset.validate(payload);
    if (validate.error) {
      const error = new Error(
          `Validation Error : ${validate.error.details[0].message}`
      ) as any;
      error.errorCode = "generalError"
      throw error
    }
    const decoded = jwt.verify(
      payload.uniqueString,
      env.TOKEN_KEY
    ) as JwtPayload;
    await userService.findAndUpdatePassword(
      decoded.user_id,
        payload.password
    );
    return response
      .status(200)
      .json({ status: "Success", message: "Password Changed" });
  } catch (err) {
    console.log(err);
    return response.status(400).json({ status: "Failed", message: err.message });
  }
};

export const getUser = async (request, response) => {
  try {
    const user = await userService.getById(request.user._id);
    if (user === null) {
      return response
        .status(404)
        .json({ status: "Failed", message: "data not found!" });
    }
    const {
      email,
      firstName: firstName,
      lastName: lastName,
      createdAt,
      active,
      _id,
    } = user;
    const data = {
      email,
      firstName,
      lastName,
      createdAt,
      active,
      _id,
    };
    return response.status(200).json(data);
  } catch (err) {
    return response.status(400).json({ status: "Failed", message: err.me });
  }
};
export const updateUser = async (request, response) => {
  try {
    let payload: UpdateUserInterface;
    if (typeof request.body === "string") {
      payload = JSON.parse(request.body);
    } else {
      payload = request.body as unknown as UpdateUserInterface
    }
    const validate = PATCHUserUpdate.validate(payload);
    if (validate.error) {
      const error = new Error(
          `Validation Error : ${validate.error.details[0].message}`
      ) as any;
      error.errorCode = "generalError"
      throw error
    }
    const updatedUser = await userService.findAndUpdateUserData(
      request.user._id,
      payload
    );
    if (updatedUser === null) {
      return response
        .status(404)
        .json({ status: "Failed", message: "data not found!" });
    }
    const {
      email,
      firstName,
      lastName,
      createdAt,
      active,
      _id,
    } = updatedUser;
    const data = {
      email,
      firstName,
      lastName,
      createdAt,
      active,
      _id,
    };
    return response.status(200).json(data);
  } catch (err) {
    return response.status(400).json({ status: "Failed", message: err.message });
  }
};
export const deleteUser = async (request, response) => {
  try {
    const deleteUser = await userService.findAndDelete(request.user._id);
    if (deleteUser === null) {
      return response
        .status(404)
        .json({ status: "Failed", message: "data not found!" });
    }
    return response.status(204).json();
  } catch (err) {
    return response.status(400).json({ status: "Failed", message: err.message });
  }
};

export const verifyUserToken = async (request, response) => {
  try {
    await verifyToken(request);
    if (request.user) {
      return response.status(200).json({message: "User Verified!"});
    }
    return response
          .status(404)
          .json({ status: "Failed", message: "Failed to verify" });
  } catch (err) {
    return response.status(400).json({ status: "Failed", message: err.message });
  }
};