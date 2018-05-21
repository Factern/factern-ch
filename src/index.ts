
const express = require('express');
const bodyParser = require('body-parser');

const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

import { OAuthService } from './service/oauth.service';
import { FacternService } from './service/factern.service';
import { Schema } from './graphql/schema';
import { CompanyTypedef } from './graphql/typedefs/company.typedef';

export async function main() {

  const loginId: string = '' + process.env.FACTERN_LOGIN_ID;
  const oauthClientId: string = '' + process.env.OAUTH_CLIENT_ID;
  const oauthClientSecret: string = '' + process.env.OAUTH_CLIENT_SECRET;
  const companyHouseKey: string = '' + process.env.COMPANY_HOUSE_KEY;

  const auth: OAuthService = new OAuthService(oauthClientId, oauthClientSecret);
  const facternService: FacternService = new FacternService(loginId, await auth.accessToken(), companyHouseKey);
  const containerNode = await facternService.getServiceContainerNode();
  const interfaceNode = await facternService.getOrCreateInterface();
  const extFieldTypeNode = await facternService.getOrCreateField('erchl-extfield-201805141453', true, interfaceNode);
  const commentFieldTypeNode = await facternService.getOrCreateField('erchl-company-comment-201805141453', true, undefined);
  const templateNode = await facternService.getOrCreateTemplate('erchl-template-201805111200', extFieldTypeNode);
  const commentTemplateNode = await facternService.getOrCreateTemplate('erchl-company-comment-template-201805111200', extFieldTypeNode);

  const schema: Schema = new Schema(new CompanyTypedef());

  // Initialize the app
  const app = express();

  // The GraphQL endpoint
  app.use('/graphql', bodyParser.json(), graphqlExpress({
    context: {
      facternService: facternService,
      containerNode: containerNode,
      interfaceNode: interfaceNode,
      templateNode: templateNode,
      commentTemplateNode: commentTemplateNode
    },
    schema: schema.executableSchema
  }));

  // GraphiQL, a visual editor for queries
  app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

  // finally we return a promise to get our app running locally
  return new Promise((resolve, reject) => {
    const server = app.listen(3000, () => {
      console.log('Go to http://localhost:3000/graphiql to run queries!');
      resolve(server);
    }).on("error", (err: Error) => {
      reject(err);
    });
  });
}

main();
