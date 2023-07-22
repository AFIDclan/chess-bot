const Engines = require('./engines');
const MoveValidator = require("chess.js").Chess
const { Logger } = require("yalls");

// Create a parent logger
const log = Logger.console("Engine Tests", { format:":NAMESPACE | :STRING" });

Engines.forEach((Engine)=>{
    
    let tests = require("./tests/");
    let elog = log.create_child(Engine.name);

    for (let test of tests)
    {
        let e = new Engine({
            color: test.color,
            validator: new MoveValidator(test.fen)
            
        }, Logger.noop());

        let start = Date.now();
        let move = e.generate_move();
        let end = Date.now();

        let pass = move == test.expected
        elog.info(test.description + ": " + (pass ? log.f("PASS", { color: "green" }) : log.f("FAIL", { color: "red" })) + " (" + (end - start) + "ms) " + (pass ? "" : log.f("Expected: " + test.expected + " Got: " + move, { color: "red" })));

        
    }
    
});