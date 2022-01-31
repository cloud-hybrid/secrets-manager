import { SecretsManagerClient, CreateSecretCommand, CreateSecretCommandInput, GetSecretValueCommand, GetSecretValueCommandInput, ListSecretsCommand, ListSecretsCommandInput } from "@aws-sdk/client-secrets-manager";

const AWS = {
    Client: SecretsManagerClient,
    Create: CreateSecretCommand,
    List: ListSecretsCommand,
    Get: GetSecretValueCommand
};

type Client = SecretsManagerClient;

interface INI {
    accessKeyId: string;
    secretAccessKey: string;
    profile: string;
}

interface Types {
    Client: Client;
    Create: CreateSecretCommandInput;
    List: ListSecretsCommandInput;
    Get: GetSecretValueCommandInput;
    INI: INI;
}

export type { Types };

export { AWS };

export default AWS;