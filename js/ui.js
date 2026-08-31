// js/ui.js - User Interface Handler (Overlay, Stage Info, Hints)
const UI = {
  levelTitleEl: document.getElementById('level-title'),
  loopCountEl: document.getElementById('loop-count'),
  overlayEl: document.getElementById('ui-overlay'),
  overlayTitleEl: document.getElementById('overlay-title'),
  overlayQuoteEl: document.getElementById('overlay-quote'),
  overlayBtnEl: document.getElementById('overlay-btn'),

  updateHeader(stageTitle, loopCount) {
    this.levelTitleEl.textContent = stageTitle;
    this.loopCountEl.textContent = `LOOP ${loopCount}`;
  },

  showClearOverlay(quote, onNext) {
    this.overlayTitleEl.textContent = "STAGE CLEAR";
    this.overlayQuoteEl.textContent = `"${quote}"`;
    this.overlayBtnEl.textContent = "다음 단계로";
    this.overlayEl.classList.remove('hidden');

    this.overlayBtnEl.onclick = () => {
      this.overlayEl.classList.add('hidden');
      onNext();
    };
  },

  showGameCompleteOverlay(onRestart) {
    this.overlayTitleEl.textContent = "ALL STAGES CLEARED!";
    this.overlayQuoteEl.textContent = '"모든 시공간을 넘어 마침내 자신만의 길을 완성했습니다."';
    this.overlayBtnEl.textContent = "처음부터 다시하기";
    this.overlayEl.classList.remove('hidden');

    this.overlayBtnEl.onclick = () => {
      this.overlayEl.classList.add('hidden');
      onRestart();
    };
  }
};
