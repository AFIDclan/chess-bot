const piece_values = require("./piece_values.json")

class Evaluation
{
    static evaluate_board(color, validator)
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
            // if (p.type == 'p')
            //     acc += pawn_position_values[color][p.i][p.j]
            // else if (p.type == 'n')
            //     acc += knight_position_values[color][p.i][p.j]
            return acc
        }, 0)
    
        let enemy_value  = enemy_peices.reduce((acc, p) => {
            acc += piece_values[p.type]
            // if (p.type == 'p')
            //     acc += pawn_position_values[color == "w" ? "b" : "w"][p.i][p.j]
            // else if (p.type == 'n')
            //     acc += knight_position_values[color == "w" ? "b" : "w"][p.i][p.j]
            return acc
        }, 0)
    
        if (validator.isCheckmate())
            return validator.turn() == color ? -Infinity : Infinity
    
        if (validator.isStalemate() || validator.isDraw() || validator.isThreefoldRepetition())
            return 0
    
        return friendly_value - enemy_value
    }
}

module.exports = Evaluation