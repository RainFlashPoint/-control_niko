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
          <p>• 优化办公室像素画</p>
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

let ctx, canvas
let animationId = null
let lastTime = 0
const FPS = 6
const frameTime = 1000 / FPS

let frame = 0
let W = 100  // 基础宽度
let H = 60   // 基础高度

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color
  const sx = (x / W) * canvas.width
  const sy = (y / H) * canvas.height
  const sw = (w / W) * canvas.width
  const sh = (h / H) * canvas.height
  ctx.fillRect(sx, sy, sw, sh)
}

function drawText(text, x, y, color, size = 2) {
  ctx.fillStyle = color
  const fontSize = (size / W) * canvas.width * 0.8
  ctx.font = `${fontSize}px monospace`
  const sx = (x / W) * canvas.width
  const sy = (y / H) * canvas.height
  ctx.fillText(text, sx, sy)
}

function drawScene() {
  const blink = frame % 8 < 4
  const bounce = Math.floor(frame / 4) % 2 === 0 ? 0 : -0.5
  
  // 地板
  for (let i = 0; i < W; i += 2) {
    for (let j = 25; j < H; j += 2) {
      drawRect(i, j, 2, 2, ((i + j) / 2) % 2 === 0 ? '#D4A574' : '#C49A6C')
    }
  }
  
  // 墙壁
  for (let i = 0; i < W; i += 2) {
    for (let j = 0; j < 25; j += 2) {
      drawRect(i, j, 2, 2, '#F5E6C8')
    }
  }
  
  // 墙裙
  drawRect(0, 22, W, 3, '#8B6914')
  
  // 房间分隔
  drawRect(W * 0.33, 0, 1, 22, '#5D4037')
  drawRect(W * 0.66, 0, 1, 22, '#5D4037')
  
  // ===== 左侧房间：办公区 =====
  // E.T.海报
  drawRect(2, 3, 10, 10, '#1E3A5F')
  drawRect(5, 5, 4, 3, '#000000')
  drawText('E.T.', 4, 12, '#FFFFFF', 3)
  
  // 办公桌
  drawRect(3, 35, 18, 3, '#8B4513')
  drawRect(4, 38, 2, 5, '#5D4037')
  drawRect(17, 38, 2, 5, '#5D4037')
  // 显示器
  drawRect(6, 28, 8, 7, '#2A2A2A')
  drawRect(7, 29, 6, 5, '#00D9FF')
  drawRect(8, 35, 3, 2, '#4A4A4A')
  // 笔记本
  drawRect(14, 30, 5, 4, '#C0C0C0')
  // 马克杯
  drawRect(18, 32, 2, 2, '#FFFFFF')
  // 台灯
  drawRect(20, 33, 1, 3, '#8B4513')
  drawRect(19.5, 30, 3, 3, '#F5DEB3')
  
  // 椅子
  drawRect(8, 32, 5, 3, '#5D4037')
  drawRect(9, 30, 3, 2, '#5D4037')
  
  // 紫色怪物
  drawRect(6 + bounce, 33, 6, 5, '#9B59B6')
  drawRect(7 + bounce, 31, 1, 2, '#9B59B6')
  drawRect(10 + bounce, 31, 1, 2, '#9B59B6')
  drawRect(8 + bounce, 30, 2, 2, '#F1C40F')
  drawRect(5 + bounce, 34, 2, 1, '#E74C3C')
  drawRect(11 + bounce, 34, 2, 1, '#E74C3C')
  drawRect(7 + bounce, 34, 1, 1, '#FFFFFF')
  drawRect(10 + bounce, 34, 1, 1, '#FFFFFF')
  // 汗珠
  if (blink) {
    drawRect(5 + bounce, 33, 1, 1, '#3498DB')
    drawRect(12 + bounce, 33, 1, 1, '#3498DB')
  }
  
  // 恐龙
  drawRect(8, 42, 5, 4, '#2ECC71')
  drawRect(7, 41, 3, 2, '#2ECC71')
  drawRect(8, 42, 1, 1, '#000000')
  drawRect(11, 42, 1, 1, '#000000')
  
  // 对话气泡
  drawRect(4, 38, 12, 5, '#FFFFFF')
  drawRect(5, 43, 2, 1, '#FFFFFF')
  drawText('待命中', 5, 40, '#000000', 2)
  drawText('前端官', 5, 43, '#000000', 2)
  
  // 猫窝+猫
  drawRect(2, 45, 6, 3, '#A0A0A0')
  drawRect(3, 44, 4, 2, '#FF8C00')
  // 幽灵
  drawRect(22, 45, 4, 5, '#90EE90')
  drawRect(23, 44, 2, 1, '#90EE90')
  drawRect(21, 46, 1, 2, '#90EE90')
  drawRect(26, 46, 1, 2, '#90EE90')
  drawRect(22, 46, 1, 1, '#000000')
  drawRect(25, 46, 1, 1, '#000000')
  
  // 花盆+多肉
  drawRect(25, 43, 4, 3, '#8B4513')
  drawRect(25.5, 41, 3, 2, '#228B22')
  // 边柜
  drawRect(30, 38, 5, 8, '#5D4037')
  // 相框
  drawRect(31, 35, 3, 4, '#8B4513')
  drawRect(31.5, 36, 2, 2, '#FFD700')
  // 落地灯
  drawRect(36, 35, 1, 10, '#8B4513')
  drawRect(34.5, 30, 4, 5, '#F5DEB3')
  
  // ===== 中间房间：休闲区 =====
  // 老友记挂毯
  drawRect(W * 0.38, 3, 15, 8, '#228B22')
  drawText('HOW YOU', W * 0.39, 6, '#FFFFFF', 2)
  drawText("DOIN'", W * 0.4, 8, '#FFFFFF', 2)
  drawText('FRIENDS', W * 0.4, 10, '#FFFFFF', 2)
  
  // 沙发
  drawRect(W * 0.38, 38, 14, 5, '#F5DEB3')
  drawRect(W * 0.38, 37, 14, 1, '#DEB887')
  drawRect(W * 0.4, 40, 3, 2, '#8B4513')
  
  // 茶几
  drawRect(W * 0.43, 44, 8, 3, '#8B4513')
  // 咖啡机
  drawRect(W * 0.44, 40, 5, 5, '#A0A0A0')
  drawRect(W * 0.45, 41, 3, 2, '#505050')
  if (blink) {
    drawRect(W * 0.45, 39, 1, 1, '#CCCCCC')
  }
  // 马克杯
  drawRect(W * 0.47, 43, 1.5, 1.5, '#FFFFFF')
  drawRect(W * 0.49, 43, 1.5, 1.5, '#FFFFFF')
  
  // 大绿植
  drawRect(W * 0.5, 35, 5, 5, '#8B4513')
  drawRect(W * 0.5, 30, 1, 5, '#228B22')
  drawRect(W * 0.52, 28, 1.5, 7, '#2ECC71')
  drawRect(W * 0.54, 30, 1, 5, '#228B22')
  
  // 边柜+台灯
  drawRect(W * 0.38, 32, 4, 6, '#5D4037')
  drawRect(W * 0.39, 30, 1, 2, '#8B4513')
  drawRect(W * 0.38, 28, 3, 2, '#F5DEB3')
  drawRect(W * 0.52, 32, 4, 6, '#5D4037')
  drawRect(W * 0.53, 30, 1, 2, '#8B4513')
  drawRect(W * 0.52, 28, 3, 2, '#F5DEB3')
  
  // ===== 右侧房间：机房+休息 =====
  // CENTRAL PERK招牌
  drawRect(W * 0.7, 3, 14, 7, '#228B22')
  drawRect(W * 0.72, 5, 10, 3, '#FFFFFF')
  drawText('CENTRAL', W * 0.73, 6, '#FFFFFF', 1.5)
  drawText('PERK', W * 0.74, 8, '#FFFFFF', 1.5)
  
  // 服务器机柜
  drawRect(W * 0.7, 30, 7, 12, '#1E3A5F')
  drawRect(W * 0.72, 32, 3, 8, '#2C3E50')
  drawRect(W * 0.73, 33, 1, 1, '#00FF00')
  drawRect(W * 0.73, 35, 1, 1, '#00FF00')
  drawRect(W * 0.73, 37, 1, 1, '#00FF00')
  
  drawRect(W * 0.78, 30, 7, 12, '#1E3A5F')
  drawRect(W * 0.8, 32, 3, 8, '#2C3E50')
  drawRect(W * 0.81, 33, 1, 1, '#00FF00')
  drawRect(W * 0.81, 35, 1, 1, '#00FF00')
  
  // 告警灯
  drawRect(W * 0.69, 28, 2, 2, blink ? '#FF0000' : '#550000')
  drawRect(W * 0.86, 28, 2, 2, blink ? '#FF0000' : '#550000')
  drawRect(W * 0.73, 27, 4, 1, '#FFFF00')
  drawText('!', W * 0.74, 28, '#000000', 2)
  
  // 文件柜
  drawRect(W * 0.85, 35, 5, 8, '#808080')
  
  // 边柜+台灯
  drawRect(W * 0.83, 44, 4, 5, '#5D4037')
  drawRect(W * 0.84, 42, 1, 2, '#8B4513')
  drawRect(W * 0.83, 40, 3, 2, '#F5DEB3')
  
  // 床
  drawRect(W * 0.7, 48, 12, 7, '#F5DEB3')
  drawRect(W * 0.72, 49, 10, 5, '#FFFFFF')
  drawRect(W * 0.73, 50, 3, 3, '#FFFFFF')
  // 床尾绿植
  drawRect(W * 0.8, 52, 3, 3, '#8B4513')
  drawRect(W * 0.8, 50, 3, 2, '#228B22')
  
  // ===== 底部横幅 =====
  drawRect(25, 0.5, 50, 4, '#5D4037')
  drawRect(24, 1.5, 1, 2, '#FFD700')
  drawRect(75, 1.5, 1, 2, '#FFD700')
  drawText('niko的办公室', 35, 3, '#FFD700', 3)
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
    
    drawScene()
  }
  
  animationId = requestAnimationFrame(render)
}

function removeVisitor(id) {
  visitors.value = visitors.value.filter(v => v.id !== id)
}

onMounted(() => {
  canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  
  canvas.width = canvasRef.value.parentElement.clientWidth
  canvas.height = canvasRef.value.parentElement.clientHeight
  
  render(0)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
body { font-family: 'Courier New', monospace; background: #1a1a2e; }

.container { width: 100vw; height: 100vh; display: flex; flex-direction: column; position: relative; background: #1a1a2e; }
.canvas-container { flex: 1; position: relative; background: #1a1a2e; overflow: hidden; }
.canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

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
