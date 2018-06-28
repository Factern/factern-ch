/*
 * company-search.model.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import gql from 'graphql-tag';

export const CompanySearchQL = gql`
  query CompanySearch($name: String!) {
    companies(query: $name) {
      items {
        company_number
        title
        description
        company_status
        company_type
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
`;
