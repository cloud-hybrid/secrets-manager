# `@cloud-technology/secrets-manager` #

An intuitive & user-friendly CLI application for AWS' Secrets-Manager.

## Usage ##

### Creating ###

Usage Instructions for Creating a **New Secret** in *AWS Secrets-Manager*.

1. Create an arbitrary `*.json` file containing the secret's expected content:
   ```json5
   // .secret.json
   {
       "Secret": "Value"
   }
   ```
2. Run `npx --yes @cloud-technology/secrets-manager create`
   1. Provide the **Name**: `Organization/Environment/Application/Resource/Identifier`
   2. Provide the **Description**: `An arbitrary secret ...`
   3. Provide the *relative* or *full-system path* to the `*.json` file created in step 1: `.secret.json`
