import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FormLabel from '@material-ui/core/FormLabel';

export default class MetricsCaptured extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      trails: [],
    };
    this.addTrail = this.addTrail.bind(this);
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

    renderTrail(trail,index){
    //  console.log("trail ",trail.uniqueId);
      return (
          <ListItem key={index} className="listitem">
            <ListItemText primary={trail.message+' '+trail.at}/>
          </ListItem>
      );
    }

    render() {
      return (
        <React.Fragment>
        <FormLabel>Metrics Captured</FormLabel>
        <List className="listroot">
          {this.state.trails.map((trail,index) => this.renderTrail(trail,index))}
        </List>
        </React.Fragment>
      )
    }
}
