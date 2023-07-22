const Engines = require('./engines');
const MoveValidator = require("@ninjapixel/chess").Chess
const { Logger } = require("yalls");
const fs = require('fs');
const readline = require('readline');

// Create a parent logger
const log = Logger.console("Engine Tests", { format: ":NAMESPACE | :STRING" });
let loading_bar_length = 25;

Engines.forEach(async (Engine) => {

    let tests = require("./tests/");

    let stream_log = log.create_child(Engine.name, { log: {
        debug: process.stdout.write.bind(process.stdout),
        info: process.stdout.write.bind(process.stdout),
        warn: process.stdout.write.bind(process.stdout),
        error: process.stdout.write.bind(process.stdout)
    }, 
    format: "\r:NAMESPACE | :STRING"});


    let elog = log.create_child(Engine.name, { log: {
        debug: process.stdout.write.bind(process.stdout),
        info: process.stdout.write.bind(process.stdout),
        warn: process.stdout.write.bind(process.stdout),
        error: process.stdout.write.bind(process.stdout)
    }});

    let puzzles = await read_puzzles("./lichess_db_puzzle.csv", 25);

    let pass_count = 0;
    let fail_count = 0;

    for (let puzzle of puzzles)
    {
        //stream_log.info(log.f("Testing ", { color: "blue" , blink: true}) + (pass_count + fail_count) + "/" + puzzles.length + "" + " (" + (pass_count / (pass_count + fail_count) * 100) + "%)");
        let loading_string = ""
        for (let i=0;i<loading_bar_length;i++)
            loading_string += (i > Math.round((pass_count+fail_count)/puzzles.length*loading_bar_length)) ? "░" : "█";

        
        stream_log.info(log.f("Testing ", { color: "blue" , blink: true}) + (pass_count + fail_count) + "/" + puzzles.length + "  " + loading_string);
        let e = new Engine({
            color: puzzle.fen.split(' ')[1],
            validator: new MoveValidator(puzzle.fen)

        }, Logger.noop());

        let pass = true;

        // for (let puzzle_move of puzzle.moves)
        // {
        //     let move = e.generate_move();

        //     if (move != puzzle_move)
        //     {
        //         pass = false;
        //         break;
        //     }
        // }
       

        let move = e.generate_move();
        pass = move == puzzle.moves[0];

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