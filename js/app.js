const app = {
	player: {
		x: 0,
		y: 0,
		direction: "right",
	},

	targetCell: {
		x: 5,
		y: 3,
	},

	grid: {
		rows: 4,
		cols: 6,
	},

	nbMoves: 0,

	gameOver: false,

	init() {
		this.drawBoard();
		this.listenKeyboardEvents();
	},

	drawBoard() {
		for (let i = 0; i < this.grid.rows; i++) {
			const row = document.createElement("div");
			row.classList.add("row");
			for (let j = 0; j < this.grid.cols; j++) {
				const cell = document.createElement("div");
				cell.classList.add("cell");

				if (j === this.targetCell.x && i === this.targetCell.y) {
					cell.classList.add("target-cell");
				} else if (j === this.player.x && i === this.player.y) {
					const playerEl = this.createPlayer();
					cell.appendChild(playerEl);
				}
				row.appendChild(cell);
			}
			document.querySelector("#board").appendChild(row);
		}
		if (
			this.player.x === this.targetCell.x &&
			this.player.y === this.targetCell.y
		) {
			const playerEl = this.createPlayer();
			document.querySelector(".target-cell").appendChild(playerEl);
		}
	},

	clearBoard() {
		document.querySelector("#board").textContent = "";
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
			this.nbMoves += 1;
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
			this.nbMoves += 1;
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
			this.nbMoves += 1;
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
			this.nbMoves += 1;
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
			this.nbMoves += 1;
		} else if (this.player.direction === "left" && this.player.x > 0) {
			this.player.x -= 1;
			this.nbMoves += 1;
		} else if (this.player.direction === "up" && this.player.y > 0) {
			this.player.y -= 1;
			this.nbMoves += 1;
		} else if (
			this.player.direction === "down" &&
			this.player.y < this.grid.rows - 1
		) {
			this.player.y += 1;
			this.nbMoves += 1;
		}

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
			}
		});
	},

	isGameOver() {
		if (
			this.player.x === this.targetCell.x &&
			this.player.y === this.targetCell.y
		) {
			this.gameOver = true;
			setTimeout(() => {
				alert(`Gagné ! en ${this.nbMoves} déplacements !`);
				if (confirm("Voulez vous rejouer?")) {
					this.replay();
				} else {
					alert("Merci d'avoir joué ! :)");
				}
			}, 50);
		} else {
			this.gameOver = false;
		}
	},

	replay() {
		this.clearBoard();
		this.player.x = 0;
		this.player.y = 0;
		this.player.direction = "right";
		this.targetCell.x = 5;
		this.targetCell.y = 3;
		this.grid.rows = 4;
		this.grid.cols = 6;
		this.nbMoves = 0;
		this.gameOver = false;
		this.redrawBoard();
	},
};

document.addEventListener("DOMContentLoaded", app.init.bind(app));
