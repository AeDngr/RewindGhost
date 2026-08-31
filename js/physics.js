// js/physics.js - Gravity, Velocity, and AABB Collision
const Physics = {
  GRAVITY: 0.55,
  FRICTION: 0.82,

  applyMovement(entity) {
    entity.vx *= this.FRICTION;
    entity.vy += this.GRAVITY;

    entity.x += entity.vx;
    entity.y += entity.vy;
  },

  // Axis-Aligned Bounding Box Collision
  checkAABB(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.y + rect1.h > rect2.y
    );
  },

  // Resolve platform collisions (Solid Objects)
  resolvePlatform(entity, platform) {
    if (!this.checkAABB(entity, platform)) return false;

    // Calculate overlap depths
    let prevY = entity.y - entity.vy;

    // Falling onto top of platform
    if (prevY + entity.h <= platform.y + 10 && entity.vy >= 0) {
      entity.y = platform.y - entity.h;
      entity.vy = 0;
      entity.isGrounded = true;
      return true;
    }
    // Hitting bottom of platform
    else if (prevY >= platform.y + platform.h - 10 && entity.vy < 0) {
      entity.y = platform.y + platform.h;
      entity.vy = 0;
    }
    // Side collisions
    else if (entity.x + entity.w / 2 < platform.x + platform.w / 2) {
      entity.x = platform.x - entity.w;
      entity.vx = 0;
    } else {
      entity.x = platform.x + platform.w;
      entity.vx = 0;
    }
    return false;
  }
};
