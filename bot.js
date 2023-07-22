let LichessAPI = require('./LichessAPI.js');
//let Engine = require('./engines/base_2_deep/Base2Deep.js');
let Engine = require('./engines/tactic_search/TacticSearch.js');
const { Logger } = require("yalls");

// Create a parent logger
const log = Logger.console("Kilroy");

let api = new LichessAPI("ZokBot", "lip_QRSo1o94PzkkLJXz1PEK");


api.on("challenge", (c)=>{
    c.accept();
})

api.on("new_game", (g)=>{

    let engine = new Engine(g, log);

    g.on("move_needed", ()=>{
        log.info("Move needed.");
        let move = g.validator.moves({ verbose: true })

        //Select random move
        move = engine.generate_move();

        if (!move) 
            return;

        log.info("Making move: ", move)
        g.make_move(move);
    });

});



log.info("Connecting.")
api.connect();