import S3 from "aws-sdk/clients/s3";
import { Request } from "express";
import { AWS_BUCKET_NAME, AWS_ID, AWS_SECRET } from "../util/secrets";

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

export const downloadFromS3 = async (req: Request, filename: string) => {
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
