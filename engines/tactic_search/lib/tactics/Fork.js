const Tactic = require("../Tactic");
const MoveValidator = require("chess.js").Chess
const { fast_moves } = require("../Helpers")
const piece_values = require("../piece_values.json")

class Fork extends Tactic
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
        //console.log("GET moves", move.to)
        let moves = fast_moves(v, { square: move.to, verbose: true })

        moves = moves.filter(m => m.captured)

        moves = moves.map(m => piece_values[m.captured])

        moves = moves.filter(m => m > 100)
        
        if (moves.length < 2)
            return null;


        return new Fork(move, Math.min(...moves) )
    }

    static _from_move(validator, move)
    {
        validator.move(move)
        validator._turn = validator._turn == "w" ? "b" : "w"

        let moves = validator.moves({ square: move.to, verbose: true })

        validator._turn = validator._turn == "w" ? "b" : "w"
        validator.undo()

        moves = moves.filter(m => m.captured)

        moves = moves.map(m => piece_values[m.captured])
        
        if (moves.length < 2)
            return null;


        return new Fork(move, 0)
    }
}

module.exports = Fork;