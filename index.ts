import { Command } from "commander";

import Prompt from "inquirer";
import { Service } from "./src/client";
import { Parameter } from "@cloud-technology/parameter";
import { IO } from "@cloud-technology/input-buffer";

//const secrets = await Service.listSecrets( "name", [ "Capstone" ] );

//console.log( secrets );

export default {};

const $ = new Command()
    .name( "secrets-manager" )
    .version( "0.0.0", "-v, --version", "Show Version, Semantic" )
    .helpOption( "-h, --help", "Display Help Information" );

$.command( "list" )
    .description( "List Account Secrets - Doesn't Include Secret Value(s)" )
    .requiredOption( "-n, --name <filter>", "Filter Search Results via Name" )
    .option( "-v, --verbose", "Include Verbose Attribute(s)", false )
    .action( (parameters: { name: string, verbose: boolean }) => {
        Service.listSecrets( "name", [ parameters?.name ] ).then( ($) => {
            const data = $.map( (secret) => {
                return (parameters.verbose) ? secret : secret.compact();
            } );

            console.log( data );

            return data;
        } );
    } );

$.command( "search" )
    .description( "Choose a Secret from an Optionally Filtered List" )
    .option( "-n, --name <filter>", "Filter Search Results via Name" )
    .option( "-s, --stage <version>", "Filter Specific Instance(s) of Secret to its Version", "AWSCURRENT" )
    .action( (parameters: { name: string, stage: string}) => {
        const module = Prompt.createPromptModule();
        Service.listSecrets( "name", [ parameters?.name ] ).then( async ($) => {
            const query = $.map( (secret) => {
                return secret.compact();
            } );

            const data = query.sort(($, _) => {
                return (String($.name).localeCompare(String(_.name)));
            })

            const options: {name: string | undefined, value: any, extra: any}[] = data.map(($) => {
                return {
                    name: $.name,
                    value: $.name,
                    extra: { description: $.description }
                }
            });

            const selection = await module( {
                type: "list",
                choices: options,
                message: "Select a Secret" + ":",
                askAnswered: true,
                pageSize: 20,
                name: "secret",
                loop: false
            } );

            const secret = selection.secret;
            return Service.getSecret( secret, parameters.stage ).then( ($) => {
                console.log( $.serialize() );

                return $.serialize();
            } );
        } );
    } );

$.command( "create" )
    .description( "Create a New Secret" )
    /// .requiredOption("-n, --name <value>", "The Secret's Name - Ex) IBM/Production/Audit-Service/Watson-AI/Credentials")
    /// .requiredOption("-d, --description <value>", "Resource Description - Ex) Login Credentials for IBM Auditing Service")
    /// .requiredOption("-s, --secret <value>", "Target Secret Value - File Location or Buffer")
    .option("--force", "Force Creation of Secret - Overwrites Existing Secret(s)", false)
    .action( (parameter: {name: string, description: string, secret: string}) => {
//        const name = parameter.name;
//        const input = Parameter.create(name, "Identifier", true);
//        console.log(input);

        console.log(parameter);
        const test = IO("Secret File Path or Contents", false).then(($) => {
            console.log($);
        });
    } );

await $.parse( process.argv );