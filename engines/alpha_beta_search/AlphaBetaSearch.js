const Engine = require("../Engine")
const Evaluation = require("./lib/Evaluation")
const { Board } = require("jank-chess");



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

        this.board = new Board(this.validator.fen())
        let best = this.search(5)

        let end = Date.now();

        this.log.info("Resulting score:", best.score, "in", end - start, "ms")
 
        if (!best.move) return null

        return best.move
    }

    search(depth, best_alpha=new Eval(), best_beta=new Eval(Infinity))
    {

        if (depth == 0) return {score: Evaluation.evaluate_board(this.board), index: -1}

    
        let moves = this.board.get_moves();

        if (moves.length == 0) return {score: Evaluation.evaluate_board(this.board), index: -1}

        for (let move of moves)
        {
            this.board.move(move)
            let { score } = this.search(depth - 1, best_beta.negate(), best_alpha.negate())
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