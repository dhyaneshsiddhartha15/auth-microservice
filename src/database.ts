import { winstonLogger } from "@dhyaneshsiddhartha15/jobber-shared";

import { Sequelize } from "sequelize";
import { Logger } from "winston";
import { config } from "./config";


const log:Logger=winstonLogger(`${config.ELASTIC_SEARCH_URL}`,'authDatabaseSerever','debug');
export const  sequelize:Sequelize=new Sequelize(process.env.MYSQL_DB!,{
    dialect:'mysql',
    logging:false,
    dialectOptions:{
        multipleStatements:true,
    }
})

export async function databaseConnection ():Promise<void>{
try{
await sequelize.authenticate();
log.info("Database connected Successfully");
}catch(error){
    log.error('AuthService - unable to connect');
    log.log('error','AuthService - unable to connect',error);
}
}