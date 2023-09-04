
// Extracts the zero-based rank of an 0x88 square.
function rank(square) {
    return square >> 4
}

// Extracts the zero-based file of an 0x88 square.
function file(square) {
    return square & 0xf
}

// Converts a 0x88 square to algebraic notation.
function algebraic(square) {
    const f = file(square)
    const r = rank(square)
    return ('abcdefgh'.substring(f, f + 1) +
      '87654321'.substring(r, r + 1))
  }

function fast_moves(validator, opts={})
{
    let moves = validator._moves(opts)

    if (opts.verbose)
        moves = moves.map((m) => ({...m, to: algebraic(m.to), from: algebraic(m.from)}))

    return moves;
}

module.exports = {
    rank,
    file,
    algebraic,
    fast_moves
}