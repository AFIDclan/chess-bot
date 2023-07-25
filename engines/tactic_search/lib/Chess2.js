
const Chess = require("chess.js").Chess

const WHITE = 'w'
const BLACK = 'b'

const PAWN = 'p'
const KNIGHT = 'n'
const BISHOP = 'b'
const ROOK = 'r'
const QUEEN = 'q'
const KING = 'k'

const PIECE_OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14],
    b: [-17, -15, 17, 15],
    r: [-16, 1, 16, -1],
    q: [-17, -16, -15, 1, 17, 16, 15, -1],
    k: [-17, -16, -15, 1, 17, 16, 15, -1],
}

const PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15],
}

const RANK_1 = 7
const RANK_2 = 6
/*
 * const RANK_3 = 5
 * const RANK_4 = 4
 * const RANK_5 = 3
 * const RANK_6 = 2
 */
const RANK_7 = 1
const RANK_8 = 0

const SECOND_RANK = { b: RANK_7, w: RANK_2 }

const BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64,
}
// Extracts the zero-based rank of an 0x88 square.
function rank(square) {
    return square >> 4
}

// Extracts the zero-based file of an 0x88 square.
function file(square) {
    return square & 0xf
}
function swapColor(color) {
    return color === WHITE ? BLACK : WHITE
}

function addMove(
    moves,
    color,
    from,
    to,
    piece,
    captured = undefined,
    flags = 1
) {
    const r = rank(to)

    if (piece === PAWN && (r === RANK_1 || r === RANK_8)) {
        for (let i = 0; i < PROMOTIONS.length; i++) {
            const promotion = PROMOTIONS[i]
            moves.push({
                color,
                from,
                to,
                piece,
                captured,
                promotion,
                flags: flags | BITS.PROMOTION,
            })
        }
    } else {
        moves.push({
            color,
            from,
            to,
            piece,
            captured,
            flags,
        })
    }
}

// prettier-ignore
// eslint-disable-next-line
const Ox88 = {
    a8: 0, b8: 1, c8: 2, d8: 3, e8: 4, f8: 5, g8: 6, h8: 7,
    a7: 16, b7: 17, c7: 18, d7: 19, e7: 20, f7: 21, g7: 22, h7: 23,
    a6: 32, b6: 33, c6: 34, d6: 35, e6: 36, f6: 37, g6: 38, h6: 39,
    a5: 48, b5: 49, c5: 50, d5: 51, e5: 52, f5: 53, g5: 54, h5: 55,
    a4: 64, b4: 65, c4: 66, d4: 67, e4: 68, f4: 69, g4: 70, h4: 71,
    a3: 80, b3: 81, c3: 82, d3: 83, e3: 84, f3: 85, g3: 86, h3: 87,
    a2: 96, b2: 97, c2: 98, d2: 99, e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
}
class Chess2 extends Chess {

    _moves({
        legal = true,
        piece = undefined,
        square = undefined,
    } = {}) {
        const forSquare = square ? (square.toLowerCase()) : undefined
        const forPiece = piece?.toLowerCase()

        const moves = []
        const us = this._turn
        const them = swapColor(us)

        let firstSquare = Ox88.a8
        let lastSquare = Ox88.h1
        let singleSquare = false

        // are we generating moves for a single square?
        if (forSquare) {
            // illegal square, return empty moves
            if (!(forSquare in Ox88)) {
                return []
            } else {
                firstSquare = lastSquare = Ox88[forSquare]
                singleSquare = true
            }
        }

        console.log(forSquare)

        for (let from = firstSquare; from <= lastSquare; from++) {
            // did we run off the end of the board
            if (from & 0x88) {
                from += 7
                continue
            }

            // empty square or opponent, skip
            if (!this._board[from] || this._board[from].color === them) {
                continue
            }
            const { type } = this._board[from]

            let to;
            if (type === PAWN) {
                if (forPiece && forPiece !== type) continue

                // single square, non-capturing
                to = from + PAWN_OFFSETS[us][0]
                if (!this._board[to]) {
                    addMove(moves, us, from, to, PAWN)

                    // double square
                    to = from + PAWN_OFFSETS[us][1]
                    if (SECOND_RANK[us] === rank(from) && !this._board[to]) {
                        addMove(moves, us, from, to, PAWN, undefined, BITS.BIG_PAWN)
                    }
                }

                // pawn captures
                for (let j = 2; j < 4; j++) {
                    to = from + PAWN_OFFSETS[us][j]
                    if (to & 0x88) continue

                    if (this._board[to]?.color === them) {
                        addMove(
                            moves,
                            us,
                            from,
                            to,
                            PAWN,
                            this._board[to].type,
                            BITS.CAPTURE
                        )
                    } else if (to === this._epSquare) {
                        addMove(moves, us, from, to, PAWN, PAWN, BITS.EP_CAPTURE)
                    }
                }
            } else {
                if (forPiece && forPiece !== type) continue

                for (let j = 0, len = PIECE_OFFSETS[type].length; j < len; j++) {
                    const offset = PIECE_OFFSETS[type][j]
                    to = from

                    while (true) {
                        to += offset
                        if (to & 0x88) break

                        if (!this._board[to]) {
                            addMove(moves, us, from, to, type)
                        } else {
                            // own color, stop loop
                            if (this._board[to].color === us) break

                            addMove(
                                moves,
                                us,
                                from,
                                to,
                                type,
                                this._board[to].type,
                                BITS.CAPTURE
                            )
                            break
                        }

                        /* break, if knight or king */
                        if (type === KNIGHT || type === KING) break
                    }
                }
            }
        }

        /*
         * check for castling if we're:
         *   a) generating all moves, or
         *   b) doing single square move generation on the king's square
         */

        if (forPiece === undefined || forPiece === KING) {
            if (!singleSquare || lastSquare === this._kings[us]) {
                // king-side castling
                if (this._castling[us] & BITS.KSIDE_CASTLE) {
                    const castlingFrom = this._kings[us]
                    const castlingTo = castlingFrom + 2

                    if (
                        !this._board[castlingFrom + 1] &&
                        !this._board[castlingTo] &&
                        !this._attacked(them, this._kings[us]) &&
                        !this._attacked(them, castlingFrom + 1) &&
                        !this._attacked(them, castlingTo)
                    ) {
                        addMove(
                            moves,
                            us,
                            this._kings[us],
                            castlingTo,
                            KING,
                            undefined,
                            BITS.KSIDE_CASTLE
                        )
                    }
                }

                // queen-side castling
                if (this._castling[us] & BITS.QSIDE_CASTLE) {
                    const castlingFrom = this._kings[us]
                    const castlingTo = castlingFrom - 2

                    if (
                        !this._board[castlingFrom - 1] &&
                        !this._board[castlingFrom - 2] &&
                        !this._board[castlingFrom - 3] &&
                        !this._attacked(them, this._kings[us]) &&
                        !this._attacked(them, castlingFrom - 1) &&
                        !this._attacked(them, castlingTo)
                    ) {
                        addMove(
                            moves,
                            us,
                            this._kings[us],
                            castlingTo,
                            KING,
                            undefined,
                            BITS.QSIDE_CASTLE
                        )
                    }
                }
            }
        }

        /*
         * return all pseudo-legal moves (this includes moves that allow the king
         * to be captured)
         */
        if (!legal || this._kings[us] === -1) {
            return moves
        }

        // filter out illegal moves
        const legalMoves = []

        for (let i = 0, len = moves.length; i < len; i++) {
            this._makeMove(moves[i])
            if (!this._isKingAttacked(us)) {
                legalMoves.push(moves[i])
            }
            this._undoMove()
        }

        return legalMoves
    }
}

module.exports = Chess2;