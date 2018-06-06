
const FacternClient = require('factern_api_version_2/dist/factern-client-bundle');

import { OAuthService } from '../service/oauth.service';

export interface CommentThreadResponse {
    count: number;
    comments: CommentThreadResponse[];
}

export class FacternService {

    private loginId: string;
    private companyHouseKey: string;

    private readonly FRN_DATAROOT = 'frn:entity::factern-dataRoot';
    private readonly FRN_ENTITY_PREFIX = 'frn:entity::';
    private readonly ApiClient = FacternClient.ApiClient.instance;
    private readonly FactsApi = new FacternClient.FactsApi();
    private readonly OAuth2 = this.ApiClient.authentications['OAuth2'];

    private readonly NAMED_ENTITY_SERVICE = 'erchl-service-201806051014';
    private readonly NAMED_ENTITY_PREFIX_COMPANY = 'erchl-company-201806051014-';
    private readonly NAMED_FIELDTYPE_COMMENT = 'erchl-company-comment-field-201806051014';
    private readonly NAMED_TEMPLATE_COMMENT = 'erchl-company-comment-template-201806051014';
    private readonly NAMED_INTERFACE_COMPANIES = 'erchl-interface-companies-201806051014';

    public constructor(loginId: string, accessToken: string, companyHouseKey: string) {
      this.OAuth2.accessToken = accessToken;
      this.loginId = loginId;
      this.companyHouseKey = companyHouseKey;
    }

    get namedEntityPrefix() {
        return this.NAMED_ENTITY_PREFIX_COMPANY;
    }

    public async getOrCreateTemplate(name: string, fieldId: string) {
        return (await this.describeByName('template', name))
            || (await this.createTemplate(name, fieldId));
    }

    public async createTemplate(name: string, fieldId: string) {
        try {
            const templateResponse = await this.FactsApi.createTemplate({
                login: this.loginId,
                representing: this.loginId,
                body: {
                    name: name,
                    memberIds: [
                        fieldId
                    ]
                }
            });
            return templateResponse.data.nodeId;
        } catch (err) {
            console.log(err);
            return;
        }
    }

    public async templateRead(nodeId: string, templateId: string, defaultStorageId: string, query: string, items: number = 20, start: number = 0) {
        try {
            const templateReadResponse = await this.FactsApi.read({
                login: this.loginId,
                representing: this.loginId,
                body: {
                    nodeId: nodeId,
                    templateId: templateId,
                    defaultStorageId: defaultStorageId,
                    parameters: [
                        { key: 'query', value: query, persistent: false },
                        { key: 'items', value: items, persistent: false },
                        { key: 'start', value: start, persistent: false }
                    ]
                }
            });
            return templateReadResponse.data.items[0].readItem.data;
        } catch (err) {
            console.log(err);
            return;
        }
    }

    public async getServiceContainerNode() {
        return await this.getOrCreateNamedEntity(this.NAMED_ENTITY_SERVICE);
    }

    public async getOrCreateField(name: string, isUniqueByParent: boolean, storageId: string | undefined) {
        return await this.describeByName('field', name) || (await this.createField(name, isUniqueByParent, storageId));
    }

    public async createField(name: string, isUniqueByParent: boolean, storageId: string | undefined) {
        try {
            const createFieldResponse = await this.FactsApi.createField({
                login: this.loginId,
                representing: this.loginId,
                body: {
                    parentId: this.FRN_DATAROOT,
                    name: name,
                    uniqueByParent: isUniqueByParent,
                    searchable: false,
                    branch: false,
                    storageId: storageId
                }
            });
            return createFieldResponse.data.nodeId;
        } catch (err) {
            console.log(err);
            return;
        }
    }

    public async getOrCreateInterface() {
        const name = this.NAMED_INTERFACE_COMPANIES;
        return (await this.describeByName('interface', name))
            || (await this.createInterface(name));
    }

    public async createInterface(name: string) {
        try {
            const createInterfaceResponse = await this.FactsApi.createInterface({
                login: this.loginId,
                representing: this.loginId,
                body: {
                    name: name,
                    addData: {
                        url: 'https://api.companieshouse.gov.uk/search/companies',
                        method: 'GET',
                        async: false,
                    },
                    getData: {
                        url: 'https://api.companieshouse.gov.uk/search/companies?q={{query}}&items_per_page={{items}}&start_index={{start}}',
                        method: 'GET',
                        headers: [{
                            key: 'Authorization',
                            value: 'Basic ' + this.companyHouseKey
                        }],
                        async: false,
                    },
                    deleteData: {
                        url: 'https://api.companieshouse.gov.uk/search/companies',
                        method: 'GET',
                        async: false,
                    }
                }
            });
            return createInterfaceResponse.data.nodeId;
        } catch(err) {
            console.log(err);
            return;
        }
    }

    public async getOrCreateNamedEntity(name: string) {
        let response;
        try {
            const describeResponse = await this.FactsApi.describe({
                login: this.loginId,
                representing: this.loginId,
                body: new FacternClient.DescribeRequest(this.FRN_ENTITY_PREFIX + name)
            });
            response = describeResponse.data.node.nodeId;
        } catch(err) {
            const createResponse = await this.createNamedEntity(name);
            response = createResponse.data.nodeId;
        }

        return response;
    }

    public async describeByName(type: string, name: string) {
        try {
            const describeResponse = await this.FactsApi.describe({
                login: this.loginId,
                representing: this.loginId,
                body: new FacternClient.DescribeRequest('frn:' + type + '::' + name)
            });
            return describeResponse.data.node.nodeId;
        } catch (err) {
            return;
        }
    }

    public async createNamedEntity(name: string) {
        return await this.FactsApi.createEntity({
            login: this.loginId,
            representing: this.loginId,
            body: {
                parentId: this.FRN_DATAROOT,
                name: name
            }
        });
    }

    public async writeInformation(entityId: string, templateId: string, data: string) {
        return await this.FactsApi.write({
            login: this.loginId,
            representing: this.loginId,
            body: {
                nodeId: entityId,
                templateId: templateId,
                values: [ data ]
            }
        });
    }

    public async read(nodeId: string, templateId: string) {
        return await this.FactsApi.read({
            login: this.loginId,
            representing: this.loginId,
            body: {
                nodeId: nodeId,
                templateId: templateId
            }
        });
    }

    public async addCommentToCompany(company_number: string, comment: string) {
        const companyEntity = await this.getOrCreateNamedEntity(this.NAMED_ENTITY_PREFIX_COMPANY + company_number);
        const commentField = await this.getOrCreateField(this.NAMED_FIELDTYPE_COMMENT, false, undefined);
        const templateId = await this.getOrCreateTemplate(this.NAMED_TEMPLATE_COMMENT, commentField);
        const response = await this.writeInformation(companyEntity, templateId, comment);
        return response.data.nodes[0].nodeId;
    }

    public async addResponseToComment(commentId: string, comment: string) {
        const commentField = await this.getOrCreateField(this.NAMED_FIELDTYPE_COMMENT, false, undefined);
        const templateId = await this.getOrCreateTemplate(this.NAMED_TEMPLATE_COMMENT, commentField);
        const response = await this.writeInformation(commentId, templateId, comment);
        return response.data.nodes[0].nodeId;
    }

    public async readCommentThread(company_number: string): Promise<CommentThreadResponse> {
        const companyEntity = await this.getOrCreateNamedEntity(company_number);
        const commentField = await this.getOrCreateField(this.NAMED_FIELDTYPE_COMMENT, false, undefined);
        const templateId = await this.getOrCreateTemplate(this.NAMED_TEMPLATE_COMMENT, commentField);
        const response = await this.read(companyEntity, templateId);
        const readItem = response.data.items[0].readItem.nodes;
        let comments: any[] = [];
        for (let i = 0; i < readItem.length; ++i) {
            comments.push({
                id: readItem[i].nodeId,
                text: readItem[i].data
            });
        }
        return {
          count: readItem.length,
          comments: comments
        };
    }

    public async readResponseThread(commentId: string): Promise<CommentThreadResponse> {
        const commentField = await this.getOrCreateField(this.NAMED_FIELDTYPE_COMMENT, false, undefined);
        const templateId = await this.getOrCreateTemplate(this.NAMED_TEMPLATE_COMMENT, commentField);
        const response = await this.read(commentId, templateId);
        const readItem = response.data.items[0].readItem.nodes;
        let comments: any[] = [];
        for (let i = 0; i < readItem.length; ++i) {
            comments.push({
                id: readItem[i].nodeId,
                text: readItem[i].data
            });
        }
        return {
          count: readItem.length,
          comments: comments
        };
    }
}
