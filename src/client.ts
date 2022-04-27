import { Parameter } from "@cloud-technology/parameter";

import { Credential } from "./credential.js";
import { List, Variadic } from "./secret.js";
import { Secret } from "./output.js";

import { AWS } from "./aws.js";

import type { Types } from "./aws.js";

/***
 * API Client
 */

class Client extends Credential {
    /*** AWS S3 API Client */
    service?: Types["Client"];

    credentials?: Types["INI"];

    profile: string;

    commands = {
        get: AWS.Get,
        create: AWS.Create,
        list: AWS.List
    };

    /***
     * Given AWS-V3 Change(s), `await Client.instantiate()` must be called after constructor Instantiation
     *
     * @param {string} profile
     *
     * @private
     * @constructor
     *
     */

    private constructor(profile: string = "default") {
        super(profile);

        this.profile = profile;
    }

    /***
     * Populate the instance `$.service`, and return a callable, functional S3 API Client
     *
     * @returns {Promise<Types.Client>}
     *
     */

    private async instantiate() {
        const credentials = await this.settings();

        this.id = credentials.accessKeyId;
        this.key = credentials.secretAccessKey;

        this.credentials = {
            profile: this.profile,
            accessKeyId: this.id,
            secretAccessKey: this.key
        };

        this.service = new AWS.Client( { ... this.credentials }  );

        return this;
    }

    private static async initialize(profile: string) {
        const client = new Client(profile);

        return await client.instantiate();
    }

    /***
     * Retrieve Secret with Secret-String Attributed
     *
     * @param {string} name
     * @param {string} version
     *
     * @returns {Promise<Secret>}
     *
     */

    static async getSecret(name: string, version: string = "AWSCURRENT", profile: string = "default"): Promise<Secret> {
        const client = await Client.initialize(profile);

        const input: Types["Get"] = {
            SecretId: name,
            VersionStage: version
        };

        const command = new client.commands.get(input);
        const secret = await client.service?.send(command);

        return new Secret(secret);
    }

    /***
     * List all AWS Account Secret(s)
     *
     * @returns {Promise<Variadic[]>}
     *
     */

    static async listSecrets(profile: string = "default"): Promise<Variadic[]> {
        const client = await Client.initialize(profile);

        const secrets: Variadic[] = [];
        const input: Types["List"] = {
            MaxResults: Infinity
        };

        const command = new client.commands.list(input);
        const response = await client.service?.send(command);

        let page = new List(response);
        secrets.push(... page);

        while (page.token) {
            const input: Types["List"] = {
                MaxResults: Infinity,
                NextToken: page.token
            };

            const command = new client.commands.list(input);
            const response = await client.service?.send(command);

            page = new List(response);
            secrets.push(... page);

            if (!page.token) break;
        }

        return secrets;
    }

    /***
     * Name Filter - Matches the beginning of secret names; case-sensitive
     *
     * @param {Filters} filter
     * @param {string | string[]} value
     *
     * @returns {Promise<Variadic[]>}
     *
     */

    static async searchSecrets(filter: Filters, value?: string | string[], profile: string = "default"): Promise<Variadic[]> {
        const client = await Client.initialize(profile);

        const secrets: Variadic[] = [];
        const input: Types["List"] = (value) ? {
            MaxResults: Infinity,
            Filters: [
                {
                    Key: filter, Values: (typeof value === "object") ? value : [value]
                }
            ]
        } : {
            MaxResults: Infinity
        };

        const command = new client.commands.list(input);
        const response = await client.service?.send(command);

        let page = new List(response);
        secrets.push(... page);

        while (page.token) {
            const input: Types["List"] = (value) ? {
                MaxResults: Infinity,
                Filters: [
                    {
                        Key: filter, Values: (typeof value === "object") ? value : [value]
                    }
                ], NextToken: page.token
            } : {
                MaxResults: Infinity, NextToken: page.token
            };

            const command = new client.commands.list(input);
            const response = await client.service?.send(command);

            page = new List(response);
            secrets.push(... page);

            if (!page.token) break;
        }

        return secrets;
    }

    /***
     * Create a new Secret
     *
     * **Warning**: *Never commit or upload secrets into version control*.
     *
     * 1. Create an Arbitrary `.secret.json` File:
     *
     * {
     *     "Secret": "Value"
     * }
     *
     * 2. Run `npx --yes @cloud-technology/secrets-manager create`
     *    1. Provide the **Name**: `"Organization/Environment/Application/Resource/Identifier"`
     *    2. Provide the **Description**: `A secret's description ...`
     *    3. Provide the Secret File's **Path**: `.secret.json`
     *       - Either a relative or absolute file-system path
     *
     * @param {Parameter} parameter
     * @param {string} description
     * @param {string} secret
     * @param {boolean} overwrite
     *
     * @returns {Promise<Secret>}
     *
     */

    static async createSecret(parameter: Parameter, description: string, secret: string, overwrite: boolean = false, profile: string = "default"): Promise<Secret> {
        const client = await Client.initialize(profile);

        const organization = parameter.organization;
        const environment = parameter.environment;
        const application = parameter.application;
        const service = parameter.service;

        const identifier = parameter.identifier;

        const input: Types["Create"] = {
            Name: parameter.string("Directory"),
            Description: description,
            ForceOverwriteReplicaSecret: overwrite,
            SecretString: secret,
            Tags: [
                {
                    Key: "Organization",
                    Value: organization
                },
                {
                    Key: "Environment",
                    Value: environment
                },
                {
                    Key: "Application",
                    Value: application
                },
                {
                    Key: "Service",
                    Value: service
                },
                {
                    Key: "Identifier",
                    Value: String(identifier)
                }
            ]
        };

        const command = new client.commands.create(input);
        const response = await client.service?.send(command);

        return new Secret(response);
    }

    /***
     * Create or Overwrite a Secret
     *
     * @param {Parameter} parameter
     * @param {string} description
     * @param {string} secret
     *
     * @returns {Promise<Secret>}
     *
     */

    static async forceCreateSecret(parameter: Parameter, description: string, secret: string, profile: string = "default") {
        return await Client.createSecret(parameter, description, secret, true, profile);
    }
}

interface Query {
    description: string;
    name: string;
    "tag-key": string;
    "tag-value": string;
    "primary-region": string;
    all: any;
}

type Filters = keyof Query;

export { Client };

export default Client;
