import env from "../../lib/env";

export const getFileURL = (path: string) => {
  return `${env.BUCKET_URL}/${path}`;
};
