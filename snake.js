console.log("hello world")
let canvas;
const W = 30;
const H = 18;
const SCALE = 20;
const GAP = 5;
const O = SCALE;
const MIN_TICK = 20; // tick time ms
let dirX = 1;
let dirY = 0;
let paused = false;
let snake = [];
let snakeLength;
let msgBox;

class point {
	x = 0;
	y = 0;

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

let head = new point;
let highscores;
let form;
let resultSaved;

let ctx;
let arr;

let lastTick;
let ticks;
let gameStart;
let tickInterval = 300;


function setSpeed(val) {
	gameStart = lastTick = Date.now();
	ticks = 0;
	tickInterval = Math.min(1000, Math.max(MIN_TICK, val));
	console.log("speed:", tickInterval);
}

window.addEventListener("load", (e) => {
	highscores = JSON.parse(localStorage.getItem("highscores"));
	console.log("window onload", highscores);
	// TODO: check {name:string, score:int}
	if (highscores === null) {
		highscores = [];
	}
	console.log("window onload", highscores);

	form = document.getElementById("formscore");
	form.addEventListener("submit", (ev) => {
		ev.preventDefault();
		if (resultSaved == true) {
			return;
		}
		const name = form.querySelector("#name").value;
		highscores.push({ name: name, score: snakeLength });
		highscores.sort((a, b) => b.score - a.score); // reverse order
		highscores = highscores.slice(0, 3);
		console.dir(name, highscores);
		localStorage.setItem("highscores", JSON.stringify(highscores));

		form.style.display = "none";
		resultSaved = true;
		message("Result saved.");
	});

	canvas = document.getElementById("game");
	msgBox = document.getElementById("message");
	canvas.width = ((W + 2) * SCALE);
	canvas.height = ((H + 2) * SCALE);
	canvas.style.width = `${canvas.width}px`;
	canvas.style.height = `${canvas.height}px`;
	ctx = canvas.getContext("2d");

	resetGame();
	document.body.addEventListener("keydown", (e) => {
		if (over) {
			if (resultSaved) {
				resetGame();
			} else {
				message("Save your result first.")
			}
			return;
		}
		if (e.key == " ") {
			pauseGame(!paused);
			return;
		}
		if (paused) {
			if (e.key != "Escape") {
				pauseGame(false);
				// and then handle action
			}
		}

		switch (e.key) {
			case "d":
			case "l":
			case "ArrowRight":
				if (prev.x == head.x + 1 || head.x == W - 1 && prev.x == 0) {
					break;
				}
				dirX = 1;
				dirY = 0;
				break;
			case "a":
			case "h":
			case "ArrowLeft":
				if (prev.x == head.x - 1 || head.x == 0 && prev.x == W - 1) {
					break;
				}
				dirX = -1;
				dirY = 0;
				break;
			case "s":
			case "j":
			case "ArrowDown":
				if (prev.y == head.y + 1 || head.y == H - 1 && prev.y == 0) {
					break;
				}
				dirX = 0;
				dirY = 1;
				break;
			case "w":
			case "k":
			case "ArrowUp":
				if (prev.y == head.y - 1 || head.y == 0 && prev.y == H - 1) {
					break;
				}
				dirX = 0;
				dirY = -1;
				break;
			case "Escape":
			case " ":
				pauseGame(true);
				break;
			case "i":
			case "Enter":
				pauseGame(false);
				break;
			case "+": setSpeed(tickInterval - 50); break;
			case "-": setSpeed(tickInterval + 50); break;

			default:
		}
	});
	window.setInterval(() => {
		if (paused) {
			return;
		}
		if (!document.hasFocus()) {
			// intervals won't be steady if game was running in the backgroud
			pauseGame(true);
		}
		let duration = Date.now() - gameStart;
		if (duration / ticks < tickInterval) {
			return;
		}
		ticks++;
		// console.log(Date.now() - lastTick, tickInterval)
		lastTick = Date.now();

		addFood();
		prev = Object.assign({}, head);
		head.x = (head.x + dirX + W) % W;
		head.y = (head.y + dirY + H) % H;
		if (arr[head.x][head.y] == 2) {
			snakeLength++;
		}
		if (arr[head.x][head.y] == 1) {
			console.log("self intersection: game over");
			paused = true;
			over = true;
			// TODO: show form only if actually high score
			form.style.display = "block";

			let hs = highscores.map((a, i) => `<small>${i + 1}</small> ${a.name}: ${a.score}`).join(", ");
			message(`Press space to play again.<br>High scores: ${hs}`);
			[...document.querySelectorAll(".show-score")].forEach((a) => {
				a.innerHTML = snakeLength;
			});
		} else {
			arr[head.x][head.y] = 1;
			if (snake.length >= snakeLength) {
				const clear = snake.shift();
				arr[clear.x][clear.y] = 0;
			}
			snake.push(Object.assign({}, head));
		}
		renderFrame();
	}, MIN_TICK * 0.618);
});

function message(msg) {
	msgBox.innerHTML = msg;
}

function resetGame() {
	resultSaved = false;
	snake = [];
	snakeLength = 2;
	dirX = 1;
	dirY = 0;
	arr = arr2D(W, H);
	over = false;
	prev = new point(-1, -1);
	head = new point(1, 2);
	snake.push(Object.assign({}, head));
	arr[1][2] = 1;
	renderFrame(); // order?
	pauseGame(true);
	message("Press space to start.")
}

function pauseGame(val) {
	if (val == true) {
		ticks = 0;
		gameStart = Date.now();
		lastTick = Date.now();
		paused = true;
		message("Paused. Space to continue.");
	} else {
		ticks = 0;
		gameStart = Date.now();
		lastTick = Date.now();
		paused = false;
		message("");
	}
}

function addFood() {
	let rx = Math.floor(Math.random() * W);
	let ry = Math.floor(Math.random() * H);
	// TODO: what to do?
	if (arr[rx][ry] == 0) {
		arr[rx][ry] = 2;
	}
}

function renderFrame() {
	ctx.fillStyle = "#becd02";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#445473";
	ctx.strokeStyle = "red";

	ctx.beginPath();
	ctx.strokeStyle = "gray";
	ctx.lineWidth = SCALE / 2;
	ctx.rect(SCALE / 2, SCALE / 2, (W + 1) * SCALE, (H + 1) * SCALE);
	ctx.stroke();

	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			if (arr[x][y] == 1) {
			} else if (arr[x][y] == 2) {
				const fx = O + x * SCALE;
				const fy = O + y * SCALE;
				const FS = 4;
				const FG = 1;
				for (let i = 0; i < 3; i++) {
					for (let j = 0; j < 3; j++) {
						if ((i + j) % 2 == 1) {
							ctx.beginPath();
							ctx.fillRect(fx + i * FS, fy + j * FS, FS - FG, FS - FG)
							ctx.fill();
						}
					}
				}
			} else {
				ctx.beginPath();
				ctx.strokeStyle = "#bebd44";
				ctx.lineWidth = 1;
				ctx.strokeRect(O + 2 + x * SCALE, O + 2 + y * SCALE, 2, 2);
			}
		}
	}
	let dx = -3;
	let dy = -3;
	let i = 0;
	for (let p of snake) {
		let x = p.x;
		let y = p.y;
		let extX = 0;
		let extY = 0;
		let dX = 0;
		let dY = 0;

		if (i > 0) {
			if (Math.abs(x - dx) == 1) {
				extX = GAP;
				if (x > dx) {
					dX = -GAP;
				}
			}
			if (Math.abs(y - dy) == 1) {
				extY = GAP;
				if (y > dy) {
					dY = -GAP;
				}
			}
		}
		i++;
		dx = p.x;
		dy = p.y;

		ctx.beginPath();
		ctx.fillRect(O + x * SCALE + dX, O + y * SCALE + dY, SCALE - GAP + extX, SCALE - GAP + extY);
		ctx.fill();
	}
}

function arr2D(w, h, val = 0) {
	let res = [];
	for (let x = 0; x < w; x++) {
		let row = [];
		for (let y = 0; y < h; y++) {
			row.push(val);
		}
		res.push(row);
	}
	return res;
}