import Joi from "joi";
import {
    CreateUserInterface,
    LoginUserInterface,
    PasswordResetUser,
    UpdateUserInterface
} from "../interfaces/users/userModel";

export const POSTUserRegister =Joi.object<CreateUserInterface>({
    email: Joi.string().email().required(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    password: Joi.string().required()
})

export const POSTUserLogin =Joi.object<LoginUserInterface>({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

export const PATCHUserUpdate = Joi.object<UpdateUserInterface>({
    email: Joi.string().email(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    active: Joi.boolean(),
})

export const POSTUserPasswordReset =Joi.object<PasswordResetUser>({
    uniqueString: Joi.string().required(),
    password: Joi.string().required()
})