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
const FPS = 6
const frameTime = 1000 / FPS

let frame = 0

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color
  ctx.fillRect(Math.floor(x * scale), Math.floor(y * scale), Math.floor(w * scale), Math.floor(h * scale))
}

function drawText(text, x, y, color, size = 8) {
  ctx.fillStyle = color
  ctx.font = `${Math.floor(size * scale)}px monospace`
  ctx.fillText(text, x * scale, y * scale)
}

// ===== 绘制组件 =====

function drawLobster(x, y, s) {
  drawRect(x - s*2, y, s*4, s*1.5, '#E74C3C')
  drawRect(x - s*2.5, y + s*1.2, s*5, s*1, '#E74C3C')
  drawRect(x - s*1.5, y + s*2, s*1, s*0.8, '#E74C3C')
  drawRect(x - s*0.5, y + s*2, s*1, s*0.8, '#E74C3C')
  drawRect(x + s*0.5, y + s*2, s*1, s*0.8, '#E74C3C')
  drawRect(x - s*3, y + s*0.3, s*1, s*0.6, '#FF6B6B')
  drawRect(x + s*2, y + s*0.3, s*1, s*0.6, '#FF6B6B')
  drawRect(x - s*0.5, y - s*0.3, s*0.5, s*0.5, '#FFFFFF')
  drawRect(x + s*0.2, y - s*0.3, s*0.5, s*0.5, '#FFFFFF')
  drawRect(x - s*0.4, y - s*0.2, s*0.3, s*0.3, '#000000')
  drawRect(x + s*0.3, y - s*0.2, s*0.3, s*0.3, '#000000')
}

function drawETPoster(x, y, w, h) {
  drawRect(x, y, w, h, '#1E3A5F')
  drawRect(x + w*0.3, y + h*0.1, w*0.4, h*0.3, '#000000')
  drawRect(x + w*0.2, y + h*0.5, w*0.1, h*0.05, '#CCCCCC')
  drawRect(x + w*0.6, y + h*0.5, w*0.1, h*0.05, '#CCCCCC')
  drawRect(x + w*0.35, y + h*0.4, w*0.3, h*0.25, '#3D5C3D')
  drawRect(x + w*0.3, y + h*0.5, w*0.05, h*0.2, '#3D5C3D')
  drawRect(x + w*0.55, y + h*0.5, w*0.05, h*0.2, '#3D5C3D')
  drawText('E.T.', x + w*0.38, y + h*0.8, '#FFFFFF', 10)
}

function drawFriendsPoster(x, y, w, h) {
  drawRect(x, y, w, h, '#8B4513')
  drawRect(x + 1, y + 1, w - 2, h - 2, '#2C3E50')
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#DDA0DD']
  for (let i = 0; i < 6; i++) {
    drawRect(x + 2 + i * (w/6 - 1), y + 3, w/6 - 2, h - 6, colors[i])
  }
}

function drawCentralPerkSign(x, y, w, h) {
  drawRect(x, y, w, h, '#228B22')
  drawRect(x + 2, y + 2, w - 4, h - 4, '#006400')
  drawRect(x + w*0.1, y + h*0.3, w*0.25, h*0.4, '#FFFFFF')
  drawRect(x + w*0.1, y + h*0.5, w*0.3, h*0.1, '#FFFFFF')
  drawRect(x + w*0.35, y + h*0.35, w*0.05, h*0.25, '#FFFFFF')
  drawText('CENTRAL PERK', x + w*0.4, y + h*0.5, '#FFFFFF', 8)
}

function drawDeskLamp(x, y, shadeColor) {
  drawRect(x, y, 2, 1, '#8B4513')
  drawRect(x + 0.5, y - 4, 1, 4, '#8B4513')
  drawRect(x - 1, y - 5, 4, 3, shadeColor)
  drawRect(x + 0.5, y - 4, 1, 1, '#FFFF00')
}

function drawFloorLamp(x, y) {
  drawRect(x, y, 2, 10, '#8B4513')
  drawRect(x - 2, y - 4, 6, 4, '#F5DEB3')
  drawRect(x + 0.5, y - 3, 1, 1, '#FFFF00')
}

function drawPotAndSucculent(x, y) {
  drawRect(x, y, 5, 4, '#8B4513')
  drawRect(x + 1, y - 3, 3, 3, '#228B22')
  drawRect(x, y - 4, 2, 2, '#32CD32')
}

function drawBigPlant(x, y) {
  drawRect(x, y, 6, 5, '#8B4513')
  drawRect(x + 1, y - 6, 1, 6, '#228B22')
  drawRect(x + 3, y - 8, 2, 8, '#2ECC71')
  drawRect(x + 4, y - 5, 1, 5, '#228B22')
}

function drawCatBed(x, y) {
  drawRect(x, y, 6, 3, '#A0A0A0')
  drawRect(x - 1, y - 1, 8, 1, '#A0A0A0')
  drawRect(x + 1, y - 2, 4, 2, '#FF8C00')
}

function drawGhost(x, y) {
  drawRect(x, y, 4, 5, '#90EE90')
  drawRect(x + 0.5, y - 1, 3, 1, '#90EE90')
  drawRect(x - 1, y + 1, 1, 2, '#90EE90')
  drawRect(x + 4, y + 1, 1, 2, '#90EE90')
  drawRect(x + 1, y + 1, 1, 1, '#000000')
  drawRect(x + 3, y + 1, 1, 1, '#000000')
}

function drawServerCabinet(x, y, w, h) {
  drawRect(x, y, w, h, '#1E3A5F')
  drawRect(x + 1, y + 1, w - 2, h - 2, '#2C3E50')
  for (let i = 0; i < 5; i++) {
    drawRect(x + 2, y + 2 + i * 3, 2, 1, '#00FF00')
  }
}

function drawAlertLight(x, y, blink) {
  const color = blink ? '#FF0000' : '#550000'
  drawRect(x, y, 2, 2, color)
}

function drawBed(x, y, w, h) {
  drawRect(x, y, w, h, '#F5DEB3')
  drawRect(x + 1, y + 1, w - 2, h * 0.6, '#FFFFFF')
  drawRect(x + 2, y + 2, w * 0.25, h * 0.4, '#FFFFFF')
}

function drawCoffeeMachine(x, y) {
  drawRect(x, y, 6, 7, '#A0A0A0')
  drawRect(x + 1, y + 1, 4, 2, '#505050')
  drawRect(x + 1, y + 4, 4, 2, '#D0D0D0')
  if (frame % 4 < 2) {
    drawRect(x + 2, y - 1, 1, 1, '#CCCCCC')
    drawRect(x + 4, y - 2, 1, 1, '#CCCCCC')
  }
}

function drawSofa(x, y, w, h) {
  drawRect(x, y, w, h, '#F5DEB3')
  drawRect(x, y - 1, w, 1, '#DEB887')
  drawRect(x + 2, y + 2, 3, 2, '#8B4513')
}

function drawCoffeeTable(x, y, w, h) {
  drawRect(x, y, w, h, '#8B4513')
  drawRect(x + 1, y + 1, w - 2, h - 2, '#A0522D')
}

function drawPurpleMonster(x, y) {
  drawRect(x, y, 6, 5, '#9B59B6')
  drawRect(x + 1, y - 2, 1, 2, '#9B59B6')
  drawRect(x + 4, y - 2, 1, 2, '#9B59B6')
  drawRect(x + 2, y - 3, 2, 3, '#F1C40F')
  drawRect(x - 2, y + 2, 2, 1, '#E74C3C')
  drawRect(x + 6, y + 2, 2, 1, '#E74C3C')
  drawRect(x + 1, y + 1, 1, 1, '#FFFFFF')
  drawRect(x + 4, y + 1, 1, 1, '#FFFFFF')
  drawRect(x + 1, y + 1, 1, 1, '#000000')
  drawRect(x + 4, y + 1, 1, 1, '#000000')
  if (frame % 6 < 3) {
    drawRect(x - 1, y, 1, 1, '#3498DB')
    drawRect(x + 6, y, 1, 1, '#3498DB')
  }
}

function drawSpeechBubble(x, y, text1, text2) {
  drawRect(x, y, 10, 6, '#FFFFFF')
  drawRect(x + 3, y + 6, 2, 1, '#FFFFFF')
  drawText(text1, x + 1, y + 2, '#000000', 3)
  drawText(text2, x + 1, y + 5, '#000000', 3)
}

function drawGreenDinosaur(x, y) {
  drawRect(x, y, 5, 4, '#2ECC71')
  drawRect(x - 1, y - 1, 3, 2, '#2ECC71')
  drawRect(x, y, 1, 1, '#000000')
  drawRect(x + 3, y, 1, 1, '#000000')
}

function drawDesk(x, y, w, h) {
  drawRect(x, y, w, h, '#8B4513')
  drawRect(x, y + h, 1, 3, '#5D4037')
  drawRect(x + w - 1, y + h, 1, 3, '#5D4037')
  drawRect(x + 2, y - 3, 5, 3, '#C0C0C0')
  drawRect(x + 2.5, y - 2.5, 4, 2, '#00D9FF')
  drawRect(x + w - 3, y - 2, 2, 2, '#FFFFFF')
  drawRect(x + w - 5, y - 1, 1, 1, '#FF69B4')
  drawRect(x + w - 5, y + 0.5, 1, 1, '#228B22')
}

function drawChair(x, y) {
  drawRect(x, y, 5, 3, '#5D4037')
  drawRect(x + 1, y - 2, 3, 2, '#5D4037')
}

function drawBanner(w) {
  const bannerW = 40
  const bannerH = 4
  const x = (w - bannerW) / 2
  const y = 1
  drawRect(x, y, bannerW, bannerH, '#5D4037')
  drawRect(x - 1, y + 1, 1, 2, '#FFD700')
  drawRect(x + bannerW, y + 1, 1, 2, '#FFD700')
  drawText('niko的办公室', x + 3, y + 3, '#FFD700', 4)
}

function drawWall(x, y, w, h) {
  for (let i = 0; i < w; i += 2) {
    for (let j = 0; j < h; j += 2) {
      drawRect(x + i, y + j, 2, 2, '#8B4513')
    }
  }
}

function drawRoomDivider(x, y1, y2) {
  for (let y = y1; y < y2; y += 2) {
    drawRect(x, y, 1, 1, '#5D4037')
    drawRect(x, y + 1, 1, 1, '#3E2723')
  }
}

// ===== 主场景 =====
function drawScene() {
  const w = canvas.width / scale
  const h = canvas.height / scale
  const blink = frame % 8 < 4
  
  // 地板
  for (let i = 0; i < w; i += 3) {
    for (let j = 15; j < h; j += 3) {
      const color = ((i + j) / 3) % 2 === 0 ? '#F5DEB3' : '#DEB887'
      drawRect(i, j, 3, 3, color)
    }
  }
  
  // 墙 - 上半部分
  for (let i = 0; i < w; i += 3) {
    for (let j = 0; j < 15; j += 3) {
      drawRect(i, j, 3, 3, '#F5E6C8')
    }
  }
  
  // 墙裙
  drawRect(0, 12, w, 2, '#8B6914')
  
  // 房间分隔（垂直线）
  drawRoomDivider(w * 0.33, 0, 15)
  drawRoomDivider(w * 0.66, 0, 15)
  
  // ===== 左侧房间：办公区 =====
  // E.T.海报
  drawETPoster(3, 2, 8, 8)
  
  // 办公桌
  drawDesk(2, 18, 12, 1.5)
  drawChair(5, 15.5)
  drawPurpleMonster(4, 16)
  drawDeskLamp(12, 17, '#F5DEB3')
  
  // 恐龙+对话
  drawGreenDinosaur(5, 23)
  drawSpeechBubble(2, 19, '待命中', '前端官')
  
  // 猫窝+猫
  drawCatBed(2, 25)
  // 幽灵
  drawGhost(11, 25)
  // 花盆
  drawPotAndSucculent(14, 23)
  // 边柜
  drawRect(18, 20, 4, 6, '#5D4037')
  // 老友记相框
  drawFriendsPoster(19, 18, 2, 3)
  // 落地灯
  drawFloorLamp(22, 19)
  
  // ===== 中间房间：休闲区 =====
  // 老友记挂毯
  drawRect(w * 0.38, 2, 12, 6, '#228B22')
  drawText('HOW YOU', w * 0.39, 4, '#FFFFFF', 3)
  drawText("DOIN'", w * 0.4, 6, '#FFFFFF', 3)
  drawText('FRIENDS', w * 0.4, 8, '#FFFFFF', 3)
  
  // 地毯
  drawRect(w * 0.36, h * 0.45, w * 0.28, h * 0.2, '#FFF8DC')
  
  // 沙发
  drawSofa(w * 0.36, 22, 10, 4)
  // 茶几
  drawCoffeeTable(w * 0.4, 26, 7, 3)
  // 咖啡机
  drawCoffeeMachine(w * 0.41, 24)
  // 马克杯
  drawRect(w * 0.43, 25, 1.5, 1.5, '#FFFFFF')
  drawRect(w * 0.45, 25, 1.5, 1.5, '#FFFFFF')
  // 大绿植
  drawBigPlant(w * 0.48, 20)
  // 边柜+台灯
  drawRect(w * 0.35, 18, 3, 5, '#5D4037')
  drawDeskLamp(w * 0.35 + 1, 16, '#F5DEB3')
  drawRect(w * 0.52, 18, 3, 5, '#5D4037')
  drawDeskLamp(w * 0.52 + 1, 16, '#F5DEB3')
  
  // ===== 右侧房间：机房+休息 =====
  // CENTRAL PERK招牌
  drawCentralPerkSign(w * 0.7, 2, 12, 6)
  
  // 服务器机柜
  drawServerCabinet(w * 0.7, 17, 6, 9)
  drawServerCabinet(w * 0.77, 17, 6, 9)
  // 告警灯
  drawAlertLight(w * 0.69, 15.5, blink)
  drawAlertLight(w * 0.83, 15.5, blink)
  // WARNING
  drawRect(w * 0.73, 14.5, 5, 1.5, '#FFFF00')
  drawText('!', w * 0.74, 15.5, '#000000', 3)
  // 文件柜
  drawRect(w * 0.83, 20, 4, 7, '#808080')
  // 边柜+台灯
  drawRect(w * 0.8, 26, 4, 5, '#5D4037')
  drawDeskLamp(w * 0.81, 24, '#F5DEB3')
  
  // 床
  drawBed(w * 0.7, 29, 9, 6)
  // 床尾绿植
  drawPotAndSucculent(w * 0.79, 31)
  
  // ===== 底部横幅 =====
  drawBanner(w)
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

function handleResize() {
  if (!canvasRef.value || !canvasRef.value.parentElement) return
  const container = canvasRef.value.parentElement
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  
  scale = Math.min(canvas.width / 100, canvas.height / 45)
  scale = Math.max(1.5, Math.min(scale, 8))
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
