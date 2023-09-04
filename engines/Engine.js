const { spawn } = require("node:child_process")
class Engine
{
    constructor(game, log)
    {
        this.game = game;
        this.log = log;
    }

    generate_move()
    {
        throw new Error("Not implemented");
    }

    async await_worker_search(path, fen, starting_moves)
    {   
        return new Promise((resolve, reject) => {
            let searcher = spawn('node', [path, fen, starting_moves])
            searcher.stdout.on('data', (data) => {
                

                let lines = data.toString().split("\n")

                let output = lines.find((a) => a.startsWith("OUT: "))
                if (output)
                {
                    let ss = Date.now()

                    let move = output.split(" ")[1]

                    move = JSON.parse(move)
                    resolve(move)
                }
                
            })

            searcher.stderr.on('data', (data) => {
                console.log(data.toString())
            })
        });
    }
}

module.exports = Engine;