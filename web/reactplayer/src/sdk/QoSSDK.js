import aws from './AWSConnector';

export var SDK = function(playerComponent) {
  var player = playerComponent;
  // console.log(player);
  //----- common functions & variables-----

  var sdk = this,
    connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  var getConnectionType = function() {
      return {
        type: connection ? connection.type || connection.effectiveType : "not available",
        rtt: connection ? connection.rtt : -1
      };
    },
    resetVideo = function(videoId) {
      return {
        videoId: videoId,
        previousTime: 0,
        currentTime: 0,
        seekStart: null,
        seekStartTime: 0,
        seekEndTime: 0,
        loadStarted: 0,
        dataLoaded: null,
        percentSeen: 0,
        packageType: null,
        avgBitrate: 0,
        duration: 0,
        resolution: null,
        frameRate: 0,
        bufferStarted:0,
      };
    },
    resetUser = function(userId) {
      return {
        cognitoId: userId,
        firstNAme: '',
        lastName: ''
      };
    },
    getUser = function() {
      // console.log("In getUser");
      var userId = aws.getUserId();
      // console.log("User id ",userId);
      if(userId){
        displayMetrics("User Id : ", userId);
      }
      return userId;
    },
    initialize = function(videoId) {
      console.log("In initialize :",videoId);
      currentVideo = resetVideo(videoId);
      currentUser = resetUser(getUser());
      // console.log("Current user :",currentUser);
      commonAttr = {
        user_id: currentUser.cognitoId,
        video_id: currentVideo.videoId
      };
    },
    //----- Push metrics to Firehose -----
    sendToAWS = function(calculatedMetrics) {
      // console.log("Sending Data To AWS ...");
      console.log(calculatedMetrics);
      aws.push(calculatedMetrics, function(error, data) {
        if (error) {
          console.log("error");
        }
      });
    },
    currentUser = resetUser(),
    currentVideo = resetVideo(),
    commonAttr = {},
    // cdnTrackingId = '',
    connectionType = getConnectionType();

  //-----Defining the Metrics -----

  var Metric = function(MetricType, MetricValue) {

      //structure of the metric object
      var metric = {
        MetricType,
        ...MetricValue,
        ...commonAttr,
        TimeStamp: Date.now()
        // isotimestamp: (new Date()).toISOString()
      };

      return metric;
    },
    MetricType = ["PLAY","FIRSTFRAME", "SEEK", "BUFFER", "STREAM", "STEP", "PAUSE", "ERROR", "STOP"],
    PLAY = {
      at: '',//playback position
      duration: '',
    },
    FIRSTFRAME = {
      rtt: '',//round trip time
      connection_type: '',//3g or 4g
      package: '', //HLS or DASH
      resolution: '',
      fps: '',
      avg_bitrate: '',
      time_millisecond: '',
      cdn_tracking_id: '',
    },
    SEEK = {
      seek_from: '',
      seek_to: '',
      rtt: '',
      connection_type: '',
      time_millisecond: '',
      cdn_tracking_id: ''
    },
    BUFFER = {
      buffer_type: '',
      at: '',//playback position
      rtt: '',
      connection_type: '',
      time_millisecond: '',
      cdn_tracking_id: ''
    },
    STREAM = {
      at: '',
      rtt: '',
      connection_type: '',
      package: '',
      // aspect_ratio: '',
      resolution: '',
      fps: '',
      avg_bitrate: '',
      duration: '',
      cdn_tracking_id:''
    },
    STEP = {
      at: '',//playback position
      bitrate_from: '',
      bitrate_to: '',
      direction: '',//quality UP or DOWN
      package: '',
      resolution: '',
      fps: '',
      connection_type: '',
    },
    STOP = {
      at: '',
      duration: '',
      connection_type: '',
      package: '',
      // aspect_ratio: '',
      resolution: '',
      fps: '',
      avg_bitrate: '',
    },
    PAUSE = {
      at: '',
      duration: '',
    },
    ERROR = {
      at: '',
      message: '',
      cdn_tracking_id: ''
    },
    MetricValue = {
      FIRSTFRAME,
      SEEK,
      PLAY,
      BUFFER,
      PAUSE,
      ERROR,
      STOP,
      STREAM,
      STEP
    },
    setMetricValue = function(metericName, args) {
      var metricObj = MetricValue[metericName];
      var index = 0;
      for (var key in metricObj) {
        metricObj[key] = args[index++];
      }
      return metricObj;
    };

  //-----Defining the player event function handlers ------

  var play = function(playlistType) {
    console.log("In play with playlistType ",playlistType);
      displayMetrics("Video Start at ", new Date().toLocaleTimeString());
      var metericName = "PLAY";
      //set whether the video being played is VOD or Live
      commonAttr.playlist_type = playlistType;
      var metricValue = setMetricValue(metericName, [currentVideo.currentTime, currentVideo.duration]);
      var calculatedMetric = Metric(metericName, metricValue);
      return sendToAWS(calculatedMetric);
    },
    loadStarted = function() {
      currentVideo.loadStarted = Date.now();
    },
    loadeddata = function(duration, packageType, playbackAttr, cdn_request_id, rtt) {
      currentVideo.packageType = packageType.toUpperCase();
      if(playbackAttr["AVERAGE-BANDWIDTH"]){
        currentVideo.avgBitrate = parseInt(playbackAttr["AVERAGE-BANDWIDTH"]);
      }
      else{
        currentVideo.avgBitrate = 0;
      }
      currentVideo.duration = duration;
      currentVideo.resolution = parseResolution(playbackAttr);
      currentVideo.frameRate = playbackAttr["FRAME-RATE"];

      var dataloadedTime = Date.now();

      if (!currentVideo.dataLoaded) {
        timeToFirstFrame(playbackAttr, dataloadedTime - currentVideo.loadStarted, cdn_request_id, rtt);
      }
      currentVideo.dataLoaded = dataloadedTime;
    },
    timeToFirstFrame = function(playbackAttr, time, cdn_request_id, rtt) {
      displayMetrics("Time to First Frame ", time + ' ms');

      var metericName = "FIRSTFRAME";
      connectionType = getConnectionType();
      var metricValue = setMetricValue(metericName, [rtt, connectionType.type, currentVideo.packageType, currentVideo.resolution,
        playbackAttr["FRAME-RATE"], playbackAttr["AVERAGE-BANDWIDTH"], time, cdn_request_id
      ]);
      var calculatedMetric = Metric(metericName, metricValue);
      return sendToAWS(calculatedMetric);
    },
    buffering = function(time) {
      if(time === 0){
        displayMetrics("Initial buffering..", '');
      }
      else{
        displayMetrics("Buffering at :", time);
      }
      currentVideo.isBuffering = true;
      currentVideo.bufferStarted = Date.now();
    },
    bufferCompleted = function(cdn_request_id, rtt) {
      var time = currentVideo.currentTime;
      if (currentVideo.isBuffering) {
        var bufferingTime = Date.now() - currentVideo.bufferStarted;
        updateBufferStatus("ScreenFreezedBuffer", bufferingTime, time, cdn_request_id, rtt);
      } else {
        firstBufferCompleted(time, cdn_request_id, rtt );
      }
      if (currentVideo.seekStart) {
        seeked(currentVideo.previousTime);
      }
      return currentVideo.isBuffering = false;
    },
    updateBufferStatus = function(bufferType, timeTakenToBuffer, time, cdn_request_id, rtt) {
      var metericName = "BUFFER";
      connectionType = getConnectionType();
      var metricValue = setMetricValue(metericName, [bufferType, time, rtt, connectionType.type, timeTakenToBuffer, cdn_request_id]);
      var calculatedMetric = Metric(metericName, metricValue);
      // displayMetrics("Completed " + bufferType + " at :", new Date().toLocaleTimeString());
      displayMetrics(bufferType + " ready in :", timeTakenToBuffer + " ms");
      return sendToAWS(calculatedMetric);
    },
    firstBufferCompleted = function(time, cdn_request_id, rtt) {
      var timeTakenToBuffer = Date.now() - currentVideo.loadStarted;
      return updateBufferStatus("FirstBuffer", timeTakenToBuffer, currentVideo.currentTime, cdn_request_id, rtt);
    },
    step = function(playbackAttr, packageType, time) {
      var metericName = "STEP";
      let newAvgBitrate = 0;
      if(playbackAttr["AVERAGE-BANDWIDTH"]){
        newAvgBitrate = parseInt(playbackAttr["AVERAGE-BANDWIDTH"])
      }
      else{
        newAvgBitrate = 0;
      }
      // let newAvgBitrate = parseInt(playbackAttr["AVERAGE-BANDWIDTH"]);
      let direction;

      currentVideo.packageType = packageType.toUpperCase();
      //if current bitrate is 0, then its the step down operation
      //at the start of play
      if(currentVideo.avgBitrate === 0){
        direction = 'DOWN';
      }
      else{
        direction = (currentVideo.avgBitrate > newAvgBitrate) ? 'DOWN' : 'UP';
      }
      connectionType = getConnectionType();
      var metricValue = setMetricValue(metericName, [currentVideo.currentTime, currentVideo.avgBitrate, newAvgBitrate, direction, currentVideo.packageType, currentVideo.resolution, currentVideo.frameRate,  connectionType.type]);
      // playbackAttr["FRAME-RATE"]
      var calculatedMetric = Metric(metericName, metricValue);

      //set the new Avg Bitrate being streamed
      currentVideo.avgBitrate = parseInt(newAvgBitrate);
      displayMetrics("Bitrate Step " + direction + " at :", currentVideo.currentTime);
      return sendToAWS(calculatedMetric);
    },
    timeUpdate = function(time, duration, cdn_request_id,rtt) {
      currentVideo.previousTime = currentVideo.currentTime;
      currentVideo.currentTime = time;

      var intPlayedTime = parseInt(time, 10);

      if (currentVideo.percentSeen !== intPlayedTime) {
          currentVideo.percentSeen = intPlayedTime;
          captureStreamingLogs(currentVideo.packageType, currentVideo.resolution, currentVideo.frameRate, currentVideo.avgBitrate, currentVideo.duration,cdn_request_id,rtt);
      }
    },
    captureStreamingLogs = function(stream_package, resolution, fps, bitrate, duration,cdn_request_id,rtt) {
      var metericName = "STREAM";
      connectionType = getConnectionType();
      var metricValue = setMetricValue(metericName, [currentVideo.currentTime, rtt, connectionType.type, stream_package, resolution, fps, bitrate, duration, cdn_request_id]);
      displayMetrics("Streaming at :", currentVideo.currentTime);
      var calculatedMetric = Metric(metericName, metricValue);
      return sendToAWS(calculatedMetric);
    },
    seeking = function() {
      if (currentVideo.seekStart === null) {
        currentVideo.seekStart = currentVideo.previousTime;
        currentVideo.seekStartTime = Date.now();
      }
      currentVideo.isBuffering = true;
    },
    seeked = function(currentTime,cdn_request_id,rtt) {
      var timeTakenToSeek = Date.now() - currentVideo.seekStartTime;
      displayMetrics('Seeked from ', currentVideo.seekStart + ' to ' + currentTime + ' in ' + timeTakenToSeek + ' ms');
      updateSeekStatus(currentTime, timeTakenToSeek,cdn_request_id,rtt);
      return currentVideo.seekStart = null;
    },
    updateSeekStatus = function(currentTime, timeTakenToSeek,cdn_request_id,rtt) {
      var metericName = "SEEK";
      connectionType = getConnectionType();
      var metricValue = setMetricValue(metericName, [currentVideo.seekStart, currentTime, rtt, connectionType.type, timeTakenToSeek, cdn_request_id]);
      var calculatedMetric = Metric(metericName, metricValue);
      return sendToAWS(calculatedMetric);
    },
    pause = function() {
      //to avoid firing pause metric which is also called when video playback is //finished
      if (currentVideo.currentTime === currentVideo.duration) return;

      displayMetrics("Video Paused at ", currentVideo.currentTime);
      var metericName = "PAUSE";
      var metricValue = setMetricValue(metericName, [currentVideo.currentTime, currentVideo.duration]);
      var calculatedMetric = Metric(metericName, metricValue);
      return sendToAWS(calculatedMetric);
    },
    ended = function(currentTime, duration) {
      var text = '';
      if (currentTime === duration) {
        text = "Finished playing at";
        stop(currentTime);
      } else {
        text = "Video Ended with some error at "
        errorOccured(currentTime, text + new Date().toUTCString());
      }
      displayMetrics(text, new Date().toLocaleTimeString());
      // return stop();
    },
    stop = function(time) {
      displayMetrics("Video Stopped at ", time);
      var metericName = "STOP";
      connectionType = getConnectionType();
      var metricValue = setMetricValue(metericName, [time, currentVideo.duration, connectionType.type, currentVideo.packageType, currentVideo.resolution, currentVideo.frameRate, currentVideo.avgBitrate]);
      var calculatedMetric = Metric(metericName, metricValue);
      return sendToAWS(calculatedMetric);
    },
    parseResolution = function(playbackAttr) {
      return playbackAttr.RESOLUTION.width + "x" + playbackAttr.RESOLUTION.height;
    },
    errorOccured = function(time, cdn_request_id, error) {
      var text = "Some thing went wrong at ";
      displayMetrics(text, new Date().toLocaleTimeString());
      error = error || text + new Date().toUTCString();

      var metericName = "ERROR";
      var metricValue = setMetricValue(metericName, [time, "Error", cdn_request_id]);
      var calculatedMetric = Metric(metericName, metricValue);
      return sendToAWS(calculatedMetric);
    };

  //-------------------------------All Functions exposed by SDK when you create an object -------------------------------------------------------------------------------------------
  sdk.play = play;
  sdk.pause = pause;
  sdk.stop = stop;
  sdk.errorOccured = errorOccured;
  sdk.ended = ended;
  sdk.bufferCompleted = bufferCompleted;
  sdk.loadeddata = loadeddata;
  sdk.loadStarted = loadStarted;
  sdk.seeked = seeked;
  sdk.seeking = seeking;
  sdk.timeUpdate = timeUpdate;
  sdk.buffering = buffering;
  sdk.initialize = initialize;
  sdk.step = step;
  sdk.getUser = getUser;

  //-----Extendable Functions to create push custom metrics-----
  // var publishCustomMetric = function(MetricType, MetricValue) {
  //   MetricType = MetricType.toLocaleUpperCase();
  //   var calculatedMetric = Metric(MetricType, MetricValue);
  //   displayMetrics("Custom metric " + MetricType + " published at", new Date().toLocaleTimeString());
  //   return sendToAWS(calculatedMetric);
  // }
  //
  // sdk.publishCustomMetric = publishCustomMetric;

  //-----This is used to show activities on screen-----
  var displayMetrics = function(data, value) {
    player.addTrail(data, value);
  }
  sdk.displayMetrics = displayMetrics;

  return sdk;
};
