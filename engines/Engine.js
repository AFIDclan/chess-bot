
class Engine
{
    constructor(game, log)
    {
        this.game = game;
        this.log = log;
    }

    generate_move()
    {
        throw new Error("Not implemented");
    }
}

module.exports = Engine;