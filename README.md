# `@cloud-technology/secrets-manager` #

An intuitive & user-friendly CLI application for AWS' Secrets-Manager.

## Usage ##

### Creating a Secret ###

**Warning**: *Never commit or upload secrets into version control*. 

1. Create an Arbitrary `.secret.json` File:
   ```json5
   {
       "Secret": "Value"
   }
   ```
2. Run `npx --yes @cloud-technology/secrets-manager create`
   1. Provide the **Name**: `Organization/Environment/Application/Resource/Identifier`
   2. Provide the **Description**: `A secret's description ...`
   3. Provide the Secret File's **Path**: `.secret.json`
      - Either a relative or absolute file-system path