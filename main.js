//initial data
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105219.svg', // 梅花
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg' // 方塊
]

//functions for page visualization
const view = {
  getCardElement (index) {
    const symbolNum = Math.floor(index / 13)
    return `<div data-index="${index}" data-symbol="${symbolNum}" class="card back"></div>`
  },

  getCardContent (index, symbolNum) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[symbolNum]
    let symbolColor
    symbolNum === 0 || symbolNum === 1
      ? (symbolColor = '')
      : (symbolColor = 'red')

    return `
      <p>${number}</p>
      <img src="${symbol}" class="${symbolColor}"/>
      <p>${number}</p>
    `
  },

  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards (indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join('')
  },

  flipCards (...cards) {
    cards.map((card) => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(
          Number(card.dataset.index),
          Number(card.dataset.symbol)
        )
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards (...cards) {
    cards.map((card) => {
      card.classList.add('paired')
    })
  },

  renderScore (score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes (times) {
    document.querySelector(
      '.tried'
    ).textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation (...cards) {
    cards.map((card) => {
      card.classList.add('wrong')
      card.addEventListener(
        'animationend',
        (event) => event.target.classList.remove('wrong'),
        { once: true }
      )
    })
  },

  showGameFinished () {
    const div = document.createElement('div')

    div.classList.add('completed')
    div.innerHTML = `
      <p>🎉 Congratulation 🎉</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

//functions for data processing
const model = {
  revealedCards: [],

  isRevealedCardsMatched () {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13 &&
      this.revealedCards[0].dataset.symbol ===
      this.revealedCards[1].dataset.symbol
    )
  },

  score: 0,

  triedTimes: 0
}

//functions for proceeding game status
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards () {
    view.displayCards(utility.getRandomNumberArray(10))
  },

  dispatchCardAction (card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)

        view.flipCards(card)
        model.revealedCards.push(card)

        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore((model.score += 10))

          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []

          if (model.score === 50) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log(
      'revealedCards',
      model.revealedCards.map((card) => card.dataset.index)
    )
  },

  resetCards () {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

//functions for shuffling cards
const utility = {
  getRandomNumberArray (count) {
    // randomly select 5 numbers out of 52
    const allCardsNum = Array.from(Array(52).keys())
    const number = []
    while (number.length < count / 2) {
      const tempIndex = Math.floor(Math.random() * allCardsNum.length)
      number.push(allCardsNum[tempIndex])
    }
    // copy 5 numbers
    const numbers = number.concat(number)
    // shuffle 10 numbers
    for (let index = numbers.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [numbers[index], numbers[randomIndex]] = [
        numbers[randomIndex],
        numbers[index]
      ]
    }
    return numbers
  }
}

//start game
controller.generateCards()

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', (event) => {
    controller.dispatchCardAction(card)
  })
})
