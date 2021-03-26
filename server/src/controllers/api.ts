import { Response, Request, NextFunction } from "express";
import { AWS_BUCKET_NAME, AWS_ID, AWS_SECRET } from "../util/secrets";
import S3 from "aws-sdk/clients/s3";
import { v4 as uuidv4 } from "uuid";
import FormData from "form-data";
import axios from "axios";
import * as fs from "fs";
import * as util from "util";

const s3 = new S3({
  accessKeyId: AWS_ID,
  secretAccessKey: AWS_SECRET,
});

// Uploads file from the request multipart form to S3 and returns a link to the image
export const uploadToS3 = async (req: Request, filename: string) => {
  const S3params = {
    ACL: "public-read",
    Bucket: AWS_BUCKET_NAME,
    Key: filename,
    Body: req.file.buffer,
  };

  return await s3
    .upload(S3params)
    .promise()
    .then((data) => data["Location"]);
};
