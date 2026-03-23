<template>
  <div class="container">
    <div class="canvas-container">
      <img ref="bgRef" src="/bg-scene.png" class="bg-scene" @load="onBgLoad" />
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
const bgRef = ref(null)
const systemStatus = ref('idle')
const mainStatus = ref('在线')
const messageCount = ref(0)
const uptime = ref('0分钟')
const tokenUsage = ref('0K')
const visitors = ref([])

// 角色状态列表
const characters = ref([])
const characterCount = ref(0)

// 角色Emoji
const characterEmojis = ['🧑‍💻', '👩‍💼', '👨‍💼', '🧑‍🔬', '👩‍🎨', '👨‍🎤', '👩‍🏫', '🧑‍🚀']

let ctx, canvas, bgImg
let animationId = null
let bgLoaded = false
let frameIndex = 0
let lastFrameTime = 0
let lastMoveTime = 0
const FRAME_RATE = 4
const FRAME_INTERVAL = 1000 / FRAME_RATE

function onBgLoad() {
  bgLoaded = true
  bgImg = bgRef.value
}

// 初始化角色位置
function initCharacters(count) {
  characters.value = []
  for (let i = 0; i < count; i++) {
    characters.value.push({
      x: 0.2 + (i * 0.15),  // 初始位置 (20%, 35%, 50%...)
      direction: Math.random() > 0.5 ? 1 : -1,  // 移动方向
      speed: 0.002 + Math.random() * 0.002,  // 移动速度
      emoji: characterEmojis[i % characterEmojis.length]
    })
  }
  characterCount.value = count
}

// 更新角色位置（走动逻辑）
function updateCharacters() {
  const now = Date.now()
  if (now - lastMoveTime < 50) return  // 每50ms更新一次位置
  lastMoveTime = now
  
  characters.value.forEach(char => {
    // 只有在工作状态才走动
    if (systemStatus.value === 'working') {
      char.x += char.direction * char.speed
      
      // 边界检测 - 在10%到80%之间来回走动
      if (char.x > 0.8) {
        char.x = 0.8
        char.direction = -1
      } else if (char.x < 0.1) {
        char.x = 0.1
        char.direction = 1
      }
    }
  })
}

// 自动获取OpenClaw状态
async function fetchStatus() {
  try {
    const res = await fetch('http://localhost:3001/api/roles')
    const data = await res.json()
    if (data.code === 0 && data.data) {
      // 取活跃的agent + main（至少显示main）
      let activeAgents = data.data.filter(r => r.status === 'working')
      const main = data.data.find(r => r.id === 'main')
      if (main && !activeAgents.find(a => a.id === 'main')) {
        activeAgents.push(main)
      }
      
      // 更新角色数量
      if (activeAgents.length !== characterCount.value) {
        initCharacters(activeAgents.length)
      }
      
      // 更新状态
      const main = data.data.find(r => r.id === 'main')
      if (main) {
        mainStatus.value = main.status === 'working' ? '工作中' : '在线'
        
        if (main.status === 'working') {
          systemStatus.value = 'working'
        } else {
          systemStatus.value = 'idle'
        }
        
        if (main.lastActive && main.lastActive !== '-') {
          const lastTime = new Date(main.lastActive)
          const now = new Date()
          const diffMs = now - lastTime
          const diffMins = Math.floor(diffMs / 60000)
          if (diffMins < 1) uptime.value = '刚刚'
          else if (diffMins < 60) uptime.value = diffMins + '分钟'
          else uptime.value = Math.floor(diffMins / 60) + '小时'
        }
      }
      
      messageCount.value = activeAgents.length
    }
  } catch (e) {
    console.log('获取状态失败', e)
  }
}

function getBgRect() {
  if (!bgImg || !canvas) return null
  return { x: 0, y: 0, w: canvas.width, h: canvas.height }
}

function render() {
  if (!ctx || !canvas) {
    animationId = requestAnimationFrame(render)
    return
  }
  if (!bgLoaded || !bgImg) {
    animationId = requestAnimationFrame(render)
    return
  }
  
  const bg = getBgRect()
  if (!bg) {
    animationId = requestAnimationFrame(render)
    return
  }
  
  // 帧率控制
  const now = performance.now()
  if (!lastFrameTime) lastFrameTime = now
  if (now - lastFrameTime >= FRAME_INTERVAL) {
    frameIndex = (frameIndex + 1) % 4
    lastFrameTime = now
  }
  
  // 更新角色位置
  updateCharacters()
  
  // 清除并绘制背景
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bgImg, bg.x, bg.y, bg.w, bg.h)
  
  // 绘制角色
  const charSize = canvas.width * 0.06
  const groundY = bg.h * 0.85  // 地面位置
  
  ctx.font = `${charSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  
  characters.value.forEach((char, i) => {
    const charX = bg.x + bg.w * char.x
    // 走路时的上下起伏
    const bounceY = systemStatus.value === 'working' 
      ? Math.sin(frameIndex * 1.5 + i) * 3 
      : 0
    ctx.fillText(char.emoji, charX, groundY + bounceY)
  })
  
  animationId = requestAnimationFrame(render)
}

function removeVisitor(id) {
  visitors.value = visitors.value.filter(v => v.id !== id)
}

function handleResize() {
  if (!canvas || !canvasRef.value) return
  canvas.width = canvasRef.value.parentElement.clientWidth
  canvas.height = canvasRef.value.parentElement.clientHeight
}

let statusInterval = null

onMounted(() => {
  canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  handleResize()
  
  // 初始显示0个角色，等待API返回
  initCharacters(0)
  
  render()
  window.addEventListener('resize', handleResize)
  
  // 每10秒自动获取一次状态
  fetchStatus()
  statusInterval = setInterval(fetchStatus, 10000)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  if (statusInterval) clearInterval(statusInterval)
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
  background: #0d0d1a;
  overflow: hidden;
  margin-right: 220px;
}

.bg-scene {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.canvas { 
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
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
