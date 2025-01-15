import { getAuthUserById, getAuthUserByVerificationToken, updateVerifyEmailField } from "@auth/services/auth.service";
import { BadRequestError, IAuthDocument } from "@dhyaneshsiddhartha15/jobber-shared";
import { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";







export async function update(req: Request, res: Response): Promise<void> {
    const token: string | undefined = typeof req.body === 'string' ? req.body : undefined;
  
    if (!token) {
      res.status(400).json({ message: "Token is missing in the request body" });
      return;
    }
  
    const checkIfUserExist: IAuthDocument | undefined = await getAuthUserByVerificationToken(token);
  
    if (!checkIfUserExist) {
      throw new BadRequestError("Invalid token. Token not found", "Update user profile method error");
    }
  
    await updateVerifyEmailField(checkIfUserExist.id!, 1, '');
    const updatedUser = await getAuthUserById(checkIfUserExist.id!);
  
    res.status(StatusCodes.OK).json({
      message: "Email Verified Successfully",
      user: updatedUser,
    });
  
    console.log("Token from update", token);
  }
  
