function gridCells(row = 3, column = 3) {
  const gameGrid = []

  //Создаем массив
  const createNewGrid = () => {
    gameGrid.splice(0, gameGrid.length)
    for (let i = 0; i < row; i++) {
      gameGrid[i] = [];
      for (let j = 0; j < column; j++) {
        gameGrid[i].push(Cell())
      }
    }
    console.log("Поле сброшено.");
  }
  createNewGrid();
  // Получить сетку
  const getGrid = () => gameGrid;

  //изменить значение ячейки 
  const updateCell = (row, column, player) => {
    if (gameGrid[row][column].getValue() === 0) {
      gameGrid[row][column].addToken(player)
      return true
    }
    return false
  }

  //Метод вывода поля в консоль
  const printGrid = () => {
    const gridCellValue = gameGrid.map((row) => row.map((cell) => cell.getValue()));
    console.log(gridCellValue)
  }

  return { getGrid, updateCell, printGrid, createNewGrid }
}

function Cell() {
  let value = 0;

  //Добавить значение
  const addToken = (player) => {
    value = player;
  }

  const getValue = () => value;



  return { addToken, getValue }
}

function GameController(playerOneName = 'Player One',
  playerTwoName = 'Player Two',
  row = 3,
  column = 3
) {
  const grid = gridCells(row, column); //Создать игровое поле
  //Игроки
  const players =
    [{
      name: playerOneName,
      token: 1,
      score: 0,
    },
    {
      name: playerTwoName,
      token: 2,
      score: 0
    }
    ];
  const gameStatus = {
    round: 0,
    draw: 0,
    movesCount: 0
  }
  //Активный игрок
  let activePlayer = players[0];

  const getGameStatus = () => ({
    players,
    activePlayer,
    gameStatus,
    grid: grid.getGrid()
  })

  //Ничья
  const incrementRow = () => gameStatus.draw++
  //Перключение
  const switchPlayerActive = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  //Получить активного игрока
  const getActivePlayer = () => activePlayer;
  //Плюс действия
  const incrementMoves = () => gameStatus.movesCount++;
  //Сброс действий
  const resetMove = () => gameStatus.movesCount = 0;
  //New round
  const updateRound = () => gameStatus.round++
  //Вывод в консоль
  const printNewRound = () => {
    grid.printGrid(); // Выводим игровую сетку
    console.log(`${getActivePlayer().name} ходит`);
    console.log(`Раунд: ${gameStatus.round}, Ходы: ${gameStatus.movesCount}, Ничьи: ${gameStatus.draw}`);
    console.log(`Счёт: ${players[0].name} - ${players[0].score}, ${players[1].name} - ${players[1].score}`);

  }

  //Поиск победителя 
  const findingWinner = () => {
    const arrayWin = grid.getGrid().map((row) => row.map((cell) => cell.getValue()))
    //Проверка строки на одинаковые элементы в строке
    const isWinningRow = row => row.every(cell => cell === row[0] && cell !== 0);
    //Проверка в столбцах
    const isWinningColumn = (column) => {
      const arrayColumn = arrayWin.map((cell) => cell[column])
      return arrayColumn.every(cellColumn => cellColumn === arrayColumn[0] && cellColumn !== 0)
    }
    //Диагонали 
    const isWinningDiagonalMain = arrayWin.map((row, index) => row[index]).every(cell => cell === arrayWin[0][0] && cell !== 0);
    const isWinningDiagonalAnti = arrayWin.map((row, index) => row[arrayWin.length - 1 - index]).every(cell => cell === arrayWin[0][arrayWin.length - 1] && cell !== 0);
    //Для строк
    for (const row of arrayWin) {
      if (isWinningRow(row)) {
        console.log(`Победил - ${getActivePlayer().name} Счет - ${gameStatus.round}`)
        getActivePlayer().score++
        return true;
      }
    }
    //Для столбцов
    for (let i = 0; i < column; i++) {
      if (isWinningColumn(i)) {
        getActivePlayer().score++
        console.log(`Победил - ${getActivePlayer().name} Счет - ${gameStatus.round}`)
        return true;
      }
    }
    //Для пересечений 

    if (isWinningDiagonalMain || isWinningDiagonalAnti) {
      getActivePlayer().score++
      console.log(`Победил - ${getActivePlayer().name} Счет - ${gameStatus.round}`);
      return true;
    }
    return false;

  }

  //Заполнить ячейку знаком игрока
  const playRound = (row, column) => {
    if (row < 0 || row >= grid.getGrid().length || column < 0 || column >= grid.getGrid()[0].length) {
      console.log("Ошибка: Неверные координаты.");
      return;
    }
    if (grid.updateCell(row, column, getActivePlayer().token)) {
      console.log(`Заполняем ячейку колонка: ${column} и строка: ${row}, игроком: ${getActivePlayer().name}`)
      incrementMoves();
    } else {
      console.log("Клетка уже занята. Попробуйте снова.");
      return
    }

    //Обновить количество раундов
    if (gameStatus.movesCount > 4 && gameStatus.movesCount < 9) {
      if (findingWinner()) {
        updateRound();
        grid.printGrid()
        grid.createNewGrid();
        activePlayer = players[0];
        resetMove();
        return
      }
    } else if (gameStatus.movesCount > 8) {
      console.log("Игра закончилась ничьей!");
      updateRound();
      incrementRow();
      grid.printGrid()
      grid.createNewGrid();
      activePlayer = players[0];
      resetMove();
      return
    }
    switchPlayerActive(); // Меняем игрока
    printNewRound(); // Отображаем новое состояние игры
  };


  return { playRound, getActivePlayer, getGrid: grid.getGrid, findingWinner, getGameStatus }; // Интерфейс для управления игрой
}

(function ScreenController() {
  const gameContainer = document.querySelector('.body__game')


  function showPlayerForm() {
    gameContainer.innerHTML = `<h1 class="new__game">Создать игру</h1>
<form class="form" id="form_play" action="">
    <div class="input__group">

        <label class="input__label--text" for="name__player1">Введите имя игрока №1 </label>
        <input style="font-size: 36px;" class="input__form--modifier" id="name__player1" type="text" name="name__player1"
            placeholder="Константин">
    </div>

    <div class="input__group">
        <label class="input__label--text" for="name__player2">Введите имя игрока №2 </label>
        <input class="input__form--modifier" id="name__player2" type="text" name="name__player2"
            placeholder="Никита">
    </div>
    <button class="form__button">СОЗДАТЬ ИГРУ</button>
</form>
`

    const playerForm = document.querySelector('#form_play');
    playerForm.addEventListener('submit', startGame);
  }

  function renderingGame(players, gameStatus, game) {
    gameContainer.innerHTML = `<div class="result">
      <div class="result__player result__player--one">
          <p class="name__playerOne name__text">${players[0].name}</p>
          <p class="score__playerOne score__text">${players[0].score}</p>
      </div>
      <div class="result__row">
          <p class="name__row name__text">Ничья</p>
          <p class="score__row score__text">${gameStatus.gameStatus.draw}</p>
      </div>
      <div class=" result__player result__player--two">
          <p class="name__playerTwo name__text">${players[1].name}</p>
          <p class="score__playerTwo score__text">${players[1].score}</p>
      </div>
    </div>
    `

    const borderGame = document.createElement('div')
    borderGame.classList.add('border__game')
    gameStatus.grid.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        const cellButton = document.createElement('button')
        cellButton.classList.add('border__cell')
        cellButton.dataset.row = rowIndex;
        cellButton.dataset.cell = cellIndex;

        cellButton.innerHTML = '';

        const cellValue = cell.getValue();

        if (cellValue !== 0) {
          const img = document.createElement('img')
          img.src = cellValue === 1 ? './assets/img/circle.png' : './assets/img/cross.png';

          cellButton.appendChild(img);

        }

        cellButton.addEventListener('click', () => {
          game.playRound(rowIndex, cellIndex);
          renderingGame(players, gameStatus, game);
        })
        borderGame.appendChild(cellButton);
      })
    })
    gameContainer.appendChild(borderGame)
    console.log(gameStatus.players)
  }




  function startGame(event) {
    event.preventDefault();

    const playerOne = document.getElementById('name__player1').value
    const playerTwo = document.getElementById('name__player2').value

    const game = GameController(playerOne, playerTwo);

    const gameStatus = game.getGameStatus();

    const arrayDate = gameStatus.grid.map((row) => row.map(cell => cell.getValue));

    console.log(gameStatus.gameStatus.draw)
    renderingGame(gameStatus.players, gameStatus, game);
  }

  showPlayerForm()
})();






