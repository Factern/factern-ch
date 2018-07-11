/*
 * factern.service.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

const FacternClient = require('@factern/factern-client');

import { OAuthService } from '../service/oauth.service';

export interface CommentThreadResponse {
    count: number;
    comments: CommentThreadResponse[];
}

export interface DescribeResponseNode {
    nodeId: string;
    agent: {
        login: string;
    }
}

class DescribeCacheEntry {
    public readonly type: string;
    public readonly name: string;
    public readonly describeResponse: any;
    constructor(type: string, name: string, describeResponse: any) {
        this.type = type;
        this.name = name;
        this.describeResponse = describeResponse;
    }
    public matches(type: string, name: string): boolean {
        return this.type == type && this.name == name;
    }
}

export class FacternService {
    private loginId: string;
    private companyHouseKey: string;
    private readonly describeCache: Array<DescribeCacheEntry> = [];

    private readonly FRN_DATAROOT = 'frn:entity::factern-dataRoot';
    private readonly FRN_ENTITY_PREFIX = 'frn:entity::';
    private readonly ApiClient = FacternClient.ApiClient.instance;
    private readonly FactsApi = new FacternClient.FactsApi();
    private readonly OAuth2 = this.ApiClient.authentications['OAuth2'];
    private readonly appAuth: string;

    private readonly NAMED_ENTITY_SERVICE = 'erchl-service-201805111201';
    private readonly NAMED_ENTITY_PREFIX_COMPANY = 'erchl-company-201806150954-';
    private readonly NAMED_FIELDTYPE_COMMENT = 'erchl-company-comment-field-201805151540';
    private readonly NAMED_TEMPLATE_COMMENT = 'erchl-company-comment-template-201805151540';
    private readonly NAMED_INTERFACE_COMPANIES = 'erchl-interface-companies-201806201428';
    private readonly NAMED_INTERFACE_COMPANY_DETAILS = 'erchl-interface-company-details-201806201428';

    public constructor(loginId: string, accessToken: string, companyHouseKey: string) {
        this.appAuth = accessToken;
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
            console.error(err);
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
            console.error(err);
            return;
        }
    }

    public async companyDetails(nodeId: string, templateId: string, defaultStorageId: string, company_number: string) {
        try {
            const templateReadResponse = await this.FactsApi.read({
                login: this.loginId,
                representing: this.loginId,
                body: {
                    nodeId: nodeId,
                    templateId: templateId,
                    defaultStorageId: defaultStorageId,
                    parameters: [
                        { key: 'company_number', value: company_number, persistent: false }
                    ]
                }
            });
            return templateReadResponse.data.items[0].readItem.data;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    public async setPrivateNode(nodeId: string, loginId: string, authorization: string) {
        try {
            this.OAuth2.accessToken = authorization;

            const policy = new FacternClient.PermissionPolicyDocument(
                FacternClient.PermissionEffect.Deny,
                []
            );
            policy.actions = [ FacternClient.PermissionAction.Read ];
            const policyRequest = new FacternClient.CreatePermissionRequest(policy, nodeId);

            const permissionResponse = await this.FactsApi.permission({
                login: loginId,
                representing: loginId,
                body: policyRequest
            });
            this.OAuth2.accessToken = this.appAuth;
            return permissionResponse;
        } catch (err) {
            console.error(err);
            this.OAuth2.accessToken = this.appAuth;
            return;
        }
    }

    public async getServiceContainerNode() {
        return await this.getOrCreateNamedEntity(this.NAMED_ENTITY_SERVICE);
    }

    public async getOrCreateField(name: string, isUniqueByParent: boolean, storageId: string | undefined) {
        return (await this.describeByName('field', name))
            || (await this.createField(name, isUniqueByParent, storageId));
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
            console.error(err);
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
            console.error(err);
            return;
        }
    }

    public async getOrCreateCompanyInterface(name: string) {
        return (await this.describeByName('interface', name))
            || (await this.createCompanyInterface(name));
    }

    public async createCompanyInterface(name: string) {
        try {
            const createInterfaceResponse = await this.FactsApi.createInterface({
                login: this.loginId,
                representing: this.loginId,
                body: {
                    name: name,
                    addData: { url: 'https://api.companieshouse.gov.uk/search/companies', method: 'GET', async: false },
                    getData: {
                        url: 'https://api.companieshouse.gov.uk/company/{{company_number}}',
                        method: 'GET',
                        headers: [{ key: 'Authorization', value: 'Basic ' + this.companyHouseKey }],
                        async: false
                    },
                    deleteData: { url: 'https://api.companieshouse.gov.uk/search/companies', method: 'GET', async: false }
                }
            });
            return createInterfaceResponse.data.nodeId;
        } catch(err) {
            console.error(err);
            return;
        }
    }

    public async getOrCreateNamedEntity(name: string) {
        return (await this.describeByName('entity', name))
            || (await this.createNamedEntity(this.FRN_ENTITY_PREFIX + name));
    }

    public precache(resources: [string, string][]): Promise<any> {
        return Promise.all(resources.map(([type, name]) => this.describeByName(type, name)));
    }

    public async standardPrecache() {
        return this.precache([
            ["entity", this.NAMED_ENTITY_SERVICE],
            ["field", this.NAMED_FIELDTYPE_COMMENT],
            ["template", this.NAMED_TEMPLATE_COMMENT],
            ["interface", this.NAMED_INTERFACE_COMPANIES]
        ]);
    }

    public async describeByName(type: string, name: string) {
        // Everything that calls this can have its responses cached
        for(let entry of this.describeCache) {
            if(entry.matches(type, name)) {
                return entry.describeResponse.data.node.nodeId;
            }
        }
        try {
            const describeResponse = await this.FactsApi.describe({
                login: this.loginId,
                representing: this.loginId,
                body: new FacternClient.DescribeRequest('frn:' + type + '::' + name)
            });
            // Theoretically, we could get two identical describeByName calls simultaneously, and
            // then they would both come back later and both get added to the cache. This doesn't
            // break anything, though, and so there's no need to check for uniqueness.
            this.describeCache.push(new DescribeCacheEntry(type, name, describeResponse));
            return describeResponse.data.node.nodeId;
        } catch (err) {
            console.error(err);
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

    public async writeInformation(entityId: string, templateId: string, data: string, loginId: string, authorization: string) {
        this.OAuth2.accessToken = authorization;
        try {
            const writeNodeResponse = await this.FactsApi.write({
                login: loginId,
                representing: loginId,
                body: {
                    nodeId: entityId,
                    templateId: templateId,
                    values: [ data ]
                }
            });
            this.OAuth2.accessToken = this.appAuth;
            return writeNodeResponse;
        } catch (err) {
            console.error(err);
            this.OAuth2.accessToken = this.appAuth;
            return;
        }
    }

    public async read(nodeId: string, templateId: string, loginId: string, authorization: string) {
        this.OAuth2.accessToken = authorization;
        try {
            const readResponse = await this.FactsApi.read({
                login: loginId,
                representing: loginId,
                body: {
                    nodeId: nodeId,
                    templateId: templateId
                }
            });

            this.OAuth2.accessToken = this.appAuth;
            return readResponse;
        } catch (err) {
            console.error(err);
            this.OAuth2.accessToken = this.appAuth;
            return;
        }
    }

    public async addCommentToCompany(company_number: string, comment: string, isPrivate: boolean, loginId: string, authorization: string) {
        const companyEntity = await this.getOrCreateNamedEntity(this.NAMED_ENTITY_PREFIX_COMPANY + company_number);
        const commentField = await this.getOrCreateField(this.NAMED_FIELDTYPE_COMMENT, false, undefined);
        const templateId = await this.getOrCreateTemplate(this.NAMED_TEMPLATE_COMMENT, commentField);
        const response = await this.writeInformation(companyEntity, templateId, comment, isPrivate ? loginId : this.loginId, isPrivate ? authorization : this.appAuth);
        const commentNode = response.data.nodes[0].nodeId;

        if (isPrivate) {
            await this.setPrivateNode(commentNode, loginId, authorization);
        }

        return commentNode;
    }

    public async addResponseToComment(commentId: string, comment: string, isPrivate: boolean, loginId: string, authorization: string) {
        const commentField = await this.getOrCreateField(this.NAMED_FIELDTYPE_COMMENT, false, undefined);
        const templateId = await this.getOrCreateTemplate(this.NAMED_TEMPLATE_COMMENT, commentField);
        const response = await this.writeInformation(commentId, templateId, comment, isPrivate ? loginId : this.loginId, isPrivate ? authorization : this.appAuth);
        const commentNode = response.data.nodes[0].nodeId;

        if (isPrivate) {
            await this.setPrivateNode(commentNode, loginId, authorization);
        }

        return commentNode;
    }

    public async describeWithChildren(companyEntity: string) {
        try {
            const describeResponse = await this.FactsApi.describe({
                login: this.loginId,
                representing: this.loginId,
                body: {
                    nodeId: companyEntity,
                    listChildren: {}
                }
            });

            return describeResponse;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    public ownerMap(nodes: DescribeResponseNode[]): Map<string, string> {
        let map = new Map<string, string>();
        for (let i = 0; i < nodes.length; ++i) {
            map.set(nodes[i].nodeId, nodes[i].agent.login);
        }
        return map;
    }

    public async readCommentThread(company_number: string, loginId: string, authorization: string): Promise<CommentThreadResponse> {
        const companyEntity = await this.getOrCreateNamedEntity(company_number);
        const commentField = await this.getOrCreateField(this.NAMED_FIELDTYPE_COMMENT, false, undefined);
        const templateId = await this.getOrCreateTemplate(this.NAMED_TEMPLATE_COMMENT, commentField);

        const describeResponse = await this.describeWithChildren(companyEntity);
        const ownerMap = this.ownerMap(describeResponse.data.children.nodes);

        const response = await this.read(companyEntity, templateId, loginId.length > 0 ? loginId : this.loginId, loginId.length > 0 ? authorization : this.appAuth);
        const readItem = response.data.items[0].readItem.nodes;
        let comments: any[] = [];
        for (let i = 0; i < readItem.length; ++i) {
            comments.push({
                id: readItem[i].nodeId,
                text: readItem[i].data,
                owner: ownerMap.get(readItem[i].nodeId)
            });
        }
        return {
          count: readItem.length,
          comments: comments
        };
    }

    public async readResponseThread(commentId: string, loginId: string, authorization: string): Promise<CommentThreadResponse> {
        const commentField = await this.getOrCreateField(this.NAMED_FIELDTYPE_COMMENT, false, undefined);
        const templateId = await this.getOrCreateTemplate(this.NAMED_TEMPLATE_COMMENT, commentField);
        const response = await this.read(commentId, templateId, loginId.length > 0 ? loginId : this.loginId, loginId.length > 0 ? authorization : this.appAuth);

        const readItem = response.data.items[0].readItem.nodes;
        let comments: any[] = [];
        for (let i = 0; i < readItem.length; ++i) {
            comments.push({
                id: readItem[i].nodeId,
                text: readItem[i].data,
            });
        }
        return {
          count: readItem.length,
          comments: comments
        };
    }
}
