import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, GetResponse} from '@elastic/elasticsearch/lib/api/types';
import { config } from '@auth/config';
import { winstonLogger } from "@dhyaneshsiddhartha15/jobber-shared";
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

async function checkConnection(): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    log.info('AuthService connecting to ElasticSearch...');
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`AuthService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retrying...');
      log.log('error', 'AuthService checkConnection() method:', error);
    }
  }
}
async function checkIfIndexExist(indexName:string):Promise <boolean>{
  const result:boolean =await elasticSearchClient.indices.exists({index:indexName});
  return result;
}
async function createIndex(indexName:string):Promise <void>{
  try{
const result:boolean=await checkIfIndexExist(indexName);
if(result){
  log.info(`Index ${indexName} already exists`);
}
else{
  await elasticSearchClient.indices.create({index:indexName});
  await elasticSearchClient.indices.refresh({index:indexName});

  log.info(`Index ${indexName} created successfully`);
  }
  }catch(error){
log.error(`An error occurred while creating index ${indexName}`);
log.log('error', 'AuthService checkConnection() method:', error);
  }
}

async function getDocumentById(index:string,gigId:string){
  try{
const result:GetResponse=await elasticSearchClient.get({
  index,
  id:gigId
});
return result._source;
  }catch(error){
log.log('error', 'AuthService checkConnection() method:', error);
  }
}

export { elasticSearchClient, checkConnection,createIndex,getDocumentById};