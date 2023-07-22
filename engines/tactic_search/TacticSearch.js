const Engine = require("../Engine");

class TacticSearch extends Engine
{
    generate_move()
    {

       
        let moves = this.game.validator.moves({verbose: true})
        let random_move = moves[Math.floor(Math.random() * moves.length)]

        return random_move.from + random_move.to
    }
}

module.exports = TacticSearch;