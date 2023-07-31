class Tactic {


    constructor(move, value)
    {
        this.move = move
        this.value = value
    }

    static from_move(validator, move)
    {
        throw new Error("Not Implemented")
    }
}

module.exports = Tactic;