import React, { Component } from "react";
import FormLabel from '@material-ui/core/FormLabel';
import './css/VideoPlayer.css';

export default class GetVideo extends Component {

constructor(props) {
  super(props);
  //console.log("In GetVideo.constructor :", props);
  this.state = {
    videoid: ''
  }
}

static defaultProps = {
  video: {},
}

_unsubscribe() {
  //console.log("In GetVideo.unsubscribe");
  this.subscribeToGetVideo && this.subscribeToGetVideo.unsubscribe();
}

componentWillUnmount() {
  //console.log("In GetVideo.componentWillUnmount");
  this._unsubscribe();
}

componentDidMount() {
  //console.log("In GetVideo.componentDidMount");
  //this.props.dataRefetch(this.state.videoid);
}

componentDidUpdate(prevProps) {
  // Typical usage (don't forget to compare props):
  //console.log("In GetVideo.componentDidUpdate.prevProps ",prevProps);
  //console.log("In GetVideo.componentDidUpdate.props ",this.props);

  if (this.props.videoid !== prevProps.videoid) {
    this._unsubscribe();
  }
}

render() {
  const { video } = this.props;
  //console.log("In GetVideo.render :",this.props);

    if(video && video.id){
      return (
            <FormLabel>#People watching: {video.recent_views}</FormLabel>
      )
    }
    else{
      return ('')
    }
  }
}
