/*
 * company-profile.model.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import gql from 'graphql-tag';

export const CompanyProfileSearchQL = gql`
  query CompanyProfileSearch($company_number: String!) {
    companyDetails(company_number: $company_number) {
      company_name
      company_number
      status
      facternNodeId
      commentThread {
        count
        comments {
          id
          text
          owner
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
`;
