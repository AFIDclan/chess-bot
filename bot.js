let LichessAPI = require('./LichessAPI.js');

let api = new LichessAPI("ZokBot", "lip_QRSo1o94PzkkLJXz1PEK");


api.on("challenge", (c)=>{
    c.accept();
})

api.on("new_game", (g)=>{

    g.on("move_needed", ()=>{
        let move = g.validator.moves({ verbose: true })

        //Select random move
        move = move[Math.floor(Math.random() * move.length)]

        if (!move) 
            return;

        console.log("MOVE:", (move.from + move.to));
        g.make_move(move.from + move.to);
    });

});



console.log("Connecting.")
api.connect();