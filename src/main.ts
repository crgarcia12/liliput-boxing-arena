import { Game } from './game'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const game = new Game(canvas)

// Show menu on load
document.getElementById('menu-screen')!.classList.add('visible')

// Make game instance globally accessible for testing
;(window as any).game = game
