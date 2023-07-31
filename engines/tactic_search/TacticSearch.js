const Engine = require("../Engine");

const Pin = require("./lib/tactics/Pin");
const Fork = require("./lib/tactics/Fork");
const Capture = require("./lib/tactics/Capture");
const Check = require("./lib/tactics/Check");
const Evade = require("./lib/tactics/Evade");
const Tactic = require("./lib/Tactic");
const { fast_moves } = require("./lib/Helpers")

const piece_values = require("./lib/piece_values.json")

const Evaluation = require("./lib/Evaluation")

class TacticSearch extends Engine
{
    generate_move()
    {

        this.max_search_time_ms = 500

        this.search_count = 0
        this.search_start = Date.now()
        
        let moves = fast_moves(this.game.validator, {verbose: true})
        

        let best = this.search(5, this.game.validator)
        
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

        if (depth == 0) {
            return {score: Evaluation.evaluate_board(this.game.color, validator),  moves: [], term_cause: "Depth Exceeded"}
        }

        // if (Date.now()-this.search_start > this.max_search_time_ms)
        // {
        //     return {score: Evaluation.evaluate_board(this.game.color, validator), moves: [], term_cause: "Time Exceeded"}
        // }

        //console.log("GET moves ALL")
        let moves = validator.moves({verbose: true})
        
        let found_tactics = moves.map((move)=>{

            let fork = Fork.from_move(this.game.validator, move)
            if (fork) return fork

            let capture = Capture.from_move(this.game.validator, move)
            if (capture) return capture

            let pin = Pin.from_move(this.game.validator, move)
            if (pin) return pin

            let check = Check.from_move(this.game.validator, move)
            if (check) return check

            let evade = Evade.from_move(this.game.validator, move)
            if (evade) return evade

            return null

        });

        found_tactics = found_tactics.filter(f => f)


        let first = false
        if (this.search_count == 1)
            first = true
            

        if (!found_tactics.length)
        {
            return {score: Evaluation.evaluate_board(this.game.color, validator), moves: [], term_cause: "No Moves"}
        }   
        

        let results = found_tactics.map((tactic, i) => {
            //console.log("Searcing: " + tactic.constructor.name + " " + tactic.move.from + tactic.move.to + " " + i + "/" + found_tactics.length)
            validator.move(tactic.move)
            let {score, moves, term_cause} = this.search(depth - 1, validator)
            
            //score -= tactic.value
            moves.unshift({tactic, score, depth: depth-1})
            score = -score
            
            validator.undo()

            return {score, tactic, moves, term_cause}
        })

        if (first)
        {
            results.forEach(r => {
                console.log("TACTIC", r.tactic.constructor.name, r.tactic.move.from+r.tactic.move.to , r.score, r.term_cause)
                r.moves.slice(1).forEach((m, i) => {
                    for (let j = 0; j < i; j++)
                        process.stdout.write("   ")
                    console.log(" -> MOVE", m.tactic.constructor.name, m.tactic.move.from+m.tactic.move.to, m.score, m.depth)
                })
            })
        }

        let best_move = results.reduce((acc, r) => {
            if (r.score > acc.score)
                return r
            return acc
        }, {score: -Infinity, tactic: null, moves: [], term_cause: null})

        return best_move
    }

}

module.exports = TacticSearch;