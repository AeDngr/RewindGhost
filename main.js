// === 스테이지 데이터 ===
// 0: 빈 공간 / 1: 벽 / 2: 시작점 / 3: 발판(버튼) / 4: 문(Door) / 9: 출구
const STAGES = [
  {
    id: 1,
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 3, 4, 9, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    id: 2,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 1, 9, 0, 0, 1],
      [1, 0, 0, 4, 0, 0, 0, 1],
      [1, 0, 3, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    id: 3,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 1, 9, 0, 0, 1],
      [1, 1, 1, 0, 4, 0, 0, 0, 1],
      [1, 3, 0, 0, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  }
];

// === 게임 엔진 ===
class RewindGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.tileSize = 50;
    this.stageIndex = 0;
    this.isRunning = false;
    
    // 플레이어 & 고스트 데이터
    this.player = { x: 0, y: 0, vx: 0, vy: 0 };
    this.recording = []; // 현재 이동 기록 [ {x, y}, ... ]
    this.ghostHistory = []; // [ [{x,y}, {x,y}], ... ] (여러 고스트 기록)
    
    this.keys = {};
    this.startTime = 0;
    this.elapsedTime = 0;
    
    this.loadProgress();
    this.initUI();
    this.resizeCanvas();
    
    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('rewind_ghost_progress');
      this.unlockedStage = saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      this.unlockedStage = 0;
    }
  }

  saveProgress() {
    localStorage.setItem('rewind_ghost_progress', this.unlockedStage.toString());
  }

  resetProgress() {
    this.unlockedStage = 0;
    this.saveProgress();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initUI() {
    document.getElementById('btn-start').onclick = () => this.showStageMenu();
    document.getElementById('btn-settings').onclick = () => {
      document.getElementById('settings-menu').style.display = 'block';
    };
    document.getElementById('btn-close-settings').onclick = () => {
      document.getElementById('settings-menu').style.display = 'none';
    };
    document.getElementById('btn-reset').onclick = () => {
      if (confirm('모든 진행 상황을 초기화하시겠습니까?')) {
        this.resetProgress();
        alert('초기화되었습니다.');
        this.showMainMenu();
      }
    };
    document.getElementById('btn-back').onclick = () => this.showMainMenu();
    document.getElementById('btn-rewind').onclick = () => this.rewind();
    document.getElementById('btn-restart').onclick = () => this.startStage(this.stageIndex);
    document.getElementById('btn-exit').onclick = () => {
      this.stop();
      this.showMainMenu();
    };
  }

  showMainMenu() {
    this.hideAllUI();
    document.getElementById('main-menu').style.display = 'block';
  }

  showStageMenu() {
    this.hideAllUI();
    document.getElementById('stage-menu').style.display = 'block';
    const container = document.getElementById('stage-buttons');
    container.innerHTML = '';

    STAGES.forEach((stage, i) => {
      const btn = document.createElement('button');
      const isCleared = i < this.unlockedStage;
      const isUnlocked = i <= this.unlockedStage;

      btn.className = `glow-btn ${isCleared ? 'cleared' : ''}`;
      btn.innerText = isCleared ? `ST ${i + 1} ✓` : `ST ${i + 1}`;
      btn.disabled = !isUnlocked;

      if (isUnlocked) {
        btn.onclick = () => {
          this.hideAllUI();
          document.getElementById('hud').style.display = 'block';
          this.startStage(i);
        };
      }
      container.appendChild(btn);
    });
  }

  hideAllUI() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('stage-menu').style.display = 'none';
    document.getElementById('settings-menu').style.display = 'none';
    document.getElementById('hud').style.display = 'none';
  }

  startStage(index) {
    this.stageIndex = index;
    this.grid = JSON.parse(JSON.stringify(STAGES[index].grid));
    this.ghostHistory = [];
    this.resetLevelState();
    
    this.isRunning = true;
    this.startTime = performance.now();
    this.loop();
  }

  resetLevelState() {
    this.recording = [];
    this.findStartPos();
  }

  findStartPos() {
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        if (this.grid[r][c] === 2) {
          this.player = {
            x: c * this.tileSize + this.tileSize / 4,
            y: r * this.tileSize + this.tileSize / 4,
            size: this.tileSize / 2,
            speed: 3
          };
          return;
        }
      }
    }
  }

  rewind() {
    if (this.recording.length > 0) {
      this.ghostHistory.push([...this.recording]);
    }
    this.resetLevelState();
  }

  onKeyDown(e) {
    this.keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'r' && this.isRunning) {
      this.rewind();
    }
  }

  onKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }

  update() {
    if (!this.isRunning) return;

    this.elapsedTime = (performance.now() - this.startTime) / 1000;
    document.getElementById('hud-timer').innerText = this.elapsedTime.toFixed(1);
    document.getElementById('hud-stage').innerText = this.stageIndex + 1;

    // 플레이어 이동 로직
    let dx = 0, dy = 0;
    if (this.keys['arrowleft'] || this.keys['a']) dx -= this.player.speed;
    if (this.keys['arrowright'] || this.keys['d']) dx += this.player.speed;
    if (this.keys['arrowup'] || this.keys['w']) dy -= this.player.speed;
    if (this.keys['arrowdown'] || this.keys['s']) dy += this.player.speed;

    // X축 이동 Collision
    this.player.x += dx;
    if (this.checkCollision(this.player.x, this.player.y)) {
      this.player.x -= dx;
    }

    // Y축 이동 Collision
    this.player.y += dy;
    if (this.checkCollision(this.player.x, this.player.y)) {
      this.player.y -= dy;
    }

    // 좌표 녹화 (프레임 단위)
    this.recording.push({ x: this.player.x, y: this.player.y });

    // 스위치 및 문 업데이트
    this.updateTriggers();
  }

  getFrameIndex() {
    return this.recording.length - 1;
  }

  checkCollision(x, y) {
    const margin = 2;
    const points = [
      { x: x + margin, y: y + margin },
      { x: x + this.player.size - margin, y: y + margin },
      { x: x + margin, y: y + this.player.size - margin },
      { x: x + this.player.size - margin, y: y + this.player.size - margin }
    ];

    for (let p of points) {
      const c = Math.floor(p.x / this.tileSize);
      const r = Math.floor(p.y / this.tileSize);

      if (r < 0 || r >= this.grid.length || c < 0 || c >= this.grid[0].length) return true;

      const tile = this.grid[r][c];
      if (tile === 1) return true; // 벽
      if (tile === 4) return true; // 닫힌 문
    }
    return false;
  }

  updateTriggers() {
    let buttonPressed = false;
    const currentFrame = this.getFrameIndex();

    // 현재 플레이어 및 모든 고스트 위치 수집
    const entities = [{ x: this.player.x, y: this.player.y, size: this.player.size }];
    
    this.ghostHistory.forEach(ghostRec => {
      const idx = Math.min(currentFrame, ghostRec.length - 1);
      if (idx >= 0) {
        entities.push({ x: ghostRec[idx].x, y: ghostRec[idx].y, size: this.player.size });
      }
    });

    // 버튼(3) 눌림 감지
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        if (this.grid[r][c] === 3) {
          const bx = c * this.tileSize;
          const by = r * this.tileSize;

          for (let ent of entities) {
            if (
              ent.x < bx + this.tileSize &&
              ent.x + ent.size > bx &&
              ent.y < by + this.tileSize &&
              ent.y + ent.size > by
            ) {
              buttonPressed = true;
              break;
            }
          }
        }
      }
    }

    // 문(4) 개방/폐쇄 제어
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        if (STAGES[this.stageIndex].grid[r][c] === 4) {
          this.grid[r][c] = buttonPressed ? 0 : 4; // 버튼 누르면 통과 가능(0)
        }
      }
    }

    // 출구(9) 도착 확인
    const centerC = Math.floor((this.player.x + this.player.size / 2) / this.tileSize);
    const centerR = Math.floor((this.player.y + this.player.size / 2) / this.tileSize);

    if (this.grid[centerR] && this.grid[centerR][centerC] === 9) {
      this.clearStage();
    }
  }

  clearStage() {
    this.stop();
    if (this.stageIndex + 1 > this.unlockedStage) {
      this.unlockedStage = this.stageIndex + 1;
      this.saveProgress();
    }

    if (this.stageIndex + 1 < STAGES.length) {
      alert('STAGE CLEAR! 다음 스테이지로 이동합니다.');
      this.startStage(this.stageIndex + 1);
    } else {
      alert('축하합니다! 모든 스테이지를 클리어하셨습니다.');
      this.showStageMenu();
    }
  }

  stop() {
    this.isRunning = false;
  }

  draw() {
    this.ctx.fillStyle = '#050811';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.grid) return;

    const offsetX = (this.canvas.width - this.grid[0].length * this.tileSize) / 2;
    const offsetY = (this.canvas.height - this.grid.length * this.tileSize) / 2;

    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);

    // 맵 그리기
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        const tile = this.grid[r][c];
        const x = c * this.tileSize;
        const y = r * this.tileSize;

        if (tile === 1) { // 벽
          this.ctx.fillStyle = '#1e293b';
          this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
          this.ctx.strokeStyle = '#334155';
          this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        } else if (tile === 3) { // 스위치(발판)
          this.ctx.fillStyle = '#ff00ff';
          this.ctx.fillRect(x + 10, y + 10, this.tileSize - 20, this.tileSize - 20);
        } else if (tile === 4) { // 문
          this.ctx.fillStyle = '#ff9900';
          this.ctx.fillRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10);
        } else if (tile === 9) { // 출구
          this.ctx.fillStyle = '#00ff66';
          this.ctx.beginPath();
          this.ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize / 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    const currentFrame = this.getFrameIndex();

    // 고스트 렌더링
    this.ghostHistory.forEach(ghostRec => {
      const idx = Math.min(currentFrame, ghostRec.length - 1);
      if (idx >= 0) {
        const g = ghostRec[idx];
        this.ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';
        this.ctx.shadowColor = '#00f3ff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(g.x, g.y, this.player.size, this.player.size);
        this.ctx.shadowBlur = 0;
      }
    });

    // 플레이어 렌더링
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#ffffff';
    this.ctx.shadowBlur = 12;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
    this.ctx.shadowBlur = 0;

    this.ctx.restore();
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}

// 게임 실행
window.onload = () => {
  new RewindGame();
};
