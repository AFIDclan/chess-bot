const MoveValidator = require("@ninjapixel/chess").Chess

const piece_values = {
    'p': 1,
    'n': 3,
    'b': 3,
    'r': 5,
    'q': 9,
    'k': 1000
}

function evaluate_board(color, validator)
{


    let friendly_peices = []
    let enemy_peices = []

    validator.board().forEach((row, i) => {
        row.forEach((piece, j) => {
            if (piece && piece.color == color)
                friendly_peices.push(piece.type)
            else if (piece)
                enemy_peices.push(piece.type)

        })
    })

    let friendly_value = friendly_peices.reduce((acc, p) => acc + piece_values[p], 0)
    let enemy_value = enemy_peices.reduce((acc, p) => acc + piece_values[p], 0)

    return friendly_value - enemy_value
}

class Engine
{
    constructor(game)
    {
        this.game = game;
    }

    generate_move()
    {
        let moves = this.game.validator.moves()
        let moves_verbose = this.game.validator.moves({ verbose: true })

        let {score, index} = this.search(3, this.game.validator)

        console.log("Best score:", score)
        console.log("Best index:", index)

        if (index == -1) return null
        
        let best_move = moves_verbose[index]

        return best_move.from + best_move.to
    }

    search(depth, validator)
    {

        if (depth == 0) return {score: evaluate_board(this.game.color.slice(0, 1), validator), index: -1}

        let moves = validator.moves()

        let best_score = -Infinity
        let best_move_index = -1

        moves.forEach((move, i) => {
            let new_validator = new MoveValidator(validator.fen())
            new_validator.move(move)
            let {score} = this.search(depth - 1, new_validator)

            if (score > best_score)
            {
                best_score = score
                best_move_index = i
            }
        })

        return {score: best_score, index: best_move_index}
    }


}

module.exports = Engine;