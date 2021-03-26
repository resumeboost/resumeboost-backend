import { Request, Response, NextFunction } from "express";
import { UserDocument } from "../models/User";

// export const requiresAdmin = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const user = req.user as UserDocument;
//   if (!user) {
//     return res.status(401).json("Error: unauthenticated user");
//   } else {
//     if (!user.type) {
//       if (user.type !== "Admin") {
//         return res
//           .status(403)
//           .json("Error: requires admin but only " + user.type);
//       }
//     } else {
//       return res
//         .status(403)
//         .json("Error: requires admin but only " + user.type);
//     }
//   }

//   next();
// };

// export const requiresStaff = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // check is user is valid
//   let correctUserType: boolean = req.user !== null;
//   const user = req.user as UserDocument;

//   if (correctUserType) {
//     correctUserType = user.type !== null;
//   } else {
//     return res.status(401).json("Error: unauthenticated user");
//   }

//   if (correctUserType) {
//     correctUserType = user.type === "Staff";
//   } else {
//     return res.status(403).json("Error: requires staff but " + user.type);
//   }

//   if (correctUserType) {
//     next();
//   } else {
//     return res.status(403).json("Error: requires staff but " + user.type);
//   }
// };
