'use strict';
/**
 * This shows how to use standard Apollo client on Node.js
 */
/**
 * This shows how to use standard Apollo client on Node.js
 */

require('es6-promise').polyfill();
require('isomorphic-fetch');
const URL = require('url');
const AWS = require('aws-sdk');

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
// const API_KEY = process.env.API_KEY;
// "https://arpgjwxeknclllq7akimhnr2cm.appsync-api.us-west-2.amazonaws.com/graphql";
// const apiKey = "da2-fplx5k76ijchjbqdy5jhyeomsm";

console.log('Loading function');
exports.handler = (event, context, callback) => {
  let success = 0;
  let failure = 0;
  console.log("Event :%j", event);

  const output = event.records.map((record) => {
    /* Data is base64 encoded, so decode here */
    console.log("record :%j", record);
    const recordData = Buffer.from(record.data, 'base64');
    const jsonData = JSON.parse(recordData);
    console.log("data :%j", jsonData);

    let mutationData, data;

    mutationData = {
      id: jsonData.VIDEOID,
      recent_views: jsonData.VIEWS
    };
    data = {
      "variables": mutationData,
      "query": "mutation AddVideo($id: ID!, $recent_views: Int) { addVideo(id: $id, recent_views: $recent_views) { id recent_views total_views} }"
    };

    console.log("data :%j", data);
    // console.log("API Key :%s", API_KEY);

    // fetch(GRAPHQL_ENDPOINT, {
    //     method: 'POST',
    //     headers: {
    //       "Content-Type": "application/graphql",
    //       "X-Api-Key": API_KEY
    //     },
    //     body: JSON.stringify(data),
    //   })
    //   .then(res => res.json())
    //   .then(res => {
    //     console.log("data :%j", res);
    //   });

    const uri = URL.parse(GRAPHQL_ENDPOINT);
    console.log(uri.href);
    console.log("Region ",process.env.AWS_REGION);
    const httpRequest = new AWS.HttpRequest(uri.href, process.env.AWS_REGION);
    httpRequest.headers.host = uri.host;
    httpRequest.headers['Content-Type'] = 'application/json';
    httpRequest.method = 'POST';
    httpRequest.body = JSON.stringify(data);

    AWS.config.credentials.get(err => {
        const signer = new AWS.Signers.V4(httpRequest, "appsync", true);
        signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());

        const options = {
            method: httpRequest.method,
            body: httpRequest.body,
            headers: httpRequest.headers
        };

        fetch(uri.href, options)
            .then(res => res.json())
            .then(json => {
                console.log(`JSON Response = ${JSON.stringify(json, null, 2)}`);
                callback(null, event);
            })
            .catch(err => {
                console.error(`FETCH ERROR: ${JSON.stringify(err, null, 2)}`);
                callback(err);
            });
    });

    return {
      recordId: record.recordId,
      result: 'Ok',
    };
  });
  callback(null, {
    records: output,
  });
};
