import jwt from "jsonwebtoken";
import UserService from "@users/userModels";
const userService = new UserService();

import { NextFunction, Request, Response } from "express";
import { UserModelInterface } from "../lib/interfaces/users/userModel";
import env from "../lib/env";
import * as console from "console";

function convertKeysToCamelCase(obj: Record<string, any>) {
  const newObj = {};

  for (let key in obj) {
    if (Object.keys(obj).includes(key)) {
      const camelCaseKey = key.replace(/[-_]+(.)?/g, (match, chr) => {
        console.log(match, "match>>>>>");
        return chr ? chr.toUpperCase() : "";
      });
      newObj[camelCaseKey] = obj[key];
    }
  }

  return newObj;
}

export const camelCaseParser = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // request.body.requestTime = new Date().toISOString();
  if (request.body) {
    request.body = convertKeysToCamelCase(request.body);
  }
  if (response.statusCode) {
    console.log("response");
  }
  next();
};

const verifyLastLogin = async (userId: string, lastLogin: number) => {
  const user: UserModelInterface | null | undefined =
    await userService.findById(userId);
  if (user && user.lastLogin) {
    const date = new Date(user.lastLogin);
    const epochTimeInMilliseconds = date.getTime();
    const epochTimeInSeconds = Math.floor(epochTimeInMilliseconds / 1000);
    return epochTimeInSeconds === lastLogin;
  } else {
    return false;
  }
};

export const verifyToken = async (
    request: any
) => {
  let token =
    request.body.token || request.query.token || request.headers.authorization;
  if (!token || !token.startsWith("JWT")) {
    return 403;
  }
  try {
    token = token.replace("JWT ", "");
    const decoded = jwt.verify(token, env.TOKEN_KEY) as Record<string, any>;
    if (!(await verifyLastLogin(decoded.user_id, decoded.lastLogin))) {
      return 401
    }
    request.user = await userService.findById(decoded.user_id);
    return 200
  } catch (err) {
    return 401
  }
};

export const jwtDecoder = async (
  request: any,
  response: any,
  next: NextFunction
) => {
   const statusCode = await verifyToken(request)
  if(statusCode === 403){
    return response
        .status(403)
        .json({ message: "A token is required for authentication" });
  }
  if(statusCode === 401){
    return response
        .status(401)
        .json({ message: "Invalid Token" });
  }
  next();
};

