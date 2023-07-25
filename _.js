const Engine = require("./engines/tactic_search/TacticSearch.js");
const { Logger } = require("yalls");

// Create a parent logger
const log = Logger.console("Engine Tests", { format:":NAMESPACE | :STRING" });


const MoveValidator = require("chess.js").Chess

let e = new Engine({
    color: "w",
    validator: new MoveValidator("r7/8/8/8/BP4p1/2K2k2/8/8 w - - 0 1")
    
}, log);

let start = Date.now();
let move = e.generate_move();
let end = Date.now();

console.log("Move:", move, "in", end - start, "ms")