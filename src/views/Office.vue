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
const FPS = 15
const frameTime = 1000 / FPS

// RPG角色配色方案
const rpgStyles = [
  { 
    name: '剑士',
    skin: '#FFD9B3', hair: '#5C3317', hairLight: '#8B6914',
    armorMain: '#708090', armorLight: '#A0A0A0', armorDark: '#4A5568',
    cape: '#8B0000', capeInside: '#DC143C',
    weapon: '#C0C0C0', weaponDetail: '#808080', handle: '#4A3728'
  },
  { 
    name: '法师',
    skin: '#FFD9B3', hair: '#FFD700', hairLight: '#FFE44D',
    armorMain: '#4B0082', armorLight: '#6A0DAD', armorDark: '#2E0050',
    cape: '#2E0050', capeInside: '#4B0082',
    weapon: '#9400D3', weaponDetail: '#BA55D3', handle: '#4A3728'
  },
  { 
    name: '刺客',
    skin: '#FFD9B3', hair: '#1C1C1C', hairLight: '#3D3D3D',
    armorMain: '#1C1C1C', armorLight: '#3D3D3D', armorDark: '#0D0D0D',
    cape: '#1A3A3A', capeInside: '#2F4F4F',
    weapon: '#A0A0A0', weaponDetail: '#606060', handle: '#2D1F1F'
  },
  { 
    name: '骑士',
    skin: '#FFD9B3', hair: '#8B4513', hairLight: '#A0522D',
    armorMain: '#D4AF37', armorLight: '#FFD700', armorDark: '#AA8800',
    cape: '#1E3A5F', capeInside: '#4169E1',
    weapon: '#C0C0C0', weaponDetail: '#808080', handle: '#4A3728'
  },
  { 
    name: '弓箭手',
    skin: '#FFD9B3', hair: '#8B4513', hairLight: '#A0522D',
    armorMain: '#228B22', armorLight: '#32CD32', armorDark: '#006400',
    cape: '#006400', capeInside: '#228B22',
    weapon: '#8B4513', weaponDetail: '#A0522D', handle: '#4A3728'
  }
]

let frame = 0

// 绘制矩形（使用缩放）
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color
  ctx.fillRect(x * scale, y * scale, w * scale, h * scale)
}

// 绘制高清RPG角色（优化版）
function drawCharacter(style, x, y, animPhase) {
  const s = style
  const bounce = Math.floor(animPhase) % 2 === 0 ? 0 : -1
  const legPhase = Math.floor(animPhase) % 4
  
  // 腿部动画偏移
  const legOffset1 = legPhase === 1 ? -1 : legPhase === 3 ? 1 : 0
  const legOffset2 = legPhase === 3 ? -1 : legPhase === 1 ? 1 : 0
  
  // === 腿部 ===
  drawRect(x + 8, y + 28 + bounce, 5, 8, s.armorDark)
  drawRect(x + 8, y + 36 + bounce, 5, 3, s.handle)
  drawRect(x + 7, y + 38 + bounce, 7, 2, s.armorMain)
  
  drawRect(x + 15, y + 28 + bounce + legOffset2, 5, 8, s.armorDark)
  drawRect(x + 15, y + 36 + bounce + legOffset2, 5, 3, s.handle)
  drawRect(x + 14, y + 38 + bounce + legOffset2, 7, 2, s.armorMain)
  
  // === 身体盔甲 ===
  drawRect(x + 6, y + 16 + bounce, 16, 13, s.armorMain)
  drawRect(x + 5, y + 18 + bounce, 2, 10, s.armorDark)
  drawRect(x + 21, y + 18 + bounce, 2, 10, s.armorDark)
  drawRect(x + 6, y + 14 + bounce, 16, 3, s.armorLight)
  drawRect(x + 12, y + 18 + bounce, 4, 6, s.armorLight)
  drawRect(x + 10, y + 17 + bounce, 8, 2, s.weaponDetail)
  
  // === 披风 ===
  drawRect(x + 4, y + 14 + bounce, 3, 18, s.cape)
  drawRect(x + 21, y + 14 + bounce, 3, 18, s.cape)
  drawRect(x + 5, y + 16 + bounce, 2, 14, s.capeInside)
  drawRect(x + 21, y + 16 + bounce, 2, 14, s.capeInside)
  
  // === 手臂 ===
  drawRect(x + 2, y + 17 + bounce, 4, 10, s.armorMain)
  drawRect(x + 1, y + 26 + bounce, 3, 4, s.skin)
  drawRect(x + 22, y + 17 + bounce, 4, 10, s.armorMain)
  drawRect(x + 24, y + 26 + bounce, 3, 4, s.skin)
  
  // === 武器 ===
  if (s.name === '剑士' || s.name === '刺客' || s.name === '骑士') {
    drawRect(x + 26, y + 10 + bounce, 2, 14, s.weapon)
    drawRect(x + 26, y + 8 + bounce, 2, 3, s.weaponDetail)
    drawRect(x + 26, y + 24 + bounce, 2, 3, s.handle)
    drawRect(x + 24, y + 26 + bounce, 6, 2, s.weaponDetail)
  } else if (s.name === '法师') {
    drawRect(x + 26, y + 6 + bounce, 2, 22, s.handle)
    drawRect(x + 24, y + 4 + bounce, 6, 6, s.weapon)
    drawRect(x + 25, y + 5 + bounce, 4, 4, s.weaponDetail)
    drawRect(x + 26, y + 3 + bounce, 2, 2, '#FFFFFF')
  } else if (s.name === '弓箭手') {
    drawRect(x + 26, y + 8 + bounce, 2, 16, s.weapon)
    drawRect(x + 23, y + 7 + bounce, 2, 2, s.weapon)
    drawRect(x + 23, y + 23 + bounce, 2, 2, s.weapon)
    drawRect(x + 24, y + 8 + bounce, 1, 16, '#CCCCCC')
  }
  
  // === 头部 ===
  drawRect(x + 9, y + 2 + bounce, 10, 10, s.skin)
  drawRect(x + 8, y + bounce, 12, 4, s.hair)
  drawRect(x + 7, y + 1 + bounce, 2, 5, s.hair)
  drawRect(x + 19, y + 1 + bounce, 2, 5, s.hair)
  drawRect(x + 9, y - 1 + bounce, 10, 2, s.hair)
  drawRect(x + 11, y - 2 + bounce, 6, 2, s.hairLight)
  
  // 头盔
  drawRect(x + 8, y - 1 + bounce, 12, 4, s.armorMain)
  drawRect(x + 10, y - 3 + bounce, 8, 3, s.armorMain)
  drawRect(x + 13, y - 4 + bounce, 2, 2, s.armorLight)
  drawRect(x + 12, y + 1 + bounce, 4, 3, s.armorDark)
  
  // 眼睛
  drawRect(x + 11, y + 5 + bounce, 2, 2, '#1A1A1A')
  drawRect(x + 15, y + 5 + bounce, 2, 2, '#1A1A1A')
  drawRect(x + 11, y + 5 + bounce, 1, 1, '#FFFFFF')
  drawRect(x + 15, y + 5 + bounce, 1, 1, '#FFFFFF')
  
  // 嘴巴
  drawRect(x + 13, y + 9 + bounce, 2, 1, '#CC8888')
}

// 绘制房间（优化版）
function drawRoom() {
  const w = canvas.width
  const h = canvas.height
  
  // 地板 - 简约木纹
  for (let i = 0; i < w; i += 6) {
    for (let j = h * 0.3; j < h; j += 6) {
      const color = ((i + j) / 6) % 2 === 0 ? '#C9A86C' : '#B8956A'
      drawRect(i / scale, j / scale, 1, 1, color)
    }
  }
  
  // 墙壁 - 上方
  for (let i = 0; i < w; i += 4) {
    for (let j = 0; j < h * 0.3; j += 4) {
      drawRect(i / scale, j / scale, 1, 1, '#D4C4A8')
    }
  }
  
  // 墙壁纹理
  for (let i = 0; i < w; i += 20) {
    for (let j = 0; j < h * 0.3; j += 20) {
      drawRect(i / scale, j / scale, 1, 1, '#E8DCC4')
    }
  }
  
  // 墙裙
  drawRect(0, h * 0.28 / scale, w / scale, 2, '#8B6914')
}

// 绘制家具（优化版）
function drawFurniture() {
  const w = canvas.width / scale
  const h = canvas.height / scale
  
  // 5个工作位 - 根据画布大小动态计算位置
  const deskCount = 5
  const deskWidth = 12
  const spacing = (w - 40) / deskCount
  
  for (let i = 0; i < deskCount; i++) {
    const dx = 20 + i * spacing
    const dy = h * 0.55
    
    // 桌子
    drawRect(dx, dy, deskWidth, 1, '#8B6914')
    drawRect(dx, dy + 1, 1, 4, '#5C4010')
    drawRect(dx + deskWidth - 1, dy + 1, 1, 4, '#5C4010')
    
    // 显示器
    drawRect(dx + 2, dy - 5, 8, 5, '#2A2A3A')
    drawRect(dx + 2, dy - 5, 8, 4, i < 2 ? '#00D9FF' : '#1A1A2A')
    drawRect(dx + 4, dy, 4, 1, '#4A4A5A')
    drawRect(dx + 3, dy + 1, 6, 1, '#3A3A4A')
    
    // 键盘
    drawRect(dx + 3, dy - 2, 6, 1, '#4A4A5A')
  }
  
  // 窗帘
  for (let i = 0; i < 5; i++) {
    drawRect(5 + i * 15, 5, 2, 25, '#E8B4B8')
    drawRect(6 + i * 15, 5, 1, 25, '#F0C8CC')
  }
  
  // 窗户
  for (let i = 0; i < 5; i++) {
    drawRect(6 + i * 15, 8, 8, 12, '#87CEEB')
  }
  
  // 沙发
  drawRect(5, h * 0.7, 15, 4, '#8B4513')
  drawRect(5, h * 0.68, 4, 5, '#A0522D')
  drawRect(16, h * 0.68, 4, 5, '#A0522D')
  drawRect(5, h * 0.66, 15, 3, '#A0522D')
  
  // 书架
  drawRect(5, h * 0.35, 6, 18, '#654321')
  for (let i = 0; i < 4; i++) {
    drawRect(6, h * 0.38 + i * 4, 4, 2, [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF1C40F][i])
  }
  
  // 服务器机柜
  drawRect(w - 8, h * 0.35, 6, 22, '#2A2A2A')
  for (let i = 0; i < 8; i++) {
    drawRect(w - 7, h * 0.38 + i * 2.5, 4, 1, '#FF0000')
  }
  
  // 咖啡机
  drawRect(w - 10, h * 0.65, 4, 6, '#6F4E37')
  drawRect(w - 10, h * 0.64, 4, 2, '#A0A0A0')
  
  // 盆栽
  drawRect(10, h * 0.72, 3, 5, '#8B4513')
  drawRect(9, h * 0.58, 5, 6, '#228B22')
  drawRect(10, h * 0.55, 3, 3, '#32CD32')
  
  // 猫
  drawRect(w * 0.7, h * 0.75, 4, 3, '#FFA500')
  drawRect(w * 0.7, h * 0.73, 3, 2, '#FF8800')
  
  // 时钟
  drawRect(w * 0.85, 8, 4, 4, '#FFFFFF')
  drawRect(w * 0.85 + 1, 9, 2, 2, '#000000')
  
  // 招牌
  drawRect(w * 0.4, 3, 15, 3, '#FFA500')
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
    
    // 绘制场景
    drawRoom()
    drawFurniture()
    
    // 动画相位
    const animPhase = (frame % 12) / 3
    
    // 绘制5个角色 - 根据画布大小调整位置
    const w = canvas.width / scale
    const h = canvas.height / scale
    const spacing = (w - 40) / 5
    
    for (let i = 0; i < 5; i++) {
      const x = 20 + i * spacing
      const y = h * 0.45
      drawCharacter(rpgStyles[i], x, y, animPhase + i * 0.5)
    }
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
  
  // 计算缩放 - 让内容适配画布
  const baseWidth = 120
  const baseHeight = 80
  scale = Math.min(canvas.width / baseWidth, canvas.height / baseHeight)
  
  // 限制缩放范围
  scale = Math.max(1, Math.min(scale, 4))
}

onMounted(() => {
  canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  
  // 初始尺寸
  handleResize()
  
  // 启动渲染
  render(0)
  
  // 监听窗口变化
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
