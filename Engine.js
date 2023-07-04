const MoveValidator = require("@ninjapixel/chess").Chess

const piece_values = {
    'p': 100,
    'n': 300,
    'b': 300,
    'r': 500,
    'q': 900,
    'k': 1000
}

const pawn_position_values = {
    'w': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'b': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [-5, -10, -10, 20, 20, -10, -10, -5],
        [-5, 5, 10, 0, 0, 10, 5, -5],
        [0, 0, 0, -20, -20, 0, 0, 0],
        [-5, -5, -10, -25, -25, -10, -5, -5],
        [-10, -10, -20, -30, -30, -20, -10, -10],
        [-50, -50, -50, -50, -50, -50, -50, -50],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ]
}

function evaluate_board(color, validator)
{


    let friendly_peices = []
    let enemy_peices = []

    validator.board().forEach((row, i) => {
        row.forEach((piece, j) => {
            if (piece && piece.color == color)
                friendly_peices.push({type: piece.type, i, j})
            else if (piece)
                enemy_peices.push({type: piece.type, i, j})

        })
    })


    let friendly_value = friendly_peices.reduce((acc, p) => {
        acc += piece_values[p.type]
        // if (p.type == 'p')
        //     acc += pawn_position_values[color][p.i][p.j]
        return acc
    }, 0)

    let enemy_value  = enemy_peices.reduce((acc, p) => {
        acc += piece_values[p.type]
        // if (p.type == 'p')
        //     acc += pawn_position_values[color == "w" ? "b" : "w"][p.i][p.j]
        return acc
    }, 0)

    return friendly_value - enemy_value
}

class Engine
{
    constructor(game, log)
    {
        this.game = game;
        this.log = log;
    }

    generate_move()
    {
        let moves = this.game.validator.moves()
        let moves_verbose = this.game.validator.moves({ verbose: true })

        let {score, index} = this.search(4, this.game.validator)


        this.log.info("Resulting score: ", score)

        if (index == -1) return null

        let best_move = moves_verbose[index]

        this.best_moves_at_depth = []

        return best_move.from + best_move.to
    }

    search(depth, validator)
    {
        // if (!this.best_moves_at_depth[depth])
        //     this.best_moves_at_depth[depth] = 
        if (depth == 0) return {score: evaluate_board(this.game.color.slice(0, 1), validator), index: -1}

        let moves = validator.moves()

        let best_score = -Infinity
        let best_move_index = -1

        moves.forEach((move, i) => {

            validator.move(move)
            let {score} = this.search(depth - 1, validator)
            score = -score
            validator.undo()

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