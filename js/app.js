const app = {
	player: {
		x: 0,
		y: 0,
		direction: "right",
		isDead: false,
		hearts: 3,
		nbMoves: 0,
		maxJumps: 2,
	},

	targetCell: {
		x: 5,
		y: 3,
	},

	traps: [],

	level: 0,

	grid: {
		rows: 4,
		cols: 6,
	},

	isChangingBoard: false,

	gameOver: false,

	collision: false,

	music: {
		startingMusic: new Audio("/audio/epic-chorus-song.mp3"),
		setps: new Audio("/audio/steps.mp3"),
		jump: new Audio("/audio/jump.mp3"),
		painSound: new Audio("/audio/pain.mp3"),
		winningMusic: new Audio("/audio/jingle-win.mp3"),
		losingMusic: new Audio("/audio/jingle-lose.mp3"),
		playerDie: new Audio("/audio/player-dying.mp3"),
		gameOver: new Audio("/audio/end.mp3"),
	},

	domElems: {
		board: document.querySelector("#board"),
		playerInfo: document.querySelector("#player__info"),
		playerLife: document.querySelector("#player__life"),
		levelDisplay: document.querySelector("#level__display"),
		maxJumpsDisplay: document.querySelector("#max__jumps"),
		backdrop: document.querySelector("#backdrop"),
		replayModal: document.querySelector("#replay__modal"),
		losingMessage: document.querySelector("#losing__message"),
		replayButton: document.querySelector("#replay__button"),
		changeBoardButton: document.querySelector("#change__board"),
		stopButton: document.querySelector("#stop__button"),
	},

	init() {
		this.domElems.backdrop.style.display = "none";
		this.domElems.replayModal.style.display = "none";
		this.music.startingMusic.loop = true;
		this.level++;
		this.player.direction = this.getRandomDirection();
		this.domElems.levelDisplay.textContent = `niveau ${this.level}`;
		this.domElems.maxJumpsDisplay.textContent = `Sauts restants : ${this.player.maxJumps}`;
		this.domElems.stopButton.addEventListener(
			"click",
			this.stopGameHandler.bind(this),
		);
		this.domElems.changeBoardButton.addEventListener(
			"click",
			this.changeBoardHandler.bind(this),
		);
		this.playStartingMusic();
		this.drawBoard();
		this.showPlayerLife();
		this.listenKeyboardEvents();
	},

	drawBoard() {
		for (let rowIndex = 0; rowIndex < this.grid.rows; rowIndex++) {
			const row = document.createElement("div");
			row.classList.add("row");
			for (let cellIndex = 0; cellIndex < this.grid.cols; cellIndex++) {
				const cell = document.createElement("div");
				cell.classList.add("cell");

				if (cellIndex === this.targetCell.x && rowIndex === this.targetCell.y) {
					cell.classList.add("target-cell");
				} else if (cellIndex === this.player.x && rowIndex === this.player.y) {
					const playerEl = this.createPlayer();
					cell.appendChild(playerEl);
				}

				for (let trapIndex = 0; trapIndex < this.traps.length; trapIndex++) {
					if (
						this.traps[trapIndex].x === cellIndex &&
						this.traps[trapIndex].y === rowIndex
					) {
						const trap = document.createElement("div");
						trap.classList.add("trap");
						if (
							this.traps[trapIndex].x === this.targetCell.x &&
							this.traps[trapIndex].y === this.targetCell.y
						) {
							this.traps[trapIndex].x = "";
							this.traps[trapIndex].y = "";
							trap.classList.remove("trap");
						}
						cell.appendChild(trap);
					} else if (
						this.player.x === this.traps[trapIndex].x &&
						this.player.y === this.traps[trapIndex].y
					) {
						this.player.isDead = true;
					}
				}
				row.appendChild(cell);
			}
			this.domElems.board.appendChild(row);
		}
		if (
			this.player.x === this.targetCell.x &&
			this.player.y === this.targetCell.y
		) {
			const playerEl = this.createPlayer();
			document.querySelector(".target-cell").appendChild(playerEl);
		}
		if (this.collision) {
			this.ouch();
		}
	},

	clearBoard() {
		this.domElems.board.textContent = "";
	},

	redrawBoard() {
		this.clearBoard();
		this.drawBoard();
		this.isGameOver();
	},

	createPlayer() {
		const playerEl = document.createElement("div");
		if (this.player.direction === "left") {
			playerEl.classList.add("left");
		} else if (this.player.direction === "right") {
			playerEl.classList.add("right");
		} else if (this.player.direction === "up") {
			playerEl.classList.add("up");
		} else if (this.player.direction === "down") {
			playerEl.classList.add("down");
		}
		playerEl.classList.add("player");
		playerEl.setAttribute("id", "player");
		return playerEl;
	},

	turnUp() {
		if (this.gameOver) {
			return;
		}

		if (this.player.direction === "up") {
			this.moveForward();
		} else {
			this.player.direction = "up";
			this.player.nbMoves += 1;
			this.redrawBoard();
		}
	},

	turnLeft() {
		if (this.gameOver) {
			return;
		}

		if (this.player.direction === "left") {
			this.moveForward();
		} else {
			this.player.direction = "left";
			this.player.nbMoves += 1;
		}
		this.redrawBoard();
	},

	turnRight() {
		if (this.gameOver) {
			return;
		}

		if (this.player.direction === "right") {
			this.moveForward();
		} else {
			this.player.direction = "right";
			this.player.nbMoves += 1;
			this.redrawBoard();
		}
	},

	turnDown() {
		if (this.gameOver) {
			return;
		}

		if (this.player.direction === "down") {
			this.moveForward();
		} else {
			this.player.direction = "down";
			this.player.nbMoves += 1;
			this.redrawBoard();
		}
	},

	moveForward() {
		if (this.gameOver) {
			return;
		}

		if (
			this.player.direction === "right" &&
			this.player.x < this.grid.cols - 1
		) {
			this.player.x += 1;
			this.player.nbMoves += 1;
		} else if (this.player.direction === "left" && this.player.x > 0) {
			this.player.x -= 1;
			this.player.nbMoves += 1;
		} else if (this.player.direction === "up" && this.player.y > 0) {
			this.player.y -= 1;
			this.player.nbMoves += 1;
		} else if (
			this.player.direction === "down" &&
			this.player.y < this.grid.rows - 1
		) {
			this.player.y += 1;
			this.player.nbMoves += 1;
		} else {
			this.collision = true;
			this.redrawBoard();
		}

		this.music.setps.play();
		this.redrawBoard();
	},

	listenKeyboardEvents() {
		document.addEventListener("keyup", e => {
			if (e.keyCode === 38) {
				// flêche haut
				this.turnUp();
			} else if (e.keyCode === 39) {
				// flêche droite
				this.turnRight();
			} else if (e.keyCode === 37) {
				// flêche gauche
				this.turnLeft();
			} else if (e.keyCode === 40) {
				//flêche bas
				this.turnDown();
			} else if (e.keyCode === 32) {
				// touche espace
				this.jump();
			}
		});
	},

	ouch() {
		const playerEl = document.querySelector("#player");
		if (this.collision) {
			this.music.painSound.play();
			playerEl.classList.add("ouch");
			setTimeout(() => {
				playerEl.classList.remove("ouch");
				this.collision = false;
			}, 500);
		} else if (this.player.isDead) {
			this.music.playerDie.play();
			playerEl.classList.add("die");
		}
	},

	isGameOver() {
		if (this.player.isDead) {
			this.player.hearts -= 1;
			this.gameOver = true;
			this.ouch();

			this.showPlayerLife();

			this.music.startingMusic.pause();
			this.music.losingMusic.play();
			setTimeout(() => {
				if (this.player.hearts <= 0) {
					this.domElems.backdrop.style.display = "block";
					this.domElems.replayModal.style.display = "block";
					this.domElems.losingMessage.textContent = `Vous êtes arrivé jusqu'au niveau ${this.level} ! Voulez vous rejouer?`;
					this.domElems.replayButton.addEventListener(
						"click",
						this.replayButtonHandler.bind(this),
					);
					this.music.gameOver.play();
					return;
				}

				this.music.startingMusic.play();
				this.music.losingMusic.pause();
				this.music.losingMusic.currentTime = 0;
				this.level--;
				this.replay();
			}, 2000);
		} else if (
			this.player.x === this.targetCell.x &&
			this.player.y === this.targetCell.y &&
			this.player.nbMoves > 0
		) {
			const playerEl = document.querySelector(".player");
			playerEl.classList.add("player--disappear");
			this.gameOver = true;
			this.music.startingMusic.pause();
			this.music.winningMusic.play();
			// alert(`Gagné ! en ${this.player.nbMoves} déplacements !`); // a changer pour custom alert
			setTimeout(() => {
				this.replay();
				this.music.startingMusic.play();
				this.music.winningMusic.pause();
				this.music.winningMusic.currentTime = 0;
				this.gameOver = false;
			}, 2000);
		}
	},

	stopGameHandler() {
		// this.music.startingMusic = "";
		this.music.gameOver.play();
		this.gameOver = true;
	},

	replay() {
		this.grid.rows = this.getRandomInt();
		this.grid.cols = this.getRandomInt();

		this.targetCell.x = this.checkPosition(0, this.grid.cols);
		this.targetCell.y = this.checkPosition(0, this.grid.rows);

		this.player.x = this.checkPlayerPosition(0, this.grid.cols);
		this.player.y = this.checkPlayerPosition(0, this.grid.rows);

		this.player.direction = this.getRandomDirection();

		this.player.nbMoves = 0;

		if (!this.isChangingBoard) {
			this.level++;
		}

		this.domElems.levelDisplay.textContent = `niveau ${this.level}`;
		this.player.maxJumps = 2;
		this.domElems.maxJumpsDisplay.textContent = `Sauts restants : ${this.player.maxJumps}`;
		this.gameOver = false;
		this.player.isDead = false;
		this.showPlayerLife();
		this.increaseDifficulty(this.level);
		this.redrawBoard();
	},

	increaseDifficulty(level) {
		if (level % 3 === 0) {
			this.traps = this.addTraps(level, 2, this.grid.cols, 2, this.grid.rows);
		}
	},

	replayButtonHandler() {
		this.level = 0;
		this.player.hearts = 3;
		this.domElems.backdrop.style.display = "none";
		this.domElems.replayModal.style.display = "none";
		this.music.startingMusic.currentTime = 0;
		this.music.startingMusic.play();
		this.replay();
	},

	getRandomDirection() {
		const direction = ["up", "right", "left", "down"];
		const randomDirection = this.getRandomInt(0, 4);
		return direction[randomDirection];
	},

	getNewPosition() {
		return this.getRandomInt();
	},

	checkPlayerPosition(minValue, maxValue) {
		//! this.player.x : minValue = 0 - maxValue = this.grid.cols
		//! this.player.y : minValue = 0 - maxValue = this.grid.rows
		playerPosition = this.getRandomInt(minValue, maxValue - 1);

		for (let i = 0; i < this.traps.length; i++) {
			if (
				playerPosition === this.traps[i].x ||
				playerPosition === this.traps[i].y
			) {
				return (playerPosition = 0);
			}
		}

		if (
			playerPosition >= maxValue ||
			playerPosition < 0 ||
			playerPosition === maxValue
		) {
			return (playerPosition = 0);
		} else {
			return playerPosition;
		}
	},

	checkPosition(minValue, maxValue) {
		targetCellPosition = this.getRandomInt(minValue, maxValue);
		if (targetCellPosition >= maxValue) {
			targetCellPosition = maxValue - 1;
			if (targetCellPosition < 0) {
				targetCellPosition = maxValue + 1;
			}
		}
		return targetCellPosition;
	},

	getRandomInt(min = 6, max = 15) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	},

	playStartingMusic() {
		//! Autoplay does not work anymore !
		if (this.music.startingMusic !== "") {
			window.addEventListener("click", this.startMusicHandler());
			window.addEventListener("keydown", this.startMusicHandler());
		}
	},

	startMusicHandler() {
		this.music.startingMusic.play();
	},

	addTraps(nbTraps, minXValue, maxXValue, minYValue, maxYValue) {
		let trapsArray = [];
		for (let i = 0; i < nbTraps; i++) {
			do {
				trapItem = {
					x: this.checkPosition(minXValue, maxXValue),
					y: this.checkPosition(minYValue, maxYValue),
				};
				trapsArray.push(trapItem);
			} while (
				trapItem.x === this.targetCell.x &&
				trapItem.y === this.targetCell.y
			);
		}
		return trapsArray;
	},

	showPlayerLife() {
		this.domElems.playerLife.textContent = "";
		for (let i = 0; i < this.player.hearts; i++) {
			const playerHeartEl = document.createElement("img");
			playerHeartEl.classList.add("heart");
			playerHeartEl.src = "/img/8bit-heart.png";
			this.domElems.playerLife.appendChild(playerHeartEl);
		}
	},

	updateJumpCounter(jumps) {
		switch (true) {
			case jumps === 0:
				this.domElems.maxJumpsDisplay.textContent = `Saut restant : ${this.player.maxJumps}`;
				break;
			case jumps > 0:
				this.domElems.maxJumpsDisplay.textContent = `Sauts restants : ${this.player.maxJumps}`;
				break;
		}
	},

	jump() {
		if (this.gameOver) {
			return;
		} else if (this.player.maxJumps === 0) {
			return;
		}

		if (
			this.player.direction === "right" &&
			this.player.x < this.grid.cols - 2
		) {
			this.player.x += 2;
			this.player.nbMoves += 1;
			this.player.maxJumps -= 1;
			this.music.jump.play();
			this.updateJumpCounter(this.player.maxJumps);
		} else if (this.player.direction === "left" && this.player.x > 1) {
			this.player.x -= 2;
			this.player.nbMoves += 1;
			this.player.maxJumps -= 1;
			this.music.jump.play();
			this.updateJumpCounter(this.player.maxJumps);
		} else if (this.player.direction === "up" && this.player.y > 1) {
			this.player.y -= 2;
			this.player.nbMoves += 1;
			this.player.maxJumps -= 1;
			this.music.jump.play();
			this.updateJumpCounter(this.player.maxJumps);
		} else if (
			this.player.direction === "down" &&
			this.player.y < this.grid.rows - 2
		) {
			this.player.y += 2;
			this.player.nbMoves += 1;
			this.player.maxJumps -= 1;
			this.music.jump.play();
			this.updateJumpCounter(this.player.maxJumps);
		} else {
			this.redrawBoard();
		}

		this.redrawBoard();
	},

	changeBoardHandler(e) {
		document.activeElement.blur();
		this.domElems.board.focus();
		this.isChangingBoard = true;
		this.replay();
		this.isChangingBoard = false;
	},

	//TODO add timer
};

document.addEventListener("DOMContentLoaded", app.init.bind(app));
