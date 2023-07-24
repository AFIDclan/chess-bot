const Engine = require("../Engine");

const Pin = require("./lib/tactics/Pin");
const Fork = require("./lib/tactics/Fork");
const Capture = require("./lib/tactics/Capture");
const Tactic = require("./lib/Tactic");


const piece_values = require("./lib/piece_values.json")

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

class TacticSearch extends Engine
{
    generate_move()
    {

        this.search_count = 0
        let moves = this.game.validator.moves({verbose: true})
        
        let best = this.search(6, this.game.validator)
        
        if (!best || !best.tactic)
        {
            this.log.info("No tactic found")
            console.log("No tactic found")
            // Generate a random move
            let move = moves[Math.floor(Math.random() * moves.length)]
            return move.from + move.to
        }
        console.log("Search count: " + this.search_count)
        return best.tactic.move.from + best.tactic.move.to
    }

    search(depth, validator,)
    {
        this.search_count++

        if (depth == 0) return {score: 0, validator}

        let moves = validator.moves({verbose: true})

        let forks = moves.map(move => Fork.from_move(this.game.validator, move)).filter(f => f)
        let captures = moves.map(move => Capture.from_move(this.game.validator, move)).filter(f => f)
        let pins = moves.map(move => Pin.from_move(this.game.validator, move)).filter(f => f)

        let found_tactics = forks.concat(captures).concat(pins)

        if (!found_tactics.length)
        {
            return {score: 0, validator}
            // Generate a random move
            found_tactics = [new Tactic(moves[Math.floor(Math.random() * moves.length)], 0)]
        }

        let results = found_tactics.map((tactic, i) => {
            validator.move(tactic.move)
            let {score} = this.search(depth - 1, validator)
            
            score -= tactic.value
            score = -score

            validator.undo()

            return {score, tactic}
        })


        let best_move = results.reduce((acc, r) => {
            if (r.score > acc.score)
                return r
            return acc
        }, {score: -Infinity, tactic: null})

        return best_move
    }

}

module.exports = TacticSearch;