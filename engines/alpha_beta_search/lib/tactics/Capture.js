const Tactic = require("../Tactic");
const piece_values = require("../piece_values.json")

class Capture extends Tactic
{
    static from_move(validator, move)
    {

        if (!move.captured)
            return null;

        return new Capture(move, piece_values[move.captured])
    }
}

module.exports = Capture;