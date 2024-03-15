console.log("hello world")
let canvas;
const W = 30;
const H = 18;
const SCALE = 20;
const GAP = 5;
const O = SCALE;
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

let ctx;
let arr;
window.addEventListener("load", (e) => {
	highscores = JSON.parse(localStorage.getItem("highscores"));
	console.log("window onload", highscores);
	if (highscores === null) {
		highscores = [];
	}
	highscores.map(a => parseInt(a))
	console.log("window onload", highscores);
	canvas = document.getElementById("game");
	msgBox = document.getElementById("message");
	canvas.width = ((W + 2) * SCALE);
	canvas.height = ((H + 2) * SCALE);
	canvas.style.width = `${canvas.width}px`;
	canvas.style.height = `${canvas.height}px`;
	ctx = canvas.getContext("2d");

	resetGame();
	document.body.addEventListener("keydown", (e) => {
		switch (e.key) {
			case "d":
			case "l":
			case "ArrowRight":
				if (prev.x == head.x + 1) {
					break;
				}
				dirX = 1;
				dirY = 0;
				break;
			case "a":
			case "h":
			case "ArrowLeft":
				if (prev.x == head.x - 1) {
					break;
				}
				dirX = -1;
				dirY = 0;
				break;
			case "s":
			case "j":
			case "ArrowDown":
				if (prev.y == head.y + 1) {
					break;
				}
				dirX = 0;
				dirY = 1;
				break;
			case "w":
			case "k":
			case "ArrowUp":
				if (prev.y == head.y - 1) {
					break;
				}
				dirX = 0;
				dirY = -1;
				break;
			case "Escape":
				paused = true;
				break;
			case " ":
				if (over) {
					resetGame();
				} else {
					paused = !paused;
				}
				break;
			case "i":
			case "Enter":
				paused = false;
				break;
			default:
		}
		if (paused) {
			message("Paused. Space to continue.");
		} else {
			message("");
		}
	});
	window.setInterval(() => {
		if (paused) {
			return;
		}
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
			highscores.push(snakeLength);
			highscores.sort((a, b) => b - a); // reverse order
			highscores = highscores.slice(0, 3);
			console.dir(highscores);
			localStorage.setItem("highscores", JSON.stringify(highscores));

			let hs = highscores.map((a, i) => `<small>${i + 1}:</small> ${a}`).join(", ");
			message(`Game over! Your score ${snakeLength}. Press space to play again.<br>High scores: ${hs}`)
		} else {
			arr[head.x][head.y] = 1;
			if (snake.length >= snakeLength) {
				const clear = snake.shift();
				arr[clear.x][clear.y] = 0;
			}
			snake.push(Object.assign({}, head));
		}
		renderFrame();
	}, 300);
});

function message(msg) {
	msgBox.innerHTML = msg;
}

function resetGame() {
	message("Press space to start.")
	snake = [];
	snakeLength = 2;
	dirX = 1;
	dirY = 0;
	arr = arr2D(W, H);
	over = false;
	paused = true;
	prev = new point(-1, -1);
	head = new point(1, 2);
	snake.push(Object.assign({}, head));
	arr[1][2] = 1;
	renderFrame();
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