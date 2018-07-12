/*
 * index.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const superagent = require('superagent');

const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

import { OAuthService } from './service/oauth.service';
import { FacternService } from './service/factern.service';
import { Schema } from './graphql/schema';
import { CompanyTypedef } from './graphql/typedefs/company.typedef';

export async function main() {
  ['FACTERN_LOGIN_ID', 'OAUTH_CLIENT_ID', 'OAUTH_CLIENT_SECRET', 'COMPANY_HOUSE_KEY'].forEach(key => {
    if(!(key in process.env)) {
      console.log(`Missing required environment variable: ${key}`);
      process.exit(0)
    }
  });

  const loginId: string = '' + process.env.FACTERN_LOGIN_ID;
  const oauthClientId: string = '' + process.env.OAUTH_CLIENT_ID;
  const oauthClientSecret: string = '' + process.env.OAUTH_CLIENT_SECRET;
  const companyHouseKey: string = '' + process.env.COMPANY_HOUSE_KEY;

  const auth: OAuthService = new OAuthService(oauthClientId, oauthClientSecret);
  const facternService: FacternService = new FacternService(loginId, await auth.accessToken(), companyHouseKey);
  await facternService.precache([
    ['field', 'erchl-extfield-201805141453'],
    ['field', 'erchl-company-comment-201805141453'],
    ['template', 'erchl-template-201805111201'],
    ['template', 'erchl-company-comment-template-201805111201'],
    ['interface', 'erchl-company-details-interface-201805311560'],
    ['field', 'erchl-companyprofile-201805311559'],
    ['template', 'erchl-company-profile-template-201805311559']
  ]);
  await facternService.standardPrecache();
  const containerNode = await facternService.getServiceContainerNode();
  const interfaceNode = await facternService.getOrCreateInterface();
  const extFieldTypeNode = await facternService.getOrCreateField('erchl-extfield-201805141453', true, interfaceNode);
  const commentFieldTypeNode = await facternService.getOrCreateField('erchl-company-comment-201805141453', true, undefined);
  const templateNode = await facternService.getOrCreateTemplate('erchl-template-201805111201', extFieldTypeNode);
  const commentTemplateNode = await facternService.getOrCreateTemplate('erchl-company-comment-template-201805111201', extFieldTypeNode);

  const companyDetailsInterfaceNode = await facternService.getOrCreateCompanyInterface('erchl-company-details-interface-201805311560');
  const companyProfileFieldTypeNode = await facternService.getOrCreateField('erchl-companyprofile-201805311559', true, companyDetailsInterfaceNode);
  const companyProfileTemplateNode = await facternService.getOrCreateTemplate('erchl-company-profile-template-201805311559', companyProfileFieldTypeNode);

  const schema: Schema = new Schema(new CompanyTypedef());

  // Initialize the app
  const app = express();
  app.use(cors());

  app.post('/profile', bodyParser.json(), (req: any, res: any) => {
    superagent
      .post('https://api.factern.com/v2/describe')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + req.body.accessToken)
      .send({})
      .then((idRes: any) => {
        res.send(JSON.parse(idRes.text));
      }).catch((err: Error) => {
        console.error(err);
        res.end();
      });
  });

  // The GraphQL endpoint
  app.use('/graphql', bodyParser.json(), graphqlExpress((request: any) => ({
    context: {
      facternService: facternService,
      containerNode: containerNode,
      interfaceNode: interfaceNode,
      templateNode: templateNode,
      commentTemplateNode: commentTemplateNode,
      companyDetailsInterfaceNode: companyDetailsInterfaceNode,
      companyProfileTemplateNode: companyProfileTemplateNode,
      authorization: request.headers.authorization,
      loginId: request.headers['x-factern-login']
    },
    schema: schema.executableSchema
  })));

  // GraphiQL, a visual editor for queries
  app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

  // finally we return a promise to get our app running locally
  return new Promise((resolve, reject) => {
    const server = app.listen(3000, () => {
      console.log('Go to http://localhost:3000/graphiql to run queries!');
      resolve(server);
    }).on('error', (err: Error) => {
      reject(err);
    });
  });
}

main();
