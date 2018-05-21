Factern Demo over Companies House using GraphQL and GraphiQL
==========================================================

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
 - npm install http://download.factern.net/javascript/factern-api-js.tgz
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

## To use:
 - open http://localhost:3000/graphiql
 - enter a query, for example:

```
query {
  companies(query:"pizza", items: 20, start:0) {
    total_results
    items {
      company_number
      title
      description
      facternNodeId
    }
  }
}
```

  - add a comment:

```
mutation {
  addComment(number: "08563679", comment: "I love this pizza!")
}
```

  - query with comments:

```
query {
  companies(query:"pizza", items: 20, start:0) {
    total_results
    items {
      company_number
      title
      description
      facternNodeId
      commentThread {
        count
        comments {
          id
          text
        }
      }
    }
  }
}
```

You will see the comment id and text.

  - respond to a comment:

Use the comment id from the previous comment to add a response to the comment.

```
mutation {
  respondToComment(
    commentId: "<provide_your_comment_id>"
    comment: "I agree")
}
```
  - query with comments and responses:

```
query {
  companies(query:"pizza", items: 20, start:0) {
    total_results
    items {
      company_number
      title
      description
      facternNodeId
      commentThread {
        count
        comments {
          id
          text
          responseThread {
            count
            comments {
              id
              text
            }
          }
        }
      }
    }
  }
}
```
