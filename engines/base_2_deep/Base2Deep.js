const Engine = require("../Engine")
const {fast_moves} = require("./Helpers")
const { Board } = require("../../../jank-chess-js")

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


function evaluate_board(validator)
{

    color = validator.turn()

    let other_color = color == 'w' ? 'b' : 'w'

    return  validator.material(color) - validator.material(other_color)
}

class Base2Deep extends Engine
{
    generate_move()
    {
        

        this.board = Board.from_fen(this.validator.fen())
        this.evaluations = 0

        let start = Date.now();

        let best = this.search(2)

        let end = Date.now();

        this.log.info("Resulting score:", best.score/100, "in", end - start, "ms")
 
        if (!best.move) return null

        return best.move
    }

    search(depth)
    {
        this.evaluations++
        let board_eval = evaluate_board(this.board)

        if (depth == 0) return {score: board_eval, index: -1}

        let moves = this.board.get_moves()


        let options = moves.map((move, i) => {
            this.board.move(move)
            let {score} = this.search(depth - 1)
            score = -score
            this.board.undo()
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

    get validator()
    {
        return this.game.validator
    }


}

module.exports = Base2Deep;