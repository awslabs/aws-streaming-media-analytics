import {
  graphql,
  compose
} from 'react-apollo';
import ActiveUser from "./ActiveUser";
import GetActiveUserQuery from '../Queries/GetActiveUserQuery';
import ActiveUserSubscription from '../Queries/ActiveUserSubscription';

export const SubscribeActiveUser = compose(
  graphql(GetActiveUserQuery, {
    options: (props) => ({
      fetchPolicy: 'cache-and-network',
      variables: {
        id: 'recent'
      },
    }),
    props: (props) =>
        ({
        user: props.data.getActiveUser,
        // START - NEW PROP :
        subscribeToUsers: params => {
          props.data.subscribeToMore({
            document: ActiveUserSubscription,
            // variables: {
            //   id: 'recent'
            // },
            updateQuery: (prev, {
              subscriptionData: {
                data: {
                  newUser
                }
              }
            }) => ({
              // ...prev,
              // getActiveUser: {
                newUser
              // }
            })
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
)(ActiveUser);
