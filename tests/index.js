const fs = require('fs');

// Get a list of json files
let files = fs.readdirSync("./tests");
let tests = [];

// Load each file
for (let file of files.filter(f => f.endsWith(".json")))
{
    let test = require("./" + file);
    tests.push(test);
}

module.exports = tests;