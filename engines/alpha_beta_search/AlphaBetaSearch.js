const Engine = require("../Engine")
const {fast_moves} = require("./Helpers")
const Pin = require("./lib/tactics/Pin")
const Fork = require("./lib/tactics/Fork")
const Capture = require("./lib/tactics/Capture")
const Check = require("./lib/tactics/Check")
// const { Board } = require("../../../jank-chess-js")
const { Board } = require("jank-chess")
const worker = require('node:worker_threads'); 
const { spawn } = require("node:child_process")
const exec = require('node:child_process').execSync;


function evaluate_board(validator)
{

    color = validator.turn()

    let other_color = color == 'w' ? 'b' : 'w'

    return  validator.material(color) - validator.material(other_color)
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

        this.board = Board.from_fen(this.validator.fen())

        let start = Date.now();
        let moves = this.board.get_moves()


        // let move_worker = new worker.Worker('./engines/alpha_beta_search/lib/search.js', {workerData: {
        //     fen: this.validator.fen(),
        //     starting_moves: [moves[0]]
        // }})
        
        // this.await_worker_search(move_worker)
        // .then((move) => {
        //     console.log(move)
        // })

        this.search_start = Date.now()

        // let options = await Promise.all(moves.map((a) => {
        //     return this.await_worker_search('./engines/alpha_beta_search/lib/search.js', this.validator.fen(), [a])
        // }))

        

        // console.log("took", end - start, "ms")
        // console.log(options)

        // let best = options.reduce((a, b) => {
        //     if (b.score > a.score)
        //         return b
        //     return a
        // })

        this.max_extention = 2

        let best = this.search(8)
        let end = Date.now();
        this.log.info("Resulting score:", best.score/100, "in", end - start, "ms")
 
        if (!best.move) return null

        return best.move
    }

    search(depth, best_alpha=new Eval(), best_beta=new Eval(Infinity), extention=0, starting_move=null)
    {

        if (depth+extention == 0) return {score: evaluate_board(this.board), index: -1}

        //if (Date.now() - this.search_start > 1000) return {score: evaluate_board(this.validator), index: -1}
        let moves;

        if (depth == 5 && starting_move)
            moves = [starting_move]
        else
            moves = this.board.get_moves()

        // moves = moves.map((a) => {
    
        //     let check = Check.from_move(this.validator, a)
        //     if (check)
        //         return {...a, value: check.value, extention: 1}

        //     let pin = Pin.from_move(this.validator, a)
        //     if (pin)
        //         return {...a, value: pin.value, extention: 1}

        //     let fork = Fork.from_move(this.validator, a)
        //     if (fork)
        //         return {...a, value: fork.value, extention: 1}
            
        //     let capture = Capture.from_move(this.validator, a)
        //     if (capture)
        //         return {...a, value: capture.value, extention: 0}
                

        //     return a
        // })

        // moves.sort((a, b) => b.value - a.value)
    

        for (let move of moves)
        {
            this.board.move(move)
            let {score} = this.search(depth - 1, best_beta.negate(), best_alpha.negate(), Math.min(extention + (move.extention || 0), this.max_extention))
            score = -score
            this.board.undo()

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