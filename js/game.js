// js/game.js - Main Loop & Stage Management
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.currentStageIndex = 0;
    this.loopCount = 1;

    this.keys = {};
    this.player = null;
    this.ghosts = [];
    this.currentRecord = [];

    this.platforms = [];
    this.buttons = [];
    this.doors = [];
    this.movingPlatforms = [];
    this.doorGoal = null;

    this.isCleared = false;
    this.bindInputs();
  }

  initStage(index) {
    this.currentStageIndex = index;
    const stageData = STAGES[index];

    this.loopCount = 1;
    this.ghosts = [];
    this.currentRecord = [];
    this.isCleared = false;

    this.loadStageObjects(stageData);
    UI.updateHeader(stageData.title, this.loopCount);
  }

  loadStageObjects(stageData) {
    this.player = new Player(stageData.spawn.x, stageData.spawn.y);
    this.doorGoal = stageData.door;
    this.platforms = [...stageData.platforms];
    this.buttons = (stageData.buttons || []).map(b => new Button(b));
    this.doors = (stageData.doors || []).map(d => new DoorGate(d));
    this.movingPlatforms = (stageData.movingPlatforms || []).map(p => new MovingPlatform(p));
  }

  // 시간 되돌리기 (R 키 / Loop 버튼)
  rewind() {
    if (this.currentRecord.length > 0) {
      // 현재 기록을 유령으로 전환
      this.ghosts.push(new Ghost(this.currentRecord));
    }
    
    this.currentRecord = [];
    this.loopCount++;
    
    const stageData = STAGES[this.currentStageIndex];
    this.player = new Player(stageData.spawn.x, stageData.spawn.y);

    // 고스트 프레임 리셋
    this.ghosts.forEach(g => {
      g.frameIndex = 0;
      g.isFinished = false;
    });

    UI.updateHeader(stageData.title, this.loopCount);
  }

  bindInputs() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'KeyR') this.rewind();
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });

    // Touch Controls
    const bindTouch = (id, code) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[code] = true; });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys[code] = false; });
    };

    bindTouch('btn-left', 'KeyA');
    bindTouch('btn-right', 'KeyD');
    bindTouch('btn-jump', 'Space');
    
    document.getElementById('btn-rewind')?.addEventListener('click', () => this.rewind());
  }

  update() {
    if (this.isCleared) return;

    // 1. 플레이어 업데이트 & 기록
    this.player.update(this.keys);
    this.currentRecord.push({
      x: this.player.x,
      y: this.player.y,
      vx: this.player.vx,
      vy: this.player.vy
    });

    // 2. 유령(과거의 나) 업데이트
    this.ghosts.forEach(ghost => ghost.update());

    // 3. 물리 충돌 처리
    let allSolidPlatforms = [...this.platforms, ...this.movingPlatforms];
    
    // 닫힌 문도 고체 충돌 처리
    this.doors.forEach(door => {
      if (!door.open) allSolidPlatforms.push(door);
    });

    // 플레이어 - 발판 충돌
    this.player.isGrounded = false;
    allSolidPlatforms.forEach(plat => {
      Physics.resolvePlatform(this.player, plat);
    });

    // 과거의 유령을 플랫폼처럼 밟을 수 있음!
    this.ghosts.forEach(ghost => {
      Physics.resolvePlatform(this.player, ghost);
    });

    // 4. 스위치 & 기믹 작동 처리
    let activeEntities = [this.player, ...this.ghosts];
    this.buttons.forEach(btn => {
      btn.update(activeEntities);
      
      // 문 제어
      if (btn.targetDoor) {
        const door = this.doors.find(d => d.id === btn.targetDoor);
        if (door) door.open = btn.isPressed;
      }
      // 무빙 발판 제어
      if (btn.targetPlatform) {
        const plat = this.movingPlatforms.find(p => p.id === btn.targetPlatform);
        if (plat) plat.active = btn.isPressed;
      }
    });

    this.movingPlatforms.forEach(p => p.update());

    // 5. 탈출 문 도착 판정
    if (Physics.checkAABB(this.player, this.doorGoal)) {
      this.clearStage();
    }
  }

  clearStage() {
    this.isCleared = true;
    const stage = STAGES[this.currentStageIndex];

    if (this.currentStageIndex + 1 < STAGES.length) {
      UI.showClearOverlay(stage.quote, () => {
        this.initStage(this.currentStageIndex + 1);
      });
    } else {
      UI.showGameCompleteOverlay(() => {
        this.initStage(0);
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 배경 그리드
    this.ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // 발판
    this.ctx.fillStyle = '#1e293b';
    this.platforms.forEach(p => {
      this.ctx.fillRect(p.x, p.y, p.w, p.h);
      this.ctx.strokeStyle = '#334155';
      this.ctx.strokeRect(p.x, p.y, p.w, p.h);
    });

    // 무빙 발판, 스위치, 문
    this.movingPlatforms.forEach(p => p.draw(this.ctx));
    this.buttons.forEach(b => b.draw(this.ctx));
    this.doors.forEach(d => d.draw(this.ctx));

    // 탈출 문 (Goal)
    this.ctx.fillStyle = '#10b981';
    this.ctx.shadowColor = '#10b981';
    this.ctx.shadowBlur = 15;
    this.ctx.fillRect(this.doorGoal.x, this.doorGoal.y, this.doorGoal.w, this.doorGoal.h);
    this.ctx.shadowBlur = 0;

    // 과거 유령들 & 현재 플레이어
    this.ghosts.forEach(g => g.draw(this.ctx));
    this.player.draw(this.ctx);
  }
}
