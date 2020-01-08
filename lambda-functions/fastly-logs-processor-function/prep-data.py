from __future__ import print_function

import os
import json
import urllib
import boto3
from gzip import GzipFile
from io import BytesIO
from user_agents import parse

print('Loading function')

s3 = boto3.client('s3')
firehose = boto3.client('firehose')
cdn_source = os.environ['CDN_SOURCE']
delivery_stream = os.environ['KINESIS_FIREHOSE_STREAM']

def lambda_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'].encode('utf8'))
    dist_name = key.split("/")[-1].split(".")[0]
    print("Enter into try")

    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        print("Getting the response on key "+key)
        bytestream = BytesIO(response['Body'].read())
        data = GzipFile(None, 'rb', fileobj=bytestream).read().decode('utf-8')

        for line in data.strip().split("\n"):

            if not line.startswith("#"):
                try:
                    line = line.strip()
                    line = line.replace("<134>","",1)
                    columns = line.split("|")
                    print(len(columns))
                    ua = parse(columns[5])
                    json_data = {}
                    firstColumn = columns[0].split(" ")
                    print(firstColumn)
                    datetime = firstColumn[0].split("T")
                    json_data['logdate'] = datetime[0]
                    json_data['logtime'] = datetime[1].replace("Z","",1)
                    json_data["location"] = firstColumn[1]
                    json_data["browserfamily"] = ua.browser.family
                    json_data["osfamily"] = ua.os.family
                    json_data["isbot"] = ua.is_bot
                    #normalise the cache result type HIT or MISS to upper case to be in sync
                    json_data["resulttype"] = columns[7].upper()
                    json_data["requestid"] = columns[8]
                    json_data["cdn_source"] = cdn_source
                    # following to be included for cross CDN compatibility
                    json_data["bytes"] = columns[3]
                    json_data["requestip"] = firstColumn[3]
                    json_data["uri"] = columns[4]
                    json_data = json.dumps(json_data)

# fastly columns
#<134>2019-01-06T04:17:46Z cache-bom18223 S3LogBucket[22354]: 49.36.1.187 "-" "-" [06/Jan/2019:04:17:45 +0000] "GET /sample-videos/hls/TearsOfSteel.m3u8 HTTP/1.1" 403 243 "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" 0 "MISS" "33c478dd-0491-4bfb-b303-64f546b819e7"

                    # line = line + '\t' + str(ua.browser.family) + '\t' + str(ua.os.family) + '\t' + str(ua.is_bot) + '\t' + key + '\t' + dist_name + '\t' + cdn_source + '\n'
                    processed = True

                    print("pushing item to firehose stream -> ")
                    print(json_data)

                    firehose.put_record(
                        DeliveryStreamName=delivery_stream,
                            Record={
                                "Data":json_data+"\n"
                            }
                    )
                except Exception as e:
                    print(e)
                    print("Exception during utf8 conversion")

    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e
