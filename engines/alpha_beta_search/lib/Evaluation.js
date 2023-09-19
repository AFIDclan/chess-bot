const piece_values = require("./piece_values.json")
const piece_positions = require("./piece_positions.json")


function eval_color(board, c)
{
    let pawns = board.get_pawns(c)
    let knights = board.get_knights(c)
    let bishops = board.get_bishops(c)
    let rooks = board.get_rooks(c)
    let queens = board.get_queens(c)
    let kings = board.get_kings(c)

    let pawn_val = pawns.reduce((acc, pos) => acc + (piece_values["p"] * piece_positions[c]["p"][pos]), 0)
    let knight_val = knights.reduce((acc, pos) => acc + (piece_values["n"] * piece_positions[c]["n"][pos]), 0)
    let bishop_val = bishops.reduce((acc, pos) => acc + (piece_values["b"] * piece_positions[c]["b"][pos]), 0)
    let rook_val = rooks.reduce((acc, pos) => acc + (piece_values["r"] * piece_positions[c]["r"][pos]), 0)
    let queen_val = queens.reduce((acc, pos) => acc + (piece_values["q"] * piece_positions[c]["q"][pos]), 0)
    let king_val = kings.reduce((acc, pos) => acc + (piece_values["k"] * piece_positions[c]["k"][pos]), 0)

    return pawn_val + knight_val + bishop_val + rook_val + queen_val + king_val
}

piece_positions["b"] =  Object.fromEntries(Object.entries(piece_positions["w"]).map(([k, pos])=>[k, [...pos].reverse()]))


class Evaluation
{
    /**
     * 
     * @param {Board} board the board to evaluate
     * @returns {number} the value of the board
     */
    static evaluate_board(board)
    {

        let color = board.turn()
        

        let other_color = color == 'w' ? 'b' : 'w';

        return eval_color(board, color) - eval_color(board, other_color);
    }
}

module.exports = Evaluation