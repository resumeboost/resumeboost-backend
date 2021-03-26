import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { uploadToS3 } from "./api";

export const postImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];
  const filename = uuidv4() + "." + fileType;

  try {
    const imgUrl = await uploadToS3(req, filename);
    return res.status(200).json("url: " + imgUrl);
  } catch (err) {
    return res.status(400).json("Error: " + err);
  }
};
