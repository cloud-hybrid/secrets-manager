import Prompt from "inquirer";
import { Command } from "commander";
import { IO } from "@cloud-technology/input-buffer";
import { Client } from "./client.js";
const $ = new Command()
    .name("secrets-manager")
    .version("0.0.0", "-v, --version", "Show Version, Semantic")
    .helpOption("-h, --help", "Display Help Information");
$.command("list")
    .description("List Account Secrets - Doesn't Include Secret Value(s)")
    .requiredOption("-p, --profile <account>", "AWS Account Alias - Aliases Found in ~/.aws/credentials", "default")
    .option("-v, --verbose", "Include Verbose Attribute(s)", false)
    .action((parameters) => {
    Client.listSecrets(parameters.profile).then(($) => {
        const data = $.map((secret) => {
            return (parameters.verbose) ? secret : secret.compact();
        });
        console.log(data);
        return data;
    });
});
$.command("search")
    .description("Choose a Secret from an Optionally Filtered List")
    .helpOption("-h, --help", "Display Help Information")
    .requiredOption("-n, --name <filter>", "Filter Search Results via Name")
    .requiredOption("-p, --profile <account>", "AWS Account Alias - Aliases Found in ~/.aws/credentials", "default")
    .option("-s, --stage <version>", "Filter Specific Instance(s) of Secret to its Version", "AWSCURRENT")
    .action((parameters) => {
    const module = Prompt.createPromptModule();
    Client.searchSecrets("name", [parameters?.name ?? undefined], parameters.profile).then(async ($) => {
        const query = $.map((secret) => {
            return secret.compact();
        });
        const data = query.sort(($, _) => {
            return (String($.name).localeCompare(String(_.name)));
        });
        const options = data.map(($) => {
            return {
                name: $.name,
                value: $.name,
                extra: { description: $.description }
            };
        });
        const selection = await module({
            type: "list",
            choices: options,
            message: "Select a Secret" + ":",
            askAnswered: true,
            pageSize: 20,
            name: "secret",
            loop: false
        });
        const secret = selection.secret;
        return Client.getSecret(secret, parameters.stage, parameters.profile).then(($) => {
            console.log($.serialize());
            return $.serialize();
        });
    });
});
$.command("create")
    .description("Create a New Secret")
    .helpOption("-h, --help", "Display Help Information")
    .requiredOption("-p, --profile <account>", "AWS Account Alias - Aliases Found in ~/.aws/credentials", "default")
    /// .requiredOption("-n, --name <value>", "The Secret's Name - Ex) IBM/Production/Audit-Service/Watson-AI/Credentials")
    /// .requiredOption("-d, --description <value>", "Resource Description - Ex) Login Credentials for IBM Auditing Service")
    /// .requiredOption("-s, --secret <value>", "Target Secret Value - File Location or Buffer")
    .option("--force", "Force Creation of Secret - Overwrites Existing Secret(s)", false)
    .action((parameter) => {
    //        const name = parameter.name;
    //        const input = Parameter.create(name, "Identifier", true);
    //        console.log(input);
    console.log(parameter);
    const test = IO("Secret File Path or Contents", false).then(($) => {
        console.log($);
    });
});
$.command("help").description("Display Help Information").action(() => {
    $.help();
});
export default await $.parse(process.argv);
