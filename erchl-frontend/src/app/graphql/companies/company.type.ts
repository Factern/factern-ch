/*
 * company.type.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { CommentThread } from './comment-thread.type';

export interface Company {
  company_number: string;
  company_status: string;
  company_type: string;
  description: string;
  kind: string;
  title: string;
  facternNodeId: string;
  commentThread: CommentThread;
}
