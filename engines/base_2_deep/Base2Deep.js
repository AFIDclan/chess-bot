const Engine = require("../Engine")
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
        [5, 5, 5, 20, 20, 5, 5, 5],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'b': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 5, 5, 20, 20, 5, 5, 5],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [0, 0, 0, 0, 0, 0, 0, 0]
        ]
}


const knight_position_values = {
    'w': [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50]
    ],
    'b': [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50]
    ]
}


function evaluate_board(color, validator)
{


    let friendly_peices = []
    let enemy_peices = []
    color = validator.turn()
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
        if (p.type == 'p')
            acc += pawn_position_values[color][p.i][p.j]
        else if (p.type == 'n')
            acc += knight_position_values[color][p.i][p.j]
        return acc
    }, 0)

    let enemy_value  = enemy_peices.reduce((acc, p) => {
        acc += piece_values[p.type]
        if (p.type == 'p')
            acc += pawn_position_values[color == "w" ? "b" : "w"][p.i][p.j]
        else if (p.type == 'n')
            acc += knight_position_values[color == "w" ? "b" : "w"][p.i][p.j]
        return acc
    }, 0)

    if (validator.isCheckmate())
        return validator.turn() == color ? -Infinity : Infinity

    if (validator.isStalemate() || validator.isDraw() || validator.isThreefoldRepetition())
        return 0

    return friendly_value - enemy_value
}

class Base2Deep extends Engine
{
    generate_move()
    {
        let start = Date.now();

        let best = this.search(3, this.game.validator)

        let end = Date.now();

        this.log.info("Resulting score:", best.score/100, "in", end - start, "ms")
 
        if (!best.move) return null

        return best.move.from + best.move.to
    }

    search(depth, validator)
    {
        // if (!this.best_moves_at_depth[depth])
        //     this.best_moves_at_depth[depth] = 
        let board_eval = evaluate_board(this.game.color.slice(0, 1), validator)

        if (depth == 0) return {score: board_eval, index: -1}

        let moves = validator.moves({verbose: true})

        let options = moves.map((move, i) => {
            validator.move(move)
            let {score} = this.search(depth - 1, validator)
            score = -score
            validator.undo()
            return {score, index: i, move}
        })

        let best = options.reduce((acc, option) => {
            if (option.score >= acc.score)
                return option
            return acc
        }, {score: -Infinity, index: -1, move: null})

        if (best.index == -1)
            return {score: board_eval, index: -1}

        return best
    }

}

module.exports = Base2Deep;