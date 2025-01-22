
import { Application } from "express";
import { authRoutes } from "./routes/auth";
import { verifyGatewayRequest } from "@dhyaneshsiddhartha15/jobber-shared";
import { currentUserRoutes } from "./routes/current-user";
import { healthRoutes } from "@auth/routes/health";
import { searchRoutes } from "@auth//routes/search,";
import { seedRoutes } from "./routes/seed";
const BASE_PATH='/api/v1/auth'

export function appRoutes(app:Application):void{

  app.use('',healthRoutes());

  app.use(BASE_PATH ,verifyGatewayRequest,authRoutes());
  app.use(BASE_PATH ,verifyGatewayRequest,seedRoutes());
  app.use(BASE_PATH ,verifyGatewayRequest,searchRoutes());
  app.use(BASE_PATH ,verifyGatewayRequest,currentUserRoutes());
};