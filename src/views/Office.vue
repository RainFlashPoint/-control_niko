<template>
  <div class="container">
    <!-- 背景层 -->
    <img src="/bg-scene.png" class="bg-img" />
    
    <!-- 角色层 -->
    <div class="chars-layer">
      <div 
        v-for="(char, i) in characters" 
        :key="i"
        class="char-box"
        :style="getCharStyle(i)"
      >
        <img :src="getCharImg(i)" class="char-img" />
      </div>
    </div>
    
    <div class="side-panel">
      <div class="panel-title">🐉 龙虾状态</div>
      <div class="status-list">
        <div class="status-item">
          <span class="status-icon">🧑‍💼</span>
          <span class="status-label">大总管</span>
          <span class="status-value">{{ mainStatus }}</span>
        </div>
        <div class="status-item">
          <span class="status-icon">📊</span>
          <span class="status-label">市场调研员</span>
          <span class="status-value">在线</span>
        </div>
        <div class="status-item">
          <span class="status-icon">🤖</span>
          <span class="status-label">模型</span>
          <span class="status-value">MiniMax-M2.5</span>
        </div>
        <div class="status-item">
          <span class="status-icon">💬</span>
          <span class="status-label">今日消息</span>
          <span class="status-value">{{ messageCount }}</span>
        </div>
        <div class="status-item">
          <span class="status-icon">⏱️</span>
          <span class="status-label">运行时长</span>
          <span class="status-value">{{ uptime }}</span>
        </div>
        <div class="status-item">
          <span class="status-icon">⚡</span>
          <span class="status-label">Token消耗</span>
          <span class="status-value">{{ tokenUsage }}</span>
        </div>
      </div>
    </div>
    
    <div class="ui-panel">
      <div class="ui-section notes">
        <div class="section-title">📝 昨日小记</div>
        <div class="notes-content">
          <p>• 研究自动化AI测试工具</p>
          <p>• 探索1人公司创业方向</p>
          <p>• 优化龙虾控制台展示</p>
        </div>
      </div>
      
      <div class="ui-section status">
        <div class="section-title">⭐ Star 状态</div>
        <div class="status-buttons">
          <button class="status-btn" :class="{ active: systemStatus === 'idle' }" @click="systemStatus = 'idle'">
            <span class="btn-icon">💤</span>
            <span>待命</span>
          </button>
          <button class="status-btn" :class="{ active: systemStatus === 'working' }" @click="systemStatus = 'working'">
            <span class="btn-icon">💻</span>
            <span>工作</span>
          </button>
        </div>
      </div>
      
      <div class="ui-section visitors">
        <div class="section-title">👥 访客列表</div>
        <div class="visitor-list">
          <div class="visitor-item">
            <span class="visitor-avatar">🧑‍💻</span>
            <span class="visitor-name">访客A</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const systemStatus = ref('working')
const mainStatus = ref('工作中')
const messageCount = ref(2)
const uptime = ref('刚刚')
const tokenUsage = ref('0K')

const characters = ref([])
const frameIndex = ref(0)

let animationId = null
let lastFrameTime = 0
let lastMoveTime = 0
const FRAME_INTERVAL = 500

const charImages = [
  '/character-1.png', '/character-2.png', '/character-3.png', '/character-4.png',
  '/character-5.png', '/character-6.png', '/character-7.png', '/character-8.png'
]

function initChars() {
  characters.value = [
    { x: 20, dir: 1, speed: 0.5 },
    { x: 50, dir: -1, speed: 0.4 }
  ]
}

function getCharImg(i) {
  const base = i * 4
  const idx = base + (frameIndex.value % 4)
  return charImages[idx]
}

function getCharStyle(i) {
  const char = characters.value[i]
  if (!char) return {}
  
  const bounce = systemStatus.value === 'working' 
    ? Math.sin(frameIndex.value * 1.5 + i) * 5 
    : 0
  
  return {
    left: char.x + '%',
    bottom: (18 + bounce) + '%'
  }
}

function update() {
  const now = Date.now()
  if (now - lastMoveTime < 50) return
  lastMoveTime = now
  
  characters.value.forEach(char => {
    if (systemStatus.value === 'working') {
      char.x += char.dir * char.speed
      if (char.x > 75) { char.x = 75; char.dir = -1 }
      else if (char.x < 10) { char.x = 10; char.dir = 1 }
    }
  })
}

function loop() {
  const now = performance.now()
  if (!lastFrameTime) lastFrameTime = now
  if (now - lastFrameTime >= FRAME_INTERVAL) {
    frameIndex.value = (frameIndex.value + 1) % 4
    lastFrameTime = now
  }
  
  update()
  animationId = requestAnimationFrame(loop)
}

onMounted(() => {
  initChars()
  loop()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
body { font-family: 'Courier New', monospace; background: #1a1a2e; }

.container {
  width: 100vw; height: 100vh;
  position: relative;
  overflow: hidden;
}

.bg-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.chars-layer {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.char-box {
  position: absolute;
  width: 8%;
  transform: translateX(-50%);
}

.char-img {
  width: 100%;
  height: auto;
  display: block;
  image-rendering: pixelated;
}

.side-panel {
  position: absolute; top: 0; right: 0;
  width: 220px; height: calc(100% - 110px);
  background: linear-gradient(180deg, #1a1a2e 0%, #2d2d44 100%);
  border-left: 3px solid #E74C3C; padding: 15px; overflow-y: auto;
  z-index: 100;
}
.panel-title { font-size: 14px; color: #F1C40F; margin-bottom: 15px; text-align: center; padding-bottom: 10px; border-bottom: 2px solid #E74C3C; }
.status-list { display: flex; flex-direction: column; gap: 10px; }
.status-item { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; }
.status-icon { font-size: 16px; }
.status-label { flex: 1; font-size: 10px; color: #888; }
.status-value { font-size: 11px; color: #4ECDC4; font-weight: bold; }

.ui-panel {
  height: 110px;
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(180deg, #2C2C3E 0%, #1A1A2E 100%);
  border-top: 4px solid #E74C3C; display: flex; padding: 8px; gap: 8px;
  z-index: 100;
}
.ui-section { background: #3A3A4A; border: 3px solid #000; padding: 6px; }
.ui-section.notes { flex: 1; }
.ui-section.status { width: 200px; }
.ui-section.visitors { flex: 1; }
.section-title { font-size: 10px; color: #F1C40F; margin-bottom: 4px; }
.notes-content p { font-size: 8px; color: #AAA; margin: 1px 0; }

.status-buttons { display: flex; gap: 4px; }
.status-btn {
  flex: 1; background: #2A2A3A; border: 2px solid #000; color: #FFF;
  padding: 4px; font-size: 8px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center;
}
.status-btn.active { background: #E74C3C; }
.btn-icon { font-size: 12px; }

.visitor-list { }
.visitor-item { display: flex; align-items: center; gap: 4px; background: #2A2A3A; padding: 3px 5px; font-size: 8px; }
.visitor-avatar { font-size: 12px; }
.visitor-name { color: #CCC; }
</style>
