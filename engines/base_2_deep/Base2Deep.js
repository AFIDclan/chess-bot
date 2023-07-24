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

class Base2Deep extends Engine
{

    generate_move()
    {
        this.log.info("Starting score: ", evaluate_board(this.game.color.slice(0, 1), this.game.validator))

        this.search_count = 0

        let {move, score, history} = this.search(2, this.game.validator)
        if (!move) return null
        this.log.info("Search count: ", this.search_count)
        this.log.info("Ending score: ", score)
        this.log.info("Move: ", move.from + move.to)
        this.log.info("History: ", history.reverse())

        console.log("Search count: ", this.search_count)

        return move.from + move.to
    }

    search(depth, validator)
    {
        this.search_count++

        if (depth == 0) return {score: evaluate_board(this.game.color.slice(0, 1), validator), history: []}

        let moves = validator.moves({verbose: true})

        let results = moves.map((move, i) => {
            validator.move(move)
            let {score, history} = this.search(depth - 1, validator)
            
            score = -score

            validator.undo()
            
            history.push(move.from + move.to)

            return {score, move, history}
        })

        let best_move = results.reduce((acc, r) => {
            if (r.score > acc.score)
                return r
            return acc
        }, {score: -Infinity, move: null, history: []})

        return best_move
    }


}

module.exports = Base2Deep;