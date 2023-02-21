const axios = require('axios');

const commands = {
    hello: "/hello",
    info: "/info",
    cat: "/cat",
    currency: "/currency",
    game: "/game",
};

const currencyOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: "Доллар к Рублю", callback_data: "RUB"}],
            [{text: "Доллар к Евро", callback_data: "EUR"}],
            [{text: "Доллар к Фунту Стерлингов", callback_data: "GBP"}],
            [{text: "Доллар к Белорусскому рублю", callback_data: "BYR"}],
        ]
    })
}


// Текущее состояние клавиатуры и игрового поля
let state = {
    keyBoard: [
        [{text: "?", callback_data: "0"}, {text: "?", callback_data: "1"}, {text: "?", callback_data: "2"}],
        [{text: "?", callback_data: "3"}, {text: "?", callback_data: "4"}, {text: "?", callback_data: "5"}],
        [{text: "?", callback_data: "6"}, {text: "?", callback_data: "7"}, {text: "?", callback_data: "8"}],
        [{text: "Начать заново", callback_data: "initial"}],
    ],
    array: [0, 1, 2, 3, 4, 5, 6, 7, 8],
};

// Функция, обрабатывающая действия пользователя
const createTicTacOptions = (option) => {
    switch (option) {
        case "initial": {
            resetState();
            return {
                options: {
                    reply_markup: JSON.stringify({
                        inline_keyboard: state.keyBoard,
                    })
                },
                winner: null,
            }
        }
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8": {
            const chosenNumber = Number(option);
            if (typeof (state.array[chosenNumber]) !== "number") {
                return {
                    options: {
                        reply_markup: JSON.stringify({
                            inline_keyboard: state.keyBoard,
                        })
                    },
                    winner: null,
                }
            }
            makeUserStep(chosenNumber);
            const result = checkResult(state.array, "x");
            if (result.val) {
                return {
                    options: {
                        reply_markup: JSON.stringify({
                            inline_keyboard: state.keyBoard,
                        })
                    },
                    winner: result.win,
                }
            }
            makeBotStep();
            const result1 = checkResult(state.array, "0");
            if (result1.val) {
                return {
                    options: {
                        reply_markup: JSON.stringify({
                            inline_keyboard: state.keyBoard,
                        })
                    },
                    winner: result1.win,
                }
            }
            return {
                options: {
                    reply_markup: JSON.stringify({
                        inline_keyboard: state.keyBoard,
                    })
                },
                winner: null,
            }
        }
        default: {
            resetState();
            return {
                options: {
                    reply_markup: JSON.stringify({
                        inline_keyboard: state.keyBoard,
                    })
                },
                winner: null,
            }
        }
    }
}

// Функция для обнуления игрового поля
const resetState = () => {
    state = {
        keyBoard: [
            [{text: "?", callback_data: "0"}, {text: "?", callback_data: "1"}, {text: "?", callback_data: "2"}],
            [{text: "?", callback_data: "3"}, {text: "?", callback_data: "4"}, {text: "?", callback_data: "5"}],
            [{text: "?", callback_data: "6"}, {text: "?", callback_data: "7"}, {text: "?", callback_data: "8"}],
            [{text: "Начать заново", callback_data: "initial"}],
        ],
        array: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    };
}

// Функция для хода пользователя
const makeUserStep = (chosenSquare) => {
    makeStep(chosenSquare, "x");
}

// Функция для хода бота
const makeBotStep = () => {
    let chosenSquare = minimax(state.array, "0");
    makeStep(chosenSquare.index, "0");
}

// Общая функция для хода
const makeStep = (number, sign) => {
    state.array[number] = sign;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (state.keyBoard[i][j]?.callback_data === number.toString()) {
                state.keyBoard[i][j].text = sign;
                return;
            }
        }
    }
}

// Функция для определения оптимального хода бота
function minimax(newBoard, player) {

    //Свободные клетки
    let availableSpots = emptySpots(newBoard);

    // проверка исход игры (победа | поражение | ничья)
    if (checkResult(newBoard, "x").val === 1) {
        return {score: -10};
    }
    if (checkResult(newBoard, "0").val === 1) {
        return {score: 10};
    }
    if (availableSpots.length === 0) {
        return {score: 0};
    }

    // массив для хранения всех возможных ходов
    let moves = [];

    // цикл по свободным клеткам
    for (let i = 0; i < availableSpots.length; i++) {
        //создаем объект, в котором будет храниться индекс клетки и результат хода
        let move = {};
        move.index = newBoard[availableSpots[i]];

        // Свободную клетку занимает крестик или нолик в зависимости от того, кто сейчас ходит
        newBoard[availableSpots[i]] = player;

        //Рекурсивно просчитываем следующие ходы для бота (нолики) и игрока (крестики)
        if (player === "0") {
            let result = minimax(newBoard, "x");
            move.score = result.score;
        } else {
            let result = minimax(newBoard, "0");
            move.score = result.score;
        }

        //Освобождаем свободную клетку
        newBoard[availableSpots[i]] = move.index;

        // Добавляем ход в массив
        moves.push(move);
    }


// Если ходит бот, находим ход с наибольшим результатом
    let bestMove;
    if (player === "0") {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
// Ходит человек - находим ход с худшим результатом
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

// Возвращаем лучших ход из нашего массива ходов
    return moves[bestMove];
}

// Функция для определения свободных клеток
function emptySpots(board) {
    return board.filter(element => typeof (element) === "number");
}

// Функция для проверки результата и выявления победителя
const checkResult = (board, player) => {
    if ((board[0] === player && board[1] === player && board[2] === player) ||
        (board[3] === player && board[4] === player && board[5] === player) ||
        (board[6] === player && board[7] === player && board[8] === player) ||
        (board[0] === player && board[3] === player && board[6] === player) ||
        (board[1] === player && board[4] === player && board[7] === player) ||
        (board[2] === player && board[5] === player && board[8] === player) ||
        (board[0] === player && board[4] === player && board[8] === player) ||
        (board[2] === player && board[4] === player && board[6] === player))
        return {val: 1, win: player === "x" ? "Ты" : "Бот"}
    if (emptySpots(board).length === 0) {
        return {val: 2, win: "Ничья"}
    }
    return {val: 0}
}


const getCatUrl = async () => {
    try {
        const data = await axios.get('https://api.thecatapi.com/v1/images/search');
        return data?.data[0]?.url;
    } catch (e) {
        console.log('Error: ', e.message);
        return null;
    }
}

const getCurrency = async (currencies = 'RUB') => {
    try {
        const data = await axios.get(`https://api.apilayer.com/currency_data/live?source=USD&currencies=${currencies}`, {
            headers: {'apikey': 'YiQJd5FD579QOZWjaT5PQvEwFjnLIjCl'}
        });
        return Object.values(data?.data?.quotes)[0];
    } catch (e) {
        console.log('Error: ', e.message);
        return null;
    }
}


module.exports = {commands, getCatUrl, getCurrency, currencyOptions, createTicTacOptions};