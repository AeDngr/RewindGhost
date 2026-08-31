// js/objects.js - Game Entities (Player, Ghost, Button, Door, MovingPlatform)

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 26;
    this.h = 36;
    this.vx = 0;
    this.vy = 0;
    this.speed = 3.8;
    this.jumpForce = -11.5;
    this.isGrounded = false;
    this.color = '#38bdf8';
  }

  update(keys) {
    if (keys['ArrowLeft'] || keys['KeyA']) {
      this.vx = -this.speed;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
      this.vx = this.speed;
    }
    if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
    }

    Physics.applyMovement(this);
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.shadowBlur = 0;

    // 눈 표현 (방향감)
    ctx.fillStyle = '#0f172a';
    let eyeX = this.vx >= 0 ? this.x + 16 : this.x + 4;
    ctx.fillRect(eyeX, this.y + 8, 6, 6);
  }
}

class Ghost {
  constructor(recordData) {
    this.record = recordData; // Array of {x, y, vx, vy, isGrounded}
    this.frameIndex = 0;
    this.x = recordData[0]?.x || 0;
    this.y = recordData[0]?.y || 0;
    this.w = 26;
    this.h = 36;
    this.color = 'rgba(168, 85, 247, 0.75)'; // 보라색 유령 잔상
    this.isFinished = false;
  }

  update() {
    if (this.frameIndex < this.record.length) {
      const state = this.record[this.frameIndex];
      this.x = state.x;
      this.y = state.y;
      this.frameIndex++;
    } else {
      // 기록 종료 시 마지막 위치 고정 (발판 역할 수행)
      this.isFinished = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = this.isFinished ? 4 : 12;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.shadowBlur = 0;

    // 잔상 효과 선
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.5)';
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
}

class Button {
  constructor(data) {
    Object.assign(this, data);
    this.isPressed = false;
  }

  update(entities) {
    this.isPressed = false;
    for (let e of entities) {
      if (Physics.checkAABB(e, this)) {
        this.isPressed = true;
        break;
      }
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.isPressed ? '#4ade80' : '#ef4444';
    ctx.shadowColor = this.isPressed ? '#4ade80' : '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(this.x, this.isPressed ? this.y + 4 : this.y, this.w, this.isPressed ? this.h - 4 : this.h);
    ctx.shadowBlur = 0;
  }
}

class DoorGate {
  constructor(data) {
    Object.assign(this, data);
  }

  draw(ctx) {
    if (this.open) return; // 열렸으면 안그림 (통과 가능)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
}

class MovingPlatform {
  constructor(data) {
    Object.assign(this, data);
    this.startY = data.y;
  }

  update() {
    let target = this.active ? this.targetY : this.startY;
    this.y += (target - this.y) * 0.1; // Smooth move
  }

  draw(ctx) {
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.shadowBlur = 0;
  }
}
