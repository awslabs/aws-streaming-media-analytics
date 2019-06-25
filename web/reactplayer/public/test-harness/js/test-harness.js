loadValue = 0;
userValue = 5;
bufferingValue = 2;
batchsize = 10;
maxWatchTime = 6000;
seriesArray = weightedRandTable(['Jackets', 'BreakingTerrible', 'TheBandTour', 'TheMagicHoundabout', 'ThisIsMyArchitecture', 'JackBryan',
                                 'TheContentShow', 'CarWars', 'KillerCrows', 'BigBrutha', 'TourDeFrank', 'TheJetbuns', 'TheClintstones',
                                 'BearGillz', 'Ozmark', 'GameOfLoans', 'CastleClock', 'BetterCallPaul', 'TheSkinner', 'OrangeIsTheNewPurple',
                                 'TreysAnatomy', 'TheBandMaidsTale', 'TheRunningDead', 'SteelFist', 'BrooklynTenTen', 'TheBusiness', 'CriminalBrains',
                                 'StrangerBrings', 'BlueMirror', 'PeakeyMinders', 'FalseDetective', '14ReasonsWhy', 'TheCrampireDiaries', 'HowIMetYourBrother',
                                 'HouseOfBards', 'TheBigGangTheory', 'DoctorSnu', 'Homebrand', 'Barkos', 'PerksAndReclamation']);

connTypeArray = weightedRandTable(['4G', 'wifi', 'ethernet', 'serialcable', 'wimax', 'modem', 'carrierpigeonoverip', 'cable', 'ADSL', '3G', 'GPRS', '10BASE2']);

var users = new Array();
var views = {};

$("#sl1").slider();
$("#sl1").on("slide", function(slideEvt) {
	$("#sl1SliderVal").text(slideEvt.value);
    loadValue = slideEvt.value;
    if(loadValue > 50){
        batchsize = loadValue;
    }
    if(loadValue > 75){
        batchsize = loadValue*3;
    }
    if(loadValue > 98){
        batchsize = 490;
    }
});

$("#sl2").slider();
$("#sl2").on("slide", function(slideEvt) {
	$("#sl2SliderVal").text(slideEvt.value);
    userValue = slideEvt.value;
});

$("#sl3").slider();
$("#sl3").on("slide", function(slideEvt) {
	$("#sl3SliderVal").text(slideEvt.value);
    bufferingValue = slideEvt.value;
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function weightedRandTable(spec) {
  var i, j, table=[];
  for (i in spec) {
    var mult = 10;
    if(Math.floor((Math.random() * 4) + 1) > 3){
        mult = 50;
    }
    for (j=0; j<Math.floor(Math.random() * mult); j++) {
      table.push(spec[i]);
    }
  }
  return table;
}

function uuid(){
    var uuid = '', ii;
    for (ii = 0; ii < 32; ii += 1) {
      switch (ii) {
      case 8:
      case 20:
        uuid += '-';
        uuid += (Math.random() * 16 | 0).toString(16);
        break;
      case 12:
        uuid += '-';
        uuid += '4';
        break;
      case 16:
        uuid += '-';
        uuid += (Math.random() * 4 | 8).toString(16);
        break;
      default:
        uuid += (Math.random() * 16 | 0).toString(16);
      }
    }
    return `us-test-1:${uuid}`;
}

function UserObj() {
        this.uid = uuid(),
        this.connType = connTypeArray[Math.floor(Math.random() * connTypeArray.length)],
        this.counter = 0,
        this.seriesName = seriesArray[Math.floor(Math.random() * seriesArray.length)],
        this.seasonNumber = Math.floor((Math.random() * 5) + 1),
        this.episodeNumber = Math.floor((Math.random() * 22) + 1),
        // this.videoId = `${this.seriesName}S${this.seasonNumber}E${this.episodeNumber}`,
        this.videoId = `${this.seriesName}`,
        this.firstFired = Date.now(),
        this.maxWatch = Math.floor((Math.random() * maxWatchTime) + 1)
}

function getUser(userNumber){
    var u = users[userNumber];
    if (typeof(u) != 'undefined' && u != null)
    {
        u.counter = u.counter + 1;
    } else {
        u = new UserObj();
        users[userNumber] = u;
    }
    return u;
}

function getMetricDataFrame(){
    var userForMetric = Math.floor((Math.random() * userValue) + 1);
    var user = getUser(userForMetric);
    var timeAt = (Date.now() - user.firstFired) / 1000;
    //console.log(`Got user ${userForMetric} with ${user.uid} (uid)   ${user.connType} (con)   ${user.counter} (eventcount)     ${timeAt} timeat     ${user.videoID} (videoID)`)
    var dataFrame = {
        MetricType: 'UNDEFINED',
        user_id: user.uid,
        video_id: user.videoId,
        // Video_seriesName: user.seriesName,
        // Video_seasonNumber: user.seasonNumber,
        // Video_episodeNumber: user.episodeNumber,
        connection_type: user.connType,
        at: timeAt,
        TimeStamp: Date.now(),
        isotimestamp: (new Date()).toISOString()
    };

    if(user.counter == 0){
        dataFrame['MetricType'] = 'FIRSTFRAME';
        dataFrame['time_millisecond'] = Math.floor((Math.random() * 3000) + 1);
    } else {
        if(timeAt > user.maxWatch){
            //Reset the user if they hit their maximum watch time.
            dataFrame['MetricType'] = 'STOP';
            delete users[userForMetric];
            console.log(`Deleted user ${userForMetric}`);
        } else {
            if(Math.floor((Math.random() * 100) + 1) > bufferingValue) {
                dataFrame['MetricType'] = 'PLAY';
                dataFrame['duration'] = '50';
            } else {
                dataFrame['MetricType'] = 'BUFFER';
                dataFrame['buffer_type'] = "ScreenFreezedBuffer";
                dataFrame['time_millisecond'] = Math.floor((Math.random() * 2000) + 1);
            }
        }
    }


/* NOT IMPLEMENTED
    SEEK = {
        seek_from: '',
        seek_to: '',
        rtt: '',
        connectionType: '',
        timeInMillisecond: ''
    },
    PAUSE = {
        at: ''
    },
    ERROR = {
        at: '',
        message: '',
        error: {}
    },
    BUFFER = {
        buffer_type: '',
        at: '',
        rtt: '',
        connectionType: '',
        timeInMillisecond: ''
    },
    STREAM = {
        at: '',
        rtt: '',
        connectionType: '',
        package: '',
        aspectratio: '',
        resolution: '',
        fps: '',
        bitrate: ''
    },
*/
    return dataFrame;
}

//This is very terrible.
function copy(o) {
   var output, v, key;
   output = Array.isArray(o) ? [] : {};
   for (key in o) {
       v = o[key];
       output[key] = (typeof v === "object") ? copy(v) : v;
   }
   return output;
}

async function mainLoop(){

    setInterval(function(){
      console.log("clearing metrics..");
      views = {};
    }, 60000);

    var aws = new AWS_ADAPTER();
    var dataArray = [];
    var slTime = 2000;
    for (;;) {
        if(loadValue > 0){
            slTime = 1000 - (loadValue*10);
            let df = getMetricDataFrame();

            if(df.MetricType === 'STREAM'){
              if(views[df.video_id]){
                views[df.video_id] = views[df.video_id] + 1;
              }
              else{
                views[df.video_id] = 1;
              }
            }
            // console.log(JSON.stringify(df));

            dataArray.push({ Data: JSON.stringify(df) + "\n"});
            if(dataArray.length > batchsize){
                //Horrible async failure modes are here. Probably should use something better.
                var tmpArray = copy(dataArray);
                dataArray = [];
                console.log(`Pushing batch: ${tmpArray.length} / ${batchsize}`);
                console.log("total views ",views);
                aws.pushBatch(tmpArray, function (error, data) {
                    if (error) {
                        console.log("error");
                        return console.log(error);
                    }
                });

            }
        } else {
            slTime = 2000;
        }
        await sleep(slTime);
    }
}
mainLoop();
