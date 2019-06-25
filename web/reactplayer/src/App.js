import AWSAppSyncClient from "aws-appsync";
import { Rehydrated } from 'aws-appsync-react';
import { AUTH_TYPE } from "aws-appsync/lib/link/auth-link";
import { ApolloProvider } from 'react-apollo';
import React, { Component } from 'react';
import VideoJSPlayer from "./Components/VideoJSPlayer";
import Grid from '@material-ui/core/Grid';
import AppBar from './Components/AppBar';
import AppSync from './sdk/aws-exports.js';
import AWSConnector from './sdk/AWSConnector';
import './App.css';

const client = new AWSAppSyncClient({
    url: AppSync.graphqlEndpoint,
    region: AppSync.aws.region,
    auth: {
        type: AUTH_TYPE.AWS_IAM,
        credentials: () => AWSConnector.getCredentials(),
        // apiKey: AppSync.apiKey,
    },
});

const videoJsOptions = {
    controls: true,
    width: 620,
    height: 348,
    preload: "auto",
    autoplay: true,
    //following added for Safari support
    html5: {
      hls: {
        overrideNative: true
      }
    }
};

class App extends Component {
    render() {
        return (
          <div className="gridroot">
     <Grid container>
       <Grid container item xs={12}>
        <AppBar />
       </Grid>
       <Grid container item xs={12}>
         <VideoJSPlayer {...videoJsOptions} />
       </Grid>
     </Grid>
   </div>
      );
    }
}

const WithProvider = () => (
    <ApolloProvider client={client}>
      <Rehydrated>
        <App />
      </Rehydrated>
    </ApolloProvider>
);

export default WithProvider;
