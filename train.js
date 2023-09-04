
const fs = require('fs');
const readline = require('readline');
const brain = require("brain.js")
const Chess = require('chess.js').Chess;


// provide optional config object (or undefined). Defaults shown.
const config = {
    binaryThresh: 0.5,
    hiddenLayers: [100, 100], // array of ints for the sizes of the hidden layers in the network
    activation: 'relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
    leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
  };

async function train() {
    const puzzles = await read_puzzles("./lichess_db_puzzle.csv", 500);
    const trainingData = prepareTrainingData(puzzles);

    // Split data into training and validation sets
    const validationDataSize = Math.floor(trainingData.length * 0.1); // 10% for validation
    const validationData = trainingData.splice(0, validationDataSize);

        
    const net = new brain.NeuralNetwork(config);
    const error = net.train(trainingData, {
        // Defaults values --> expected validation
        iterations: 100, // the maximum times to iterate the training data --> number greater than 0
        errorThresh: 1e-10, // the acceptable error percentage from training data --> number between 0 and 1
        log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
        logPeriod: 10, // iterations between logging out --> number greater than 0
        learningRate: 0.01, // scales with delta to effect training rate --> number between 0 and 1
        momentum: 0.1,
        callback: ({ error }) => {
            // Calculate accuracy on the validation set and print it out
            const accuracy = calculateAccuracy(net, validationData);
            console.log("Validation accuracy:", accuracy);
        }
      });


    // You can also test the trained network on some test data, but that requires more preparation.

    console.log("Training completed!", error);

    const key = brain.likely(trainingData[4].input, net);

    console.log(oneHotToMove(key), oneHotToMove(trainingData[4].output))
}

function prepareTrainingData(puzzles) {
    // Convert puzzles data to the format required for brain.js
    const trainingData = puzzles.map((puzzle) => {
        const board = new Chess(puzzle.fen);
        const input = boardToInput(board);
        const output = moveToOneHotEncoding(puzzle.moves[0]); // We'll take only the first move as the correct move.
        return { input, output };
    });

    return trainingData;
}

function calculateAccuracy(net, validationData) {
    // Calculate the accuracy of the neural network on the validation set
    let correctPredictions = 0;

    validationData.forEach(({ input, output }) => {
        const prediction = brain.likely(input, net);
        const predictedMove = oneHotToMove(prediction);
        const trueMove = oneHotToMove(output);
        if (predictedMove === trueMove) {
            correctPredictions++;
        }
    });

    return correctPredictions / validationData.length;
}

function boardToInput(board) {
    // Convert chess board state to an array of inputs for the neural network
    // Here, we'll use a simple representation where each square is either empty or has a piece (binary values)

    const input = [];

    // Loop through each square of the chess board
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = board.get(row, col);
            if (square) {
                // Convert piece to a binary value
                // 1 for white pieces, -1 for black pieces
                // Encode each piece type using unique numbers (e.g., 1 for Pawn, 2 for Knight, etc.)
                const pieceValue = {
                    'p': 1,
                    'r': 2,
                    'n': 3,
                    'b': 4,
                    'q': 5,
                    'k': 6,
                    'P': -1,
                    'R': -2,
                    'N': -3,
                    'B': -4,
                    'Q': -5,
                    'K': -6
                }[square.type];

                input.push(pieceValue);
            } else {
                input.push(0); // Empty square
            }
        }
    }

    return input;
}

function moveToOneHotEncoding(move) {
    // Convert chess move to a one-hot encoded array for the neural network
    // The array will have a 1 at the index corresponding to the move and 0 elsewhere

    const moves = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8',
        'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8',
        'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8',
        'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'];

    const moveIndex = moves.indexOf(move.slice(2, 4));

    const output = Array(moves.length).fill(0);
    output[moveIndex] = 1;

    return output;
}

function oneHotToMove(output) {
    // Convert neural network output to a chess move
    // The output is a one-hot encoded array with a 1 at the index corresponding to the move and 0 elsewhere

    if (output.length == 64) 
        output = output.indexOf(1);

    const moves = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8',
        'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8',
        'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8',
        'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'];


    return moves[output];
}

train()

async function read_puzzles(puzzle_path, num_puzzles) {

    class Puzzle {
        //'PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags',
        constructor(csv_line) {
            let fields = csv_line.split(',');
            this.id = fields[0];
            this.fen = fields[1];
            this.moves = fields[2].split(' ');
            this.rating = fields[3];
            this.rating_deviation = fields[4];
            this.popularity = fields[5];
            this.nb_plays = fields[6];
            this.themes = fields[7];
            this.game_url = fields[8];
            this.opening_tags = fields[9];
        }
    }

    const readable = fs.createReadStream(puzzle_path);
    const reader = readline.createInterface({ input: readable });
    const puzzles = await new Promise((resolve) => {
        let puzzles = [];
        reader.on('line', (line) => {


            if (puzzles.length > num_puzzles) {
                reader.close();
                resolve(puzzles);
            } else {
                puzzles.push(new Puzzle(line));
            }
        });
    });
    readable.close();
    puzzles.shift()

    return puzzles;
}