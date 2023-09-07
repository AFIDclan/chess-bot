const Engine = require("./engines/alpha_beta_search/AlphaBetaSearch.js")
const MoveValidator = require("chess.js").Chess


let engine = new Engine({
    color: "b",
    validator: new MoveValidator("r4bk1/3Q1pn1/8/8/2PK4/8/8/2R5 b - - 0 1")
}, console);

let move = engine.generate_move();

console.log(move);