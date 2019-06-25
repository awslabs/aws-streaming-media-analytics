var AWS_ADAPTER = function () {
    var aws = this;
    console.log(awsmobile);
    AWS.config.credentials = new AWS.CognitoIdentityCredentials(awsmobile.cognito);
    AWS.config.update(awsmobile.aws);
    var fireHose = new AWS.Firehose();
    var params = {
        DeliveryStreamType: "DirectPut",
        ExclusiveStartDeliveryStreamName: awsmobile.firehose.DeliveryStreamName,
        Limit: 1
    };
    fireHose.listDeliveryStreams(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log("Verfied Delivery Stream"); // successful response
    })
    aws.getUserId = function () {
        return AWS.config.credentials.params.IdentityId;
    }
    aws.push = function (data, callback) {
        var fireHoseParams = awsmobile.firehose;
        fireHoseParams.Record = {
            Data: JSON.stringify(data) + "\n"
        }
        fireHose.putRecord(fireHoseParams, callback);
        return true;
    }
    aws.pushBatch = function (data, callback) {
        var fireHoseParams = awsmobile.firehose;
        fireHoseParams.Records = data;
        fireHose.putRecordBatch(fireHoseParams, callback);
        return true;
    }
    return aws;
}
