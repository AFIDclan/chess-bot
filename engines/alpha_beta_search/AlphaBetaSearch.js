const Engine = require("../Engine")
const {fast_moves} = require("./Helpers")
const Pin = require("./lib/tactics/Pin")
const Fork = require("./lib/tactics/Fork")


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

class Eval
{
    constructor(score=-Infinity, move=null)
    {
        this.score = score
        this.move = move
    }

    negate()
    {
        return new Eval(-this.score, this.move)
    }
}

class AlphaBetaSearch extends Engine
{
    generate_move()
    {
        let start = Date.now();

        let best = this.search(5)

        let end = Date.now();

        this.log.info("Resulting score:", best.score/100, "in", end - start, "ms")
 
        if (!best.move) return null

        return best.move.from + best.move.to
    }

    search(depth, best_alpha=new Eval(), best_beta=new Eval(Infinity))
    {
        let board_eval = evaluate_board(this.validator)

        if (depth == 0) return {score: board_eval, index: -1}

        let moves = this.validator.moves({verbose: true})

        if (depth == 5)
        {
            moves = moves.sort((a, b) => {
        
                let pin = Pin.from_move(this.validator, a)
                if (pin)
                    return -pin.value

                let fork = Fork.from_move(this.validator, a)
                if (fork)
                    return -fork.value
                
                    

                return 0 
            })
        }

        for (let move of moves)
        {
            this.validator.move(move)
            let {score} = this.search(depth - 1, best_beta.negate(), best_alpha.negate())
            score = -score
            this.validator.undo()

            if (score >= best_beta.score)    
            {          
                return best_beta
            }  
            else if (score > best_alpha.score)
            {
                best_alpha = new Eval(score, move)
            }
                

        }
       
        return best_alpha
    }

    get validator()
    {
        return this.game.validator
    }


}

module.exports = AlphaBetaSearch;