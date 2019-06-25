
# LAB 1: EXPLORING THE OTT PLATFORM AND MEASURING THE STREAMING EXPERIENCE

In this lab you will explore the video streaming application and data ingestion pipeline. You will first generate some data by watching videos and observing the way metadata is captured and streamed to a Kinesis Data Firehose endpoint. Next, you will observe the flow of the data through the pipeline as it makes its way to the data lake hosted on Amazon S3.

## EXPLORING THE USER INTERFACE AND GENERATING SOME DATA
1. Open the CloudFormation management console and select the stack you deployed earlier. By default this will be named mediaqos.

2. Click on the Outputs tab

3. Copy the URL next to PlayerURL and open this link in a new browser tab or window. This URL is the streaming video platform that you will use throughout the workshop. Keep this tab/window open throughout the workshop

4. Once the streaming video platform has loaded, click on the Sample Videos box to expand the list of videos available to view.

5. Click on a Video URL from the list and then click the PLAY button to start watching the video.

6. While the video plays, you will see periodic entries in the Metrics Captured window, showing the player events being captured. You may see events such as:

a. Video Start

b. Time to first Frame

c. FirstBuffer

d. Streaming

e. ScreenFreezedBuffer

f. Seeked

and other events, based on your network conditions and actions in watching the video.

7. (optional) To dive deeper, open Developer Tools in your browser and view Network events.

a. As you watch the video, you will see HTTP GET requests to pull each fragment of video and also HTTP POST requests to deliver the player metrics to Kinesis Data Firehose.

b. Open the Console in your browser and you will see the raw messages sent to the Kinesis Data Firehose stream. These messages include metadata about the player state at the time of the event and correspond to the entries that appear in the GUI.

8. Watch several videos from the collection. Perform actions such as dragging the timeline slider to other parts of the video, pausing and starting playback multiple times. This will generate interesting data for analysis in the next lab.

9. In addition to watching several videos, open another browser or two and watch some videos in each browser. This will simulate multiple users watching your videos (as each browser will register a unique cognito-id) and provide richer data for the next labs.

10. One of the videos: oceans.mpd, is encoded in a format that is not compatible with the video.js player when run under Google Chrome. This is an example of problem content that our analytics platform can help to identify. Try playing this clip on a Chrome browser. You should receive an error. This error will also be pushed into the Analytics pipeline and appear in the reports we generate in the next lab.

## OBSERVING THE DATA FLOW
In this section, you will explore the flow of data from the video player into the data lake.

1. In the AWS Management Console, open Kinesis.

2. From the menu on the left of the Kinesis Management Console, click on Data Firehose.

3. Click on the Delivery Stream for the video player event logs from the list. The default name is mediaqos-playerlogs-stream.

4. Take a minute to read through the configuration. Note the source of data and the final destination.

5. Click on the Monitoring tab. From here, you should see CloudWatch Metrics confirming data has been delivered into the Kinesis Data Firehose stream.

6. Click on the Details tab and then click on the link to the S3 Bucket hosting the logs located at the bottom of the page.

7. From the base of the S3 bucket, click on the player_logs folder. From here you will find nested folders which correspond to the year/month/day/hour the logs were generated in. Within the hour level folder, you will find the logs produced by your activity at the start of this lab.

8. (optional) If you are curious, click on one of the logs and select Download to download the log to your local machine. You can open the log in a text editor and observe the contents.

## [PROCEED TO LAB 2](LAB2.md)
Once you've completed the steps in this guide, you can click on the following button to proceed to the next lab.

## [LAB 2: EXPLORING THE DATA AND GENERATING REPORTS](LAB2.md)
   
Note: When a reasonable amount of participants get to this stage, we will resume the presentation, introducing the next component of the solution: generating reports and dashboards using Amazon Athena and QuickSight

If you're keen, it's perfectly fine to proceed - but it's recommended that you hit the above button and wait until the aforementioned content has been presented (we will commence presenting content when approximately 20-percent of participants have loaded the page for Lab 2).
