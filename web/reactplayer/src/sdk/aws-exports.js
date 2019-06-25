const awsmobile =  {
    "graphqlEndpoint": "QOS_GRAPHQL_ENDPOINT",
    "authenticationType": "AWS_IAM",
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
//     "graphqlEndpoint": "https://6wvgpg3yujfatgg735kmawspsm.appsync-api.us-west-2.amazonaws.com/graphql",
//     "authenticationType": "AWS_IAM",
//     // "apiKey": "da2-gb2efkzljbaidohw2is5owy2wy",
//     "cloudfront_domain": 'https://d2ncourldxvm3g.cloudfront.net/',
//     "firehose": {
//         DeliveryStreamName: "mediaqos14-playerlogs-stream"
//     },
//     "aws": {
//         region: "us-west-2"
//     },
//     "cognito": {
//         IdentityPoolId: 'us-west-2:3059e56b-bdb7-4291-aae5-aa69c72f5a76'
//     }
// };

export default awsmobile;
