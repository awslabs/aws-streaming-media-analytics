import React from 'react';

//import player library and QoS SDK
import videojs from 'video.js';
import {SDK} from '../sdk/QoSSDK';
import {Utils} from '../sdk/videojs/utils';

//import material UI components
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import InputAdornment from '@material-ui/core/InputAdornment';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

//import custom user interface definitions
import SampleVideos from './SampleVideos';
import {SubscribeVideo} from './SubscribeVideo';
import {PopularVideos} from './PopularVideos';
import {SubscribeActiveUser} from './SubscribeActiveUser';

//import styling
import './css/VideoPlayer.css';

export default class VideoJSPlayer extends React.Component {

  constructor(props) {
    super(props);
    // console.log(props);
    this.state = {
      videoUrl: '',
      trails: [],
      videoid: ''
    };
    // console.log("In VideoJSPlayer.constructor.this :",this);

    this.getVideoId = this.getVideoId.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addTrail = this.addTrail.bind(this);
  }

  componentWillMount(){
    window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;
  }

  //called when the component is mounted
  componentDidMount() {

    //initialize the QoS SDK
    var sdk = new SDK(this);
    this.sdk = sdk;
    var utils = new Utils();

    //initialize user
    sdk.getUser();

    // instantiate Video.js
    this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
      // console.log('onPlayerReady', this);
    });

    //-----Capturing Events for SDK-----

    //fired when video is played
    this.player.on('play', function() {
      sdk.play(utils.getPlaylistType(this));
    });

    //Fired when the user agent begins looking for the media
    this.player.on('loadstart', sdk.loadStarted);

    //fired when the metadata,first frame info of the media is available
    this.player.on('loadeddata', function() {
      // console.log("In loadeddata :", this);
      let segmentInfo = utils.getSegmentInfo(this);
      sdk.loadeddata(this.duration(), utils.getPackageType(this), this.tech_.hls.playlists.media_.attributes, segmentInfo.cdn_request_id, segmentInfo.rtt);
    });

    //fired when the player is waiting for buffer to fill in
    this.player.on('waiting', function() {
      sdk.buffering(this.currentTime());
    });

    //fired once the player has estimated that it has enough media in the buffer to //start playback
    this.player.on('canplaythrough', function() {
      // console.log("In canplaythrough ",this);
      let segmentInfo = utils.getSegmentInfo(this);
      // console.log("Segment Info :",segmentInfo);
      sdk.bufferCompleted(segmentInfo.cdn_request_id, segmentInfo.rtt);
    });

    //fired every few milli seconds as play back position changes
    this.player.on('timeupdate', function() {
      var intPlayedTime = parseInt(this.currentTime(), 10);
      let everyFiveSec = intPlayedTime % 5 === 0 && intPlayedTime !== 0;

      //process it only every 5 seconds.
      if (everyFiveSec) {
        let segmentInfo = utils.getSegmentInfo(this);
        // console.log("In timeupdate ",this.tech_.hls.playlists.media_.segments);
        sdk.timeUpdate(this.currentTime(),this.duration(), segmentInfo.cdn_request_id,segmentInfo.rtt);
      }
    });

    this.player.on('seeking', sdk.seeking);
    this.player.on('seeked', function() {
      let segmentInfo = utils.getSegmentInfo(this);
      sdk.seeked(this.currentTime(),segmentInfo.cdn_request_id,segmentInfo.rtt);
    });

    //fired when there is a switch in bitrate
    this.player.on('mediachange', function(event) {
      console.log("In mediachange :", this);
      sdk.step(this.tech_.hls.playlists.media_.attributes, utils.getPackageType(this), this.currentTime());
    });

    //fired when video.js player encounters an 'error'
    this.player.on('error', function(err) {
      let segmentInfo = utils.getSegmentInfo(this);
      sdk.errorOccured(this.currentTime(), segmentInfo.cdn_request_id, err);
    });

    //fired when video is paused.
    this.player.on('pause', sdk.pause);

    //fired when playback has finished
    this.player.on('ended', function() {
      sdk.ended(this.currentTime(), this.duration());
    });

    //
    // this.player.on('playing',function(){
    //   // console.log("In playing ",this);
    // });
    // this.player.on('progress', function(event) {
    //   // console.log("In progress ",this);
    // });
  }

  //-----Show activities in 'Metric Captured' component
  addTrail(message, at) {
    // console.log("In addTrail : %s %s",message,at);
    this.setState(oldState => ({
      trails: [{
        message: message,
        at: at
      }, ...oldState.trails],
    }));
  }

  getVideoId(url) {
    var tempArray = url.split("/");
    var tempVideoName = tempArray[tempArray.length - 1].split(".")[0];
    return tempVideoName;
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  handleChange(e) {
    console.log("In VideoJSPlayer.handleChange ",e.target.value);
    this.setState({
      videoUrl: e.target.value
    });
  }

  onPlay(e) {
    // console.log("In play",e);
    //if player is not initialized yet, do nothing
    if(!this.player)return;

    let videoUrl = this.state.videoUrl;

    if (videoUrl) {
      //for dash packaging
      if (videoUrl.endsWith(".mpd")) {
        this.player.src({
          src: videoUrl,
          type: 'application/dash+xml'
        });
      } else {
        this.player.src(videoUrl);
      }

      var videoId = this.getVideoId(this.player.src());
      // console.log("videoid ",videoId);
      this.setState(oldState => ({
        trails: [],
        videoid: videoId
      }));
      this.sdk.initialize(videoId);
      this.player.play();
    }
  }

  onPause(e) {
    // console.log("In pause");
    this.player.pause();
  }
  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {

    return (
      <React.Fragment>

        <Grid item xs={6} className="videoelement">
        <Card>
            <div data-vjs-player>
              <video ref={ node => this.videoNode = node } className="video-js"></video>
            </div>
            <Input id="video_url" value={this.state.videoUrl} onChange={this.handleChange} className="videourl" startAdornment={<InputAdornment position="start">URL:</InputAdornment>}/>
            <CardActions>
            <Button variant="contained" color="primary" onClick={this.onPlay}>
              Play
            </Button>
            <Button variant="contained" color="primary" onClick={this.onPause}>
              Pause
            </Button>
            <SubscribeVideo videoid={this.state.videoid}/>
            </CardActions>
        </Card>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">Sample Videos</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
              <SampleVideos {...this}/>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        </Grid>
        <Grid item xs={6}>
        <ExpansionPanel defaultExpanded>s
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">Active Users</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className="activeuser">
            <SubscribeActiveUser />
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">Popular Videos (total views)</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <PopularVideos />
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">Metrics Captured</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <List className="listroot">
              {this.state.trails.map((trail,index) => this.renderTrail(trail,index))}
            </List>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        </Grid>
        </React.Fragment>
    )
  }

  renderTrail(trail,index){
  //  console.log("trail ",trail.uniqueId);
    return (
        <ListItem key={index} dense divider>
          <ListItemText primary={trail.message+' '+trail.at}/>
        </ListItem>
    );
  }
}
