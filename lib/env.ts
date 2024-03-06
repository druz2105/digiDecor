// @ts-ignore
import { cleanEnv, email, num, str } from "envalid";

export default cleanEnv(process.env, {
  STAGE: str(),
  BUCKET_URL: str(),
  DB_NAME: str(),
  DB_USER: str(),
  DB_PASSWORD: str(),
  DB_HOST: str(),
  PORT: num(),
  TOKEN_KEY: str(),
  SENDGRID_KEY: str(),
  VERIFICATION_LINK: str(),
  SEND_EMAIL: email(),
  VERIFY_ACCOUNT_TEMPLATE: str(),
  RESET_PASSWORD_LINK: str(),
  RESET_PASSWORD_TEMPLATE: str(),
});
