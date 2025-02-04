import { setContext } from '@apollo/client/link/context';
import { auth0Client } from '../common/auth0';
import { config } from '../common/config';
import { RetryLink } from '@apollo/client/link/retry';
import { ApolloLink } from '@apollo/client/link/core';
import { HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { OperationDefinitionNode } from 'graphql/language';
import { getTimezone } from '../helpers/date';
import { appInstanceId } from '../hooks/useOnUpdate';

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      return error.statusCode >= 500;
    }
  }
});

const headersResolverLink = setContext(async (_, { headers }) => {
  const token = await auth0Client.getTokenSilently();
  const timezone = getTimezone();

  return {
    headers: {
      ...headers,
      Authorization: token,
      timezone,
      appInstanceId
    }
  };
});

export const uriResolverLink = new ApolloLink((operation, forward) => {
  const { operationName, query } = operation;
  const definition = getMainDefinition(query);

  const isNeedWarmApi = ['GetEntriesByDay', 'GetEntriesByOneDay'].includes(definition.name?.value!);

  const uri = isNeedWarmApi ? config.warmApiUrl + '/graphql' : config.apiUrl + '/graphql';

  const queryType = query.definitions.find(
    (d) => d.kind === 'OperationDefinition'
  ) as OperationDefinitionNode;

  operation.setContext(() => ({
    uri: `${uri}?${queryType?.operation[0]}=${operationName}`
  }));

  return forward(operation);
});

export const link = ApolloLink.from([
  retryLink,
  headersResolverLink,
  uriResolverLink,
  new HttpLink()
]);
