# WORKSHOP CLEANUP
Congratulations, you have completed the workshop! Your next challenge is to remove all of the resources that were provisioned in your account so as to ensure that no additional cost can be incurred. Please note that the steps below should be implemented in order - some later steps have dependancies on earlier ones!

1. Delete all S3 objects created to allow CloudFormation to remove the S3 Buckets

2. Delete CloudFormation stack to remove all deployed resources

3. Unsubscribe from QuickSight (if you signed up today)

## DELETE ALL OBJECTS WITHIN THE S3 BUCKET CREATED BY CLOUDFORMATION
When you attempt to delete the CloudFormation stack that you deployed during the Workshop Preparation (the next step, following this), the S3 buckets that were provisioned will not be able to be removed unless emptied. The following instructions will take you through removing the contents of the log and application buckets.

1. Go to the S3 console (or go to https://s3.console.aws.amazon.com/s3/home?region=us-west-2);

2. Click on the whitespace around the S3 bucket used for logs (if you used the default Stack name it should be mediaqos-logs-{acctid}-{region} ). If you have done this correctly, the bucket should become highlighted in the list of S3 buckets.

3. Close the slide-in information window that appears by clicking on the X located in the top-right corner.

4. Click the Empty button to start the process of emptying the bucket contents. To complete this task, you will need to type in the bucket name to confirm the action. As this is a destructive action, please ensure you only empty the buckets from this workshop.

5. Repeat from Step 2, this time for the Application bucket, which is named mediaqos-sourcebucket-{acctid}-{region} by default.

## DELETE CLOUDFORMATION STACKS
Once you have confirmed that both the log and application S3 buckets are empty, you can remove the CloudFormation template that you deployed during the Workshop Preparation.

1. Go to the CloudFormation console (or go to https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2);

2. If you see a Stack named mediaqos, mark the checkbox associated with this stack and from the Actions dropdown, select the Delete Stack option. At the confirmation pop-up, click on the Yes, Delete button. Note, you must wait for this stack to be deleted before proceeding on to the next step.

## UNSUBSCRIBE FROM QUICKSIGHT
Once above steps are complete, you can unsubscribe from QuickSight if you subscribed during lab 2 of this Workshop. Note if you were already using QuickSight in your AWS account then you should not unsubscribe.

1. Go to the QuickSight console under Services and switch to N.Virginia (us-east-1) region (or go to https://us-east-1.quicksight.aws.amazon.com/sn/start);

1. In the QuickSight console, click on your username located in the top right corner of the window. In the menu that appears, select Manage QuickSight.

2. From the menu on the left, click on Account settings

3. Under Account settings, click on Unsubscribe and confirm.

## THANK YOU!
At this point, we would like to than you for attending this workshop, and would appreciate it if you could complete the session survey. Thanks for attending and we hope you enjoy the rest of the event!