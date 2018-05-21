
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
