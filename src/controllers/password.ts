import { changePasswordSchema, emailSchema, passwordSchema } from "@auth/schemas/password";
import { getAuthUserByPasswordToken, getUserByEmail, getUserByUsername, updatePassword, updatePasswordToken } from "@auth/services/auth.service";
import { BadRequestError, IAuthDocument, IEmailMessageDetails } from "@dhyaneshsiddhartha15/jobber-shared";
import { Request, Response } from "express";
import crypto from 'crypto';
import { config } from '@auth/config';
import { publishDirectMessage } from "@auth/queues/auth.producer";
import { authChannel } from "@auth/server";
import { StatusCodes } from "http-status-codes";

import { AuthModel } from "@auth/modals/auth.schema";

export async function forgotPassword(req: Request, res: Response): Promise<void> {
    const { error } = await Promise.resolve(emailSchema.validate(req.body));
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'Password forgotPassword() method error');
    }
    const { email } = req.body;
    const existingUser: IAuthDocument | undefined = await getUserByEmail(email);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials', 'Password forgotPassword() method error');
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const date: Date = new Date();
    date.setHours(date.getHours() + 1);
    await updatePasswordToken(existingUser.id!, randomCharacters, date);
    const resetLink = `${config.CLIENT_URL}/reset_password?token=${randomCharacters}`;
    const messageDetails: IEmailMessageDetails = {
      receiverEmail: existingUser.email,
      resetLink,
      username: existingUser.username,
      template: 'forgotPassword'
    };
    await publishDirectMessage(
      authChannel,
      'jobber-email-notification',
      'auth-email',
      JSON.stringify(messageDetails),
      'Forgot password message sent to notification service.'
    );
    res.status(StatusCodes.OK).json({ message: 'Password reset email sent.' });
  }
   export async function resetPassword(req:Request) :Promise <void>{
    const {error}=await Promise.resolve(passwordSchema.validate(req.body));
    if(error?.details){
     throw new BadRequestError(error.details[0].message,'Password does not match');
    }
const {password,confirmPassword}=req.body;
const {token}=req.params;
console.log("Token is",token);

if(password!==confirmPassword){
    throw new BadRequestError('Passwords do not match','Password does not match');
}
const existingUser:IAuthDocument |undefined=await getAuthUserByPasswordToken(token);
console.log("Exisitng User from user: " + existingUser);
if(!existingUser){
        throw new BadRequestError(
            'Invalid token or expired token','Password reset failed'
        )
}
const hashedPassword :string =await AuthModel.prototype.hashPassword(password);
await updatePassword(existingUser.id!,hashedPassword); 
const messageDetails:IEmailMessageDetails={
    receiverEmail:existingUser.email,
    resetLink:'',
    username:existingUser.username,
   };
   await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Password reset success message sent to notification service.'
   )
}
export async function changePassword(req: Request, res: Response): Promise<void> {
    const { error } = await Promise.resolve(changePasswordSchema.validate(req.body));
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'Password changePassword() method error');
    }
    const { newPassword } = req.body;
  
    const existingUser: IAuthDocument | undefined = await getUserByUsername(`${req.currentUser?.username}`);
    if (!existingUser) {
      throw new BadRequestError('Invalid password', 'Password changePassword() method error');
    }
    const hashedPassword: string = await AuthModel.prototype.hashPassword(newPassword);
    await updatePassword(existingUser.id!, hashedPassword);
    const messageDetails: IEmailMessageDetails = {
      username: existingUser.username,
      template: 'resetPasswordSuccess'
    };
    await publishDirectMessage(
      authChannel,
      'jobber-email-notification',
      'auth-email',
      JSON.stringify(messageDetails),
      'Password change success message sent to notification service.'
    );
    res.status(StatusCodes.OK).json({ message: 'Password successfully updated.' });
  }