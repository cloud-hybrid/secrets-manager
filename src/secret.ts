import { GetSecretValueCommandOutput, ListSecretsCommandOutput, ListSecretsResponse } from "@aws-sdk/client-secrets-manager";

interface Tag {
    Key?: string;
    Value?: string;
}

interface Shape {
    /*** Secret.ARN */
    id?: string | undefined;
    /*** Secret.CreatedDate */
    creation?: Date | string | undefined;
    /*** Secret.DeletedDate */
    deletion?: Date | string | undefined;
    /*** Secret.Description */
    description?: string | undefined;
    /*** Secret.LastAccessedDate */
    access?: Date | string | undefined;
    /*** Secret.LastChangedDate */
    modification?: Date | string | undefined;
    /*** Secret.Name */
    name?: string | undefined;
    /*** Secret.SecretVersionsToStages */
    version: {
        [key: string]: string[]
    };
    /*** Secret.Tags */
    tags?: Tag[] | undefined;
}

interface Compact {
    /*** Secret.Name */
    name?: string | undefined;
    /*** Secret.Description */
    description?: string | undefined;
}

/*** Extended, Modified Secret Type */
class Variadic implements Shape {
    id?;
    name?;
    description?;
    tags?;
    version;
    access?;
    creation?;
    modification?;
    deletion?;

    constructor(input: Shape) {
        this.id = input.id;
        this.name = input.name;
        this.creation = input.creation;
        this.version = input.version;

        this.deletion = input.deletion;
        this.description = input.description;
        this.access = input.access;
        this.modification = input.modification;
        this.tags = input.tags;
    }

    /*** Return a modified, simplified Secret */
    public compact () {
        /// Composition of Secret
        return new Secret(this);
    }

}

/*** Simplified Variadic (Secret) Type */
class Secret implements Compact {
    name?;
    description?;

    constructor(input: Compact) {
        this.name = input.name;
        this.description = input.description;
    }
}

class List extends Array {
    protected total?: number;
    public token?: string | null;

    constructor(response: ListSecretsCommandOutput | undefined) {
        super();

        (response !== undefined) && response.SecretList?.forEach( ($) => {
            const secret = new Variadic( {
                id: $.ARN ?? "N/A",
                name: $.Name,
                creation: $.CreatedDate,
                version: $.SecretVersionsToStages ?? {},
                deletion: $.DeletedDate,
                description: $.Description,
                access: $.LastAccessedDate,
                modification: $.LastChangedDate,
                tags: $.Tags
            } );

            this.push( secret );
        } );

        this.token = response?.NextToken ?? null;
        this.total = this.length ?? null;
    }
}

export { Secret, List, Variadic };
export default { Secret, List, Variadic };
