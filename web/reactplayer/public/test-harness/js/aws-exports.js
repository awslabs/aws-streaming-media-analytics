const awsmobile =  {
    "graphqlEndpoint": "QOS_GRAPHQL_ENDPOINT",
    "authenticationType": "API_KEY",
    "apiKey": "QOS_API_KEY",
    "cloudfront_domain": 'CLOUDFRONT_DOMAIN',
    "firehose": {
        DeliveryStreamName: "QOS_DELIVERY_STREAM"
    },
    "aws": {
        region: "QOS_DEPLOY_REGION"
    },
    "cognito": {
        IdentityPoolId: 'QOS_IDENTITY_POOL_ID'
    }
};

// const awsmobile =  {
//     "graphqlEndpoint": "https://ecjj3smm75bdnpzejucgximdle.appsync-api.us-east-1.amazonaws.com/graphql",
//     "authenticationType": "API_KEY",
//     "apiKey": "da2-ug64m5t3fjgvrivmoamlugflsy",
//     "cloudfront_domain": 'CLOUDFRONT_DOMAIN',
//     "firehose": {
//         DeliveryStreamName: "mediaqos6-playerlogs-stream"
//     },
//     "aws": {
//         region: "us-east-1"
//     },
//     "cognito": {
//         IdentityPoolId: 'us-east-1:3dba761d-78f6-438f-99bd-b26acff42169'
//     }
// };
