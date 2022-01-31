import OS from "os";

import {
    SecretsManagerClient,
    CreateSecretCommand, CreateSecretCommandInput,
    GetSecretValueCommand, GetSecretValueCommandInput,
    ListSecretsCommand, ListSecretsCommandInput
} from "@aws-sdk/client-secrets-manager";

import { fromIni } from "@aws-sdk/credential-providers";

import { CredentialProvider } from "@aws-sdk/types";

import { Parameter } from "@cloud-technology/parameter";

import { List, Variadic } from "./secret.js";
import { Secret } from "./output.js";


/***
 * Client Credentials
 * ---
 *
 * Creates a credential provider function that reads from a shared credentials file at ~/.aws/credentials and a shared
 * configuration file at ~/.aws/config.
 *
 * Both files are expected to be INI formatted with section names corresponding to
 * profiles.
 *
 * Sections in the credentials file are treated as profile names, whereas profile sections in the config file
 * must have the format of[profile profile-name], except for the default profile.
 *
 * @example
 * const Credentials = new Client();
 * await Credentials.initialize();
 *
 * console.log(Credentials);
 *
 */

class Credential {
    /***
     * Returns information about the currently effective user. On POSIX platforms, this is typically a subset of the
     * password file. The returned object includes the username, uid, gid, shell, and homedir. On Windows, the uid
     * and gid fields are -1, and shell is null. The value of homedir returned by os.userInfo() is provided by the
     * operating system. This differs from the result of os.homedir(), which queries environment variables for the home
     * directory before falling back to the operating system response.
     *
     * Throws a SystemError if a user has no username or homedir.
     *
     */

    user = OS.userInfo();

    /*** `AWS_PROFILE` environment variable or a default of `default`. */
    profile: string;

    /*** AWS_ACCESS_KEY_ID */
    id?: string;

    /*** AWS_SECRET_ACCESS_KEY */
    key?: string;

    /***
     * A function that, when invoked, returns a promise that will be fulfilled with a value of type Credential
     *
     * @type {import("@aws-sdk/types").CredentialProvider}
     * */

    settings: CredentialProvider;

    /***
     *
     * @param profile {string} Defaults to `default`
     *
     */

    constructor(profile: string) {
        this.profile = profile;

        this.settings = fromIni( {
            profile: profile
        } );
    }
}

/***
 * API Client
 * ---
 *
 * @example
 * const Service = new Client();
 * await Service.instantiate();
 *
 * @example
 * const API = await (new Client()).instantiate();
 */

interface INI {
    accessKeyId: string;
    secretAccessKey: string;
    profile: string;
}

interface Inputs {
    get: GetSecretValueCommandInput;
    list: ListSecretsCommandInput;
    create: CreateSecretCommandInput;
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

class Client extends Credential {
    /*** AWS S3 API Client */
    service?: SecretsManagerClient;

    credentials?: INI;

    profile: string;

    commands = {
        get: GetSecretValueCommand,
        create: CreateSecretCommand,
        list: ListSecretsCommand
    };

    /*** Given AWS-V3 Change(s), `await Client.instantiate()` must be called after constructor Instantiation */

    constructor(profile: string = "default") {
        super(profile);

        this.profile = profile;
    }

    /***
     * Populate the instance `$.service`, and return a callable, functional S3 API Client
     *
     * @returns {Promise<SecretsManagerClient>}
     */

    private async instantiate() {
        const credentials = await this.settings();

        this.id = credentials.accessKeyId;
        this.key = credentials.secretAccessKey;
        this.profile = this.profile;

        this.credentials = {
            profile: this.profile,
            accessKeyId: this.id,
            secretAccessKey: this.key
        };

        this.service = new SecretsManagerClient( { ... this.credentials }  );
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
     * @returns {Promise<Secret>}
     */
    static async getSecret(name: string, version: string = "AWSCURRENT", profile: string = "default"): Promise<Secret> {
        const client = await Client.initialize(profile);

        const input: Inputs["get"] = {
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
     */
    static async listSecrets(profile: string = "default"): Promise<Variadic[]> {
        const client = await Client.initialize(profile);

        const secrets: Variadic[] = [];
        const input: Inputs["list"] = {
            MaxResults: Infinity
        };

        const command = new client.commands.list(input);
        const response = await client.service?.send(command);

        let page = new List(response);
        secrets.push(... page);

        while (page.token) {
            const input: Inputs["list"] = {
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
     *
     * Name Filter - Matches the beginning of secret names; case-sensitive
     *
     * @param {Filters} filter
     * @param {string | string[]} value
     * @returns {Promise<Variadic[]>}
     */
    static async searchSecrets(filter: Filters, value?: string | string[], profile: string = "default"): Promise<Variadic[]> {
        const client = await Client.initialize(profile);

        const secrets: Variadic[] = [];
        const input: Inputs["list"] = (value) ? {
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
            const input: Inputs["list"] = (value) ? {
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
     * @param {Parameter} parameter
     * @param {string} description
     * @param {string} secret
     * @param {boolean} overwrite
     *
     * @returns {Promise<Secret>}
     */
    static async createSecret(parameter: Parameter, description: string, secret: string, overwrite: boolean = false, profile: string = "default"): Promise<Secret> {
        const client = await Client.initialize(profile);

        const organization = parameter.organization;
        const environment = parameter.environment;
        const application = parameter.application;
        const resource = parameter.resource;

        const identifier = parameter.identifier;

        const input: Inputs["create"] = {
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
                    Key: "Resource",
                    Value: resource
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
     */
    static async forceCreateSecret(parameter: Parameter, description: string, secret: string, profile: string = "default") {
        return await Client.createSecret(parameter, description, secret, true, profile);
    }
}

export { Client };

export default Client;