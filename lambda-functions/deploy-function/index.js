'use strict';

const AWS = require("aws-sdk");
const S3 = new AWS.S3({
 signatureVersion: 'v4',
});

const path = require('path');
const AdmZip = require('adm-zip');
const mime = require('mime/lite');
const https = require("https");
const url = require("url");
const readline = require('readline');

const SourceBucket = process.env.SourceBucket;
const SourceFileBucket = process.env.SourceFileBucket;
const SourceUIFilePath = process.env.SourceUIFilePath;
const UIPrefix = process.env.UIPrefix;
const VideoAssetsPrefix = process.env.VideoAssetsPrefix;
const SourceVideoAssetsPrefix = process.env.SourceVideoAssetsPrefix;
const CloudFrontDomain = process.env.CloudFrontDomain;
const GlueJobDefinition = process.env.GlueJobDefinition;

exports.handler = function(event, context) {

 console.log("REQUEST RECEIVED: %j", event);
 console.log("Source bucket :%s", SourceBucket);

 // For Delete requests, immediately send a SUCCESS response.
 if (event.RequestType == "Delete") {
  sendResponse(event, context, "SUCCESS");
  return;
 }

 let responseStatus = "SUCCESS";
 let responseData = {};

 if (event.RequestType == "Create") {

  let jobs = Promise.all([uploadUIAssets(event),uploadVideoAssets(event),uploadGlueJobDefinition(event)]);
  // let jobs = Promise.all([uploadVideoAssets(event)]);

  jobs.then(args => {
   // console.log("Args 2 :%j",args[2]);
   // responseData.UserName = userName;
   // responseData.Password = temporaryPassword;
   sendResponse(event, context, responseStatus, responseData);
  });
 }
 else {
  sendResponse(event, context, responseStatus, responseData);
 }
};

//copy the sample video assets..
function uploadVideoAssets(event) {
 console.log("In uploadVideoAssets :%s", SourceVideoAssetsPrefix);

 let videoUrls = [];

 var lineReader = readline.createInterface({
   input: S3.getObject({ Bucket: SourceFileBucket, Key: SourceVideoAssetsPrefix+'/video-manifest.txt'}).createReadStream()
 });

 lineReader.on('line', function (line) {
   // console.log('Line from file:', line);
   let destKey = line.replace(SourceVideoAssetsPrefix,'');
  // console.log("Destination key ",destKey);

        var params = {
          Bucket: SourceBucket,
          CopySource: SourceFileBucket + '/' + line,
          Key: VideoAssetsPrefix + destKey
        };
        S3.copyObject(params, function(err, data) {
           if (err) console.log(err, err.stack); // an error occurred
           else{
             // console.log(data);
           }               // successful response

         });
 })
 .on('close', function() {
   console.log("Done uploading video assets");
   // return new Promise((resolve, reject) => { // (*)
   //     resolve('Done uploading video assets');
   //    });
 });
 //
 // return .promise()
 //  .then(data => {
 //    console.log("Data ",data.Body);
 //
 //   });

 // return S3.listObjects({ Bucket: SourceFileBucket, Prefix: SourceVideoAssetsPrefix }).promise()
 //  .then(data => {
 //    // console.log("Data :",data);
 //    data.Contents.forEach(function(asset){
 //      // console.log("Key :%s",asset.Key);
 //      let destKey = asset.Key.replace(SourceVideoAssetsPrefix,'');
 //      // console.log("Destination key ",destKey);
 //
 //      var params = {
 //        Bucket: SourceBucket,
 //        CopySource: SourceFileBucket + '/' + asset.Key,
 //        Key: VideoAssetsPrefix + destKey
 //      };
 //      S3.copyObject(params, function(err, data) {
 //         if (err) console.log(err, err.stack); // an error occurred
 //         else{
 //           console.log(data);
 //         }               // successful response
 //
 //       });
 //    });
 //    return new Promise((resolve, reject) => { // (*)
 //     resolve('Done uploading video assets');
 //    });
 //   });
}

//upload the UI assets. Also modifies the 'js/services/configService.js' file to
//configure the deployment specific resources
// - BUCKET_URL : the S3 bucket where the redirector.json and User interface is deployed.
function uploadUIAssets(event) {
 console.log("In uploadUIAssets :%s", SourceUIFilePath);

 return S3.getObject({ Bucket: SourceFileBucket, Key: SourceUIFilePath }).promise()
  .then(data => {
   let zip = new AdmZip(data.Body);
   let zipEntries = zip.getEntries();

   zipEntries.forEach(function(zipEntry) {

    if (!zipEntry.isDirectory) {
     let mimeType = mime.getType(zipEntry.name.substring(zipEntry.name.lastIndexOf(".")));
     let fileContents = zipEntry.getData();
     // console.log('File Name: ', zipEntry.entryName);

     if ((zipEntry.entryName.includes("static/js/main.") && zipEntry.entryName.endsWith(".js")) || zipEntry.entryName.includes("test-harness/js/aws-exports.js")) {
      // console.log("Kinesis Stream name :%s",event.ResourceProperties.KinesisStreamName);

      fileContents = fileContents.toString().replace('QOS_DELIVERY_STREAM', event.ResourceProperties.KinesisStreamName);
      fileContents = fileContents.replace('QOS_IDENTITY_POOL_ID', event.ResourceProperties.IdentityPoolId);
      fileContents = fileContents.replace('QOS_DEPLOY_REGION', event.ResourceProperties.Region);
      fileContents = fileContents.replace('QOS_DEPLOY_REGION', event.ResourceProperties.Region);
      fileContents = fileContents.replace('QOS_GRAPHQL_ENDPOINT', event.ResourceProperties.GraphQLEndpoint);
      fileContents = fileContents.replace('QOS_API_KEY', event.ResourceProperties.GraphQLApiKey);
      fileContents = fileContents.replace('CLOUDFRONT_DOMAIN', event.ResourceProperties.CloudFrontDomain);
      // console.log(fileContents);
     }

     S3.putObject({
       // ACL: 'public-read',
       Body: fileContents,
       Bucket: SourceBucket,
       Key: UIPrefix + "/" + zipEntry.entryName,
       // Key: zipEntry.entryName,
       ContentType: mimeType
      }).promise()
      .catch(() => { console.log("Exception while uploading the file into S3 bucket") });
    }
   });
   console.log("Done uploading UI");
   // return new Promise((resolve, reject) => { // (*)
   //  resolve('Done uploading UI');
   // });
  });
}

//copy the sample video assets..
function uploadGlueJobDefinition(event) {
 console.log("In GlueJobDefinition source - destination :%s - %s", SourceBucket, SourceFileBucket + GlueJobDefinition);

 var params = {
    Bucket: SourceBucket,
    CopySource: SourceFileBucket + "/"+ GlueJobDefinition,
    Key: GlueJobDefinition
  };

  S3.copyObject(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else{
      console.log("Done uploadGlueJobDefinition");
    }
  });
 }

// Send response to the pre-signed S3 URL
function sendResponse(event, context, responseStatus, responseData) {

 let responseBody = JSON.stringify({
  Status: responseStatus,
  Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
  PhysicalResourceId: context.logStreamName,
  StackId: event.StackId,
  RequestId: event.RequestId,
  LogicalResourceId: event.LogicalResourceId,
  Data: responseData
 });

 console.log("RESPONSE BODY:\n", responseBody);

 let parsedUrl = url.parse(event.ResponseURL);
 let options = {
  hostname: parsedUrl.hostname,
  port: 443,
  path: parsedUrl.path,
  method: "PUT",
  headers: {
   "content-type": "",
   "content-length": responseBody.length
  }
 };

 console.log("SENDING RESPONSE...\n");

 let request = https.request(options, function(response) {
  console.log("STATUS: " + response.statusCode);
  console.log("HEADERS: " + JSON.stringify(response.headers));
  // Tell AWS Lambda that the function execution is done
  // context.done();
 });

 request.on("error", function(error) {
  console.log("sendResponse Error:" + error);
  // Tell AWS Lambda that the function execution is done
  // context.done();
 });

 // write data to request body
 request.write(responseBody);
 request.end();
}
