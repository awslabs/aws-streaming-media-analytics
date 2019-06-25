import React, { Component } from "react";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import './css/VideoPlayer.css';

export default class AllVideos extends Component {

    static defaultProps = {
        videos: [],
    }

    renderStats = (post) => {
  //  console.log("In post :%j",post);

        return (

        <ListItem key={post.id} className="listitem">
          <Avatar>{post.total_views}</Avatar>
          <ListItemText primary={post.id}/>
        </ListItem>
        );
    }

    render() {
        const { videos } = this.props;
        //console.log("In AllVideos.render");

        return (
        <List className="listroot" dense divider="true">
            {[].concat(videos).sort((a, b) => b.total_views - a.total_views).map(this.renderStats)}
        </List>

        );
    }

    componentWillMount(){
      this.props.subscribeToNewVideos();
    }

    _unsubscribe() {
      console.log("In GetVideo.unsubscribe");
      this.subscribeToNewVideos && this.subscribeToNewVideos.unsubscribe();
    }

    componentWillUnmount() {
      this._unsubscribe();
    }
}
