
const superagent = require('superagent');

export class OAuthService {

  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async accessToken() {
    return (await this.credentials()).body.access_token;
  }

  async credentials() {
    return await superagent
      .post('https://factern-test.eu.auth0.com/oauth/token')
      .set('Content-Type', 'application/json')
      .send({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: "https://api.factern.com",
        grant_type: "client_credentials"
      });
  }

}
