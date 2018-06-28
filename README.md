Factern Demo over Companies House using GraphQL and GraphiQL
============================================================

## What is this repository for?

Our Demo provides a portal for querying of companies available on Companies House, with the ability to add and respond
to comments on particular companies.

The front-end is strictly GraphiQL, and runs against production Factern.

## What do you need?

- Clone and build this repo
- Sign-up for a Factern login. See http://docs.factern.net/users-guide/ for acquiring a clientId, clientSecret and loginId.
- Sign-up with Companies House to get an API key. I would recommend starting with https://developer.companieshouse.gov.uk/api/docs/.

## To build:

 - npm install
 - npm run-script build

## To run:

### Environment Variables

Some environment variables are required to define your configuration:

    export FACTERN_LOGIN_ID='YOUR_FACTERN_LOGIN_ID'
    export OAUTH_CLIENT_ID='YOUR_OAUTH_CLIENT_ID'
    export OAUTH_CLIENT_SECRET='YOUR_OAUTH_CLIENT_SECRET'
    export COMPANY_HOUSE_KEY='YOUR_COMPANY_HOUSE_KEY'

Note that Companies House uses Basic access authentication with the API key treated as the user and the password
left blank. Hence, you will need to take your API key, suffix it with ':', and provide the base64 encoding of
this result to Factern as YOUR_COMPANY_HOUSE_KEY. 

### Start

 - npm start

## Frontend:

In another terminal in the erchl-frontend directory with the same environment variables set

 - npm install
 - npm run-script replace-vars
 - npm start

## To use:

 - open http://localhost:4200/ in your browser

