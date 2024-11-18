import './utils.js';

import { Game } from './game.js';

export default class Chessboard {

	static DarkStroke = '#000';
	static DarkFill = '#333';
	static DarkHighlightStroke = '#bbb';
	static LightFill = '#eee';
	static LightStroke = '#bbb';
	static SelectionStroke = '#4f4';
	static LastStroke = '#44f';
	static MoveFill = '#0f03';
	static CheckStroke = '#f44';

	static defaultOptions = { 
		lightCellColor: '#f0d9b5', 
		darkCellColor: '#b58863',
		ai: 2,
		onmove: function() {},
		undo: function() {}
	};

	static SIZE = 45;

	#ctx;
	#opt = Chessboard.defaultOptions;
	#w;
	#scale = 1;
	#game;
	#selection = -1;
	#moves = [];
	#last = [];
	#color = 'white';

	get context() { return this.#ctx; }
	get canvas() { return this.#ctx.canvas; }
	get width() { return this.canvas.width; }
	get height() { return this.canvas.height; }

	get onmove() { return this.#game.board.getPlayingColor(); }
	get waiting() { return this.#color != this.onmove; }
	get opponent() { return this.#color == 'black' ? 'white' : 'black'; }

	set level(v) { this.#opt.ai = v; }

	constructor (canvas, color='white', opt={}) {

		canvas.onclick = (e) => this.#handleClick(e.offsetX, e.offsetY);
		
		this.#ctx = canvas.getContext('2d');
		this.#ctx.lineWidth = 1;

		this.#color = color;


		Object.assign(this.#opt, opt);

		let config = Game.newGameConfig(), history = [];

		if (localStorage) {
			const data = localStorage.getItem('game_chess');

			if (data) {

				const state = JSON.parse(data);

				config = state.config;
				history = state.history;

				const last = history[history.length - 1];
				this.#last = [fromMove(last.from), fromMove(last.to)];

				for (const i of history)
					this.#opt.onmove(i);
			}
		}

		this.#game = new Game(config);

		//this.#game.printToConsole();
		console.debug(this.#game.board.configuration);

		// const W = Math.min(this.width, this.height);
		// if (W)
		// 	this.#setSize(W);

		const resizeObserver = new ResizeObserver(e => this.#onResize(e[0].contentRect));
		resizeObserver.observe(canvas);
		//resizeObserver.observe(canvas.parentElement);
	}

	draw() {

		this.#drawBoard();
		this.#drawSelection();
		this.#drawLastMove();
		this.#drawMoves();
		this.#drawCheck();
		this.#drawPieces();
		this.#drawLabels();

		
	}

	undo() {

		const m = this.#game.undo();
		
		if (m) {

			this.#game.undo();
			
			this.#moves = [];
			this.#selection = -1;

			const hist = this.#game.getHistory();
			if (hist.length > 0) {
				const last = hist[hist.length - 1];
				this.#last = [fromMove(last.from), fromMove(last.to)];
			}
			else {
				this.#last = [];
			}

			this.draw();
		}
	}

	reset(color='white') {

		const b = this.#game.board;

		b.configuration = Game.newGameConfig();
		b.history.splice(0, b.history.length);

		this.#last = [];
		this.#moves = [];
		this.#selection = -1;
		this.#color = color;

		if (color == 'black')
			this.#moveAI();


		this.draw();

	}

	#onResize(r) {

		//console.debug('#### ON RESIZE', r);

		const w = Math.min(r.width, r.height);

		this.#ctx.canvas.width = w;
		this.#ctx.canvas.height = w;
		
		this.#setSize(w);
	}

	#setSize(s) {
		this.#w = s / 8;
		this.#scale = this.#w / Chessboard.SIZE;

		console.debug("# ", this.#w, this.#scale);

		this.draw();
	}

	#handleClick(X, Y) {
		// console.debug('On click:', X, Y);

		if (this.#game.finished)
			return;

		const x = Math.floor(X / this.#w)
			, y = Math.floor(Y / this.#w)
			, i = this.#color == 'white' ? y * 8 + x : 63 - (y * 8 + x)
			, m = toMove(i)
			;

		// console.debug('ON click:', x, y, i, m);


		if (!this.waiting && this.#moves.includes(i)) {

			// valid move
			this.#move(this.#selection, m);
			this.draw();

			if (typeof this.#opt.ai == 'number') {
				this.#moveAI();
			}

			
			return;
		}

		const current = this.#selection;
		const p = this.#game.board.getPiece(m);

		this.#selection = p ? i : -1;

		if (current != this.#selection) {

			if (this.#selection > -1) {
				//getPieceMoves
				const moves = this.#game.moves(m);
				this.#moves = moves.map(i => fromMove(i));
			}
			else {
				this.#moves = [];
			}

			this.draw();
		}
	}

	#move(f, t) {

		let from = f, to = t;

		if (typeof f == 'number')
			from = toMove(f);
		else
			f = fromMove(f);

		if (typeof t == 'number')
			to = toMove(t);
		else
			t = fromMove(t);

		this.#game.move(from, to);
		this.#game.moves();

		this.#doMove(f, t);
	}

	#moveAI() {

		const move = () => {

			const m = this.#game.aiMove(this.#opt.ai);

			console.debug('AI move:', m);

			let i, j;

			for (const [from, to] of Object.entries(m)) {

				i = fromMove(from);
				j = fromMove(to);

				this.#doMove(i, j);
			}

			// update state
			this.#game.moves();

			this.draw();
		};

		if (!this.#game.finished)
			setTimeout(move, 2000);
	}

	#doMove(f, t) {

		//console.debug('## Move:', f, t, this.onmove);

		const history = this.#game.getHistory();
		const last = history[history.length - 1];


		if (localStorage) {
			const data = { config: this.#game.state, history };
			localStorage.setItem('game_chess', JSON.stringify(data));
		}


		this.#last = [f, t];
		this.#selection = -1;
		this.#moves = [];

		this.#opt.onmove(last);
	}

	#drawBoard() {

		const ctx = this.#ctx;

		this.#ctx.save();

		const w = this.#w;
		const W = w * 8;

		// console.debug('Draw board', W);

		const col = [ this.#opt.lightCellColor, this.#opt.darkCellColor ];

		// border
		this.#ctx.strokeStyle = "black";
		this.#ctx.strokeRect(0, 0, W, W);

		for (let i = 0, x, y; i < 64; ++i) {

			x = i % 8;
			y = Math.floor(i / 8);

			this.#ctx.fillStyle = col[(i + y) % 2];
			this.#ctx.fillRect(x*w, y*w, w, w);
		}

		this.#ctx.restore();

		drawWatermark('www.sipme.io');

		function drawWatermark(text) {
			ctx.save();
			//ctx.translate(btn.x, btn.y);
			//ctx.rotate(angle);

			const s = W / 50
				, x = w * 0.1
				, y = W - w*0.1
				;
			

			ctx.translate(x, y);
			// ctx.rotate(-Math.PI/2);
			
			ctx.fillStyle = '#1118';
			ctx.textBaseline = "middle";
			ctx.textAlign = "left";
			ctx.font = "bold " + `${s}px` + " monospace";
			ctx.fillText(text, 0, 0);
			ctx.restore();
		}
	}

	#drawSelection() {

		if (this.#selection > -1) {
			this.#drawBorder(Chessboard.SelectionStroke, this.#selection);
		}
	}

	#drawMoves() {
		// console.debug('Valid moves:', this.#moves);

		this.#ctx.fillStyle = Chessboard.MoveFill;

		let x, y;

		for (const i of this.#moves) {
			[x, y] = this.#getCoords(i);
			this.#ctx.fillRect(x, y, this.#w, this.#w);
		}
	}

	#drawLastMove() {
		if (this.#last.length > 0)
			this.#drawBorder(Chessboard.LastStroke, ...this.#last);
	}

	#drawBorder(color, ...pos) {

		let x, y;

		this.#ctx.lineWidth = 3;
		this.#ctx.strokeStyle = color;

		for (const i of pos) {
			[x, y] = this.#getCoords(i);
			this.#ctx.strokeRect(x, y, this.#w, this.#w);
		}
	}

	#drawPieces() {
		this.#ctx.lineWidth = 1;

		const pieces = this.#game.board.configuration.pieces;

		for (const [i, p] of Object.entries(pieces))
			this.#drawPiece(fromMove(i), p);
	}

	#drawLabels() {
		if (this.#game.finished) {

			drawLabel(this.#ctx, 'Checkmate');
		}
	}

	#drawCheck() {
		if (!this.waiting) {

			if (this.#game.board.hasPlayingPlayerCheck()) {

				const p = this.#game.board.getKingPosition(this.opponent);
				const i = fromMove(p);

				this.#drawBorder(Chessboard.CheckStroke, i);
			}

		}
	}

	#drawPiece(i, t) {

		const black = t.charCodeAt(0) >= 97;
		const [x, y] = this.#getCoords(i);

		if (black) {
			this.#ctx.fillStyle = Chessboard.DarkFill;
			this.#ctx.strokeStyle = Chessboard.DarkStroke;
		}
		else {
			this.#ctx.fillStyle = Chessboard.LightFill;
			// this.#ctx.strokeStyle = Chessboard.LightStroke;
			this.#ctx.strokeStyle = Chessboard.DarkStroke;
		}

		this.#drawBegin(x, y);

		switch (t.toLowerCase()) {

			case Game.PIECES.PAWN_B:
			this.#drawPawn(black);
			break;

			case Game.PIECES.ROOK_B:
			this.#drawRock(black);
			break;

			case Game.PIECES.KNIGHT_B:
			this.#drawKnight(black);
			break;

			case Game.PIECES.KING_B:
			this.#drawKing(black);
			break;

			case Game.PIECES.QUEEN_B:
			this.#drawQueen(black);
			break;

			case Game.PIECES.BISHOP_B:
			this.#drawBishop(black);
			break;

		}

		this.#drawEnd();
	}

	#drawPawn() {

		const p = new Path2D('m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 H 34 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z');

		this.#ctx.fill(p);
		this.#ctx.stroke(p);
	}

	#drawBishop(b) {

		const ctx = this.#ctx;

		const p1 = new Path2D("M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z")
			, p2 = new Path2D("M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z")
			, p3 = new Path2D("M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z")
			, p4 = new Path2D("M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18")
			;

		ctx.fill(p1);
		ctx.fill(p2);
		ctx.fill(p3);

		ctx.stroke(p1);
		ctx.stroke(p2);
		ctx.stroke(p3);

		if (b)
			ctx.strokeStyle = Chessboard.DarkHighlightStroke;

		ctx.stroke(p4);
	}

	#drawQueen(b) {

		const ctx = this.#ctx;

		if (b) {
			const p1 = new Path2D("m 22.5,6 a 2,2 0 0 0 -2,2 2,2 0 0 0 2,2 2,2 0 0 0 2,-2 2,2 0 0 0 -2,-2 z m 0,4 -3,14.5 -5.171875,-13.529297 A 2,2 0 0 0 16,9 2,2 0 0 0 14,7 a 2,2 0 0 0 -2,2 2,2 0 0 0 2,2 2,2 0 0 0 0.298828,-0.02344 L 14,25 6.7324219,13.855469 A 2,2 0 0 0 8,12 2,2 0 0 0 6,10 2,2 0 0 0 4,12 2,2 0 0 0 6,14 2,2 0 0 0 6.5820312,13.912109 L 9,26 c 0,2 1.5,2 2.5,4 1,1.5 1,1 0.5,3.5 -1.5,1 -1,2.5 -1,2.5 -1.5,1.5 0,2.5 0,2.5 a 35,35 0 0 0 23,0 c 0,0 1.5,-1 0,-2.5 0,0 0.5,-1.5 -1,-2.5 C 32.5,31 32.5,31.5 33.5,30 34.5,28 36,28 36,26 31.888195,25.274387 27.4254,24.902501 22.951172,24.878906 28.069373,24.853639 32.902124,25.225531 36,26 L 38.417969,13.912109 A 2,2 0 0 0 39,14 a 2,2 0 0 0 2,-2 2,2 0 0 0 -2,-2 2,2 0 0 0 -2,2 2,2 0 0 0 1.267578,1.855469 L 31,25 30.701172,10.976562 A 2,2 0 0 0 31,11 2,2 0 0 0 33,9 2,2 0 0 0 31,7 2,2 0 0 0 29,9 2,2 0 0 0 30.671875,10.970703 L 25.5,24.5 Z")
			, p2 = new Path2D("m 11,29 a 35,35 0 0 1 23,0")
			, p3 = new Path2D("m 12.5,31.5 h 20")
			, p4 = new Path2D("m 11.5,34.5 a 35,35 0 0 0 22,0")
			, p5 = new Path2D("m 10.5,37.5 a 35,35 0 0 0 24,0")
			;

			ctx.fill(p1);
			ctx.stroke(p1);
			ctx.stroke(p2);

			ctx.strokeStyle = Chessboard.DarkHighlightStroke;

			ctx.stroke(p2);
			ctx.stroke(p3);
			ctx.stroke(p4);
			ctx.stroke(p5);
		}
		else {
			// 2, 3
			const p1 = new Path2D("m 9,26 c 8.5,-1.5 21,-1.5 27,0 L 38.5,13.5 31,25 30.7,10.9 25.5,24.5 22.5,10 19.5,24.5 14.3,10.9 14,25 6.5,13.5 Z")
				, p2 = new Path2D("m 9,26 c 0,2 1.5,2 2.5,4 1,1.5 1,1 0.5,3.5 -1.5,1 -1,2.5 -1,2.5 -1.5,1.5 0,2.5 0,2.5 6.5,1 16.5,1 23,0 0,0 1.5,-1 0,-2.5 0,0 0.5,-1.5 -1,-2.5 -0.5,-2.5 -0.5,-2 0.5,-3.5 1,-2 2.5,-2 2.5,-4 -8.5,-1.5 -18.5,-1.5 -27,0 z")
				, p3 = new Path2D("M 11.5,30 C 15,29 30,29 33.5,30")
				, p4 = new Path2D("m 12,33.5 c 6,-1 15,-1 21,0")
				, p5 = new Path2D("M 8,12 A 2,2 0 0 1 6,14 2,2 0 0 1 4,12 2,2 0 0 1 6,10 2,2 0 0 1 8,12 Z")
				, p6 = new Path2D("m 16,9 a 2,2 0 0 1 -2,2 2,2 0 0 1 -2,-2 2,2 0 0 1 2,-2 2,2 0 0 1 2,2 z")
				, p7 = new Path2D("m 24.5,8 a 2,2 0 0 1 -2,2 2,2 0 0 1 -2,-2 2,2 0 0 1 2,-2 2,2 0 0 1 2,2 z")
				, p8 = new Path2D("m 33,9 a 2,2 0 0 1 -2,2 2,2 0 0 1 -2,-2 2,2 0 0 1 2,-2 2,2 0 0 1 2,2 z")
				, p9 = new Path2D("m 41,12 a 2,2 0 0 1 -2,2 2,2 0 0 1 -2,-2 2,2 0 0 1 2,-2 2,2 0 0 1 2,2 z")
				;

			ctx.fill(p1);
			ctx.fill(p4);
			ctx.fill(p5);
			ctx.fill(p6);
			ctx.fill(p7);
			ctx.fill(p8);
			ctx.fill(p9);
			
			ctx.stroke(p1);
			ctx.stroke(p2);
			ctx.stroke(p3);
			ctx.stroke(p4);
			ctx.stroke(p5);
			ctx.stroke(p6);
			ctx.stroke(p7);
			ctx.stroke(p8);
			ctx.stroke(p9);
		}

	}

	#drawKnight(b) {

		const ctx = this.#ctx;

		const p1 = new Path2D("m 21,7.3007812 c -1.72,1.008 -2.5,2.9999998 -2.5,2.9999998 h -2 c 0,0 -2,-3.4999998 -3,-2.4999998 0,1 -0.23,2.0060001 0.5,2.9999998 -0.11,1.6 -2,3.5 -2,3.5 0,0 -6,10 -6,12 -0.003,5 3,4 4,4 1.19,-0.77 0,-2 1,-2 1.41,-0.04 -1.042,2.06 0,3 2.18,0.34 2,-2 5,-4 1.830167,-1.217621 5.601299,-4.01422 7.234375,-6.564453 C 23.831286,32.537322 15,30.842492 15,39.300781 h 23 c 0.5,-21 -5.5,-28 -16,-29 0,0 0,-2.9999998 -1,-2.9999998 z")
			, p2 = new Path2D("M 24.55,10.4 24.1,11.85 24.6,12 c 3.15,1 5.65,2.49 7.9,6.75 2.25,4.26 3.25,10.31 2.75,20.25 l -0.05,0.5 h 2.25 L 37.5,39 C 38,28.94 36.62,22.15 34.25,17.66 31.88,13.17 28.46,11.02 25.06,10.5 Z")
			, p3 = new Path2D("M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z")
			, p4 = new Path2D("M 15 15.5 A 0.5 1.5 0 1 1  14,15.5 A 0.5 1.5 0 1 1  15 15.5 z")
			;

		ctx.fill(p1);
		ctx.stroke(p1);

		if (b) {
			ctx.strokeStyle = Chessboard.DarkHighlightStroke;
			// ctx.fill(p2);
		}

		ctx.stroke(p3);
		ctx.stroke(p4);
		
	}

	#drawKing(b) {

		const ctx = this.#ctx;

		if (b) {
			// 4, 5
			const p1 = new Path2D("m 22.5,12 c -2,0 -3,2.5 -3,2.5 -0.553113,1.106227 -0.290367,2.824429 0.261719,4.552734 C 15.862342,15.121732 9.5665816,14.516805 6.5,19.5 c -3,6 6,10.5 6,10.5 v 7 c 5.5,3.5 14.5,3.5 20,0 v -7 c 0,0 9,-4.5 6,-10.5 C 35.433418,14.516805 29.137658,15.121732 25.238281,19.052734 25.790367,17.324429 26.053113,15.606227 25.5,14.5 c 0,0 -1,-2.5 -3,-2.5 z")
			, p2 = new Path2D("m 20,8 h 5")
			, p3 = new Path2D("M 22.5,11.63 V 6")
			, p4 = new Path2D("m 32,29.5 c 0,0 8.5,-4 6.03,-9.65 C 34.15,14 25,18 22.5,24.5 v 2.1 -2.1 C 20,18 10.85,14 6.97,19.85 4.5,25.5 13,29.5 13,29.5")
			, p5 = new Path2D("m 12.5,30 c 5.5,-3 14.5,-3 20,0 m -20,3.5 c 5.5,-3 14.5,-3 20,0 m -20,3.5 c 5.5,-3 14.5,-3 20,0")
			;


			ctx.fill(p1);
			ctx.stroke(p1);
			ctx.stroke(p2);
			ctx.stroke(p3);

			ctx.strokeStyle = Chessboard.DarkHighlightStroke;
			ctx.stroke(p4);
			ctx.stroke(p5);

		}
		else {
			const p1 = new Path2D("M22.5 11.63V6M20 8h5")
				, p2 = new Path2D("M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5")
				, p3 = new Path2D("M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7")
				, p4 = new Path2D("M12.5 30c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0m-20 3.5c5.5-3 14.5-3 20 0")
				;

			ctx.fill(p2);
			ctx.fill(p3);

			ctx.stroke(p1);
			ctx.stroke(p2);
			ctx.stroke(p3);
			ctx.stroke(p4);
		}

	}

	#drawRock(x, y, b) {

		const ctx = this.#ctx;

		if (b) {

			const p1 = new Path2D("M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z ")
				, p2 = new Path2D("M 12.5,32 L 14,29.5 L 31,29.5 L 32.5,32 L 12.5,32 z ")
				, p3 = new Path2D("M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z ")
				, p4 = new Path2D("M 14,29.5 L 14,16.5 L 31,16.5 L 31,29.5 L 14,29.5 z ")
				, p5 = new Path2D("M 14,16.5 L 11,14 L 34,14 L 31,16.5 L 14,16.5 z ")
				, p6 = new Path2D("M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 z ")
				, p7 = new Path2D("M 12,35.5 L 33,35.5 L 33,35.5")
				, p8 = new Path2D("M 13,31.5 L 32,31.5")
				, p9 = new Path2D("M 14,29.5 L 31,29.5")
				, p10 = new Path2D("M 14,16.5 L 31,16.5")
				, p11 = new Path2D("M 11,14 L 34,14")
				;


			ctx.fill(p1);
			ctx.stroke(p1);
			ctx.fill(p2);
			ctx.stroke(p2);
			ctx.fill(p3);
			ctx.stroke(p3);
			ctx.fill(p4);
			ctx.stroke(p4);
			ctx.fill(p5);
			ctx.stroke(p5);

			ctx.fill(p6);
			ctx.stroke(p6);
			ctx.fill(p7);
			ctx.stroke(p7);

			ctx.strokeStyle = "#eee";
			ctx.stroke(p8);
			ctx.stroke(p9);
			ctx.stroke(p10);
			ctx.stroke(p11);
		}
		else {


			const p1 = new Path2D('M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z ');
			const p2 = new Path2D('M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z ');
			//const p3 = new Path2D('M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14');
			const p3 = new Path2D('m 11,9.3007812 v 4.9999998 l 3,3 h 17 l 3,-3 V 9.3007812 H 30 V 11.300781 H 25 V 9.3007812 H 20 V 11.300781 H 15 V 9.3007812 Z');
			//const p4 = new Path2D('M 34,14 L 31,17 L 14,17 L 11,14');
			//const p5 = new Path2D('M 31,17 L 31,29.5 L 14,29.5 L 14,17');
			const p5 = new Path2D('M 31,17 V 29.5 H 14 V 17 Z');
			// const p6 = new Path2D('M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5');
			const p6 = new Path2D('m 31,29.5 1.5,2.5 h -20 L 14,29.5 Z');
			const p7 = new Path2D('M 11,14 L 34,14');

			ctx.fill(p1);
			ctx.fill(p2);
			ctx.fill(p3);
			ctx.fill(p5);
			ctx.fill(p6);

			ctx.stroke(p1);
			ctx.stroke(p2);
			ctx.stroke(p3);
			//ctx.stroke(p4);
			ctx.stroke(p5);
			ctx.stroke(p6);
			ctx.stroke(p7);

		}
	}

	#drawBegin(x, y) {
		this.#ctx.save();
		this.#ctx.translate(x, y);
		this.#ctx.scale(this.#scale, this.#scale);
	}

	#drawEnd() {
		this.#ctx.restore();
	}

	#getCoords(i) {
		const [x, y] = getCoords(this.#color == 'white' ? i : 63 - i);
		return [x*this.#w, y*this.#w];
	} 

}

function getCoords(i) {
	return [i % 8, Math.floor(i / 8)];
}

function toMove(i, invert=false) {
	const [x, y] = getCoords(i);

	const a = 'ABCDEFGH';
	const d = invert ? y + 1 : 8 - y;

	return a[x] + d;
}

function fromMove(m, invert=true) {
	m = m.toUpperCase();

	const x = m.charCodeAt(0) - 65;
	const y = invert ? 56 - m.charCodeAt(1) : m.charCodeAt(1) - 49;
	
	return x + y*8;
}

function drawLabel(ctx, text) {
	const W = ctx.canvas.width;
	const w = W * 0.5;
	const h = W * 0.1;
	const c = W / 2;
	const fontsize = parseInt(h*0.7).toString() + "px"

	ctx.save();
	//ctx.translate(btn.x, btn.y);
	//ctx.rotate(angle);
	ctx.translate(c - w/2, c - h/2);
	ctx.fillStyle = '#aaa';
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 2;
	roundRect(ctx, 0, 0, w, h, h*0.3, true, true);
	ctx.fillStyle = '#333';
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.font = "bold " + fontsize + " Arial";
	ctx.fillText(text, w/2, h/2);
	ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == 'undefined') {
		stroke = true;
	}
	if (typeof radius === 'undefined') {
		radius = 5;
	}
	if (typeof radius === 'number') {
		radius = {
		tl: radius,
		tr: radius,
		br: radius,
		bl: radius
		};
	} else {
		var defaultRadius = {
		tl: 0,
		tr: 0,
		br: 0,
		bl: 0
		};
		for (var side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side];
		}
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
		ctx.fill();
	}
	if (stroke) {
		ctx.stroke();
	}
}
