let Engine = require('./Engine.js');
const { Logger } = require("yalls");
const MoveValidator = require("@ninjapixel/chess").Chess

// Create a parent logger
const log = Logger.console("Kilroy");

let tests = [
    {
        name: "Prevent winning a pawn",
        fen: "k1b5/1p6/2n5/1B6/3N4/2P5/2P5/K7 b - - 0 6",
        color: "b",
        expected: "c8d7"
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
