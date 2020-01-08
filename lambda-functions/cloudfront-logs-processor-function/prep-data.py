from __future__ import print_function

import os
import json
import urllib
import boto3
from gzip import GzipFile
#import gzip
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
    key = urllib.parse.unquote_plus(str(event['Records'][0]['s3']['object']['key']))
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
                    print(line)
                    columns = line.split("\t")
                    ua = parse(columns[10])
                    json_data = {}
                    json_data['logdate'] = columns[0]
                    json_data['logtime'] = columns[1]
                    json_data["location"] = columns[2]
                    json_data["browserfamily"] = ua.browser.family
                    json_data["osfamily"] = ua.os.family
                    json_data["isbot"] = ua.is_bot
                    #normalise the cache result type HIT or MISS to upper case to be in sync
                    json_data["resulttype"] = columns[13].upper()
                    json_data["requestid"] = columns[14]
                    json_data["cdn_source"] = cdn_source
                    json_data["bytes"] = columns[3]
                    json_data["requestip"] = columns[4]
                    json_data["uri"] = columns[7]
                    json_data = json.dumps(json_data)

# cloudfront columns
#           - Name: logdate - 0
#             Type: date
#           - Name: logtime - 1
#             Type: string
#           - Name: location - 2
#             Type: string
#           - Name: bytes - 3
#             Type: bigint
#           - Name: requestip - 4
#             Type: string
#           - Name: method - 5
#             Type: string
#           - Name: host - 6
#             Type: string
#           - Name: uri - 7
#             Type: string
#           - Name: status - 8
#             Type: bigint
#           - Name: referrer - 9
#             Type: string
#           - Name: useragent - 10
#             Type: string
#           - Name: uriquery - 11
#             Type: string
#           - Name: cookie - 12
#             Type: string
#           - Name: resulttype - 13
#             Type: string
#           - Name: requestid - 14
#             Type: string
#           - Name: header - 15
#             Type: string
#           - Name: csprotocol - 16
#             Type: string
#           - Name: csbytes - 17
#             Type: string
#           - Name: timetaken - 18
#             Type: bigint
#           - Name: forwardedfor - 19
#             Type: string
#           - Name: sslprotocol - 20
#             Type: string
#           - Name: sslcipher - 21
#             Type: string
#           - Name: responseresulttype - 22
#             Type: string
#           - Name: protocolversion - 23
#             Type: string
#           - Name: fle-status - 24
#             Type: string
#           - Name: fle-encrypted-fields - 25
#             Type: string
#           - Name: browserfamily - 26
#             Type: string
#           - Name: osfamily - 27
#             Type: string
#           - Name: isbot - 28
#             Type: string
#           - Name: filename - 29
#             Type: string
#           - Name: distribution - 30
#             Type: string
#           - Name: cdn_source - 31
#             Type: string

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
