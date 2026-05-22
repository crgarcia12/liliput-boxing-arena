export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export enum FighterState {
  IDLE = 'IDLE',
  JABBING = 'JABBING',
  HOOKING = 'HOOKING',
  FOOTWORK = 'FOOTWORK',
  STAGGERED = 'STAGGERED'
}

export interface FighterStats {
  health: number
  maxHealth: number
  stamina: number
  maxStamina: number
  position: { x: number; y: number }
  state: FighterState
  stateTimer: number
  invulnerable: boolean
  invulnerabilityTimer: number
}

export interface PunchRecord {
  type: 'jab' | 'hook'
  timestamp: number
}

export class Game {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  gameState: GameState = GameState.MENU
  player: FighterStats
  opponent: FighterStats
  lastTime: number = 0
  aiTimer: number = 0
  aiPunches: PunchRecord[] = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    
    this.player = this.createFighter(150, 400)
    this.opponent = this.createFighter(600, 400)
    
    this.setupEventListeners()
  }

  createFighter(x: number, y: number): FighterStats {
    return {
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      position: { x, y },
      state: FighterState.IDLE,
      stateTimer: 0,
      invulnerable: false,
      invulnerabilityTimer: 0
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (this.gameState !== GameState.PLAYING) return
      
      switch (e.key.toLowerCase()) {
        case 'j':
          this.playerJab()
          break
        case 'h':
          this.playerHook()
          break
        case 'f':
          this.playerFootwork()
          break
      }
    })

    const startBtn = document.getElementById('start-btn')
    const restartBtn = document.getElementById('restart-btn')
    
    startBtn?.addEventListener('click', () => this.startGame())
    restartBtn?.addEventListener('click', () => this.restartGame())
  }

  startGame() {
    this.gameState = GameState.PLAYING
    document.getElementById('menu-screen')!.classList.remove('visible')
    this.lastTime = performance.now()
    this.gameLoop(this.lastTime)
  }

  restartGame() {
    this.player = this.createFighter(150, 400)
    this.opponent = this.createFighter(600, 400)
    this.aiPunches = []
    this.aiTimer = 0
    this.gameState = GameState.PLAYING
    document.getElementById('game-over-screen')!.classList.remove('visible')
    this.lastTime = performance.now()
    this.gameLoop(this.lastTime)
  }

  playerJab() {
    if (this.player.stamina < 10) return
    if (this.player.state !== FighterState.IDLE) return
    
    this.player.state = FighterState.JABBING
    this.player.stateTimer = 300
    this.player.stamina = Math.max(0, this.player.stamina - 10)
    
    if (this.isInRange(this.player, this.opponent) && !this.opponent.invulnerable) {
      this.opponent.health = Math.max(0, this.opponent.health - 5)
    }
  }

  playerHook() {
    if (this.player.stamina < 20) return
    if (this.player.state !== FighterState.IDLE) return
    
    this.player.state = FighterState.HOOKING
    this.player.stateTimer = 600
    this.player.stamina = Math.max(0, this.player.stamina - 20)
    
    if (this.isInRange(this.player, this.opponent) && !this.opponent.invulnerable) {
      this.opponent.health = Math.max(0, this.opponent.health - 15)
      this.opponent.state = FighterState.STAGGERED
      this.opponent.stateTimer = 1000
    }
  }

  playerFootwork() {
    if (this.player.stamina < 15) return
    if (this.player.state !== FighterState.IDLE) return
    
    this.player.state = FighterState.FOOTWORK
    this.player.stateTimer = 300
    this.player.stamina = Math.max(0, this.player.stamina - 15)
    this.player.invulnerable = true
    this.player.invulnerabilityTimer = 300
    
    // Move laterally
    this.player.position.x = Math.max(50, Math.min(350, this.player.position.x + 50))
  }

  isInRange(attacker: FighterStats, target: FighterStats): boolean {
    return Math.abs(attacker.position.x - target.position.x) < 200
  }

  updateAI(deltaTime: number) {
    if (this.gameState !== GameState.PLAYING) return
    if (this.opponent.state === FighterState.STAGGERED) return
    if (this.opponent.state !== FighterState.IDLE) return
    
    this.aiTimer += deltaTime
    
    // AI attacks every 1-2 seconds
    if (this.aiTimer > 1000 + Math.random() * 1000) {
      this.aiTimer = 0
      const punchType = Math.random() > 0.5 ? 'jab' : 'hook'
      
      this.aiPunches.push({ type: punchType, timestamp: performance.now() })
      
      if (punchType === 'jab') {
        this.opponent.state = FighterState.JABBING
        this.opponent.stateTimer = 300
        if (this.isInRange(this.opponent, this.player) && !this.player.invulnerable) {
          this.player.health = Math.max(0, this.player.health - 10)
        }
      } else {
        this.opponent.state = FighterState.HOOKING
        this.opponent.stateTimer = 600
        if (this.isInRange(this.opponent, this.player) && !this.player.invulnerable) {
          this.player.health = Math.max(0, this.player.health - 15)
          this.player.state = FighterState.STAGGERED
          this.player.stateTimer = 1000
        }
      }
    }
  }

  update(deltaTime: number) {
    if (this.gameState !== GameState.PLAYING) return
    
    // Update player state timers
    if (this.player.stateTimer > 0) {
      this.player.stateTimer -= deltaTime
      if (this.player.stateTimer <= 0) {
        this.player.state = FighterState.IDLE
      }
    }
    
    if (this.player.invulnerabilityTimer > 0) {
      this.player.invulnerabilityTimer -= deltaTime
      if (this.player.invulnerabilityTimer <= 0) {
        this.player.invulnerable = false
      }
    }
    
    // Update opponent state timers
    if (this.opponent.stateTimer > 0) {
      this.opponent.stateTimer -= deltaTime
      if (this.opponent.stateTimer <= 0) {
        this.opponent.state = FighterState.IDLE
      }
    }
    
    // Regenerate stamina (20 per second)
    if (this.player.state === FighterState.IDLE) {
      this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + deltaTime * 0.02)
    }
    
    this.updateAI(deltaTime)
    
    // Check win/lose conditions
    if (this.opponent.health <= 0) {
      this.endGame('You Win!')
    } else if (this.player.health <= 0) {
      this.endGame('You Lose!')
    }
  }

  endGame(message: string) {
    this.gameState = GameState.GAMEOVER
    const gameOverScreen = document.getElementById('game-over-screen')!
    const messageEl = document.getElementById('game-over-message')!
    messageEl.textContent = message
    gameOverScreen.classList.add('visible')
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#16213e'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Draw boxing ring
    this.ctx.strokeStyle = '#eee'
    this.ctx.lineWidth = 3
    this.ctx.strokeRect(50, 100, 700, 450)
    
    // Draw center line
    this.ctx.strokeStyle = '#666'
    this.ctx.lineWidth = 2
    this.ctx.setLineDash([10, 10])
    this.ctx.beginPath()
    this.ctx.moveTo(400, 100)
    this.ctx.lineTo(400, 550)
    this.ctx.stroke()
    this.ctx.setLineDash([])
    
    // Draw fighters
    this.drawFighter(this.player, '#4ecdc4', 'PLAYER')
    this.drawFighter(this.opponent, '#e94560', 'AI')
    
    // Draw HUD
    this.drawHUD()
  }

  drawFighter(fighter: FighterStats, color: string, label: string) {
    const { x, y } = fighter.position
    
    // Body
    this.ctx.fillStyle = fighter.invulnerable ? '#ffff00' : color
    this.ctx.fillRect(x - 25, y - 60, 50, 80)
    
    // Head
    this.ctx.beginPath()
    this.ctx.arc(x, y - 80, 20, 0, Math.PI * 2)
    this.ctx.fill()
    
    // State indicator
    this.ctx.fillStyle = '#fff'
    this.ctx.font = '12px monospace'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(fighter.state, x, y + 30)
    
    // Stagger effect
    if (fighter.state === FighterState.STAGGERED) {
      this.ctx.strokeStyle = '#ffff00'
      this.ctx.lineWidth = 3
      this.ctx.strokeRect(x - 30, y - 90, 60, 120)
    }
    
    // Punch animation
    if (fighter.state === FighterState.JABBING || fighter.state === FighterState.HOOKING) {
      const armLength = fighter.state === FighterState.HOOKING ? 60 : 40
      this.ctx.strokeStyle = color
      this.ctx.lineWidth = 5
      this.ctx.beginPath()
      const direction = label === 'PLAYER' ? 1 : -1
      this.ctx.moveTo(x, y - 40)
      this.ctx.lineTo(x + armLength * direction, y - 40)
      this.ctx.stroke()
    }
  }

  drawHUD() {
    const barHeight = 20
    const barY = 20
    
    // Player health bar
    this.ctx.fillStyle = '#333'
    this.ctx.fillRect(50, barY, 200, barHeight)
    this.ctx.fillStyle = '#4ecdc4'
    this.ctx.fillRect(50, barY, 200 * (this.player.health / this.player.maxHealth), barHeight)
    this.ctx.strokeStyle = '#fff'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(50, barY, 200, barHeight)
    
    // Player label
    this.ctx.fillStyle = '#fff'
    this.ctx.font = '14px monospace'
    this.ctx.textAlign = 'left'
    this.ctx.fillText(`PLAYER: ${Math.round(this.player.health)}`, 50, barY - 5)
    
    // Player stamina bar
    this.ctx.fillStyle = '#333'
    this.ctx.fillRect(50, barY + 30, 200, barHeight)
    this.ctx.fillStyle = '#ffd700'
    this.ctx.fillRect(50, barY + 30, 200 * (this.player.stamina / this.player.maxStamina), barHeight)
    this.ctx.strokeStyle = '#fff'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(50, barY + 30, 200, barHeight)
    this.ctx.fillText(`STAMINA: ${Math.round(this.player.stamina)}`, 50, barY + 25)
    
    // Opponent health bar
    this.ctx.fillStyle = '#333'
    this.ctx.fillRect(550, barY, 200, barHeight)
    this.ctx.fillStyle = '#e94560'
    this.ctx.fillRect(550, barY, 200 * (this.opponent.health / this.opponent.maxHealth), barHeight)
    this.ctx.strokeStyle = '#fff'
    this.ctx.strokeRect(550, barY, 200, barHeight)
    
    // Opponent label
    this.ctx.textAlign = 'right'
    this.ctx.fillText(`AI: ${Math.round(this.opponent.health)}`, 750, barY - 5)
    
    // Controls
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = '#888'
    this.ctx.font = '12px monospace'
    this.ctx.fillText('J: Jab | H: Hook | F: Footwork', 400, 580)
  }

  gameLoop(currentTime: number) {
    if (this.gameState !== GameState.PLAYING) return
    
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime
    
    this.update(deltaTime)
    this.render()
    
    requestAnimationFrame((time) => this.gameLoop(time))
  }
}
