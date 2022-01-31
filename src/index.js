import FS from "fs";
import Path from "path";
import Process from "process";
import Prompt from "inquirer";
import { Command } from "commander";
import { Parameter } from "@cloud-technology/parameter";
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
    .option("-s, --stage <version>", "Filter via Version", "AWSCURRENT")
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
    .option("-n, --name <value>", "The Secret's Name - Ex) IBM/Production/Audit-Service/Watson-AI/Credentials")
    .option("-d, --description <value>", "Usage or Contextual Description")
    .option("-s, --secret <value>", "Target Secret Value - File System Path")
    .option("-l, --local", "Open File Path from Current Working Directory", false)
    .option("-o, --overwrite", "Force Creation of Secret - Overwrites Existing Secret(s)", false)
    .requiredOption("-p, --profile <account>", "AWS Account Alias - Aliases Found in ~/.aws/credentials", "default")
    .action((parameter) => {
    //        const name = parameter.name;
    //        const input = Parameter.create(name, "Identifier", true);
    //        console.log(input);
    const module = Prompt.createPromptModule();
    const Name = async () => {
        const input = await module({
            type: "input",
            name: "name",
            message: "Name" + ":"
        });
        return input.name;
    };
    const Description = async () => {
        const input = await module({
            type: "input",
            name: "description",
            message: "Description" + ":"
        });
        return input.description;
    };
    const Secret = async () => {
        if (parameter.secret) {
            const input = { file: parameter.secret };
            const target = (FS.existsSync(input.file)) ? Path.relative(Process.cwd(), input.file) : null;
            if (target === null) {
                (input.file === "") && process.exit(0);
                Process.stderr.write("[Error] File Couldn't be Found for Secret Creation" + "\n");
                process.exit(1);
            }
            else {
                const buffer = FS.readFileSync(target, { encoding: "utf-8" });
                return FS.readFileSync(buffer, { encoding: "utf-8" });
            }
        }
        else {
            if (parameter.local) {
                const path = Process.cwd();
                const contents = FS.readdirSync(Process.cwd(), { withFileTypes: false });
                const files = [];
                contents.forEach(($) => {
                    (FS.statSync($).isFile()) && files.push(String($));
                });
                const input = await module({
                    type: "list",
                    choices: files,
                    message: "Select a File" + ":",
                    askAnswered: true,
                    pageSize: 20,
                    name: "file",
                    loop: false
                });
                const target = Path.join(path, String(input.file));
                return FS.readFileSync(target, { encoding: "utf-8" });
            }
            else {
                const input = await module({
                    type: "input",
                    name: "file",
                    message: "Relative or Full System Path" + ":"
                });
                const target = (FS.existsSync(input.file)) ? Path.relative(Process.cwd(), input.file) : null;
                if (target === null) {
                    (input.file === "") && process.exit(0);
                    Process.stderr.write("[Error] File Couldn't be Found for Secret Creation" + "\n");
                    process.exit(1);
                }
                else {
                    return FS.readFileSync(target, { encoding: "utf-8" });
                }
            }
        }
    };
    const evaluate = async () => {
        const name = parameter?.name ?? await Name();
        const description = parameter?.description ?? await Description();
        const secret = await Secret();
        return {
            name, description, secret
        };
    };
    evaluate().then(($) => {
        const name = ($.name.split("/").length === 4)
            ? Parameter.create($.name, "Default")
            : Parameter.create($.name, "Identifier");
        Client.createSecret(name, $.description, $.secret, parameter.overwrite, parameter.profile).then(($) => {
            const result = {
                ARN: $.id,
                Name: $.name,
                Version: $.version
            };
            console.log(result);
            return result;
        });
    });
});
$.command("help").description("Display Help Information").action(() => {
    $.help();
});
const Parser = $;
export { Parser };
export default await $.parse(process.argv);
