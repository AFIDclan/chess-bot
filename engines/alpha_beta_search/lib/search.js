
// let data = require('node:worker_threads').workerData
// // let data = {
// //     fen: "r7/8/2B5/8/1P4p1/2K5/4k3/8 w - - 0 1",
// //     starting_moves: ['b4b5']
// // }
// let parent_port = require('node:worker_threads').parentPort

const { Board } = require("../../../../jank-chess-js")

function evaluate_board(board)
{

    color = board.turn()

    let other_color = color == 'w' ? 'b' : 'w'

    return  board.material(color) - board.material(other_color)
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

//pull out args
let fen = process.argv[2]
let starting_moves = process.argv[3].split(",")
console.log("starting movez: ", starting_moves)
console.log("fen: ", fen)
let max_extention = 0

let board = Board.from_fen(fen)


function search(depth, best_alpha=new Eval(), best_beta=new Eval(Infinity), extention=0, starting_moves=null)
{

    if (depth+extention == 0) return {score: evaluate_board(board), index: -1}

    let moves;

    if (starting_moves && starting_moves.length > 0)
        moves = starting_moves
    else
        moves = board.get_moves()

    for (let move of moves)
    {
        board.move(move)
        let {score} = search(depth - 1, best_beta.negate(), best_alpha.negate(), 0)
        score = -score
        board.undo()

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



console.log("searching: ", fen, starting_moves)


let best_move = search(8, new Eval(), new Eval(Infinity), 0, starting_moves)
console.log("OUT:", JSON.stringify(best_move))
