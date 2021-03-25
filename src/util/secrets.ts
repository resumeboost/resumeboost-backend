import dotenv from "dotenv";
import fs from "fs";

import logger from "./logger";

if (fs.existsSync('.env')) {
  logger.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
} else {
  logger.debug(
    'Using .env.example file to supply config environment variables'
  );
  dotenv.config({ path: '.env.example' }); // you can delete this after you create your own .env file!
}

const getEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    logger.error(`${key} ENV variable not found`);
    process.exit(1);
  }

  return value;
};

export const ENVIRONMENT = getEnv('NODE_ENV');
const prod = ENVIRONMENT === 'production'; // Anything else is treated as 'dev'

export const SESSION_SECRET = getEnv('SESSION_SECRET');
export const MONGODB_URI = prod
  ? getEnv('MONGODB_URI')
  : getEnv('MONGODB_URI_LOCAL');

export const AWS_ID = getEnv('AWS_ID');
export const AWS_SECRET = getEnv('AWS_SECRET');
export const AWS_BUCKET_NAME = getEnv('AWS_BUCKET_NAME');
