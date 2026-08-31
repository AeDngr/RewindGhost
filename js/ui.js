export class UI {
  constructor(game) {
    this.game = game;
    this.injectStyles();
    this.render();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      .glow-box {
        background: rgba(10, 15, 30, 0.95);
        border: 2px solid #00f3ff;
        box-shadow: 0 0 15px #00f3ff, inset 0 0 15px #00f3ff;
        color: #fff;
        font-family: sans-serif;
      }
      .glow-btn {
        background: transparent;
        border: 1px solid #ff00ff;
        color: #ff00ff;
        padding: 8px 16px;
        margin: 4px;
        cursor: pointer;
        text-shadow: 0 0 5px #ff00ff;
        box-shadow: 0 0 10px #ff00ff;
        transition: 0.2s;
      }
      .glow-btn:hover {
        background: #ff00ff;
        color: #000;
        box-shadow: 0 0 20px #ff00ff;
      }
      .glow-btn.hard {
        border-color: #ff0055;
        color: #ff0055;
        box-shadow: 0 0 10px #ff0055;
      }
      .glow-btn.hard:hover {
        background: #ff0055;
        color: #000;
        box-shadow: 0 0 20px #ff0055;
      }
      .glow-text {
        text-shadow: 0 0 8px #00f3ff;
      }
      .grid-select {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
        margin: 15px 0;
      }
    `;
    document.head.appendChild(style);
  }

  render() {
    const container = document.createElement('div');
    container.id = 'ui-container';
    container.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';

    container.innerHTML = `
      <div id="main-menu" class="glow-box" style="pointer-events: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 30px; text-align: center;">
        <h1 class="glow-text" style="margin-bottom: 20px;">LOOP MAZE</h1>
        <button class="glow-btn" id="btn-mode-normal">일반 모드</button><br>
        <button class="glow-btn hard" id="btn-mode-hard">하드 모드</button><br>
        <button class="glow-btn" id="btn-settings">설정</button>
      </div>

      <div id="stage-select-menu" class="glow-box" style="display: none; pointer-events: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 30px; text-align: center;">
        <h2 class="glow-text" id="stage-select-title">스테이지 선택</h2>
        <div class="grid-select" id="stage-buttons"></div>
        <button class="glow-btn" id="btn-back-main">뒤로가기</button>
      </div>

      <div id="settings-menu" class="glow-box" style="display: none; pointer-events: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 30px; text-align: center;">
        <h2 class="glow-text">SETTING</h2>
        <label style="display: block; margin: 20px 0;">
          이동 속도: <input type="range" id="speed-range" min="1" max="5" value="3">
        </label>
        <button class="glow-btn" id="btn-close-settings">닫기</button>
      </div>

      <div id="hud" style="display: none; pointer-events: auto; position: absolute; top: 10px; right: 10px;">
        <button class="glow-btn" id="btn-restart">재시작</button>
        <button class="glow-btn" id="btn-exit">나가기</button>
      </div>
    `;

    document.body.appendChild(container);
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('btn-mode-normal').addEventListener('click', () => this.openStageSelect('normal'));
    document.getElementById('btn-mode-hard').addEventListener('click', () => this.openStageSelect('hard'));
    document.getElementById('btn-back-main').addEventListener('click', () => this.showMenu('main-menu'));
    
    document.getElementById('btn-settings').addEventListener('click', () => {
      document.getElementById('settings-menu').style.display = 'block';
    });
    document.getElementById('btn-close-settings').addEventListener('click', () => {
      document.getElementById('settings-menu').style.display = 'none';
    });
    document.getElementById('speed-range').addEventListener('input', (e) => {
      this.game.setSpeed(Number(e.target.value));
    });

    document.getElementById('btn-restart').addEventListener('click', () => this.game.restartStage());
    document.getElementById('btn-exit').addEventListener('click', () => {
      this.game.stop();
      document.getElementById('hud').style.display = 'none';
      this.showMenu('main-menu');
    });
  }

  openStageSelect(mode) {
    this.showMenu('stage-select-menu');
    document.getElementById('stage-select-title').innerText = mode === 'normal' ? '일반 스테이지' : '하드 스테이지';
    const container = document.getElementById('stage-buttons');
    container.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
      const btn = document.createElement('button');
      btn.className = `glow-btn ${mode === 'hard' ? 'hard' : ''}`;
      btn.innerText = i + 1;
      btn.addEventListener('click', () => {
        this.hideAllMenus();
        document.getElementById('hud').style.display = 'block';
        this.game.startStage(mode, i);
      });
      container.appendChild(btn);
    }
  }

  showMenu(id) {
    this.hideAllMenus();
    document.getElementById(id).style.display = 'block';
  }

  hideAllMenus() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('stage-select-menu').style.display = 'none';
    document.getElementById('settings-menu').style.display = 'none';
  }
      }
