let Engine = require('./engines/base_2_deep/Base2Deep.js');
const { Logger } = require("yalls");
const MoveValidator = require("chess.js").Chess

// Create a parent logger
const log = Logger.console("Kilroy");

let tests = [
    {
        name: "Rook fork",
        fen: "r4bk1/3Q1pn1/8/8/2PK4/8/8/2R5 b - - 0 1",
        color: "b",
        expected: "a8d8"
    }
]

for (let test of tests)
{
    let engine = new Engine({
        color: test.color,
        validator: new MoveValidator(test.fen)
    }, log);

    let start = Date.now();
    let move = engine.generate_move();
    let end = Date.now();

    log.info("Time taken: \t", end - start, "ms")

    if (move != test.expected)
    {
        log.error("Test failed: \t", test.name)
        log.error("Expected: \t", test.expected)
        log.error("Got: \t\t", move)
    } else {
        log.info("Test passed: ", test.name)
    }
        

}
