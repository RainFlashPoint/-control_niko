<template>
  <div class="container">
    <div class="canvas-container">
      <canvas ref="canvasRef" class="canvas"></canvas>
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
          <button class="status-btn" :class="{ active: systemStatus === 'sync' }" @click="systemStatus = 'sync'">
            <span class="btn-icon">🔄</span>
            <span>同步</span>
          </button>
          <button class="status-btn alert" :class="{ active: systemStatus === 'alert' }" @click="systemStatus = 'alert'">
            <span class="btn-icon">⚠️</span>
            <span>报警</span>
          </button>
        </div>
      </div>
      
      <div class="ui-section visitors">
        <div class="section-title">👥 访客列表</div>
        <div class="visitor-list">
          <div v-for="v in visitors" :key="v.id" class="visitor-item">
            <span class="visitor-avatar">{{ v.avatar }}</span>
            <span class="visitor-name">{{ v.name }}</span>
            <button class="leave-btn" @click="removeVisitor(v.id)">离开</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const systemStatus = ref('working')
const mainStatus = ref('工作中')
const messageCount = ref(2)
const uptime = ref('刚刚')
const tokenUsage = ref('0K')
const visitors = ref([])

// 角色状态
const characters = ref([])
const frameIndex = ref(0)

let ctx, canvas
let animationId = null
let lastFrameTime = 0
const FRAME_RATE = 2
const FRAME_INTERVAL = 1000 / FRAME_RATE
let lastMoveTime = 0

// 背景图
const bgImg = new Image()
bgImg.src = '/bg-scene.png'
let bgLoaded = false
bgImg.onload = () => { bgLoaded = true }

// 8张角色图
const charImages = [null,null,null,null,null,null,null,null]
const charImageNames = [
  '/character-1.png', '/character-2.png', '/character-3.png', '/character-4.png',
  '/character-5.png', '/character-6.png', '/character-7.png', '/character-8.png'
]

// 加载图片
function loadImages() {
  charImageNames.forEach((src, i) => {
    const img = new Image()
    img.onload = () => { charImages[i] = img }
    img.src = src
  })
}

// 初始化角色
function initCharacters(count) {
  characters.value = []
  for (let i = 0; i < count; i++) {
    characters.value.push({
      x: 0.2 + i * 0.3,
      direction: 1,
      speed: 0.002
    })
  }
}

// 更新角色位置
function updateCharacters() {
  const now = Date.now()
  if (now - lastMoveTime < 50) return
  lastMoveTime = now
  
  characters.value.forEach(char => {
    if (systemStatus.value === 'working') {
      char.x += char.direction * char.speed
      if (char.x > 0.8) { char.x = 0.8; char.direction = -1 }
      else if (char.x < 0.1) { char.x = 0.1; char.direction = 1 }
    }
  })
}

function render() {
  if (!ctx || !canvas) {
    animationId = requestAnimationFrame(render)
    return
  }
  
  const now = performance.now()
  if (!lastFrameTime) lastFrameTime = now
  if (now - lastFrameTime >= FRAME_INTERVAL) {
    frameIndex.value = (frameIndex.value + 1) % 4
    lastFrameTime = now
  }
  
  updateCharacters()
  
  // 绘制
  const w = canvas.width
  const h = canvas.height
  
  // 清空
  ctx.clearRect(0, 0, w, h)
  
  // 背景
  if (bgLoaded) {
    ctx.drawImage(bgImg, 0, 0, w, h)
  }
  
  // 角色
  const charW = w * 0.08
  const groundY = h * 0.82
  
  characters.value.forEach((char, i) => {
    const baseIdx = i * 4
    const imgIdx = baseIdx + (frameIndex.value % 4)
    const img = charImages[imgIdx]
    if (!img) return
    
    const charX = w * char.x
    const bounceY = systemStatus.value === 'working' ? Math.sin(frameIndex.value * 1.5 + i) * 3 : 0
    const aspectRatio = img.height / img.width
    const charH = charW * aspectRatio
    
    ctx.drawImage(img, charX - charW/2, groundY - charH + bounceY, charW, charH)
  })
  
  animationId = requestAnimationFrame(render)
}

function removeVisitor(id) {
  visitors.value = visitors.value.filter(v => v.id !== id)
}

function handleResize() {
  if (!canvas) return
  canvas.width = canvas.parentElement.clientWidth
  canvas.height = canvas.parentElement.clientHeight
}

onMounted(() => {
  canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  handleResize()
  loadImages()
  initCharacters(2)
  render()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
body { font-family: 'Courier New', monospace; background: #1a1a2e; }

.container { width: 100vw; height: 100vh; display: flex; flex-direction: column; position: relative; background: #1a1a2e; }

.canvas-container {
  flex: 1;
  position: relative;
  margin-right: 220px;
  overflow: hidden;
}

.canvas { 
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  height: 110px; min-height: 110px;
  background: linear-gradient(180deg, #2C2C3E 0%, #1A1A2E 100%);
  border-top: 4px solid #E74C3C; display: flex; padding: 8px; gap: 8px;
  z-index: 100;
}
.ui-section { background: #3A3A4A; border: 3px solid #000; padding: 6px; }
.ui-section.notes { flex: 1; }
.ui-section.status { width: 260px; }
.ui-section.visitors { flex: 1; }
.section-title { font-size: 10px; color: #F1C40F; margin-bottom: 4px; text-transform: uppercase; }
.notes-content p { font-size: 8px; color: #AAA; margin: 1px 0; }

.status-buttons { display: flex; gap: 4px; }
.status-btn {
  flex: 1; background: #2A2A3A; border: 2px solid #000; color: #FFF;
  padding: 4px 2px; font-size: 8px; cursor: pointer; font-family: inherit;
  display: flex; flex-direction: column; align-items: center; gap: 1px;
}
.status-btn:hover { background: #4A4A5A; }
.status-btn.active { background: #E74C3C; border-color: #FFF; }
.status-btn.alert.active { background: #FF0000; animation: blink 0.5s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.btn-icon { font-size: 12px; }

.visitor-list { display: flex; flex-direction: column; gap: 3px; max-height: 60px; overflow-y: auto; }
.visitor-item { display: flex; align-items: center; gap: 4px; background: #2A2A3A; padding: 3px 5px; font-size: 8px; }
.visitor-avatar { font-size: 12px; }
.visitor-name { flex: 1; color: #CCC; }
.leave-btn { background: #E74C3C; border: 1px solid #000; color: #FFF; font-size: 7px; padding: 2px 4px; cursor: pointer; font-family: inherit; }
</style>
