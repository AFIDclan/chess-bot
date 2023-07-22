const Tactic = require("../Tactic");
const MoveValidator = require("chess.js").Chess
const piece_values = require("../piece_values.json")

class Fork extends Tactic
{
    static from_move(validator, move)
    {
        // Maybe check to see if the fork is worth it with this?
        let moving_piece_value = piece_values[move.piece]

        let fen = move.after

        //Swap the player to move
        if (fen.split(" ")[1] == "w")
            fen = fen.replace(" w ", " b ")
        else
            fen = fen.replace(" b ", " w ")
        

        // Remove en passant square
        fen = fen.replace(/ [a-h][36] /, " - ")

        let v = new MoveValidator(fen)
        let moves = v.moves({ square: move.to, verbose: true })

        moves = moves.filter(m => m.captured)

        moves = moves.map(m => piece_values[m.captured])
        
        if (moves.length < 2)
            return null;


        return new Fork(move, Math.min(...moves) )
    }
}

module.exports = Fork;