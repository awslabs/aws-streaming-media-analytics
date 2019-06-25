import gql from 'graphql-tag';

export default gql`
subscription GetVideoSub($id: ID!) {
newVideo(id: $id) {
    __typename
    id
    recent_views
    total_views
}
}`;
