/*
 * add-response.model.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import gql from 'graphql-tag';

export const AddResponseQL = gql`
  mutation AddResponse($commentId: String!, $comment: String!, $isPrivate: Boolean!) {
    respondToComment(commentId: $commentId, comment: $comment, isPrivate: $isPrivate)
  }
`;
