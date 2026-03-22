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
          <span class="status-value">在线</span>
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
          <span class="status-value">128</span>
        </div>
        <div class="status-item">
          <span class="status-icon">⏱️</span>
          <span class="status-label">运行时长</span>
          <span class="status-value">3h 25m</span>
        </div>
        <div class="status-item">
          <span class="status-icon">⚡</span>
          <span class="status-label">Token消耗</span>
          <span class="status-value">45.2K</span>
        </div>
      </div>
    </div>
    
    <div class="ui-panel">
      <div class="ui-section notes">
        <div class="section-title">📝 昨日小记</div>
        <div class="notes-content">
          <p>• 完成API文档更新和PDF生成</p>
          <p>• 部署niko1到Cloudflare Workers</p>
          <p>• 优化3D办公室角色显示效果</p>
          <p>• 像素角色风格调整测试</p>
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
const systemStatus = ref('idle')
const visitors = ref([
  { id: 1, name: '访客A', avatar: '🧑‍💻' },
  { id: 2, name: '访客B', avatar: '👨‍🔬' }
])

let ctx, canvas, scale = 1
let animationId = null
let lastTime = 0
const FPS = 8
const frameTime = 1000 / FPS

let frame = 0

// 绘制矩形
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color
  ctx.fillRect(Math.floor(x * scale), Math.floor(y * scale), Math.floor(w * scale), Math.floor(h * scale))
}

// 绘制小龙虾logo
function drawLobster(cx, cy, s) {
  // 身体
  drawRect(cx - s*2.5, cy - s*0.8, s*5, s*1.8, '#E74C3C')
  drawRect(cx - s*3, cy + s*0.5, s*6, s*1.2, '#E74C3C')
  // 尾巴
  for (let i = 0; i < 5; i++) {
    drawRect(cx - s*2 + i*s*1.2, cy + s*1.5, s*1, s*0.8, '#E74C3C')
  }
  // 钳子
  drawRect(cx - s*4, cy - s*0.3, s*1.2, s*0.8, '#FF6B6B')
  drawRect(cx + s*2.8, cy - s*0.3, s*1.2, s*0.8, '#FF6B6B')
  // 眼睛
  drawRect(cx - s*0.8, cy - s*0.5, s*0.6, s*0.6, '#FFFFFF')
  drawRect(cx + s*0.3, cy - s*0.5, s*0.6, s*0.6, '#FFFFFF')
  drawRect(cx - s*0.6, cy - s*0.4, s*0.3, s*0.3, '#000000')
  drawRect(cx + s*0.5, cy - s*0.4, s*0.3, s*0.3, '#000000')
  // 触角
  drawRect(cx - s*1.5, cy - s*1.5, s*0.3, s*1, '#E74C3C')
  drawRect(cx + s*1.2, cy - s*1.5, s*0.3, s*1, '#E74C3C')
}

// 绘制N标志
function drawN(cx, cy, s) {
  const color = '#E74C3C'
  // 左边竖
  drawRect(cx, cy, s, s*3, color)
  // 右边竖
  drawRect(cx + s*2, cy, s, s*3, color)
  // 上面横
  drawRect(cx, cy, s*3, s, color)
  // 下面横
  drawRect(cx + s*2, cy + s*2, s*1, s, color)
  // 斜线
  drawRect(cx + s, cy, s, s, color)
  drawRect(cx + s + 0.5, cy + s, s, s, color)
  drawRect(cx + s + 1, cy + s*1.5, s, s*0.5, color)
}

// 绘制人物（背坐）
function drawPerson(x, y, hairColor, shirtColor, animPhase) {
  const bounce = Math.floor(animPhase) % 2 === 0 ? 0 : -1
  
  // 头发
  drawRect(x + 1, y + bounce, 5, 4, hairColor)
  drawRect(x, y + 1 + bounce, 7, 3, hairColor)
  
  // 脸
  drawRect(x + 2, y + 3 + bounce, 3, 2, '#FFD9B3')
  
  // 身体/衬衫
  drawRect(x + 1, y + 6 + bounce, 5, 5, shirtColor)
  drawRect(x, y + 7 + bounce, 7, 4, shirtColor)
  
  // 手臂
  drawRect(x - 1, y + 7 + bounce, 2, 3, shirtColor)
  drawRect(x + 6, y + 7 + bounce, 2, 3, shirtColor)
  
  // 椅子
  drawRect(x + 1, y + 11, 5, 2, '#3A3A3A')
  drawRect(x + 2, y + 13, 3, 2, '#2A2A2A')
}

// 绘制空调
function drawAC(x, y, w) {
  // 主体
  drawRect(x, y, w, 3, '#D0D0D0')
  drawRect(x, y + 1, w, 2, '#B0B0B0')
  // 出风口
  for (let i = 0; i < w - 2; i += 2) {
    drawRect(x + 1 + i, y + 2, 1, 1, '#909090')
  }
  // 指示灯
  drawRect(x + w - 2, y + 1, 1, 1, '#00FF00')
}

// 绘制房间
function drawRoom() {
  const w = canvas.width / scale
  const h = canvas.height / scale
  
  // 地板 - 米黄色木地板
  for (let i = 0; i < w; i += 3) {
    for (let j = h * 0.4; j < h; j += 3) {
      const shade = ((i + j) / 3) % 2 === 0 ? '#D4A574' : '#C9A066'
      drawRect(i, j, 3, 3, shade)
    }
  }
  
  // 墙壁 - 浅黄色
  for (let i = 0; i < w; i += 3) {
    for (let j = 0; j < h * 0.4; j += 3) {
      drawRect(i, j, 3, 3, '#F5E6C8')
    }
  }
  
  // 墙裙 - 深棕色
  drawRect(0, h * 0.28, w, 3, '#8B6914')
}

// 绘制家具
function drawFurniture() {
  const w = canvas.width / scale
  const h = canvas.height / scale
  
  // ===== 左边柜子 =====
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const cx = 8 + col * 6
      const cy = h * 0.32 + row * 8
      drawRect(cx, cy, 5, 7, '#4A4A4A')
      drawRect(cx + 2, cy + 2, 1, 3, '#3A3A3A')
    }
  }
  // 柜子顶
  drawRect(5, h * 0.3, 14, 2, '#3A3A3A')
  
  // ===== 5个工作位 =====
  const deskCount = 5
  const spacing = (w - 50) / (deskCount - 1)
  
  for (let i = 0; i < deskCount; i++) {
    const dx = 30 + i * spacing
    const dy = h * 0.55
    
    // 桌子
    drawRect(dx, dy, 16, 2, '#C9A066')
    drawRect(dx, dy + 2, 2, 6, '#8B6914')
    drawRect(dx + 14, dy + 2, 2, 6, '#8B6914')
    
    // 显示器
    drawRect(dx + 3, dy - 10, 10, 8, '#2A2A2A')
    drawRect(dx + 4, dy - 9, 8, 6, '#00D9FF')
    drawRect(dx + 6, dy - 2, 4, 2, '#4A4A4A')
    drawRect(dx + 5, dy, 6, 1, '#3A3A3A')
    
    // 键盘
    drawRect(dx + 4, dy - 3, 8, 1, '#4A4A4A')
    
    // 主机箱
    drawRect(dx + 12, dy - 12, 4, 10, '#3A3A3A')
  }
  
  // ===== 3扇窗户 =====
  const windowWidth = 18
  for (let i = 0; i < 3; i++) {
    const wx = 25 + i * 38
    const wy = 8
    
    // 窗户框
    drawRect(wx - 1, wy - 1, windowWidth + 2, 18, '#FFFFFF')
    // 玻璃
    drawRect(wx, wy, windowWidth, 16, '#87CEEB')
    // 窗格
    drawRect(wx + windowWidth/2 - 0.5, wy, 1, 16, '#FFFFFF')
    drawRect(wx, wy + 8, windowWidth, 1, '#FFFFFF')
    
    // 窗帘
    drawRect(wx - 2, wy - 2, 3, 20, '#E8B4B8')
    drawRect(wx + windowWidth - 1, wy - 2, 3, 20, '#E8B4B8')
    drawRect(wx - 1, wy - 2, windowWidth + 2, 2, '#D4A0A4')
  }
  
  // ===== 空调 =====
  drawAC(w * 0.6, 3, 25)
  // 管道
  drawRect(w * 0.3, 4, w * 0.3, 1, '#B0B0B0')
  drawRect(w * 0.6, 1, w * 0.3, 1, '#B0B0B0')
  
  // ===== N标志 =====
  drawN(w * 0.48, 12, 2)
  
  // ===== 小龙虾logo =====
  drawLobster(w * 0.88, h * 0.2, 3)
}

function drawCharacters() {
  const w = canvas.width / scale
  const h = canvas.height / scale
  const spacing = (w - 50) / 4
  
  const animPhase = (frame % 16) / 2
  
  // 5个人
  const colors = [
    ['#4A4A5A', '#5D6D7E'],  // 灰
    ['#4A3D5C', '#5B4B8A'],  // 紫
    ['#3A3A4A', '#4A4A5A'],  // 黑
    ['#5D4E37', '#8B7355'],   // 棕
    ['#4A5A4A', '#5D7E5D'],  // 绿
  ]
  
  for (let i = 0; i < 5; i++) {
    const x = 33 + i * spacing
    const y = h * 0.43
    drawPerson(x, y, colors[i][0], colors[i][1], animPhase + i * 0.3)
  }
}

function render(timestamp) {
  if (!lastTime) lastTime = timestamp
  const elapsed = timestamp - lastTime
  
  if (elapsed > frameTime) {
    frame++
    lastTime = timestamp
    
    if (!ctx || !canvas) return
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    drawRoom()
    drawFurniture()
    drawCharacters()
  }
  
  animationId = requestAnimationFrame(render)
}

function removeVisitor(id) {
  visitors.value = visitors.value.filter(v => v.id !== id)
}

function handleResize() {
  if (!canvasRef.value || !canvasRef.value.parentElement) return
  const container = canvasRef.value.parentElement
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  
  const baseWidth = 140
  const baseHeight = 90
  scale = Math.min(canvas.width / baseWidth, canvas.height / baseHeight)
  scale = Math.max(1, Math.min(scale, 5))
}

onMounted(() => {
  canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  
  handleResize()
  render(0)
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

.container { 
  width: 100vw; 
  height: 100vh; 
  display: flex; 
  flex-direction: column; 
  position: relative;
  background: #1a1a2e;
}

.canvas-container {
  flex: 1;
  position: relative;
  background: #1a1a2e;
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
