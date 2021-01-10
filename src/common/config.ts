class Config {
  host = process.env.REACT_APP_HOST || 'http://localhost:3000';
  isDev = process.env.NODE_ENV !== 'production';
  stage = process.env.STAGE || 'dev';
  apiUrl = process.env.REACT_APP_API_URL || 'https://rewarder-api-gateway-prod.cycler.cc/graphql';
  wsUrl = process.env.REACT_APP_WS_URL || 'wss://rewarder-staging.herokuapp.com/graphql';
  auth = {
    domain: 'rewarder.eu.auth0.com',
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || 'BDNB7kOtnhg1cnOTukKWuyZl4kksS1eP',
    redirectUri: this.host,
    responseType: 'token id_token',
    scope: 'openid email profile',
    audience: 'rewarder-api',
    useRefreshTokens: true,
    customClaimNamespace: 'https://custom-claims.cycler.cc'
  };
  todoist = {
    clientId: process.env.REACT_APP_TODOIST_CLIENT_ID || 'c2620bca88914009852a7efa297317e8',
    scope: 'data:read'
  };
  firebase = {
    config: JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || '{}'),
    vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
  };
  sentry = {
    dsn: process.env.REACT_APP_SENTRY_DSN
  };
  ably = {
    apiKey: process.env.REACT_APP_ABLY_API_KEY!
  };
}

export const config = new Config();
