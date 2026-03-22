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

// ===== 绘制函数 =====

// 小龙虾
function drawLobster(x, y, s) {
  drawRect(x - s*2, y, s*4, s*1.5, '#E74C3C')
  drawRect(x - s*2.5, y + s*1.2, s*5, s*1, '#E74C3C')
  drawRect(x - s*1.5, y + s*2, s*1, s*0.8, '#E74C3C')
  drawRect(x - s*0.5, y + s*2, s*1, s*0.8, '#E74C3C')
  drawRect(x + s*0.5, y + s*2, s*1, s*0.8, '#E74C3C')
  // 钳子
  drawRect(x - s*3, y + s*0.3, s*1, s*0.6, '#FF6B6B')
  drawRect(x + s*2, y + s*0.3, s*1, s*0.6, '#FF6B6B')
  // 眼睛
  drawRect(x - s*0.5, y - s*0.3, s*0.5, s*0.5, '#FFFFFF')
  drawRect(x + s*0.2, y - s*0.3, s*0.5, s*0.5, '#FFFFFF')
  drawRect(x - s*0.4, y - s*0.2, s*0.3, s*0.3, '#000000')
  drawRect(x + s*0.3, y - s*0.2, s*0.3, s*0.3, '#000000')
}

// E.T.海报
function drawETPoster(x, y, w, h) {
  drawRect(x, y, w, h, '#1E3A5F') // 蓝色背景
  drawRect(x + w*0.3, y + h*0.1, w*0.4, h*0.3, '#000000') // 月亮
  // 自行车
  drawRect(x + w*0.2, y + h*0.5, w*0.1, h*0.05, '#CCCCCC')
  drawRect(x + w*0.6, y + h*0.5, w*0.1, h*0.05, '#CCCCCC')
  // E.T.
  drawRect(x + w*0.35, y + h*0.4, w*0.3, h*0.25, '#3D5C3D')
  drawRect(x + w*0.3, y + h*0.5, w*0.05, h*0.2, '#3D5C3D')
  drawRect(x + w*0.55, y + h*0.5, w*0.05, h*0.2, '#3D5C3D')
  // E.T.文字
  drawText('E.T.', x + w*0.38, y + h*0.8, '#FFFFFF', 10)
}

// 老友记海报
function drawFriendsPoster(x, y, w, h) {
  drawRect(x, y, w, h, '#8B4513') // 相框
  drawRect(x + 1, y + 1, w - 2, h - 2, '#2C3E50') // 背景
  // 6个小人
  for (let i = 0; i < 6; i++) {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#DDA0DD']
    drawRect(x + 3 + i * (w/6 - 1), y + 3, w/6 - 2, h - 6, colors[i])
  }
}

// CENTRAL PERK招牌
function drawCentralPerkSign(x, y, w, h) {
  drawRect(x, y, w, h, '#228B22') // 绿色底
  drawRect(x + 2, y + 2, w - 4, h - 4, '#006400')
  // 咖啡杯
  drawRect(x + w*0.1, y + h*0.3, w*0.25, h*0.4, '#FFFFFF')
  drawRect(x + w*0.1, y + h*0.5, w*0.3, h*0.1, '#FFFFFF')
  drawRect(x + w*0.35, y + h*0.35, w*0.05, h*0.25, '#FFFFFF')
  // 文字
  drawText('CENTRAL PERK', x + w*0.4, y + h*0.5, '#FFFFFF', 8)
}

// 台灯
function drawDeskLamp(x, y, w, h, shadeColor) {
  drawRect(x, y, w*0.3, h*0.1, '#8B4513') // 底座
  drawRect(x + w*0.1, y - h*0.6, w*0.1, h*0.6, '#8B4513') // 灯杆
  drawRect(x - w*0.1, y - h*0.7, w*0.5, h*0.4, shadeColor) // 灯罩
  drawRect(x + w*0.05, y - h*0.6, w*0.3, h*0.1, '#FFFF00') // 灯光
}

// 落地灯
function drawFloorLamp(x, y, h) {
  drawRect(x, y, 2, h, '#8B4513') // 杆
  drawRect(x - 3, y - 5, 8, 5, '#F5DEB3') // 灯罩
  drawRect(x, y - 4, 2, 1, '#FFFF00') // 灯光
}

// 花盆+多肉
function drawPotAndSucculent(x, y) {
  drawRect(x, y, 6, 5, '#8B4513') // 花盆
  drawRect(x, y - 3, 6, 3, '#228B22') // 多肉
  drawRect(x + 1, y - 4, 2, 2, '#32CD32')
  drawRect(x + 3, y - 5, 2, 2, '#32CD32')
}

// 大型绿植
function drawBigPlant(x, y) {
  drawRect(x, y, 8, 7, '#8B4513') // 盆
  // 叶子
  drawRect(x + 1, y - 10, 2, 10, '#228B22')
  drawRect(x + 3, y - 12, 2, 12, '#2ECC71')
  drawRect(x + 5, y - 8, 2, 8, '#228B22')
  drawRect(x, y - 6, 2, 6, '#32CD32')
  drawRect(x + 6, y - 6, 2, 6, '#32CD32')
}

// 猫窝+猫
function drawCatBed(x, y) {
  drawRect(x, y, 8, 4, '#A0A0A0') // 猫窝
  drawRect(x, y - 2, 8, 2, '#A0A0A0')
  drawRect(x - 1, y + 1, 1, 2, '#A0A0A0')
  drawRect(x + 8, y + 1, 1, 2, '#A0A0A0')
  // 橘猫
  drawRect(x + 2, y - 3, 4, 3, '#FF8C00')
  drawRect(x + 3, y - 4, 2, 1, '#FF8C00')
}

// 幽灵
function drawGhost(x, y) {
  drawRect(x, y, 5, 6, '#90EE90') // 身体
  drawRect(x + 1, y - 1, 3, 1, '#90EE90') // 头
  drawRect(x - 1, y + 1, 1, 3, '#90EE90')
  drawRect(x + 5, y + 1, 1, 3, '#90EE90')
  // 眼睛
  drawRect(x + 1, y + 1, 1, 1, '#000000')
  drawRect(x + 3, y + 1, 1, 1, '#000000')
}

// 服务器机柜
function drawServerCabinet(x, y, w, h) {
  drawRect(x, y, w, h, '#1E3A5F') // 深蓝
  drawRect(x + 1, y + 1, w - 2, h - 2, '#2C3E50')
  // 绿灯
  for (let i = 0; i < 5; i++) {
    drawRect(x + 2, y + 2 + i * 3, 2, 1, '#00FF00')
  }
}

// 告警灯
function drawAlertLight(x, y, blink) {
  const color = blink ? '#FF0000' : '#880000'
  drawRect(x, y, 3, 3, color)
  drawRect(x - 1, y - 1, 5, 5, color)
}

// 床
function drawBed(x, y, w, h) {
  drawRect(x, y, w, h, '#F5DEB3') // 床架
  drawRect(x + 1, y + 1, w - 2, h * 0.7, '#FFFFFF') // 床垫
  drawRect(x + 2, y + 2, w * 0.3, h * 0.5, '#FFFFFF') // 枕头
}

// 咖啡机
function drawCoffeeMachine(x, y) {
  drawRect(x, y, 8, 10, '#A0A0A0')
  drawRect(x + 1, y + 1, 6, 3, '#505050') // 显示屏
  drawRect(x + 1, y + 5, 6, 4, '#D0D0D0') // 出咖啡口
  // 蒸汽
  if (frame % 4 < 2) {
    drawRect(x + 3, y - 2, 1, 2, '#CCCCCC')
    drawRect(x + 5, y - 3, 1, 2, '#CCCCCC')
  }
}

// 沙发
function drawSofa(x, y, w, h) {
  drawRect(x, y, w, h, '#F5DEB3') // 沙发
  drawRect(x, y - 2, w, 2, '#DEB887') // 靠背
  drawRect(x, y + h - 2, w, 2, '#DEB887') // 扶手
  // 抱枕
  drawRect(x + 2, y + 2, 4, 3, '#8B4513')
}

// 茶几
function drawCoffeeTable(x, y, w, h) {
  drawRect(x, y, w, h, '#8B4513')
  drawRect(x + 1, y + 1, w - 2, h - 2, '#A0522D')
}

// 人物（紫色多角星怪物）
function drawPurpleMonster(x, y) {
  // 身体
  drawRect(x, y, 8, 7, '#9B59B6')
  // 角
  drawRect(x + 1, y - 3, 2, 3, '#9B59B6')
  drawRect(x + 5, y - 3, 2, 3, '#9B59B6')
  drawRect(x + 3, y - 4, 2, 4, '#F1C40F') // 黄色太阳装饰
  // 钳子手臂
  drawRect(x - 3, y + 2, 3, 2, '#E74C3C')
  drawRect(x + 8, y + 2, 3, 2, '#E74C3C')
  // 眼睛
  drawRect(x + 2, y + 2, 2, 2, '#FFFFFF')
  drawRect(x + 5, y + 2, 2, 2, '#FFFFFF')
  drawRect(x + 2, y + 2, 1, 1, '#000000')
  drawRect(x + 5, y + 2, 1, 1, '#000000')
  // 蓝色水滴（出汗）
  if (frame % 6 < 3) {
    drawRect(x - 1, y + 1, 1, 1, '#3498DB')
    drawRect(x + 8, y, 1, 1, '#3498DB')
  }
}

// 对话气泡
function drawSpeechBubble(x, y, w, h, text1, text2) {
  drawRect(x, y, w, h, '#FFFFFF')
  drawRect(x, y + h - 2, 4, 2, '#FFFFFF')
  drawRect(x + 4, y + h, 2, 2, '#FFFFFF')
  // 小三角
  drawRect(x + 4, y + h, 2, 2, '#FFFFFF')
  drawText(text1, x + 2, y + 5, '#000000', 4)
  drawText(text2, x + 2, y + 10, '#000000', 4)
}

// 绿色小恐龙
function drawGreenDinosaur(x, y) {
  // 身体
  drawRect(x, y, 6, 5, '#2ECC71')
  // 头
  drawRect(x - 2, y - 2, 4, 3, '#2ECC71')
  // 眼睛
  drawRect(x - 1, y - 1, 1, 1, '#000000')
  drawRect(x + 2, y - 1, 1, 1, '#000000')
  // 尾巴
  drawRect(x + 5, y + 2, 2, 1, '#2ECC71')
}

// 办公桌
function drawDesk(x, y, w, h) {
  drawRect(x, y, w, h, '#8B4513') // 桌面
  drawRect(x, y + h, 2, 4, '#5D4037') // 桌腿
  drawRect(x + w - 2, y + h, 2, 4, '#5D4037')
  // 笔记本
  drawRect(x + 2, y - 4, 6, 4, '#C0C0C0')
  drawRect(x + 3, y - 3, 4, 2, '#00D9FF')
  // 马克杯
  drawRect(x + w - 4, y - 3, 2, 3, '#FFFFFF')
  // 小花盆栽
  drawRect(x + w - 7, y - 2, 2, 2, '#FF69B4') // 花
  drawRect(x + w - 7, y, 2, 2, '#228B22') // 叶
}

// 椅子
function drawChair(x, y) {
  drawRect(x, y, 6, 4, '#5D4037')
  drawRect(x + 1, y - 3, 4, 3, '#5D4037')
}

// 底部横幅
function drawBanner(w) {
  const bannerW = 60
  const bannerH = 6
  const x = (w - bannerW) / 2
  const y = 2
  drawRect(x, y, bannerW, bannerH, '#5D4037')
  // 星星
  drawRect(x - 2, y + 2, 2, 2, '#FFD700')
  drawRect(x + bannerW, y + 2, 2, 2, '#FFD700')
  // 文字
  drawText('老袁小龙虾的办公室', x + 5, y + 4, '#FFD700', 5)
}

// ===== 主场景绘制 =====
function drawScene() {
  const w = canvas.width / scale
  const h = canvas.height / scale
  const blink = frame % 8 < 4
  
  // 地板 - 棋盘格
  for (let i = 0; i < w; i += 4) {
    for (let j = 20; j < h; j += 4) {
      const color = ((i + j) / 4) % 2 === 0 ? '#F5DEB3' : '#DEB887'
      drawRect(i, j, 4, 4, color)
    }
  }
  
  // 地毯区域（中间休闲区）
  drawRect(w * 0.25, h * 0.5, w * 0.5, h * 0.25, '#FFF8DC')
  
  // 墙壁
  for (let i = 0; i < w; i += 4) {
    for (let j = 0; j < 20; j += 4) {
      drawRect(i, j, 4, 4, '#F5E6C8')
    }
  }
  
  // 护墙板
  drawRect(0, 16, w, 3, '#DEB887')
  
  // ===== 左侧办公区 =====
  // E.T.海报
  drawETPoster(3, 3, 10, 10)
  
  // 办公桌
  drawDesk(3, 25, 14, 2)
  // 椅子
  drawChair(6, 22)
  // 紫色怪物
  drawPurpleMonster(5, 23)
  // 台灯
  drawDeskLamp(14, 23, 3, 5, '#F5DEB3')
  
  // 绿色恐龙
  drawGreenDinosaur(6, 30)
  // 对话气泡
  drawSpeechBubble(3, 24, 12, 8, '我在休息区待命', '前端情报官')
  
  // 猫窝+猫
  drawCatBed(2, 32)
  // 幽灵
  drawGhost(15, 33)
  // 花盆+多肉
  drawPotAndSucculent(20, 30)
  // 边柜
  drawRect(26, 26, 5, 8, '#5D4037')
  // 老友记相框
  drawFriendsPoster(27, 24, 3, 4)
  // 落地灯
  drawFloorLamp(32, 27, 8)
  
  // ===== 中间休闲区 =====
  // 老友记挂毯
  drawRect(w * 0.35, 3, 20, 8, '#228B22')
  drawText("HOW YOU DOIN'", w * 0.37, 7, '#FFFFFF', 5)
  drawText("FRIENDS", w * 0.42, 10, '#FFFFFF', 4)
  
  // 沙发
  drawSofa(w * 0.35, 28, 14, 6)
  // 茶几
  drawCoffeeTable(w * 0.42, 35, 10, 4)
  // 咖啡机
  drawCoffeeMachine(w * 0.44, 32)
  // 马克杯
  drawRect(w * 0.46, 34, 2, 2, '#FFFFFF')
  drawRect(w * 0.49, 34, 2, 2, '#FFFFFF')
  // 大型绿植
  drawBigPlant(w * 0.52, 28)
  // 边柜+台灯
  drawRect(w * 0.35, 26, 4, 6, '#5D4037')
  drawDeskLamp(w * 0.35, 24, 3, 4, '#F5DEB3')
  drawRect(w * 0.53, 26, 4, 6, '#5D4037')
  drawDeskLamp(w * 0.53, 24, 3, 4, '#F5DEB3')
  
  // ===== 右侧机房/休息区 =====
  // CENTRAL PERK招牌
  drawCentralPerkSign(w * 0.75, 3, 15, 8)
  
  // 服务器机柜
  drawServerCabinet(w * 0.75, 22, 8, 12)
  drawServerCabinet(w * 0.83, 22, 8, 12)
  // 告警灯
  drawAlertLight(w * 0.74, 20, blink)
  drawAlertLight(w * 0.91, 20, blink)
  // 警告标识
  drawRect(w * 0.8, 18, 6, 2, '#FFFF00')
  drawText('WARNING', w * 0.81, 19, '#000000', 3)
  // 文件柜
  drawRect(w * 0.91, 26, 5, 10, '#808080')
  // 边柜+台灯
  drawRect(w * 0.88, 36, 5, 6, '#5D4037')
  drawDeskLamp(w * 0.89, 34, 3, 4, '#F5DEB3')
  
  // 床
  drawBed(w * 0.75, 38, 12, 8)
  // 床尾绿植
  drawPotAndSucculent(w * 0.87, 42)
  
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
  
  scale = Math.min(canvas.width / 160, canvas.height / 55)
  scale = Math.max(1, Math.min(scale, 8))
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
