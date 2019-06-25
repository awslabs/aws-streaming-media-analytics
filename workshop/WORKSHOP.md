# Build an AWS Analytics Solution to Monitor the Video Streaming Experience

### [HTML5 Formatted Version of this Workshop]([LAB2.md](https://aws-streaming-media-analytics-workshop.s3.amazonaws.com/lab1_eifjccfundrutdlnbulhdfcrkiflhjbunfcjiffdlkvf.html))

Welcome to Build an AWS Analytics Solution to Monitor the Video Streaming Experience!

During this workshop, you'll get hands-on with an example OTT video streaming platform with integrated client and server-side analytics. In the 3 labs that make up this workshop, you will explore all aspects of a modern data architecture when applied to a video & OTT use-case.

Firstly, you will see how data can be captured by leveraging the event model in the video.js open source video player.

From here, you will explore how to capture data at scale with Amazon Kinesis Data Firehose and to store the data in a data lake leveraging Amazon S3.

Next, you will visualize the captured data using Amazon Quicksight and Athena, building reports that cover key operational performance metrics.

Finally, you will close the loop with customers, by performing real-time analysis on the event stream and integrating the results with the customer-facing application, improving the user experience through recommendation and analysis of trending content.

## SOLUTION ARCHITECTURE

![alt text](images/arch1.png "Architecture - ingest pipeline")

![alt text](images/arch2.png "Architecture")

![alt text](images/arch3.png "Architecture")


## WORKSHOP DETAILS
This workshop will be broken down into a series of three labs that flow on from each other (that is, you must complete each lab in order before proceeding with the next). The lab exercises that will be covered are:

• Workshop preparation: Deploy pre-requisite resources through Amazon CloudFormation;

• Lab 1: Capturing metrics from the client and server;

• Lab 2: Exploring the captured data: Building reports on key operational metrics using Amazon Quicksight and Athena;

• Lab 3: Closing the loop: exploring real-time analytics and presenting this information in a way that enhances the customer experience;

• Workshop clean up: Removing the deployed resources and resetting your AWS Account to ensure no ongoing charges accrue after the workshop is over.

As a reminder, you should have a laptop device (Windows/OSX/Linux all supported - tablets are not appropriate) with the current version of Google Chrome and/or Mozilla Firefox installed. You should also have a clean AWS account, with AdministratorAccess policy-level access.

## START THE WORKSHOP

Link to the HTML Version of the workshop

## [HTML5 Formatted Version of this Workshop]([LAB2.md](https://aws-streaming-media-analytics-workshop.s3.amazonaws.com/lab1_eifjccfundrutdlnbulhdfcrkiflhjbunfcjiffdlkvf.html))

# WORKSHOP PREPARATION

In order to explore the concepts covered in this workshop, you will work with an example OTT streaming platform which you will deploy into the AWS account you've come to this workshop with. During this workshop, you will work with a large number of AWS services, so in order to allow you to jump right in, we have pre-built the example environment into a CloudFormation template which you should deploy now.

## LOG IN TO THE AWS MANAGEMENT CONSOLE
Prior to deploying the OTT streaming platform, first ensure you are logged in to your AWS account for use in this workshop. To sign in to the AWS Management Console, open https://aws.amazon.com and click on the My Account->AWS Management Console link in the top right corner of the page.

## LAUNCH THE CLOUDFORMATION TEMPLATE
This CloudFormation template deploys an example OTT streaming platform in to your AWS account. The deployed environment includes a static website hosted on S3 with sample videos, Kinesis Data Firehose endpoints to accept and process streaming log data and a real-time log analysis application built on Kinesis Analytics, DynamoDB and AppSync.

1. To deploy the CloudFormation template, click on either of the following links, corresponding to the two regions supported by this workshop:

Region	Template Link
us-east-1 (N. Virginia)	https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/new?stackName=mediaqos&templateURL=https://s3.amazonaws.com/qos-reinvent-workshop-us-east-1/qos/cloudformation/v7/deployment.yaml

us-west-2 (Oregon)	https://console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/new?stackName=mediaqos&templateURL=https://s3.amazonaws.com/qos-reinvent-workshop-us-west-2/qos/cloudformation/v7/deployment.yaml
2. The CloudFormation Management Console will load with the template URL pre-filled as a Amazon S3 URL. Click the orange Next button located in the bottom right corner of the console to configure the deployment.

3. By default we have set a stack name of mediaqos. There is no need to change this and we refer to this name throughout the guide when identifying resources. If you do decide to change the stack name, please ensure you only use lower-case letters and digits, and keep the name under 12 characters. The stack name is used to name resources throughout the workshop. Keep the name handy as you will need it from time to time to locate resources deployed by the stack.

3. Once you have decided on a stack name, click Next to continue.

4. On the next step, Configure stack options, leave all values as they are and click Next to continue.

5. On the Review step

a. Check the three boxes under Capabilities and transforms to acknowledge the template will create IAM resources and leverage transforms.

b. Click the Create stack button located at the bottom of the page to deploy the template.

The stack should take around 15-20 minutes to deploy - so we'll keep going with the presentation while it deploys for everyone.

## [PROCEED TO LAB 1](LAB1.md)
If you have reached this point, you have successfully completed all of the preparation required to start the workshop. When a reasonable amount of participants get to this stage, we will resume the presentation, introducing the video and analytics platforms and covering the architectures we will explore in todays workshop.

## [LAB 1: EXPLORING THE OTT PLATFORM AND MEASURING THE STREAMING EXPERIENCE](LAB1.md)
   
If you're keen, it's perfectly fine to proceed - but it's recommended that you hit the above button and wait until the aforementioned content has been presented (we will commence presenting content when approximately 20-percent of participants have loaded the page for Lab 1).
