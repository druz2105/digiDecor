import { DataTypes, Optional } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import env from "../../lib/env";
import {
  CreateUserInterface,
  LoginUserInterface,
  UpdateUserInterface,
  UserModelInterface,
} from "../../lib/interfaces/users/user-model-interface";
import * as console from "console";
import { sequelize } from "../../database/config";

export const UserModel = sequelize.define<UserModelInterface>("User", {
  id: {
    type: DataTypes.INTEGER, // Adjust data types as needed
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  lastName: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  lastLogin: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
});

export class UserService {
  filterableFields = ["name", "email", "first_name", "last_name", "createdAt"];

  createUser = async (data: CreateUserInterface) => {
    data.email = data.email.toLowerCase();
    const oldUserEmail = await UserModel.findOne({
      where: { email: data.email },
    });

    if (oldUserEmail) {
      throw {
        message: "User with this Email Already Exist. Please Login",
        errCode: "emailError",
      };
    }
    data.password = this.createPassword(data.password);
    const userData = data as unknown as Optional<any, string>;
    return UserModel.create(userData);
  };

  createJWTToken = (data: UserModelInterface) => {
    let date = new Date();
    if (data.lastLogin) {
      date = new Date(data.lastLogin);
    }
    const epochTimeInMilliseconds = date.getTime();
    const epochTimeInSeconds = Math.floor(epochTimeInMilliseconds / 1000);
    return jwt.sign(
      { user_id: data.id, email: data.email, lastLogin: epochTimeInSeconds },
      env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
  };

  loginUser = async (data: LoginUserInterface) => {
    let user: UserModelInterface | null | undefined = undefined;
    if (data.email) {
      data.email = data.email.toLowerCase();
      user = (await UserModel.findOne({
        where: { email: data.email },
      })) as unknown as UserModelInterface;
    }
    if (!user) {
      throw {
        message: "User not found, make sure Email is correct",
      };
    } else {
      const checkValid = this.checkPassword(data.password, user.password);
      if (checkValid) {
        user.lastLogin = new Date().getTime();
        await user.save();
      } else {
        throw {
          message: "User not valid, make sure Email and Password is correct",
        };
      }
    }
    return user;
  };

  createPassword = (password: string) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  };

  checkPassword = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
  };

  sendVerificationEmail = async (user: UserModelInterface) => {
    try {
      const verificationLink = `${env.VERIFICATION_LINK}${user.id.toString()}`;
      const msg = {
        to: user.email,
        from: env.SEND_EMAIL,
        subject: "Verify User Account",
        templateId: env.VERIFY_ACCOUNT_TEMPLATE,
        dynamicTemplateData: {
          fullName: user.firstName,
          verificationLink: verificationLink,
        },
      };
      await sgMail.send(msg);
    } catch (err) {
      console.error(err);
    }
  };

  sendResetPasswordEmail = async (user: UserModelInterface) => {
    const jwtToken = jwt.sign(
      {
        user_id: user.id,
      },
      env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    const passwordResetLink = `${env.RESET_PASSWORD_LINK}${jwtToken}`;
    try {
      const msg = {
        to: user.email,
        from: env.SEND_EMAIL,
        subject: "Reset Password Account",
        templateId: env.RESET_PASSWORD_TEMPLATE,
        dynamicTemplateData: {
          passwordResetLink: passwordResetLink,
        },
      };
      await sgMail.send(msg);
    } catch (err) {
      console.log(err);
    }
  };

  filterUsers = async (data: UserModelInterface) => {
    const whereClause = {};
    for (const key in data) {
      if (this.filterableFields.includes(key)) {
        whereClause[key] = data[key]; // Build filter conditions
      }
    }

    let query = UserModel.findAll({ where: whereClause });

    return query;
  };

  findById = async (id: string) => {
    return UserModel.findByPk(id);
  };

  findByEmail = async (email: string) => {
    return UserModel.findOne({ where: { email: email } });
  };

  findAndUpdatePassword = async (id: string, password: string) => {
    const user = await UserModel.findByPk(id);
    if (!user) {
      throw { message: "User not found" };
    }
    user.password = this.createPassword(password);
    return user.save();
  };

  findAndUpdateUserData = async (id: string, data: UpdateUserInterface) => {
    const user = await UserModel.findByPk(id);

    if (!user) {
      throw { message: "User not found" };
    }

    if (data.email) {
      data.email = data.email.toLowerCase();
      const existingUser = await UserModel.findOne({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== user.id) {
        throw { message: "User with this Email Already Exist. Please Login" };
      }
    }

    await user.update(data); // Updates the user
    return user;
  };

  findAndDelete = async (id: string) => {
    const user = await UserModel.findByPk(id);

    if (!user) {
      throw { message: "User not found" };
    }

    return user.destroy();
  };
}
