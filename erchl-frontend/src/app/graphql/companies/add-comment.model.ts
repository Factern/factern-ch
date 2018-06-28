/*
 * add-comment.model.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import gql from 'graphql-tag';

export const AddCommentQL = gql`
  mutation AddComment($number: String!, $comment: String!, $isPrivate: Boolean!) {
    addComment(number: $number, comment: $comment, isPrivate: $isPrivate)
  }
`;
