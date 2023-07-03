const EventEmitter = require('events');
const https = require('https');
const MoveValidator = require("@ninjapixel/chess").Chess

class GameState {
    constructor(game, state) {
        this.game = game;

        this.moves = state.moves;
        this.wtime = state.wtime;
        this.btime = state.btime;
        this.winc = state.winc;
        this.binc = state.binc;
        this.status = state.status;

        //this.validator = MoveValidator.load(this.moves);
    }

    get last_move() {
        return this.moves.split(" ").pop();
    }
}

        
    
class Game extends EventEmitter{

    constructor(api, game) {

        super();

        this.api = api;

        this.id = game.id;
        this.full_id = game.fullId;
        this.fen = game.fen;
        this.color = game.color;
        this.last_move = game.lastMove;
        this.source = game.source;
        this.status = game.status;
        this.variant = game.variant;
        this.speed = game.speed;
        this.perf = game.perf;
        this.rated = game.rated;
        this.has_moved = game.hasMoved;
        this.opponent = game.opponent;
        this.is_my_turn = game.isMyTurn;
        this.compat = game.compat;

        this.validator = new MoveValidator(this.fen);

        this.connect();  

        
    }

    connect() {

        let req = this.api._get("/api/bot/game/stream/" + this.full_id, (message) => {
            this._on_message(message);
        });
    }

    make_move(move) {
        let req = this.api._post("/api/bot/game/" + this.id + "/move/" + move, (message) => {});
    }


    _update_state(state) {
        this.state = new GameState(this, state);

        this.validator.move({from: this.state.last_move.slice(0, 2), to: this.state.last_move.slice(2, 4)})

        this.fen = this.validator.fen()
        this.is_my_turn = this.color.startsWith(this.validator.turn())

        this.emit("state_update", this.state);

        if (this.is_my_turn) {
            this.emit("move_needed")
        }
    }

    _on_message(message) {

        switch (message.type) {
            case "gameFull":
                this._update_state(message.state);
                break;
            case "gameState":
                this._update_state(message);
                break;
            case "chatLine":
                this.emit("chat", message);
                break;
            case "gameFinish":
                this.emit("finish", message);
                break;
            default:
                console.log("Unknown message type:", message.type);
                break;
        }
    }
}

class Challange {
    constructor(api, challange) {
        this.api = api;

        this.id = challange.id;
        this.url = challange.url;
        this.status = challange.status;

        this.challenger = challange.challenger;
        this.dest_user = challange.destUser;

        this.variant = challange.variant.key;
        this.speed = challange.speed;
        this.time_control = challange.timeControl.type;
        this.color = challange.color;
        this.rated = challange.rated;
    }

    async accept() {
        let req = await this.api._post("/api/challenge/" + this.id + "/accept", (message) => {
            //console.log(message);
        });

    }
}

class LichessAPI extends EventEmitter {
    constructor(username, token) {

        super();

        this.username = username;
        this.token = token;
        this.games = [];
        
        this.req_options = {
            headers: {
                'Authorization': 'Bearer ' + this.token
            }
        };
        
    }

    async connect() {

        // https.get("https:/lichess.org/api/stream/event", this.req_options, (res) => {
        //     res.on('data', (chunk) => {
        //       let data = chunk.toString();
        //       if (data.includes("{") || data.includes("[")) {
        //         let message = JSON.parse(data);
        //         this._on_message(message);
        //       }

        //     });
        //     res.on('end', () =>{
        //       this.emit('end');
        //     });
        //   });

        let req = await this._get("/api/stream/event", (message) => {
            this._on_message(message);
        });
        
    }

    _request(path, callback, opts={}) {
        let options = this.req_options;
        options.path = path;

        Object.assign(options, opts);

        return new Promise((resolve, reject) => {

            https.get("https:/lichess.org" + path, options, (res) => {
                res.on('data', (chunk) => {
                    let data = chunk.toString();
                    if (data.includes("{") || data.includes("[")) {
                        try {   
                            let message = JSON.parse(data);
                            callback(message);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });

                resolve(res);
            });

        });
    }

    _post(path, callback) {
        return this._request(path, callback, {method: "POST"});
    }

    _get(path, callback) {
        return this._request(path, callback, {method: "GET"});
    }

    _on_message(message) {
        if (message.error)
        {
            this.emit('error', message.error);
            return;
        }

        switch (message.type) {
            case "gameStart":
                let game = new Game(this, message.game);
                this.games.push(game);
                this.emit('new_game', game);
                break;
            case "challenge":
                let challange = new Challange(this, message.challenge);
                this.emit('challenge', challange);
                break;
            default:
                this.emit('message', message);
                break;
        }


    }
}

module.exports = LichessAPI;