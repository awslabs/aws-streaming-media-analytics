import {
  graphql,
  compose
} from 'react-apollo';
import AllVideos from "./AllVideos";
import AllVideosQuery from '../Queries/AllVideosQuery';
import AllVideosSubscription from '../Queries/AllVideosSubscription';

export const PopularVideos = compose(
  graphql(AllVideosQuery, {
    options: {
      fetchPolicy: 'cache-and-network'
    },
    props: (props) => ({
      videos: props.data.allVideo && props.data.allVideo.videos,
      // START - NEW PROP :
      subscribeToNewVideos: params => {
        props.data.subscribeToMore({
          document: AllVideosSubscription,
          updateQuery: (prev, {
            subscriptionData: {
              data: {
                newVideo
              }
            }
          }) => ({
            ...prev,
            allVideo: {
              videos: [newVideo, ...prev.allVideo.videos.filter(post => post.id !== newVideo.id)],
              __typename: 'PaginatedVideos'
            }
          })
        });
      },
      // END - NEW PROP
    })
  })
)(AllVideos);
