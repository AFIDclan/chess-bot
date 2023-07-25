const Engine = require("../Engine");

const Pin = require("./lib/tactics/Pin");
const Fork = require("./lib/tactics/Fork");
const Capture = require("./lib/tactics/Capture");
const Check = require("./lib/tactics/Check");
const Tactic = require("./lib/Tactic");
const { fast_moves } = require("./lib/Helpers")

const piece_values = require("./lib/piece_values.json")


class TacticSearch extends Engine
{
    generate_move()
    {

        this.max_search_time_ms = 500

        this.search_count = 0
        this.search_start = Date.now()
        
        let moves = fast_moves(this.game.validator, {verbose: true})
        

        let best = this.search(20, this.game.validator)
        
        if (!best || !best.tactic)
        {
            this.log.info("No tactic found. Returning random move")
            // Generate a random move
            let move = moves[Math.floor(Math.random() * moves.length)]
            return move.from + move.to
        }
        return best.tactic.move.from + best.tactic.move.to
    }

    search(depth, validator)
    {
        this.search_count++

        if (depth == 0 || Date.now()-this.search_start > this.max_search_time_ms) return {score: 0, validator}

        //console.log("GET moves ALL")
        let moves = validator.moves({verbose: true})

        let forks = moves.map(move => Fork.from_move(this.game.validator, move)).filter(f => f)
        let captures = moves.map(move => Capture.from_move(this.game.validator, move)).filter(f => f)
        let pins = moves.map(move => Pin.from_move(this.game.validator, move)).filter(f => f)
        let checks = moves.map(move => Check.from_move(this.game.validator, move)).filter(f => f)

        let found_tactics = forks.concat(captures).concat(pins).concat(checks)

        if (!found_tactics.length)
            return {score: 0, validator}
        

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