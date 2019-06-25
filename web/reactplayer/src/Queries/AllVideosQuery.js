import gql from 'graphql-tag';

export default gql`
query AllVideos {
    allVideo {
        videos {
            __typename
            id
            recent_views
            total_views
        }
    }
}`;
