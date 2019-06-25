import React, { Component } from "react";
import Typography from '@material-ui/core/Typography';
import './css/VideoPlayer.css';

export default class ActiveUser extends Component {

constructor(props) {
  super(props);
  //console.log("In ActiveUser.constructor :", props);
}

static defaultProps = {
  user: {},
}

_unsubscribe() {
  //console.log("In GetActiveUser.unsubscribe");
  this.subscribeToUsers && this.subscribeToUsers.unsubscribe();
}

componentWillUnmount() {
  //console.log("In GetActiveUser.componentWillUnmount");
  this._unsubscribe();
}

componentWillMount() {
  //console.log("In GetActiveUser.componentWillMount ",this);
  this.props.subscribeToUsers();
  //this.props.dataRefetch(this.state.videoid);
}

componentDidUpdate(prevProps) {
  // Typical usage (don't forget to compare props):
  //console.log("In GetActiveUser.componentDidUpdate.prevProps ",prevProps);
  //console.log("In GetActiveUser.componentDidUpdate.props ",this.props);

  if (this.props.activeuserid !== prevProps.activeuserid) {
    this._unsubscribe();
  }
}

render() {
  const { user } = this.props;
  //console.log("In GetActiveUser.render :",this.props);

    if(user && user.id){
      return (
            <Typography variant="h1">{user.count}</Typography>
      )
    }
    else{
      return ('')
    }
  }
}
