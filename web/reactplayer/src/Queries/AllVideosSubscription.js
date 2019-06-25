import gql from 'graphql-tag';

export default gql`
subscription NewVideoSub {
newVideo {
    __typename
    id
    recent_views
    total_views
}
}`;
