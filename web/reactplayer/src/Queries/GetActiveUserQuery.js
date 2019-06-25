import gql from 'graphql-tag';

export default gql`
query GetActiveUser($id: ID!) {
      getActiveUser(id: $id) {
            __typename
            id
            count
        }
}`;
