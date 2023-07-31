const Tactic = require("../Tactic");
const piece_values = require("../piece_values.json")

class Evade extends Tactic
{
    static from_move(validator, move)
    {

        // We were never attacked in the first place
        if (!validator.isAttacked(move.from, move.color == "w" ? "b" : "w"))
           return null;   

        validator.move(move)

        // Moving to this square makes us not attacked
        if (!validator.isAttacked(move.to, move.color == "w" ? "b" : "w"))
        {   
            validator.undo()
            return new Evade(move, 0)
        }

        validator.undo()
        return null;
            
    }
}

module.exports = Evade;