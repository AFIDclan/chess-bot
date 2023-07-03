let LichessAPI = require('./LichessAPI.js');
let Engine = require('./Engine.js');

let api = new LichessAPI("ZokBot", "lip_QRSo1o94PzkkLJXz1PEK");


api.on("challenge", (c)=>{
    c.accept();
})

api.on("new_game", (g)=>{

    let engine = new Engine(g);

    g.on("move_needed", ()=>{
        console.log("Move needed.");
        let move = g.validator.moves({ verbose: true })

        //Select random move
        move = engine.generate_move();

        if (!move) 
            return;

        console.log("MOVE:", move);
        g.make_move(move);
    });

});



console.log("Connecting.")
api.connect();