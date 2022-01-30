# `@cloud-technology/parameter` #

*A Zero-Dependency Type-Interface via Node.js*

Parameters often used during configuration can be a difficult concept to standardize.

`@cloud-technology/parameter` aims to strictly define a naming and constructor convention to ease efforts associated
with configuration, while allowing for an easy inheritance pattern to further extend from; examples of applicable
extensions include usages with:

- `etcd`
- Hashicorp's `vault`
- AWS Secure Systems Manager
- AWS Secrets Manager
- Microsoft Cloud Vault
- GCP Credential Management

## Table of Contents ##

- [Usage](#usage)
    - [Development](#development)
    - [Common-JS](#common-js)
    - [Modules](#modules)
- [Documentation](#documentation)

## Usage ##

`@cloud-technology/parameter` uses the latest Node.js LTS version; to quickly enable, run `nvm use`.

- See [installation guide](https://github.com/nvm-sh/nvm#about) for a quick walk-through on installing `nvm`.

| Package Script | NPM Command Invocation | Description                                     |
|----------------|------------------------|-------------------------------------------------|
| **test**       | `npm test`             | Unit-Test the Distribution                      |
| **start**      | `npm start`            | Compile + Unit-Test the Distribution            |
| **watch**      | `npm run watch`        | Unit-Test Upon File-System Change(s)            |
| **build**      | `npm run build`        | Compile Distribution Upon File-System Change(s) |
| **compile**    | `npm run compile`      | Compile Distribution                            |
| **upload**     | `npm run upload`       | Deploy Package to NPM Registry                  |

### Development ###

**Recommended** - Testing Mode

Locally developing with `jest` file-watchers helps ensure non-breaking change are introduced.

1. Install Dependencies
    ```bash
    npm install --quiet
    ```
2. Build `*.ts` File(s), Enabling TSC File-Watching
    ```bash
    npm run build
    ```
3. Open an Additional TTY and Run
    ```bash
    npm run start
    ```

Lastly, continue with development.

For alternative build & unit-testing commands, please refer to the [commands list](#usage).

### Common-JS ###

```node
const Main = async () => {
    const { Parameter } = await import("@cloud-technology/parameter");

    const instance = new Parameter({
        organization: "IBM",
        environment: "Development",
        application: "Application",
        resource: "Secret-Token",
        provider: "SSM",
        identifier: "ID"
    });

    console.log(instance);

    console.log(instance.string());

    console.log(instance.string("Directory"));
    console.log(instance.string("Train-Case"));
    console.log(instance.string("Screaming-Train-Case"));
}

( async () => await Main() )();
```

### Modules ###

```node
import { Parameter } from "@cloud-technology/parameter";

const instance = new Parameter({
    organization: "IBM",
    environment: "Development",
    application: "Application",
    resource: "Secret-Token",
    provider: "SSM",
    identifier: "ID"
});

console.log(instance);
console.log(instance.string());

console.log(instance.string("Directory"));
console.log(instance.string("Train-Case"));
console.log(instance.string("Screaming-Train-Case"));
```

## Documentation ##

Please see [documentation](./documentation) for additional information and reference(s).