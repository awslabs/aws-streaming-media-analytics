import {
  graphql,
  compose
} from 'react-apollo';
import GetVideo from "./GetVideo";
import GetVideoQuery from '../Queries/GetVideoQuery';
import GetVideoSubscription from '../Queries/GetVideoSubscription';

export const SubscribeVideo = compose(
  graphql(GetVideoQuery, {
    options: (props) => ({
      fetchPolicy: 'cache-and-network',
      variables: {
        id: props.videoid
      },
    }),
    props: (props) =>
        ({
        video: props.data.getVideo,
        // START - NEW PROP :
        subscribeToGetVideo: params => {
          props.data.subscribeToMore({
            document: GetVideoSubscription,
            variables: {
              id: this.props.videoid
            },
            updateQuery: (prev, {
              subscriptionData: {
                data: {
                  newVideo
                }
              }
            }) => ({
              newVideo
            })
            // {
            //   return newVideo;
            // }
          });
        },
        // dataRefetch: (videoid) => {
        //   props.data.refetch({
        //     id: videoid
        //   })
        // },
        // END - NEW PROP
      })
  })
)(GetVideo);
