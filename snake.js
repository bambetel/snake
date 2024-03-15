console.log("hello world")
let canvas;
const W = 30;
const H = 18;
const SCALE = 20;
const GAP = 5;
const O = 1.5;
let dirX = 1;
let dirY = 0;
let paused = false;
let snake = [];
let snakeLength = 2;

class point {
	x = 0;
	y = 0;

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

let head = new point;

let ctx;
let arr;
window.addEventListener("load", (e) => {
	arr = arr2D(W, H);
	console.log("window onload");
	canvas = document.getElementById("game");
	ctx = canvas.getContext("2d");

	prev = new point(-1, -1);
	head = new point(1, 2);
	snake.push(Object.assign({}, head));
	arr[1][2] = 1;
	renderFrame();

	document.body.addEventListener("keydown", (e) => {
		switch (e.key) {
			case "l":
			case "ArrowRight":
				if (prev.x == head.x + 1) {
					break;
				}
				dirX = 1;
				dirY = 0;
				break;
			case "h":
			case "ArrowLeft":
				if (prev.x == head.x - 1) {
					break;
				}
				dirX = -1;
				dirY = 0;
				break;
			case "j":
			case "ArrowDown":
				if (prev.y == head.y + 1) {
					break;
				}
				dirX = 0;
				dirY = 1;
				break;
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
				paused = !paused;
				break;
			case "i":
			case "Enter":
				paused = false;
				break;
		}
		e.preventDefault();
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
		}
		arr[head.x][head.y] = 1;
		if (snake.length >= snakeLength) {
			const clear = snake.shift();
			console.log("clear", clear.x, clear.y);
			arr[clear.x][clear.y] = 0;
		}
		snake.push(Object.assign({}, head));
		renderFrame();
	}, 1000);
});

function addFood() {
	let rx = Math.floor(Math.random() * W);
	let ry = Math.floor(Math.random() * H);
	console.log(rx, ry)
	// TODO: what to do?
	if (arr[rx][ry] == 0) {
		arr[rx][ry] = 2;
	}
}

function renderFrame() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			if (arr[x][y] == 1) {
				ctx.beginPath();
				ctx.rect(O + x * SCALE, O + y * SCALE, SCALE - GAP, SCALE - GAP);
				ctx.stroke();
			} else if (arr[x][y] == 2) {
				const fx = O + x * SCALE;
				const fy = O + y * SCALE;
				const FS = 4;
				const FG = 1;
				for (let i = 0; i < 3; i++) {
					for (let j = 0; j < 3; j++) {
						if ((i + j) % 2 == 1) {
							ctx.beginPath();
							ctx.rect(fx + i * FS, fy + j * FS, FS - FG, FS - FG)
							ctx.stroke();
						}
					}
				}
			} else {
				ctx.beginPath();
				ctx.rect(O + 2 + x * SCALE, O + 2 + y * SCALE, 2, 2);
				ctx.stroke();
			}
		}
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