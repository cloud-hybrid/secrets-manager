#!/usr/bin/env node

const CLI = async () => await import("./src/index.js");

export { CLI };

export default await CLI();
