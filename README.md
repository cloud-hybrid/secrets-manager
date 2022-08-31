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

## Task-Board ##

- [ ] When searching for a secret, if a TTY is not present, but only a single secret was found, 
simply output the results without forcing the user to accept the list-item.
   - [ ] Add a flag that would simulate a no-TTY environment (`--ci` | `--no-ci`).
- [ ] Prompt the User to select from a drop-down (`File` | `Prompt`) for the secrets generation during the `create` command.
- [ ] Extend `Utility.inspect` to include a `Infinite` output result when piping the output from the `list` command to stdout.
