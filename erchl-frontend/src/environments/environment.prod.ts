/*
 * environment.prod.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

export const environment = {
  production: true,
  auth: {
    clientId: 'OAUTH_CLIENT_ID',
    domain: 'factern-test.eu.auth0.com',
    responseType: 'token id_token',
    audience: 'https://api.factern.com',
    redirect: 'http://localhost:4200/callback',
    scope: 'openid profile email'
  }
};
