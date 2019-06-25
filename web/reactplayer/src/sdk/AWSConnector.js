import * as AWS from 'aws-sdk';
import ClientConfig from './aws-exports';

class AWSConnector{

  //initialize with ClientConfig
  constructor(){
    AWS.config.update(ClientConfig.aws);
    console.log("Config ",ClientConfig);
    AWS.config.credentials = new AWS.CognitoIdentityCredentials(ClientConfig.cognito);
    this.firehose = new AWS.Firehose();
  }

  //get Cognito user id
  getUserId() {
    let userId = AWS.config.credentials.params.IdentityId;
    if(!userId){
        console.log("In AWSConnector.getUserId ",userId);
        AWS.config.credentials.refresh(function(){
          AWS.config.credentials.params.IdentityId = AWS.config.credentials.identityId;
          console.log("Login refreshed ",AWS.config.credentials.params.IdentityId);
        });
    }
    return userId;
  }

  getCredentials() {
    this.getUserId();
    //console.log("In getCredentials ",AWS.config.credentials);
    return AWS.config.credentials;
  }

  //push to Firehose
  push(data, callback) {
      var firehoseParams = ClientConfig.firehose;
      firehoseParams.Record = {
          Data: JSON.stringify(data) + "\n"
      }
      this.firehose.putRecord(firehoseParams, callback);
      return true;
  }
}
export default new AWSConnector();
