const MoveValidator = require("chess.js").Chess

const chess = new MoveValidator()

// make some moves
chess.move('e4')
chess._turn = 'w'
chess.move('a4')
chess._turn = 'w'
chess.move('f4')

console.log(chess.ascii())