import gql from 'graphql-tag';

export default gql`
subscription NewActiveUser {
newUser {
    __typename
    id
    count
}
}`;
