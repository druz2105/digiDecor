import Joi from "joi";
import {
    CreateUserInterface,
    LoginUserInterface,
    PasswordResetUser,
    UpdateUserInterface
} from "../interfaces/users/user-model-interface";

export const POSTUserRegister =Joi.object<CreateUserInterface>({
    email: Joi.string().email().required(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    password: Joi.string().required()
}).unknown(false);

export const POSTUserLogin =Joi.object<LoginUserInterface>({
    email: Joi.string().email().required(),
    password: Joi.string().required()
}).unknown(false);

export const PATCHUserUpdate = Joi.object<UpdateUserInterface>({
    email: Joi.string().email(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    active: Joi.boolean(),
}).unknown(false);

export const POSTUserPasswordReset =Joi.object<PasswordResetUser>({
    uniqueString: Joi.string().required(),
    password: Joi.string().required()
})