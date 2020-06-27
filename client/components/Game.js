/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/label-has-for */
import React, { useState, useRef, useEffect, forwardRef } from 'react'
import Head from './head'
import './game.scss'

const FORM = {
  FORM: 'setup-form',
  SIZE: 'size',
  DIFFICULTY: 'difficulty'
}

const CELL_STATE = {
  ACTIVE: 'active',
  USER: 'user',
  COMPUTER: 'computer',
  FREE: 'free'
}

const GAME_RESULT = {
  WIN: 'win',
  LOSE: 'lose'
}

const initialScore = {
  win: 0,
  lose: 0
}

const GAME_STATUS = {
  READY: 'ready',
  PLAY: 'play',
  RESULT: 'result'
}

const createGameDesk = (num) => {
  return Array.from({ length: num ** 2 }).map((el, index) => ({
    id: index,
    status: CELL_STATE.FREE
  }))
}

const getColor = (el) => {
  switch (el.status) {
    case CELL_STATE.COMPUTER:
      return 'bg-red-300'
    case CELL_STATE.USER:
      return 'bg-green-300'
    case CELL_STATE.ACTIVE:
      return 'bg-yellow-300'
    default:
      return 'bg-gray-300'
  }
}

const initialDelay = 1000

const getNextActiveIndex = (desk) => {
  const freeCells = desk.filter((el) => el.status === CELL_STATE.FREE).map((el) => el.id)

  const index = Math.floor(Math.random() * freeCells.length)
  return freeCells[index]
}

const SetupForm = function SetupFormComponent({ onSubmit }) {
  const [color, setColor] = useState('white')
  const handleRangeChange = (e) => {
    const value = Number.parseInt(e.target.value, 10)
    switch (value) {
      case 2:
        setColor('orange')
        break
      case 3:
        setColor('red')
        break
      default:
        setColor('white')
        break
    }
  }
  return (
    <form
      name={FORM.FORM}
      onSubmit={onSubmit}
      className="shadow rounded to w-full md:w-1/4 border-solid border-t-4 border-purple p-6 my-2 mx-auto flex flex-col justify-center"
    >
      <label className="text-2xl text-gray-900 mb-6">
        Enter field size
        <input
          name={FORM.SIZE}
          type="number"
          max="30"
          className="border-solid border w-full rounded px-3 py-2 mt-3"
        />
      </label>

      <label className="text-2xl text-gray-900 mb-6">
        Select difficulty level
        <input
          name={FORM.DIFFICULTY}
          type="range"
          min="1"
          max="3"
          defaultValue="1"
          onChange={handleRangeChange}
          style={{ backgroundColor: color }}
          className="border-solid border w-full rounded px-3 py-2 mt-3 transition-colors ease-in-out duration-300"
        />
      </label>
      <button
        type="submit"
        className="bg-blue-500 text-white uppercase font-bold py-2 px-4 border-b-4 hover:border-b-2 hover:border-t-2 border-blue-700 hover:border-blue-500 rounded"
      >
        Start the game
      </button>
    </form>
  )
}

const Desk = ({ onClick, deskCells, size }) => {
  return (
    <div className="board-grid mx-auto mt-10 border border-red-600" style={{ width: `${size}rem` }}>
      {deskCells.map((el, index) => {
        const bgColor = getColor(el)
        return (
          <button
            key={el.id}
            type="button"
            data-index={el.id}
            aria-label={`button ${el.id}`}
            className={`item border border-gray-700 bg-gray-300 ${bgColor}`}
            onClick={onClick}
          />
        )
      })}
    </div>
  )
}

const Results = ({ result, onClick, score }) => {
  return (
    <div className="mx-auto flex flex-col justify-center max-w-md py-4 px-8 bg-white shadow-lg rounded-lg my-20">
      <h1 className="mx-auto px-4 text-center text-gray-800 text-3xl font-semibold uppercase">
        {result}
      </h1>
      <div className="statistics">
        <h2 className="text-xl font-medium ">Statistics</h2>
        <span className="label win-label">Wins:</span>
        <div className="score">
          <span className="number win">{score.win}</span>
          <span className="divider" />
          <span className="number lose">{score.lose}</span>
        </div>
        <span className="label lose-label">Loses</span>
        <p className="total">
          Total <span>{score.win + score.lose}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="mx-auto block bg-blue-500 text-white uppercase font-bold py-2 px-4 border-b-4 hover:border-b-2 hover:border-t-2 border-blue-700 hover:border-blue-500 rounded"
      >
        Play again
      </button>
    </div>
  )
}

const Game = () => {
  const [gameState, setGameState] = useState(GAME_STATUS.READY)
  const [deskSize, setDeskSize] = useState(0)
  const [score, setScore] = useState(initialScore)
  const [delay, setDelay] = useState(initialDelay)

  const [result, setResult] = useState()

  const [desk, updateDesk] = useState(createGameDesk(1))
  const timer = useRef()
  const prevIndex = useRef()

  const handleRestart = () => {
    clearInterval(timer.current)
    setGameState(GAME_STATUS.READY)
  }

  const handleGameEnd = (status = 'lose') => {
    clearInterval(timer.current)
    switch (status) {
      case GAME_RESULT.WIN:
        setResult('🎉🎉 YOU WIN 🎉🎉')
        break
      default:
        setResult('☠👻 YOU LOSE 👻☠')
    }

    setScore((state) => ({ ...state, [status]: state[status] + 1 }))
    setGameState(GAME_STATUS.RESULT)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const playGame = () => {
    const playerCount = desk.filter((el) => el.status === CELL_STATE.USER).length
    const computerCount = desk.filter((el) => el.status === CELL_STATE.COMPUTER).length

    switch (true) {
      case playerCount >= desk.length / 2:
        handleGameEnd(GAME_RESULT.WIN)
        break
      case computerCount >= desk.length / 2:
        handleGameEnd(GAME_RESULT.LOSE)
        break
      default:
        timer.current = setInterval(() => {
          const data = [...desk]
          const index = getNextActiveIndex(data)

          if (Number.isFinite(index)) {
            data[index].status = CELL_STATE.ACTIVE

            if (prevIndex.current != null) {
              data[prevIndex.current].status = CELL_STATE.COMPUTER
              setDelay(delay * 1.1)
            }
            prevIndex.current = index
            updateDesk(data)
          }
        }, delay)
    }
  }

  useEffect(() => {
    if (gameState === GAME_STATUS.PLAY) {
      playGame()
    }
    if (gameState !== GAME_STATUS.PLAY) {
      clearInterval(timer.current)
    }
    return () => clearInterval(timer.current)
  }, [playGame, gameState])

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const form = document.forms[FORM.FORM]
    console.log(
      'event',
      Object.keys(document.forms[FORM.FORM].elements).map(
        (el) => document.forms[FORM.FORM].elements[el].value
      )
    )
    const value = Number.parseInt(form[FORM.SIZE].value, 10)
    if (Number.isNaN(value)) {
      return
    }
    setDeskSize(value)
    const newDesk = createGameDesk(value)
    updateDesk(newDesk)

    const difficulty = Number.parseInt(form[FORM.DIFFICULTY].value, 10)
    setDelay((delay / difficulty).toFixed(0))
    setGameState(GAME_STATUS.PLAY)
  }

  const handleElementClick = (e) => {
    const { index } = e.target.dataset
    const data = [...desk]
    if (data[index].status === CELL_STATE.ACTIVE) {
      data[index].status = CELL_STATE.USER
      updateDesk(data)
      setDelay(delay * 0.95)
      prevIndex.current = null
    }
  }

  const containerSize = deskSize * 2 + 2

  switch (gameState) {
    case GAME_STATUS.READY:
      return <SetupForm onSubmit={handleFormSubmit} />
    case GAME_STATUS.PLAY:
      return <Desk deskCells={desk} onClick={handleElementClick} size={containerSize} />
    case GAME_STATUS.RESULT:
      return <Results result={result} onClick={handleRestart} score={score} />
    default:
      return null
  }
}

Game.propTypes = {}

export default React.memo(Game)
