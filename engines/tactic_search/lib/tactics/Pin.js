const Tactic = require("../Tactic");
const MoveValidator = require("chess.js").Chess
const piece_values = require("../piece_values.json")

class Pin extends Tactic
{
    static from_move(validator, move)
    {
        let fen = move.after

        //Swap the player to move
        if (fen.split(" ")[1] == "w")
            fen = fen.replace(" w ", " b ")
        else
            fen = fen.replace(" b ", " w ")
        

        // Remove en passant square
        fen = fen.replace(/ [a-h][36] /, " - ")

        let v = new MoveValidator(fen)
        let captures = v.moves({ square: move.to, verbose: true })
        .filter(m => m.captured)

        let pins = captures.map((capture) => {
                v.remove(capture.to)
                let new_moves = v.moves({ square: move.to, verbose: true })
                v.undo()
    
                //Filter out moves that were already possible
                new_moves = new_moves.filter(m => captures.find(c => c.to == m.to) == undefined)
                let new_captures = new_moves.filter(m => m.captured)
    
    
                
                let revealed_values = new_captures.map(m => piece_values[m.captured])
                let pin_value = piece_values[capture.captured]

                if (Math.max(...revealed_values) > pin_value)
                    return new Pin(move, Math.max(...revealed_values))
                else
                    return 0;
    
            }
        ).filter(p => p.value > 0)


   

        if (pins.length > 0)
            return pins[0]
        else
            return null
    }
}

module.exports = Pin;