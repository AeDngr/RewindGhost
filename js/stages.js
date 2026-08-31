// js/stages.js - Stage configurations and Level definitions
const STAGES = [
  {
    id: 1,
    title: "1. 과거의 협동",
    quote: "내가 밟고 지나간 발자국은 또 다른 가능성의 발판이 됩니다.",
    spawn: { x: 50, y: 320 },
    door: { x: 720, y: 300, w: 40, h: 70 },
    platforms: [
      { x: 0, y: 370, w: 800, h: 80 }, // 바닥
      { x: 300, y: 260, w: 100, h: 20 }, // 스위치로 열리는 문 밑 공중 발판
      { x: 500, y: 200, w: 120, h: 20 }
    ],
    buttons: [
      { id: "btn1", x: 220, y: 360, w: 40, h: 10, targetDoor: "doorGate1" }
    ],
    doors: [
      { id: "doorGate1", x: 450, y: 270, w: 20, h: 100, open: false }
    ],
    hint: "R키를 눌러 과거의 나와 협동하세요! 바닥 스위치를 눌러 길을 여세요."
  },
  {
    id: 2,
    title: "2. 무거운 발걸음",
    quote: "혼자서는 닿을 수 없는 높이도, 지나온 시간들이 힘을 보탭니다.",
    spawn: { x: 50, y: 320 },
    door: { x: 700, y: 120, w: 40, h: 70 },
    platforms: [
      { x: 0, y: 370, w: 800, h: 80 },
      { x: 200, y: 290, w: 80, h: 20 },
      { x: 650, y: 190, w: 120, h: 20 }
    ],
    buttons: [
      { id: "btn1", x: 380, y: 360, w: 50, h: 10, targetPlatform: "pLift1" }
    ],
    movingPlatforms: [
      { id: "pLift1", x: 480, y: 360, w: 100, h: 15, targetY: 190, currentY: 360, active: false }
    ],
    hint: "스위치를 누르고 있는 동안 발판이 위로 올라갑니다."
  },
  {
    id: 3,
    title: "3. 다중 루프의 궤적",
    quote: "수많은 시도가 모여 비로소 하나의 완성된 유산이 됩니다.",
    spawn: { x: 40, y: 320 },
    door: { x: 730, y: 80, w: 40, h: 70 },
    platforms: [
      { x: 0, y: 370, w: 800, h: 80 },
      { x: 180, y: 280, w: 70, h: 20 },
      { x: 380, y: 220, w: 70, h: 20 },
      { x: 580, y: 150, w: 70, h: 20 },
      { x: 680, y: 150, w: 100, h: 20 }
    ],
    buttons: [
      { id: "btn1", x: 190, y: 270, w: 40, h: 10, targetDoor: "doorGate1" },
      { id: "btn2", x: 390, y: 210, w: 40, h: 10, targetDoor: "doorGate2" }
    ],
    doors: [
      { id: "doorGate1", x: 320, y: 220, w: 15, h: 150, open: false },
      { id: "doorGate2", x: 520, y: 150, w: 15, h: 220, open: false }
    ],
    hint: "여러 명의 분신(Ghost)을 차례로 쌓아 올려 2중 문을 통과하세요!"
  }
];
