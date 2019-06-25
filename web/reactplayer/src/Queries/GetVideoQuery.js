import gql from 'graphql-tag';

export default gql`
query GetVideo($id: ID!) {
    getVideo (id: $id){
            __typename
            id
            recent_views
            total_views
        }
}`;
