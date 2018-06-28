/*
 * company.type.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { CommentThread } from './comment-thread.type';

export interface Comment {
  id: string;
  text: string;
  owner: string;
  responseThread: CommentThread;
}
