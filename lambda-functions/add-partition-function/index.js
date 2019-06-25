const AWS = require('aws-sdk');

const athena = new AWS.Athena({
  version: '2017-05-18',
});

const ATHENA_RESULT_BUCKET = process.env.ATHENA_RESULT_BUCKET;
const PLAYER_LOGS_BUCKET = process.env.PLAYER_LOGS_BUCKET;
const PLAYER_LOGS_TABLE = process.env.PLAYER_LOGS_TABLE;
const CDN_LOGS_TABLE = process.env.CDN_LOGS_TABLE;
const ETL_PLAYER_LOGS_TABLE = process.env.ETL_PLAYER_LOGS_TABLE;

exports.handler = async (event, context) => {

  console.log("In add_partition_function.handler :%j",event);
  const date = new Date()
    .toISOString()
    .split('T');
  let yyyymmdd = date[0].split('-');
  let year =  yyyymmdd[0];
  let month = yyyymmdd[1];
  let day = yyyymmdd[2];

  let hhmmss = date[1].split(':');

  let hour = hhmmss[0];

  console.log("Date :%j",new Date()
    .toISOString());

  //create the hourly partition
  await createPlayerLogsPartition(year,month,day,hour);
  await createCDNLogsPartition(year,month,day,hour);
  await createETLJobPartition();
};

async function createPlayerLogsPartition(year, month, day, hour) {

  let {
    QueryExecutionId
  } = await runQuery({
    QueryString: `ALTER TABLE ${PLAYER_LOGS_TABLE}
    ADD IF NOT EXISTS PARTITION (year=${year},month=${month},day=${day},hour=${hour})
    location 's3://${PLAYER_LOGS_BUCKET}/player_logs/${year}/${month}/${day}/${hour}'`,
    UniqueRequestId: `add-playerlogs-partitioning-${year}-${month}-${day}-${hour}-${new Date()}`,
  });
  for (let attempt = 0; attempt < 10; attempt++) {
    let result = await getQueryExecution(QueryExecutionId);
    let state = result.QueryExecution.Status.State;
    console.log("PlayerLogs.Execution status ",state);

    switch (state) {
      case 'RUNNING':
      case 'QUEUED':
        console.log(
          'query is queued or running, retrying in ',
          Math.pow(2, attempt + 1) * 100,
          'ms',
        );
        await delay(Math.pow(2, attempt + 1) * 100);
        break;
      case 'SUCCEEDED':
        return true;
      case 'FAILED':
        console.log('query failed');
        throw new Error(result.QueryExecution.Status.StateChangeReason);
      case 'CANCELLED':
        console.log('query is cancelled');
        return;
    }
  }
}

async function createCDNLogsPartition(year, month, day, hour) {

  let {
    QueryExecutionId
  } = await runQuery({
    QueryString: `ALTER TABLE ${CDN_LOGS_TABLE}
    ADD IF NOT EXISTS PARTITION (year=${year},month=${month},day=${day},hour=${hour})
    location 's3://${PLAYER_LOGS_BUCKET}/cdn_logs/${year}/${month}/${day}/${hour}'`,
    UniqueRequestId: `add-cdnlogs-partitioning-${year}-${month}-${day}-${hour}-${new Date()}`,
  });
  for (let attempt = 0; attempt < 10; attempt++) {
    let result = await getQueryExecution(QueryExecutionId);
    let state = result.QueryExecution.Status.State;
    console.log("CDNLogs.Execution status ",state);
    switch (state) {
      case 'RUNNING':
      case 'QUEUED':
        console.log(
          'query is queued or running, retrying in ',
          Math.pow(2, attempt + 1) * 100,
          'ms',
        );
        await delay(Math.pow(2, attempt + 1) * 100);
        break;
      case 'SUCCEEDED':
        return true;
      case 'FAILED':
        console.log('query failed');
        throw new Error(result.QueryExecution.Status.StateChangeReason);
      case 'CANCELLED':
        console.log('query is cancelled');
        return;
    }
  }
}

async function createETLJobPartition() {

  let {
    QueryExecutionId
  } = await runQuery({
    QueryString: `MSCK REPAIR TABLE ${ETL_PLAYER_LOGS_TABLE}`,
  });
  for (let attempt = 0; attempt < 10; attempt++) {
    let result = await getQueryExecution(QueryExecutionId);
    let state = result.QueryExecution.Status.State;
    console.log("CDNLogs.Execution status ",state);
    switch (state) {
      case 'RUNNING':
      case 'QUEUED':
        console.log(
          'query is queued or running, retrying in ',
          Math.pow(2, attempt + 1) * 100,
          'ms',
        );
        await delay(Math.pow(2, attempt + 1) * 100);
        break;
      case 'SUCCEEDED':
        return true;
      case 'FAILED':
        console.log('query failed');
        throw new Error(result.QueryExecution.Status.StateChangeReason);
      case 'CANCELLED':
        console.log('query is cancelled');
        return;
    }
  }
}

async function runQuery({ QueryString, UniqueRequestId }) {
  console.log('running query', QueryString);
  const params = {
    QueryString,
    ResultConfiguration: {
      OutputLocation: `s3://${ATHENA_RESULT_BUCKET}/athena_logs/`,
    },
    ClientRequestToken: UniqueRequestId,
  };
  return await athena.startQueryExecution(params).promise();
}

async function getQueryExecution(QueryExecutionId) {
  const params = {
    QueryExecutionId,
  };
  return await athena.getQueryExecution(params).promise();
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
