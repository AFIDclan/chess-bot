const Tactic = require("../Tactic");
const piece_values = require("../piece_values.json")
const MoveValidator = require("chess.js").Chess

class Check extends Tactic
{
    static from_move(validator, move)
    {

        let fen = move.after

        let v = new MoveValidator(fen)
        if (!v.inCheck())
            return null;
        
        return new Check(move, 0)
    }
}

module.exports = Check;