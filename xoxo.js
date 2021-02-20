var view = { //визуальное представление
	
	displayMessage: function (msg){ //вывод сообщений
		show(msg);
		if (msg === 'Вы выиграли!'){
			document.querySelector('#messageArea').style.color = '#42A61F';
		} else if (msg === 'Вы проиграли!'){
			document.querySelector('#messageArea').style.color = '#FF0000';
		} else {
			document.querySelector('#messageArea').style.color = '#1371C8';
		}
	},

	displayStat: function (){ //вывод счета и количества сыгранных партий
		document.getElementById('statArea').innerHTML = 'Счет ' + model.playerScore + 
		' : ' + model.AIScore + '<br>' + 'Сыграно партий: ' + model.rounds;
	},
	
	displaySym: function (location, sym){ //вывод ходов
		document.getElementById(location).setAttribute('class', sym);
		sym === 'x' ? playSound(xSound) : playSound(oSound);
	},	

	displayLine: function (name){ // вывод линии трех подряд символов
		document.getElementById('winLine').style.display = 'block';
		document.getElementById('winLine').setAttribute('class', name);				
	},

	removeLine: function (){ // стереть победную линию
		document.getElementById('winLine').classList = [];
		document.getElementById('winLine').style.display = 'none';		
	},

	displayStarScore: function (){ // показ количества звезд
		document.getElementById('starScore').innerHTML = model.starScore;
	},
	displayCurrentPlayer: function (){ // символ игрока в кнопке режима сложности
		let sign = model.currentPlayer;
		document.getElementById('difMode').innerHTML = sign.toUpperCase();
	}
};

function show(msg){ // анимация строки сообщения
	let letters = msg.split('');
	let liveString = '';
	let index = 0;
	loop();
	function loop (){
		setTimeout(
			function(){
				liveString += letters[index];
				document.getElementById('messageArea').innerHTML = liveString;
				index += 1;
				if (index === letters.length){
					return;
				}
				return loop();		
			}, 15);
	}
}

var model = { //модель и состояние игры
	
	boardSize: 3, //размер игрового поля
	
	gameOver: false, // игра окончена?

	moves: 0, // количество ходов

	rounds: 0, // количество партий

	playerScore: 0, // количество побед игрока

	AIScore: 0, // количество побед противника

	currentPlayer: null, // символ игрока (х или о)

	currentAI: null, // символ противника

	currentMove: null, // текущий ход

	currentStarLocation: null, // текущее положение звезды

	currentMessage: 'Крестики-нолики', // текущее сообщение в строке сообщений

	starScore: 0, // количество звезд игрока

	freeCells: [], // свободные ячейки, в которые можно делать ход
	
	difficult: 1, // сложность (0 - легкая, 1 - нормальная)

	cells: [	
		{name: 'row0', locations: ['00', '01', '02'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'row1', locations: ['10', '11', '12'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'row2', locations: ['20', '21', '22'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'col0', locations: ['00', '10', '20'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'col1', locations: ['01', '11', '21'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'col2', locations: ['02', '12', '22'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'dia1', locations: ['00', '11', '22'], hits: ['', '', '',], toWinP: 0}, 
		{name: 'dia2', locations: ['02', '11', '20'], hits: ['', '', '',], toWinP: 0}, 
	],
			// cells[] - строки, столбцы и диагонали, в которых производятся действия
			// name - для вывода соответствующей winLine
			// locations - координаты ячеек по строкам, столбцам и диагоналям;
			// hits - отмечать ячейки попаданий х и о
			// toWinP - ближе/дальше к победе игрока
	
	playerTurn: function(location){ //ход игрока
		hit(location, model.currentPlayer);
		let index = this.freeCells.indexOf(location);
		this.freeCells.splice(index, 1);
		this.moves++;
		model.cells.forEach(isGameEnd);
		if (!this.gameOver && this.moves < this.boardSize * this.boardSize){
			model.currentMessage = 'Ход противника!';
			view.displayMessage(model.currentMessage);
			this.currentMove = this.currentAI;
		}
		this.nextTurn(controller.AIMove);
	},
	
	AITurn: function(location){ //ход противника, компьютера
		hit(location, model.currentAI);
		let index = this.freeCells.indexOf(location);
		this.freeCells.splice(index, 1);
		this.moves++;
		model.cells.forEach(isGameEnd);
		if (!this.gameOver && this.moves < this.boardSize * this.boardSize){
			model.currentMessage = 'Ваш ход!';
			view.displayMessage(model.currentMessage);
			this.currentMove = this.currentPlayer;
		}
		this.nextTurn(controller.playerMove);
	},
	
	nextTurn: function (nextPlayer) { //передача хода
 		shuffle(model.cells);
 		if (!this.gameOver && this.moves < this.boardSize * this.boardSize){
			setTimeout(function(){ // длительность передачи хода (по факту - время на ход компьютера)
				nextPlayer();
			}, 750); 
		} else if (!this.gameOver && this.moves === this.boardSize * this.boardSize) {
			model.currentMessage = 'Ничья!';
			view.displayMessage(model.currentMessage);
			playSound(gameOverSound);
			this.rounds++;
			view.displayStat();
			this.gameOver = true;
		} else {
			return false;
		}
	}
};

function hit(location, sym){ //функция записи хода игрока в соответствующую ячейку
	function a (item){
		let index = item.locations.indexOf(location);
		if (index >= 0){
			item.hits[index] = sym;
			view.displaySym(location, sym);
			sym === model.currentPlayer ? item.toWinP++ : item.toWinP--;
		}
	}
	model.cells.forEach(a);
}

function isGameEnd (item){ // проверка окончена ли игра
	if (item.hits.every(function (hit){return hit === model.currentPlayer;})){
		model.currentMessage = 'Вы выиграли!';
		view.displayMessage(model.currentMessage);
		playSound(winSound);
		model.playerScore++;
		model.rounds++;
		view.displayStat();
		model.gameOver = true;
		view.displayLine(item.name);
		if (item.locations.indexOf(model.currentStarLocation) >= 0){
			model.starScore++;
			localStorage.setItem('XOstars', model.starScore);
			view.displayStarScore();
			document.getElementById('star').src = 'winStar.png';
			document.getElementById('star').setAttribute('class', 'winStar');	
		} 
	} else {
		if (item.hits.every(function (hit){return hit === model.currentAI;})){
			model.currentMessage = 'Вы проиграли!';
			view.displayMessage(model.currentMessage);
			playSound(failSound);
			model.AIScore++;
			model.rounds++;
			view.displayStat();
			model.gameOver = true;
			view.displayLine(item.name);
			if (item.locations.indexOf(model.currentStarLocation) >= 0){
				if (model.starScore > 0){
					model.starScore--;
					localStorage.setItem('XOstars', model.starScore);
					view.displayStarScore();
				}
				document.getElementById('star').src = 'failStar.png';
				document.getElementById('star').setAttribute('class', 'failStar');
			} 
		}		
	}
}

function shuffle (arr){ // перемешивание позиций элементов в массиве случайным образом
	let j, temp;
	for (let i = arr.length - 1; i > 0; i--){
		j = Math.floor(Math.random() * (i + 1));
		temp = arr[j];
		arr[j] = arr[i];
		arr[i] = temp;
	}
	return arr;
}

var controller = { //контроллер
	
	playerMove: function(location){ //прием хода игрока
		location ? parseMove(location) : false;
	},
	
	AIMove: function(){ //прием хода компьютера и логика ходов
		let location;
		if (model.moves <= 1){
			location = randomLocation();
		} else { //определение позиции в соответствии с приоритетом
			let winLineToWinAI = model.cells.find(item => item.toWinP === 0 - 
				(model.boardSize - 1));
			let winLineToWinP = model.cells.find(item => item.toWinP === 0 + 
				(model.boardSize - 1));
			let winLineCloseToWinAI = model.cells.find(item => item.toWinP === 0 - 
				(model.boardSize - 2) && item.hits.includes(''));
			let winLineCloseToWinP = model.cells.find(item => item.toWinP === 0 + 
				(model.boardSize - 2) && item.hits.includes(''));			
			if (winLineToWinAI && model.difficult >= 0){
				location = winLineToWinAI.locations[winLineToWinAI.hits.indexOf('')];
			} else if (winLineToWinP && model.difficult >= 0){
				if (model.difficult === 0 && (Math.floor(Math.random() * 2) === 0)){
					location = randomLocation();	console.log('gen!');				
				} else  {
					location = winLineToWinP.locations[winLineToWinP.hits.indexOf('')]; 
				}
			} else if (winLineCloseToWinAI && model.difficult > 0){
				location = winLineCloseToWinAI.locations[winLineCloseToWinAI.hits.indexOf('')];
			} else if (winLineCloseToWinP && model.difficult > 0){
				location = winLineCloseToWinP.locations[winLineCloseToWinP.hits.indexOf('')];
			} else {
				location = randomLocation();
				console.log('random (last) move'); //для большего поля нужно другое решение  
			}
		}
		location && model.freeCells.length > 0 ? 
			parseAIMove(location) : console.log('Error: no free cells');
	}
};

function parseMove(location){ //валидатор хода игрока
	if ((model.freeCells.indexOf(location) >= 0) && (!model.gameOver)){
		model.playerTurn(location);
	} else {
		view.displayMessage('Ячейка занята!');
		setTimeout(function(){
			view.displayMessage(model.currentMessage);
		}, 1500);
	}
}

function parseAIMove(location){ //валидатор хода компьютера
	if ((model.freeCells.indexOf(location) >= 0) && (!model.gameOver)){
		model.AITurn(location);
	} else {
		controller.AIMove();
	}  
}

function randomLocation(){ // генератор случайной позиции
	let location = model.freeCells[Math.floor(Math.random() * model.freeCells.length)];
	return location;
}

function init(){ //инициализация игры (стартового экрана)
	let XOColorMode = localStorage.getItem('XOColorMode');
	if (!XOColorMode) {
		XOColorMode = 'light';
		localStorage.setItem('XOColorMode', XOColorMode);
	}	
	document.getElementById('colorMode').setAttribute('class', XOColorMode + 'Mode');
	document.body.setAttribute('class', XOColorMode + 'Body');
	document.getElementById('window').setAttribute('class', XOColorMode + 'Window');

	let XOSoundMode = localStorage.getItem('XOSoundMode');
	if (!XOSoundMode) {
		XOSoundMode = 'sound';
		localStorage.setItem('XOSoundMode', 'sound');
	}
	document.getElementById('soundMode').setAttribute('class', XOSoundMode);

	let XOstars = parseInt(localStorage.getItem('XOstars'));
	if (!XOstars) {
		XOstars = 0;
		localStorage.setItem('XOstars', 0);
	}
	model.starScore = XOstars;
	view.displayStarScore();

	setTimeout(function(){
		document.getElementById('loadScreen').style.display = 'none';
	}, 2500);
	document.getElementById('buttonX').onclick = function(){
		playSound(clickSound);
		start('x'); 
	}; 
	document.getElementById('buttonO').onclick = function(){
		playSound(clickSound);
		start('o'); 
	};
	document.getElementById('endGameButton').onclick = function(){
		playSound(clockSound);
		endGame(); 
	}; 
	document.getElementById('continueGameButton').onclick = function(){
		playSound(clockSound);
		continueGame(); 
	};
	document.getElementById('soundMode').onclick = function(){
		playSound(clockSound);
		changeSound(); 
	};	
	document.getElementById('colorMode').onclick = function(){
		playSound(clockSound);
		changeColorScheme(); 
	};
	document.getElementById('starScore').onclick = function(){
		playSound(clockSound);
		view.displayMessage('Всего звезд: ' + model.starScore);	
		setTimeout(function(){
			view.displayMessage(model.currentMessage);
		}, 1500);
	};
	document.getElementById('difMode').onclick = function(){
		playSound(clockSound);
		openDifficultWindow(); 
	};
	document.getElementById('easyButton').onclick = function(){
		playSound(clockSound);
		setEasy(); 
	};
	document.getElementById('normalButton').onclick = function(){
		playSound(clockSound);
		setNorm(); 
	};

	view.displayStat();	
}

function start (sym){ // старт игры
	document.querySelector('#window').style.display = 'none';
	document.querySelector('#endGameButton').style.display = 'block';
	document.querySelector('#continueGameButton').style.display = 'block';
	setGrid();
	setFreeCells();
	setStar(randomLocation()); 	
	view.displayStat();
	if (sym === 'x'){
		model.currentPlayer = 'x';
		model.currentAI = 'o';
		model.currentMessage = 'Ваш ход!';
		model.currentMove = model.currentPlayer;
	} else {
		model.currentPlayer = 'o';
		model.currentAI = 'x';
		setTimeout(function(){
			controller.AIMove();
		}, 750);
		model.currentMessage = 'Ход противника!';
		model.currentMove = model.currentAI;
	}
	view.displayMessage(model.currentMessage);
	view.displayCurrentPlayer();
}

function setGrid(){ // генерация координат ячеек и установка слушателя для кликов игрока
	for (let i = 0; i < model.boardSize; i++){
		for (let j = 0; j < model.boardSize; j++){
			let location = i + '' + j;
			document.getElementById(location).addEventListener('click', function (e){
				if (document.querySelector('#window').style.display === 'none' && 
					model.currentMove !== model.currentAI && !model.gameOver){
					controller.playerMove(location);
				}
			});
		}
	}
}

function setFreeCells(){ // генерация координат свободных ячеек
	for (let i = 0; i < model.boardSize; i++){
		for (let j = 0; j < model.boardSize; j++){
			let location = i + '' + j;
			model.freeCells.push(location);
		}
	}
}

function setStar (location){ // размещение звезды на поле
	if (model.difficult > 0){
		let star = document.createElement('img');
		star.src = 'star.png';
		star.id = 'star';
		document.getElementById(location).append(star);
		model.currentStarLocation = location;			
	} else {
		return false;
	}
}

function endGame(){ // завершение игры и выход на стартовый экран
	model.currentMessage = 'Крестики-нолики';
	view.displayMessage(model.currentMessage);
	clearBoard();
	model.rounds = 0;
	model.playerScore = 0;
	model.AIScore = 0;
	model.currentPlayer = null;
	model.currentAI = null;
	model.currentMove = null;
	document.querySelector('#window').style.display = 'block';
	document.querySelector('#endGameButton').style.display = 'none';
	document.querySelector('#continueGameButton').style.display = 'none';
	view.displayStat(); 
}

function clearBoard(){ // очистка поля и статистики текущей партии
	for (let i = 0; i < model.boardSize; i++){
		for (let j = 0; j < model.boardSize; j++){
			let idBoard = i + '' + j;
			document.getElementById(idBoard).classList.remove('x', 'o');
		}
	}
	view.removeLine();
	model.gameOver = false;
	model.moves = 0;
	model.freeCells = [];
	for (let i = 0; i < model.cells.length; i++){
		let winLine = model.cells[i];
		winLine.toWinP = 0;
		for (let j = 0; j < model.boardSize; j++){
			winLine.hits[j] = '';
		}
	}
	removeStar();	
}

function removeStar(){ // убрать звезду с поля
	if (model.difficult > 0) {
		document.getElementById('star').remove();
		model.currentStarLocation = null;		
	} else {
		return false;
	}
}

function continueGame(){ // начало новой партии текущей игры
	if (model.gameOver === true){
		clearBoard();
		setFreeCells();
		setStar(randomLocation());
		if (model.currentPlayer === 'x'){
			model.currentMessage = 'Ваш ход!';
			view.displayMessage(model.currentMessage);
			model.currentMove = model.currentPlayer;
		} else {
			setTimeout(function(){
				controller.AIMove();
			}, 750);
			model.currentMessage = 'Ход противника!';
			view.displayMessage(model.currentMessage);
			model.currentMove = model.currentAI;
		}
	}
}

function changeSound(){ // смена беззвучного режима
	if (document.getElementById('soundMode').classList.contains('sound')){
		document.getElementById('soundMode').setAttribute('class', 'mute');
		localStorage.setItem('XOSoundMode', 'mute');
		view.displayMessage('Режим: без звука');	
		setTimeout(function(){
			view.displayMessage(model.currentMessage);
		}, 1500);
	} else {
		document.getElementById('soundMode').setAttribute('class', 'sound');
		view.displayMessage('Режим: со звуком');
		localStorage.setItem('XOSoundMode', 'sound');	
		setTimeout(function(){
			view.displayMessage(model.currentMessage);
		}, 1500);
	}
}

function changeColorScheme(){ // смена стиля экрана (светлый\темный)
	if (document.getElementById('colorMode').classList.contains('lightMode')){
		document.getElementById('colorMode').setAttribute('class', 'darkMode');
		document.body.setAttribute('class', 'darkBody');
		document.getElementById('window').setAttribute('class', 'darkWindow');
		localStorage.setItem('XOColorMode', 'dark');
		view.displayMessage('Тема: темная');	
		setTimeout(function(){
			view.displayMessage(model.currentMessage);
		}, 1500);
	} else {
		document.getElementById('colorMode').setAttribute('class', 'lightMode');
		document.body.setAttribute('class', 'lightBody');
		document.getElementById('window').setAttribute('class', 'lightWindow');
		localStorage.setItem('XOColorMode', 'light');
		view.displayMessage('Тема: светлая');	
		setTimeout(function(){
			view.displayMessage(model.currentMessage);
		}, 1500);
	}
}

function openDifficultWindow(){
	if (document.getElementById('difWindow').style.display === 'none'){
		document.getElementById('difWindow').style.display = 'block';
	} else {
		document.getElementById('difWindow').style.display = 'none';		
	}
}

function setEasy(){
if (document.getElementById('difMode').classList.contains('normal')){
		document.querySelector('#window').style.display === 'none' ? endGame() : false;
		document.getElementById('difMode').setAttribute('class', 'easy');
		document.getElementById('easyButton').setAttribute('class', 'selEasyBut');
		document.getElementById('normalButton').setAttribute('class', 'unselNormBut');						
		model.difficult = 0;
		view.displayMessage('Сложность: легко');
		setTimeout(function(){
			view.displayMessage(model.currentMessage);
		}, 1500);
		document.getElementById('difWindow').style.display = 'none';
	} else {
		document.getElementById('difWindow').style.display = 'none';
	}
}

function setNorm(){
if (document.getElementById('difMode').classList.contains('easy')){
		document.querySelector('#window').style.display === 'none' ? endGame() : false;
		document.getElementById('difMode').setAttribute('class', 'normal');
		document.getElementById('normalButton').setAttribute('class', 'selNormBut');
		document.getElementById('easyButton').setAttribute('class', 'unselEasyBut');				
		view.displayMessage('Сложность: норм');	
		model.difficult = 1;
		setTimeout(function(){
			view.displayMessage(model.currentMessage);
		}, 1500);
		document.getElementById('difWindow').style.display = 'none';		
	} else {
		document.getElementById('difWindow').style.display = 'none';
	}
}

var clickSound = new Audio('sounds/click.wav');
clickSound.preload = 'auto';

var clockSound = new Audio('sounds/clock.wav');
clockSound.preload = 'auto';

var xSound = new Audio('sounds/x.wav');
xSound.preload = 'auto';

var oSound = new Audio('sounds/o.wav');
oSound.preload = 'auto';

var winSound = new Audio('sounds/win.wav');
winSound.preload = 'auto';

var failSound = new Audio('sounds/fail.wav');
failSound.preload = 'auto';

var gameOverSound = new Audio('sounds/gameOver.wav');
gameOverSound.preload = 'auto';

function playSound(sound){ // воспроизведение звука в зависимости от режима звука
	document.getElementById('soundMode').classList.contains('sound') ? sound.play() : false;
}

window.onload = init;