# AWS Streaming Media Analytics

**15 May 2024: AWS Streaming Media Analytics is no longer maintained or supported due to updates in best practices for this workload. This repository will soon be archived**

Please see the following other AWS sample projects for an updated set of examples covering this use-case:

- [Improving Video Observability with CMCD and CloudFront blog post](https://aws.amazon.com/blogs/networking-and-content-delivery/improving-video-observability-with-cmcd-and-cloudfront/)
- [Cloudfront CMCD Realtime Dashboard repository](https://github.com/aws-samples/cloudfront-cmcd-realtime-dashboard)


**The following content is preserved for archive purposes**

AWS Streaming Media Analytics is a serverless end-to-end solution for analyzing the video streaming experience

- [AWS Streaming Media Analytics](#AWS-Streaming-Media-Analytics)
  - [Solution Architecture](#Solution-Architecture)
  - [How to customize and create your own CloudFormation template.](#How-to-customize-and-create-your-own-CloudFormation-template)
  - [JavaScript Video Player Setup](#JavaScript-Video-Player-Setup)
  - [License Summary](#License-Summary)


![alt text](images/main.png "AWS Streaming Media Analytics")

## Quicksight Update Frequency

By default the Glue Trigger is set for every 4 hours to reduce cost. This can frequency can be increased, but check the AWS Glue console pricing for more details. In my testing AWS Glue cost 0.44 cents per run in this solution. 

The GlueJob that writes player data to S3 for Athena and Quick sight is located within the WatchTimeGlueTrigger. Look for the field that looks like this. 
```Schedule: cron(0 */4 * * ? *)```


## Architecture 


![alt text](workshop/images/arch1.png "Architecture - ingest pipeline")

![alt text](workshop/images/arch2.png "Architecture")

![alt text](workshop/images/arch3.png "Architecture")




## How to customize and create your own CloudFormation template.

Setup Instructions
To build with Docker && make

Pre-requisites:
- Install `docker` for your environment as we will use a Docker container to build
- Install AWS CLI
- Install yarn

The build and deployment process for this project has been tested on both Mac and Linux using the vscode and Cloud9 IDEs respectively. 

Build Configuration:

Copy the Makefile.sample file to a file named Makefile. In the new file:
  - set `bucket` variable to reflect the S3 bucket name prefix which will be created within a deployment region. Note the region name will be appended to this prefix.
  - optionally, set the `s3prefix` variable to a prefix you wish to prepend to the path of all artifacts put into the S3 bucket(s).
  - set `regions` variable to reflect one or more AWS regions you want the code artifacts to be copied for CloudFormation deployment.
  - set `stack_name` for the Stack Name to use in the deployment.
  - set `profile` to the AWS CLI profile which has necessary permissions to deploy and create all the resources required.

Commands to manage creation/deletion of S3 buckets:
- To create buckets across regions: `make creates3`
- To delete buckets across regions: `make deletes3`

Commands to build and deploy the entire project
- `make all`
- `make deploy`

Once the deployment is done you should see the player URL in the Outputs section of the CloudFormation template.

## Pricing

Reference the AWS Pricing pages for each service used. 


## JavaScript Video Player Setup

[Guide to Setup JavaScript Video Player](PLAYERSETUP.md)



## License Summary

This sample code is made available under the MIT-0 license. See the LICENSE file.
