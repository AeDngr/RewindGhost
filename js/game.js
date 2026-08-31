import { STAGES } from './stages.js';
import { UI } from './ui.js';

export class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId) || this.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.ui = new UI(this);
    
    this.currentMode = null;
    this.currentStageIndex = 0;
    this.grid = [];
    this.player = { x: 0, y: 0, dirX: 1, dirY: 0 };
    this.speed = 3;
    this.tileSize = 40;
    this.isRunning = false;
    this.timer = null;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    document.body.appendChild(canvas);
    return canvas;
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setSpeed(val) {
    this.speed = val;
  }

  startStage(mode, index) {
    this.currentMode = mode;
    this.currentStageIndex = index;
    this.grid = STAGES[mode][index].grid;
    this.initPlayer();
    this.isRunning = true;
    this.loop();
  }

  restartStage() {
    if (this.currentMode !== null) {
      this.startStage(this.currentMode, this.currentStageIndex);
    }
  }

  stop() {
    this.isRunning = false;
    if (this.timer) cancelAnimationFrame(this.timer);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  initPlayer() {
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        if (this.grid[r][c] === 2) {
          this.player = { r, c, x: c, y: r, dirX: 1, dirY: 0 };
          return;
        }
      }
    }
  }

  update() {
    if (!this.isRunning) return;

    const moveStep = 0.02 * this.speed;
    this.player.x += this.player.dirX * moveStep;
    this.player.y += this.player.dirY * moveStep;

    const targetC = Math.round(this.player.x);
    const targetR = Math.round(this.player.y);

    if (Math.abs(this.player.x - targetC) < moveStep && Math.abs(this.player.y - targetR) < moveStep) {
      this.player.x = targetC;
      this.player.y = targetR;
      this.player.c = targetC;
      this.player.r = targetR;

      if (this.grid[targetR] && this.grid[targetR][targetC] !== undefined) {
        const tile = this.grid[targetR][targetC];
        
        if (tile === 3) {
          const temp = this.player.dirX;
          this.player.dirX = -this.player.dirY;
          this.player.dirY = temp;
        } else if (tile === 4) {
          const temp = this.player.dirX;
          this.player.dirX = this.player.dirY;
          this.player.dirY = -temp;
        } else if (tile === 9) {
          this.nextStage();
          return;
        } else if (tile === 0) {
          this.restartStage();
          return;
        }
      } else {
        this.restartStage();
        return;
      }
    }
  }

  nextStage() {
    if (this.currentStageIndex + 1 < STAGES[this.currentMode].length) {
      this.startStage(this.currentMode, this.currentStageIndex + 1);
    } else {
      alert('모든 스테이지를 클리어했습니다!');
      this.stop();
      document.getElementById('hud').style.display = 'none';
      this.ui.showMenu('main-menu');
    }
  }

  draw() {
    this.ctx.fillStyle = '#050811';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.grid.length) return;

    const offsetX = (this.canvas.width - this.grid[0].length * this.tileSize) / 2;
    const offsetY = (this.canvas.height - this.grid.length * this.tileSize) / 2;

    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        const tile = this.grid[r][c];
        const x = offsetX + c * this.tileSize;
        const y = offsetY + r * this.tileSize;

        if (tile === 0) continue;

        this.ctx.lineWidth = 2;
        if (tile === 1) {
          this.ctx.strokeStyle = '#00f3ff';
          this.ctx.shadowColor = '#00f3ff';
        } else if (tile === 2) {
          this.ctx.strokeStyle = '#00ff66';
          this.ctx.shadowColor = '#00ff66';
        } else if (tile === 3) {
          this.ctx.strokeStyle = '#ff00ff';
          this.ctx.shadowColor = '#ff00ff';
        } else if (tile === 4) {
          this.ctx.strokeStyle = '#ff9900';
          this.ctx.shadowColor = '#ff9900';
        } else if (tile === 9) {
          this.ctx.strokeStyle = '#ff0055';
          this.ctx.shadowColor = '#ff0055';
        }

        this.ctx.shadowBlur = 10;
        this.ctx.strokeRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
      }
    }

    const px = offsetX + this.player.x * this.tileSize + this.tileSize / 2;
    const py = offsetY + this.player.y * this.tileSize + this.tileSize / 2;

    this.ctx.beginPath();
    this.ctx.arc(px, py, this.tileSize / 4, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#ffffff';
    this.ctx.shadowBlur = 15;
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.timer = requestAnimationFrame(() => this.loop());
  }
}

window.onload = () => {
  new Game();
};
