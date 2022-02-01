# `@cloud-technology/secrets-manager` #

The more intuitive, user-friendly commandline application for AWS' Secrets-Manager.

## Usage ##

1. Incur a *programmatic* use-case for a stored secret.
2. Create a **local** `*.json` file containing the secret's expected content.
   ```json5
   // .secret.json
   {
       "Secret": "Value"
   }
   ```
3. Install the package.
   ```bash
   npm install .
   ```
4. 