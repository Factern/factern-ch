/*
 * schema.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { GraphQLSchema } from 'graphql';

import { CompanyTypedef } from './typedefs';

export class Schema {

    private readonly companyTypeDef: CompanyTypedef;

    constructor(companyTypeDef: CompanyTypedef) {
        this.companyTypeDef = companyTypeDef;
    }

    get executableSchema(): GraphQLSchema {
        return new GraphQLSchema({
            query: this.companyTypeDef.rootQueryDefinition,
            mutation: this.companyTypeDef.rootMutationDefinition
        });
    }
}
