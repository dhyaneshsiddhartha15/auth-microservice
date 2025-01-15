import { Request, Response } from 'express';
import { AuthModel } from "@auth/modals/auth.schema";
import { loginSchema } from "@auth/schemas/signin";
import { getUserByEmail, getUserByUsername, signToken } from "@auth/services/auth.service";
import { BadRequestError, IAuthDocument, isEmail } from "@dhyaneshsiddhartha15/jobber-shared";
import { StatusCodes } from "http-status-codes";
import { omit } from "lodash";

interface LoginRequestBody {
  username: string;
  password: string;
}

interface CustomResponse extends Response {
  status(code: number): this;
  json(data: any): this;
}

export async function read(
  req: Request<{}, {}, LoginRequestBody>, 
  res: CustomResponse
): Promise<void> {
  const { error } = await Promise.resolve(loginSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'SignIn read() method error');
  }

  const { username, password } = req.body;
  const isValidEmail: boolean = isEmail(username);
  const existingUser: IAuthDocument | undefined = !isValidEmail 
    ? await getUserByUsername(username) 
    : await getUserByEmail(username);

  if (!existingUser) {
    throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
  }

  const passwordsMatch: boolean = await AuthModel.prototype.comparePassword(
    password, 
    `${existingUser.password}`
  );

  if (!passwordsMatch) {
    throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
  }

  const userJWT: string = signToken(
    existingUser.id!, 
    existingUser.email!, 
    existingUser.username!
  );

  const userData = omit(existingUser, ['password']);

  res.status(StatusCodes.OK).json({
    message: 'User login Successfully',
    user: userData,
    token: userJWT
  });
}