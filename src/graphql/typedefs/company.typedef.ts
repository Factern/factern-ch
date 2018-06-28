/*
 * company.typedef.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLList } from 'graphql';

export class CompanyTypedef {

  get rootQueryDefinition() {
    return this.rootQuery;
  }

  get rootMutationDefinition() {
    return this.rootMutation;
  }

  get companyDefinition() {
    return this.companyType;
  }

  private readonly addressType = new GraphQLObjectType({
    name: 'Address',
    description: 'The address of the company\'s registered office.',

    fields: () => ({
      address_line_1: {
        type: GraphQLString,
        description: 'The first line of the address.'
      },
      address_line_2: {
        type: GraphQLString,
        description: 'The second line of the address.'
      },
      care_of: {
        type: GraphQLString,
        description: 'The care of name.'
      },
      country: {
        type: GraphQLString,
        description: 'The country.  Possible values: (Wales, England, Scotland, Great Britain, Not specified, United Kingdom, Northern Ireland)'
      },
      locality: {
        type: GraphQLString,
        description: 'The locality e.g London.'
      },
      po_box: {
        type: GraphQLString,
        description: 'The post-office box number.'
      },
      postal_code: {
        type: GraphQLString,
        description: 'The postal code e.g CF14 3UZ.'
      },
      region: {
        type: GraphQLString,
        description: 'The region e.g Surrey.'
      },
      address_snippet: {
        type: GraphQLString,
        description: 'A single line address.  This will be the address that matched within the indexed document, or the primary address otherwise (as returned by the address member)'
      }
    })
  });

  private readonly companyProfileType = new GraphQLObjectType({
    name: 'CompanyProfile',
    description: '',

    fields: () => ({
      company_name: {
        type: GraphQLString,
        description: 'The name of the company.'
      },
      company_number: {
        type: GraphQLString,
        description: 'The company registration / incorporation number of the company.'
      },
      status: {
        type: GraphQLString,
        description: 'Status of the company. (active, dissolved, liquidation, receivership, administration, voluntary-arrangement, converted-closed, insolvency-proceedings).'
      },
      facternNodeId: {
        type: GraphQLString,
        description: 'The Factern NodeID where this company information resides.',
        resolve(parent, args, context, info) {
          return context.facternService.getOrCreateNamedEntity(context.facternService.namedEntityPrefix + parent.company_number);
        }
      },
      commentThread: {
        type: this.commentThreadType,
        resolve(parent, args, context, info) {
          return context.facternService.readCommentThread(context.facternService.namedEntityPrefix + parent.company_number, context.loginId, context.authorization);
        }
      }
    })
  });

  private readonly companyType = new GraphQLObjectType({
    name: 'Company',
    description: 'Basic company information retrieved from Companies House',

    fields: () => ({
      company_number: {
        type: GraphQLString,
        description: 'The company registration / incorporation number of the company.'
      },
      company_status: {
        type: GraphQLString,
        description: 'Status of the company. (active, dissolved, liquidation, receivership, administration, voluntary-arrangement, converted-closed, insolvency-proceedings).'
      },
      company_type: {
        type: GraphQLString,
        description: 'The company type.'
      },
      description: {
        type: GraphQLString,
        description: 'The result description.'
      },
      kind: {
        type: GraphQLString,
        description: 'The type of search response returned. Possible values are: (searchresult#company).'
      },
      title: {
        type: GraphQLString,
        description: 'The title of the search result.'
      },
      facternNodeId: {
        type: GraphQLString,
        description: 'The Factern NodeID where this company information resides.',
        resolve(parent, args, context, info) {
          return context.facternService.getOrCreateNamedEntity(context.facternService.namedEntityPrefix + parent.company_number);
        }
      },
      commentThread: {
        type: this.commentThreadType,
        resolve(parent, args, context, info) {
          return context.facternService.readCommentThread(context.facternService.namedEntityPrefix + parent.company_number, context.loginId, context.authorization);
        }
      }
    })
  });

  private readonly companyResults = new GraphQLObjectType({
    name: 'Companies',
    description: '...',
    fields: () => ({
      etag: {
        type: GraphQLString,
        description: 'The ETag of the resource.'
      },
      items_per_page: {
        type: GraphQLInt,
        description: 'The number of search items returned per page.'
      },
      kind: {
        type: GraphQLString,
        description: 'The type of search response returned. Possible values are: (search#companies).'
      },
      start_index: {
        type: GraphQLInt,
        description: 'The index into the entire result set that this result page starts.'
      },
      total_results: {
        type: GraphQLInt,
        description: 'The number of further search results available for the current search.'
      },
      items: {
        type: new GraphQLList(this.companyType),
        description: 'The results of the completed search.'
      }
    })
  });

  private readonly commentType: any = new GraphQLObjectType({
    name: 'CommentResults',
    description: '...',

    fields: () => ({
      id: {
        type: GraphQLString,
        description: 'The id (facternId) of the comment node.'
      },
      text: {
        type: GraphQLString,
        description: 'The text of the comment in the information node.'
      },
      owner: {
        type: GraphQLString
      },
      responseThread: {
        type: this.commentThreadType,
        resolve(parent, args, context, info) {
          return context.facternService.readResponseThread(parent.id, context.loginId, context.authorization);
        }
      }
    })
  });

  private readonly commentThreadType = new GraphQLObjectType({
    name: 'CommentThread',
    description: '...',

    fields: () => ({
      count: {
        type: GraphQLInt
      },
      comments: {
        type: new GraphQLList(this.commentType),
        description: 'Comment',
      }
    })
  });

  private readonly rootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'This is the default root query provided by our application',
    fields: {

      companies: {
        type: this.companyResults,
        description: 'List of companies that match the search criteria.',
        args: {
          query: {
            description: 'The term being searched for.',
            type: new GraphQLNonNull(GraphQLString)
          },
          items: {
            description: 'The number of search results to return per page.',
            type: GraphQLInt,
          },
          start: {
            description: 'The index of the first result item to return.',
            type: GraphQLInt
          }
        },
        resolve(parent, args, context, info) {
          return context.facternService.templateRead(context.containerNode, context.templateNode, context.interfaceNode, args.query, args.items || 20, args.start || 0);
        }
      },

      companyDetails: {
        type: this.companyProfileType,
        description: 'Details about a company by company number.',
        args: {
          company_number: {
            description: 'The company number to retrieve details for.',
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve(parent, args, context, info) {
          return context.facternService.companyDetails(context.containerNode, context.companyProfileTemplateNode, context.companyDetailsInterfaceNode, args.company_number);
        }
      }

    }
  });

  private readonly rootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
    description: 'This is the default root mutation provided by our application',
    fields: {

      companies: {
        type: this.companyResults,
        description: 'List of companies that match the search criteria.',
        args: {
          query: {
            description: 'The term being searched for.',
            type: new GraphQLNonNull(GraphQLString)
          },
          items: {
            description: 'The number of search results to return per page.',
            type: GraphQLInt,
          },
          start: {
            description: 'The index of the first result item to return.',
            type: GraphQLInt
          }
        },
        resolve(parent, args, context, info) {
          return context.facternService.templateRead(context.containerNode, context.templateNode, context.interfaceNode, args.query, args.items || 20, args.start || 0);
        }
      },

      companyDetails: {
        type: this.companyProfileType,
        description: 'Details about a company by company number.',
        args: {
          company_number: {
            description: 'The company number to retrieve details for.',
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve(parent, args, context, info) {
          return context.facternService.companyDetails(context.containerNode, context.companyProfileTemplateNode, context.companyDetailsInterfaceNode, args.company_number);
        }
      },

      addComment: {
        type: GraphQLString,
        description: 'Add a comment to a company record.',
        args: {
          number: {
            description: 'The company number to add the comment to.',
            type: new GraphQLNonNull(GraphQLString)
          },
          comment: {
            description: 'The comment to add.',
            type: new GraphQLNonNull(GraphQLString)
          },
          isPrivate: {
            description: 'True if the comment is private',
            type: new GraphQLNonNull(GraphQLBoolean)
          }
        },
        resolve(parent, args, context, info) {
          return context.facternService.addCommentToCompany(args.number, args.comment, args.isPrivate, context.loginId, context.authorization);
        }
      },

      respondToComment: {
        type: GraphQLString,
        description: 'Add a response to a comment.',
        args: {
          commentId: {
            description: 'The company number to add the comment to.',
            type: new GraphQLNonNull(GraphQLString)
          },
          comment: {
            description: 'The comment to add.',
            type: new GraphQLNonNull(GraphQLString)
          },
          isPrivate: {
            description: 'True if the comment is private',
            type: new GraphQLNonNull(GraphQLBoolean)
          }
        },
        resolve(parent, args, context, info) {
          return context.facternService.addResponseToComment(args.commentId, args.comment, args.isPrivate, context.loginId, context.authorization);
        }
      }

    }
  });
}
