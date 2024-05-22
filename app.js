const grid = document.querySelector('.grid')
const squares = document.querySelectorAll('.square')
const keys = document.querySelectorAll('.key')
const wordLength = 5;
let targetWord;



function getTargetWord() {
    fetch('https://random-word-api.herokuapp.com/word?length=5')
        .then(response => {
            if (response.ok) {
                return response.json()
            }
        }, networkError => console.log(networkError.message))
        .then(data => {
            targetWord = data[0]
        })
        .catch(error => console.log(error))
}

function handleClick(e) {
    if (e.target.matches('[data-key]')) {
        pressKey(e.target.dataset.key)
    }
    if (e.target.matches('[data-enter]')) {
        submit()
    }
    if (e.target.matches('[data-del]')) {
        del()
    }
}

function pressKey(key) {
    const activeSquares = getActiveSquares()
    if (activeSquares.length >= wordLength) { //stops adding letters when word length reached
        return
    }
    const nextSquare = grid.querySelector(':not([data-letter])') //selects first square that doesn't have data-letter attr.
    nextSquare.textContent = key
    nextSquare.dataset.letter = key
    nextSquare.dataset.state = 'active'
}

function getActiveSquares() {
    return grid.querySelectorAll('[data-state]')
}


// logic for checking letters in guess
function checkAnswer(guess, target) {
    console.log(target)
    let answerIndex = 0;
    const activeSquares = [...getActiveSquares()]
    const guessArray = guess.split('')
    const targetArray = target.split('')
    let functionCounter = 0;

    function checkLetters() {
        if (answerIndex === 5) {
            clearInterval(timerId)
            activeSquares.forEach(square => { //removes active state from guessed word squares (would fail if statement in pressKey otherwise)
                square.removeAttribute('data-state');
            })
            checkWord()
        }           

        if (targetArray.includes(guessArray[answerIndex])) {
            if (targetArray[answerIndex] === guessArray[answerIndex]) {
                highlight(answerIndex, activeSquares, 'green')
            } else {
                highlight(answerIndex, activeSquares, 'yellow')
            }
        } else {
            highlight(answerIndex, activeSquares, 'grey')
        }
        answerIndex++;
        functionCounter++;
        
    }

    function highlight(index, array, color) {
        array[index].classList.add(color)
        array[index].classList.add('settled')
        array[index].style.border = 'none'
        const key = document.querySelector(`[data-key=${array[index].textContent}]`)
        key.classList.add(color)
    }

    function checkWord() {
        if (activeSquares.every(square => square.classList.contains('green'))) {
            document.removeEventListener('click', handleClick)
            console.log('yay, you win')
        }
    }
    
    timerId = setInterval(checkLetters, 500)       
}


function submit() {
    const guess = [...getActiveSquares()].map(square => square.dataset.letter).join('').toLowerCase();
    if (guess.length === 5) {
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`)
        .then(response => {
            if (response.ok) {
                checkAnswer(guess, targetWord)
                return
            }
            throw new Error("word doesn't exist!")
        }, networkError => console.log(networkError.message))
        .catch(error => console.log(error)) //add error animation functionality to catch
    }
}

function del() {
    const activeSquares = getActiveSquares();
    if (activeSquares.length > 0) {
        const delTarget = activeSquares[activeSquares.length - 1]
        delTarget.textContent = '';
        delTarget.removeAttribute('data-state');
        delTarget.removeAttribute('data-letter');
    }
}



document.addEventListener('click', handleClick)

getTargetWord()



//lose functionality, display if word entered doesn't exist