import { app } from "@www/app";
import env from "../lib/env";
import { sequelize } from "../database/config";
import {syncModels} from "./custom.middelewares";
const start = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync();
    await syncModels();
    app.listen(env.PORT, () => {
      console.log(`Server tarted on port ${env.PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
