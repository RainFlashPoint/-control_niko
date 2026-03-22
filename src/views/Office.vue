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
  ctx.fillRect(x * scale, y * scale, w * scale, h * scale)
}

// 绘制像素点
function drawPixel(x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x * scale, y * scale, scale, scale)
}

// 绘制小龙虾Logo
function drawLobsterLogo(cx, cy, size) {
  const s = size
  // 身体
  drawRect(cx - s*2, cy - s, s*4, s*2, '#FF4444')
  drawRect(cx - s*3, cy, s*6, s, '#FF4444')
  // 尾巴
  for (let i = 0; i < 3; i++) {
    drawRect(cx - s*1 + i*s*0.8, cy + s, s, s, '#FF4444')
  }
  // 钳子
  drawRect(cx - s*4, cy - s*0.5, s, s*0.5, '#FF6666')
  drawRect(cx + s*3, cy - s*0.5, s, s*0.5, '#FF6666')
  // 眼睛
  drawPixel(cx - s*0.5, cy - s*0.5, '#FFFFFF')
  drawPixel(cx + s*0.5, cy - s*0.5, '#FFFFFF')
  drawPixel(cx - s*0.5, cy - s*0.5, '#000000')
  drawPixel(cx + s*0.5, cy - s*0.5, '#000000')
}

// 绘制人物（背对显示器）
function drawPerson(x, y, color1, color2, animPhase) {
  const bounce = Math.floor(animPhase) % 2 === 0 ? 0 : -1
  
  // 头发/头
  drawRect(x + 2, y + bounce, 4, 4, color1)
  drawRect(x + 1, y + 1 + bounce, 6, 3, color1)
  
  // 脸部（只显示侧脸）
  drawRect(x + 4, y + 2 + bounce, 2, 2, '#FFD9B3')
  
  // 身体
  drawRect(x + 1, y + 6 + bounce, 6, 6, color2)
  drawRect(x, y + 7 + bounce, 8, 4, color2)
  
  // 手臂
  drawRect(x - 1, y + 8 + bounce, 2, 3, color2)
  drawRect(x + 7, y + 8 + bounce, 2, 3, color2)
  
  // 椅子
  drawRect(x + 1, y + 10, 6, 2, '#4A4A4A')
  drawRect(x + 2, y + 12, 4, 3, '#3A3A3A')
}

// 绘制窗帘
function drawCurtain(x, y, w, h) {
  for (let i = 0; i < w; i += 2) {
    const shade = i % 4 === 0 ? '#E8B4B8' : '#F0C8CC'
    drawRect(x + i, y, 2, h, shade)
  }
  // 窗帘杆
  drawRect(x - 1, y, w + 2, 1, '#8B4513')
  // 窗帘顶部
  drawRect(x, y - 1, w, 2, '#D4A4A8')
}

// 绘制空调
function drawAirConditioner(x, y, w) {
  drawRect(x, y, w, 3, '#E0E0E0')
  drawRect(x + 1, y + 1, w - 2, 1, '#B0B0B0')
  // 出风口
  for (let i = 0; i < w - 2; i += 2) {
    drawRect(x + 1 + i, y + 2, 1, 1, '#909090')
  }
}

// 绘制N标志
function drawNLogo(x, y, size) {
  const s = size
  // N字
  drawRect(x, y, s, s*3, '#FF4444')
  drawRect(x + s*2, y, s, s*3, '#FF4444')
  drawRect(x, y, s*3, s, '#FF4444')
  drawRect(x + s*2, y + s*2, s*1, s, '#FF4444')
  // 斜线
  for (let i = 0; i < s*2; i++) {
    drawRect(x + s + i, y + i, s, s, '#FF4444')
  }
}

// 绘制房间
function drawRoom() {
  const w = canvas.width / scale
  const h = canvas.height / scale
  
  // 地板 - 木纹
  for (let i = 0; i < w; i += 4) {
    for (let j = h * 0.4; j < h; j += 4) {
      const shade = ((i + j) / 4) % 2 === 0 ? '#C9A86C' : '#B8956A'
      drawRect(i, j, 4, 4, shade)
    }
  }
  
  // 墙壁 - 上方
  for (let i = 0; i < w; i += 4) {
    for (let j = 0; j < h * 0.4; j += 4) {
      drawRect(i, j, 4, 4, '#E8DCC4')
    }
  }
  
  // 墙裙
  drawRect(0, h * 0.38, w, 3, '#8B6914')
  
  // 地板和墙脚线
  drawRect(0, h * 0.4 - 1, w, 1, '#A08060')
}

// 绘制家具
function drawFurniture() {
  const w = canvas.width / scale
  const h = canvas.height / scale
  
  // 5个工作位
  const deskCount = 5
  const deskWidth = 20
  const spacing = (w - 40) / deskCount
  
  for (let i = 0; i < deskCount; i++) {
    const dx = 20 + i * spacing
    const dy = h * 0.55
    
    // 桌子
    drawRect(dx, dy, deskWidth, 2, '#8B6914')
    drawRect(dx, dy + 2, 2, 8, '#5C4010')
    drawRect(dx + deskWidth - 2, dy + 2, 2, 8, '#5C4010')
    
    // 显示器
    drawRect(dx + 4, dy - 8, 12, 8, '#2A2A3A')
    drawRect(dx + 5, dy - 7, 10, 6, '#00D9FF')
    drawRect(dx + 8, dy, 4, 2, '#4A4A5A')
    drawRect(dx + 6, dy + 2, 8, 1, '#3A3A4A')
    
    // 键盘
    drawRect(dx + 5, dy - 2, 10, 2, '#4A4A5A')
    
    // 主机箱
    drawRect(dx + deskWidth - 3, dy - 10, 4, 10, '#3A3A3A')
  }
  
  // 窗帘 - 3个窗户
  const curtainWidth = 15
  for (let i = 0; i < 3; i++) {
    const cx = 15 + i * 35
    drawCurtain(cx, 8, curtainWidth, 25)
    // 窗户
    drawRect(cx + 2, 10, curtainWidth - 4, 15, '#87CEEB')
    // 窗户框
    drawRect(cx + curtainWidth/2 - 1, 10, 2, 15, '#FFFFFF')
    drawRect(cx + 2, 17, curtainWidth - 4, 2, '#FFFFFF')
  }
  
  // 空调
  drawAirConditioner(w * 0.7, 3, 20)
  
  // N标志
  drawNLogo(w * 0.48, 8, 3)
  
  // 小龙虾Logo - 右侧
  drawLobsterLogo(w * 0.88, h * 0.25, 4)
  
  // 空调管道
  drawRect(5, 5, w * 0.3, 2, '#B0B0B0')
  drawRect(w * 0.7, 2, w * 0.3, 2, '#B0B0B0')
  
  // 地板上的物品 - 垃圾桶
  drawRect(10, h - 12, 4, 8, '#606060')
  drawRect(9, h - 13, 6, 2, '#505050')
  
  // 地板上的物品 - 箱子
  drawRect(w - 15, h - 10, 8, 6, '#8B6914')
  drawRect(w - 14, h - 11, 6, 1, '#A08020')
}

function drawCharacters() {
  const w = canvas.width / scale
  const h = canvas.height / scale
  const spacing = (w - 40) / 5
  
  // 动画相位
  const animPhase = (frame % 16) / 2
  
  // 5个工作的人 - 背对
  const colors = [
    ['#4A4A6A', '#708090'],  // 剑士风格
    ['#4A0060', '#4B0082'],  // 法师风格
    ['#2A2A3A', '#1C1C1C'],  // 刺客风格
    ['#8B6914', '#D4AF37'],  // 骑士风格
    ['#1A4A1A', '#228B22'],  // 弓箭手风格
  ]
  
  for (let i = 0; i < 5; i++) {
    const x = 25 + i * spacing
    const y = h * 0.42
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
    
    // 清空
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 绘制
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
  
  // 计算缩放
  const baseWidth = 160
  const baseHeight = 100
  scale = Math.min(canvas.width / baseWidth, canvas.height / baseHeight)
  scale = Math.max(1, Math.min(scale, 6))
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
