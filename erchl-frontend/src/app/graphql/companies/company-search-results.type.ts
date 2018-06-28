/*
 * company-search-results.type.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { CompanyList } from './company-list.type';

export interface CompanySearchResults {
  companies: CompanyList;
}
