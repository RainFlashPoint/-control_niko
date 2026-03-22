<template>
  <div class="container">
    <div ref="canvasContainer" class="canvas"></div>
    
    <div class="side-panel">
      <div class="panel-title">🐉 龙虾状态</div>
      <div class="status-list">
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
        <div class="status-item">
          <span class="status-icon">🎯</span>
          <span class="status-label">技能</span>
          <span class="status-value">9 个</span>
        </div>
        <div class="status-item">
          <span class="status-icon">⏰</span>
          <span class="status-label">定时任务</span>
          <span class="status-value">3 个</span>
        </div>
      </div>
    </div>
    
    <div class="ui-panel">
      <div class="ui-section notes">
        <div class="section-title">📝 昨日小记</div>
        <div class="notes-content">
          <p>• 助手A 完成代码审查</p>
          <p>• 助手B 处理用户请求</p>
          <p>• 系统运行稳定</p>
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
import * as THREE from 'three'

const canvasContainer = ref(null)
const systemStatus = ref('idle')
const visitors = ref([
  { id: 1, name: '访客A', avatar: '🧑‍💻' },
  { id: 2, name: '访客B', avatar: '👨‍🔬' }
])

let scene, camera, renderer, characters = [], serverLights = []
let animationId = null

function init() {
  const container = canvasContainer.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)

  const width = container.clientWidth - 220
  const height = container.clientHeight - 110
  const aspect = width / height

  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
  camera.position.set(0, 12, 25)
  camera.lookAt(0, 2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  const sun = new THREE.DirectionalLight(0xffffff, 0.5)
  sun.position.set(20, 30, 20)
  scene.add(sun)

  createRoom()
  createFurniture()
  createCharacters()
  createDecor()

  animate()
}

function box(w, h, d, color, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  )
  mesh.position.set(x, y, z)
  return mesh
}

function createRoom() {
  for (let i = -8; i < 8; i++) {
    for (let j = -6; j < 6; j++) {
      const color = (i + j) % 2 === 0 ? 0xD4A574 : 0xC49A6C
      scene.add(box(3, 0.2, 3, color, i * 3, 0, j * 3))
    }
  }
  scene.add(box(50, 16, 0.5, 0xE8DCC4, 0, 8, -18))
  scene.add(box(0.5, 16, 35, 0xD4C4A8, -25, 8, 0))
  scene.add(box(0.5, 16, 35, 0xD4C4A8, 25, 8, 0))
}

function createFurniture() {
  for (let i = 0; i < 5; i++) {
    scene.add(box(0.3, 12, 1.2, 0xE8B4B8, -20 + i * 8, 10, -17.5))
    scene.add(box(0.3, 12, 1.2, 0xE8B4B8, -16 + i * 8, 10, -17.5))
    scene.add(box(4, 7, 0.3, 0x87CEEB, -18 + i * 8, 10, -17.8))
  }

  const deskPositions = [[-16, 4], [-8, 4], [0, 4], [8, 4], [16, 4]]
  deskPositions.forEach((pos, i) => {
    scene.add(box(4, 0.3, 2.5, 0xD4B86A, pos[0], 3.5, pos[1]))
    scene.add(box(0.3, 3.5, 0.3, 0x8B6914, pos[0] - 1.7, 1.75, pos[1] - 1))
    scene.add(box(0.3, 3.5, 0.3, 0x8B6914, pos[0] + 1.7, 1.75, pos[1] - 1))
    scene.add(box(0.3, 3.5, 0.3, 0x8B6914, pos[0] - 1.7, 1.75, pos[1] + 1))
    scene.add(box(0.3, 3.5, 0.3, 0x8B6914, pos[0] + 1.7, 1.75, pos[1] + 1))
    scene.add(box(2, 1.5, 0.2, 0x333333, pos[0], 5, pos[1] - 1.2))
    scene.add(box(1.5, 1, 0.1, i < 2 ? 0x00D9FF : 0x2A2A3A, pos[0], 5, pos[1] - 1.1))
    scene.add(box(0.8, 0.2, 0.6, 0x444444, pos[0], 3.7, pos[1] + 0.5))
    scene.add(box(1.5, 0.15, 0.8, 0x555555, pos[0], 3.7, pos[1] + 0.9))
    scene.add(box(1.2, 0.25, 1.2, 0x4A6FA5, pos[0], 1, pos[1] + 1.8))
    scene.add(box(1.2, 2, 0.25, 0x4A6FA5, pos[0], 2.2, pos[1] + 2.3))
  })

  scene.add(box(8, 1.5, 3, 0xC75D5D, -20, 0.75, -8))
  scene.add(box(8, 2.5, 0.6, 0xC75D5D, -20, 2, -9.8))
  scene.add(box(6, 1.2, 5, 0x8B9DC4, 18, 0.6, -10))
  scene.add(box(6, 2.5, 0.6, 0xFFFFFF, 18, 1.8, -12.8))

  for (let i = 0; i < 2; i++) {
    scene.add(box(3, 10, 0.8, 0x8B4513, -23, 5, -5 + i * 12))
    for (let j = 0; j < 7; j++) {
      const colors = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF1C40F, 0x9B59B6, 0xE67E22, 0x1ABC9C]
      scene.add(box(2.5, 0.6, 1.5, colors[j], -23, 1.3 + j * 1.3, -5 + i * 12))
    }
  }

  scene.add(box(2, 3, 2, 0x6F4E37, 22, 1.5, 8))
  scene.add(box(1.5, 0.6, 1.5, 0xCCCCCC, 22, 3.3, 8))
  scene.add(box(4, 9, 2, 0x4A4A4A, 22, 4.5, -5))
  for (let i = 0; i < 8; i++) {
    const light = box(0.6, 0.6, 0.15, 0xFF0000, 22.5, 8 - i * 1, -3.9)
    serverLights.push(light)
    scene.add(light)
  }

  scene.add(box(2.5, 4, 2.5, 0x8B4513, -20, 2, 10))
  scene.add(box(3, 3.5, 3.5, 0x4CAF50, -20, 5.5, 10))
  scene.add(box(3, 1.5, 2.5, 0xFFA500, 14, 0.75, 10))
  scene.add(box(0.8, 0.8, 0.8, 0xFF8800, 13, 1.8, 10.5))
  scene.add(box(6, 4, 0.3, 0xE74C3C, 22, 12, -17.5))
  scene.add(box(5, 3, 0.15, 0xFFFFFF, 22, 12, -17.35))
  scene.add(box(2.5, 2.5, 0.3, 0xFFFFFF, -22, 15, -17.5))
  scene.add(box(10, 2.5, 0.4, 0xFFA500, 0, 14, -17.5))
}

function createCharacters() {
  const positions = [[-16, 8], [-8, 8], [0, 8], [8, 8], [16, 8]]
  
  const styles = [
    { body: 0x5D8A5D, eyes: 0xFFFFFF, accent: 0x3D6B3D },
    { body: 0x8B6B8B, eyes: 0xFF6B6B, accent: 0x5D5D5D },
    { body: 0x6B8B9B, eyes: 0x4ECDC4, accent: 0x3D5D5D },
    { body: 0x9B6B5B, eyes: 0xFFD93D, accent: 0x6D5D4D },
    { body: 0x8B7B6B, eyes: 0xFF6B6B, accent: 0x5D4D4D },
  ]
  
  positions.forEach((pos, i) => {
    const s = styles[i]
    const g = new THREE.Group()
    
    g.add(box(2, 2.5, 1.5, s.body, 0, 2.25, 0))
    g.add(box(2.1, 2, 0.3, s.accent, 0, 2, 0.7))
    g.add(box(1.8, 1.8, 1.8, s.body, 0, 4.4, 0))
    g.add(box(1.4, 0.8, 0.3, 0xFFFFFF, 0, 4.5, 0.9))
    g.add(box(0.4, 0.4, 0.2, s.eyes, -0.35, 4.5, 1.0))
    g.add(box(0.4, 0.4, 0.2, s.eyes, 0.35, 4.5, 1.0))
    g.add(box(0.15, 0.15, 0.1, 0xFFFFFF, -0.25, 4.55, 1.1))
    g.add(box(0.15, 0.15, 0.1, 0xFFFFFF, 0.45, 4.55, 1.1))
    g.add(box(0.5, 0.2, 0.15, 0x333333, 0, 3.9, 1.0))
    g.add(box(0.3, 0.6, 0.3, s.body, -0.9, 5.3, 0))
    g.add(box(0.3, 0.6, 0.3, s.body, 0.9, 5.3, 0))
    g.add(box(0.15, 0.4, 0.15, s.eyes, -0.9, 5.7, 0))
    g.add(box(0.15, 0.4, 0.15, s.eyes, 0.9, 5.7, 0))
    g.add(box(0.5, 0.8, 0.5, s.body, -0.5, 0.4, 0))
    g.add(box(0.5, 0.8, 0.5, s.body, 0.5, 0.4, 0))
    g.add(box(0.7, 0.3, 0.8, s.accent, -0.5, 0.15, 0.1))
    g.add(box(0.7, 0.3, 0.8, s.accent, 0.5, 0.15, 0.1))

    g.position.set(pos[0], 0, pos[1])
    g.userData = { baseZ: pos[1], walkZ: pos[1] + 4, isWorking: false, index: i }
    scene.add(g)
    characters.push(g)
  })
}

function createDecor() {}

function updateCharacters() {
  const time = Date.now() * 0.001
  const isWorking = systemStatus.value === 'working'
  
  characters.forEach((char, i) => {
    if (isWorking) {
      char.position.y = Math.sin(time * 8 + i * 0.5) * 0.15
      char.position.z = char.userData.walkZ + Math.sin(time * 1.2) * 1.5
    } else {
      char.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.02)
      char.position.z = char.userData.baseZ
      char.position.y = 0
    }
  })

  const blink = Math.sin(time * 4) > 0
  serverLights.forEach(light => {
    light.material.color.setHex(blink ? 0xFF0000 : 0x550000)
  })
}

function animate() {
  animationId = requestAnimationFrame(animate)
  updateCharacters()
  renderer.render(scene, camera)
}

function onWindowResize() {
  const container = canvasContainer.value
  if (!container) return
  const width = container.clientWidth - 220
  const height = container.clientHeight - 110
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function removeVisitor(id) {
  visitors.value = visitors.value.filter(v => v.id !== id)
}

onMounted(() => {
  setTimeout(init, 100)
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onWindowResize)
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
body { font-family: 'Courier New', monospace; background: #1a1a2e; }

.container { width: 100vw; height: 100vh; display: flex; flex-direction: column; position: relative; }
.canvas { flex: 1; overflow: hidden; }
.canvas canvas { display: block; }

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
