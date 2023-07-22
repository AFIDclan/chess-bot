const Engines = require('./engines');
const MoveValidator = require("@ninjapixel/chess").Chess
const { Logger } = require("yalls");
const fs = require('fs');
const readline = require('readline');

// Create a parent logger
const log = Logger.console("Engine Tests", { format: ":NAMESPACE | :STRING" });

Engines.forEach(async (Engine) => {

    let tests = require("./tests/");
    let elog = log.create_child(Engine.name);

    let puzzles = await read_puzzles("./lichess_db_puzzle.csv", 300);

    let pass_count = 0;
    let fail_count = 0;

    for (let puzzle of puzzles)
    {
        process.stdout.write("\r" + log.f(Engine.name + ": Testing ", { color: "blue" }) + (pass_count + fail_count) + "/" + puzzles.length + "");
        let e = new Engine({
            color: puzzle.fen.split(' ')[1],
            validator: new MoveValidator(puzzle.fen)

        }, Logger.noop());

        let start = Date.now();
        let move = e.generate_move();
        let end = Date.now();

        let pass = move == puzzle.moves[0]
        //elog.info((pass ? log.f("PASS", { color: "green" }) : log.f("FAIL", { color: "red" })) + " (" + (end - start) + "ms) " + (pass ? "" : log.f("Expected: " + puzzle.moves[0] + " Got: " + move, { color: "red" })));
        if (pass) {
            pass_count++;
        } else {
            fail_count++;
        }

    }
    console.log("");
    elog.info("Pass: " + pass_count + " Fail: " + fail_count + " (" + (pass_count / (pass_count + fail_count) * 100) + "%)");

});

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