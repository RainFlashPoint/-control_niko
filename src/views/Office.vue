<template>
  <div class="container">
    <div class="canvas-container">
      <img ref="bgImage" src="/bg-scene.png" class="bg-scene" @load="onBgLoad" />
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
const bgImage = ref(null)
const systemStatus = ref('idle')
const visitors = ref([
  { id: 1, name: '访客A', avatar: '🧑‍💻' },
  { id: 2, name: '访客B', avatar: '👨‍🔬' }
])

let ctx, canvas
let animationId = null
let lastTime = 0
const FPS = 8
const frameTime = 1000 / FPS

let frame = 0

// 角色精灵图 - 根据画布百分比定位
function getCharacterPositions(canvasWidth, canvasHeight) {
  // 背景图比例 1170:664 ≈ 16:9
  // 根据画布比例计算缩放
  const bgRatio = 1170 / 664
  const canvasRatio = canvasWidth / canvasHeight
  
  let scale, offsetX = 0, offsetY = 0
  
  if (canvasRatio > bgRatio) {
    // 画布更宽，以高度为基准
    scale = canvasHeight / 664
    offsetX = (canvasWidth - 1170 * scale) / 2
  } else {
    // 画布更高，以宽度为基准
    scale = canvasWidth / 1170
    offsetY = (canvasHeight - 664 * scale) / 2
  }
  
  const baseY = canvasHeight * 0.55
  
  return [
    { name: '蓝发', src: '/character-blue.png', x: canvasWidth * 0.05, y: baseY },
    { name: '紫发', src: '/character-purple.png', x: canvasWidth * 0.22, y: baseY },
    { name: '橙发', src: '/character-orange.png', x: canvasWidth * 0.39, y: baseY },
    { name: '绿发', src: '/character-green.png', x: canvasWidth * 0.56, y: baseY },
    { name: '粉发', src: '/character-pink.png', x: canvasWidth * 0.73, y: baseY },
  ]
}

const charImages = []
let charImagesLoaded = 0

function loadCharacterImages() {
  characters.forEach((char, index) => {
    const img = new Image()
    img.src = char.src
    img.onload = () => {
      charImages[index] = img
      charImagesLoaded++
    }
  })
}

function onBgLoad() {
  // 背景加载完成后开始渲染
  render()
}

function drawCharacters() {
  const frameCol = frame % 4 // 4帧动画
  const characters = getCharacterPositions(canvas.width, canvas.height)
  
  characters.forEach((char, index) => {
    const img = charImages[index]
    if (!img) return
    
    // 原始图片大小 1170x664，每帧 292.5x664
    const srcW = img.width / 4
    const srcH = img.height
    
    // 目标显示大小 - 屏幕宽度的15%
    const destW = canvas.width * 0.15
    const destH = destW * (srcH / srcW)
    
    ctx.drawImage(
      img,
      frameCol * srcW, 0, srcW, srcH,
      char.x, char.y, destW, destH
    )
  })
}

function render() {
  // 等待图片加载完成
  if (charImagesLoaded < characters.length) {
    animationId = requestAnimationFrame(render)
    return
  }
  
  if (!ctx || !canvas) {
    animationId = requestAnimationFrame(render)
    return
  }
  
  const now = Date.now()
  if (now - lastTime < frameTime) {
    animationId = requestAnimationFrame(render)
    return
  }
  lastTime = now
  frame++
  
  // 清空
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制角色精灵
  drawCharacters()
  
  animationId = requestAnimationFrame(render)
}

function removeVisitor(id) {
  visitors.value = visitors.value.filter(v => v.id !== id)
}

onMounted(() => {
  canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  
  // 画布铺满容器
  const container = canvasRef.value.parentElement
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  
  // 加载角色图片
  loadCharacterImages()
  
  render()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

function handleResize() {
  const container = canvasRef.value?.parentElement
  if (!container) return
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
}

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
  z-index: 1;
}

.bg-scene {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  max-width: none;
  max-height: none;
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
