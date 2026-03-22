<template>
  <div class="container">
    <div ref="canvasContainer" class="canvas"></div>
    
    <!-- 底部UI面板 -->
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

// 配色
const C = {
  floor1: 0xD4A574,
  floor2: 0xC49A6C,
  wall: 0xE8DCC4,
  wallDark: 0xD4C4A8,
  desk: 0x8B6914,
  deskTop: 0xD4B86A,
  chair: 0x4A6FA5,
  screen: 0x00D9FF,
  screenOff: 0x2A2A3A,
  window: 0x87CEEB,
  curtain: 0xE8B4B8,
  sofa: 0xC75D5D,
  bed: 0x8B9DC4,
  bookshelf: 0x8B4513,
  coffee: 0x6F4E37,
  server: 0x4A4A4A,
  serverLight: 0xFF0000,
  plant: 0x4CAF50,
  cat: 0xFFA500,
  poster: 0xE74C3C,
  body1: 0x7CFC00,
  body2: 0x9932CC,
  body3: 0x00CED1,
}

function init() {
  const container = canvasContainer.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB)

  // 全屏显示
  const width = container.clientWidth
  const height = container.clientHeight
  const aspect = width / height

  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
  camera.position.set(0, 15, 30)
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
  window.addEventListener('resize', onWindowResize)
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
  // 地板
  for (let i = -5; i < 5; i++) {
    for (let j = -4; j < 4; j++) {
      const color = (i + j) % 2 === 0 ? C.floor1 : C.floor2
      scene.add(box(3, 0.2, 3, color, i * 3, 0, j * 3))
    }
  }
  
  // 墙壁
  scene.add(box(30, 14, 0.3, C.wall, 0, 7, -12))
  scene.add(box(0.3, 14, 24, C.wall, -15, 7, 0))
}

function createFurniture() {
  // 窗帘
  for (let i = 0; i < 4; i++) {
    scene.add(box(0.2, 10, 1, C.curtain, -12 + i * 6, 9, -11.5))
    scene.add(box(0.2, 10, 1, C.curtain, -8 + i * 6, 9, -11.5))
    scene.add(box(3.5, 6, 0.2, C.window, -10 + i * 6, 9, -11.8))
  }

  // 4个工作位
  const deskPositions = [[-9, 3], [-3, 3], [3, 3], [9, 3]]
  deskPositions.forEach((pos, i) => {
    scene.add(box(4, 0.3, 2.5, C.deskTop, pos[0], 3.5, pos[1]))
    scene.add(box(0.3, 3.5, 0.3, C.desk, pos[0] - 1.7, 1.75, pos[1] - 1))
    scene.add(box(0.3, 3.5, 0.3, C.desk, pos[0] + 1.7, 1.75, pos[1] - 1))
    scene.add(box(0.3, 3.5, 0.3, C.desk, pos[0] - 1.7, 1.75, pos[1] + 1))
    scene.add(box(0.3, 3.5, 0.3, C.desk, pos[0] + 1.7, 1.75, pos[1] + 1))
    
    scene.add(box(2, 1.5, 0.2, 0x333333, pos[0], 5, pos[1] - 1.2))
    scene.add(box(1.5, 1, 0.1, i < 2 ? C.screen : C.screenOff, pos[0], 5, pos[1] - 1.1))
    scene.add(box(0.8, 0.2, 0.6, 0x444444, pos[0], 3.7, pos[1] + 0.5))
    scene.add(box(1.5, 0.15, 0.8, 0x555555, pos[0], 3.7, pos[1] + 0.9))
    scene.add(box(1.2, 0.25, 1.2, C.chair, pos[0], 1, pos[1] + 1.8))
    scene.add(box(1.2, 2, 0.25, C.chair, pos[0], 2.2, pos[1] + 2.3))
  })

  // 沙发
  scene.add(box(6, 1.2, 2.5, C.sofa, -12, 0.6, -5))
  scene.add(box(6, 2, 0.5, C.sofa, -12, 1.8, -6.8))

  // 床
  scene.add(box(5, 1, 4, C.bed, 10, 0.5, -6))
  scene.add(box(5, 2, 0.5, 0xFFFFFF, 10, 1.5, -8))

  // 书架
  for (let i = 0; i < 2; i++) {
    scene.add(box(2.5, 8, 0.6, C.bookshelf, -14, 4, -5 + i * 10))
    for (let j = 0; j < 6; j++) {
      const colors = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF1C40F, 0x9B59B6, 0xE67E22]
      scene.add(box(2, 0.5, 1.2, colors[j], -14, 1 + j * 1.2, -5 + i * 10))
    }
  }

  // 咖啡机
  scene.add(box(1.5, 2.5, 1.5, C.coffee, 12, 1.25, 5))
  scene.add(box(1.2, 0.5, 1.2, 0xCCCCCC, 12, 2.75, 5))

  // 服务器
  scene.add(box(3, 7, 1.5, C.server, 12, 3.5, -3))
  for (let i = 0; i < 6; i++) {
    const light = box(0.5, 0.5, 0.1, C.serverLight, 12.4, 6.5 - i * 1, -2.2)
    serverLights.push(light)
    scene.add(light)
  }

  // 盆栽
  scene.add(box(2, 3, 2, 0x8B4513, -12, 1.5, 6))
  scene.add(box(2.5, 2.5, 2.5, C.plant, -12, 4, 6))

  // 猫
  scene.add(box(2.5, 1.2, 2, C.cat, 8, 0.6, 6))
  scene.add(box(0.6, 0.6, 0.6, 0xFF8800, 7, 1.4, 6.5))

  // 画
  scene.add(box(5, 3.5, 0.2, C.poster, 12, 10, -11.5))
  scene.add(box(4, 2.5, 0.1, 0xFFFFFF, 12, 10, -11.35))

  // 时钟
  scene.add(box(2, 2, 0.2, 0xFFFFFF, -13, 14, -11.5))

  // 招牌
  scene.add(box(8, 2, 0.3, 0xFFA500, 0, 12, -11.5))
}

function createCharacters() {
  const positions = [[-9, 6], [-3, 6], [3, 6], [9, 6]]
  const bodies = [C.body1, C.body2, C.body3, 0xFF6B6B]
  
  positions.forEach((pos, i) => {
    const group = new THREE.Group()
    
    group.add(box(1.2, 1.8, 1, bodies[i], 0, 1.9, 0))
    group.add(box(1.1, 1.1, 1.1, 0x90EE90, 0, 3.65, 0))
    group.add(box(0.3, 0.35, 0.15, 0x000000, -0.35, 3.8, 0.55))
    group.add(box(0.3, 0.35, 0.15, 0x000000, 0.35, 3.8, 0.55))
    group.add(box(0.1, 0.1, 0.05, 0xFFFFFF, -0.3, 3.85, 0.6))
    group.add(box(0.1, 0.1, 0.05, 0xFFFFFF, 0.4, 3.85, 0.6))
    group.add(box(0.25, 0.18, 0.1, 0xFFAAAA, -0.5, 3.5, 0.55))
    group.add(box(0.25, 0.18, 0.1, 0xFFAAAA, 0.5, 3.5, 0.55))
    group.add(box(0.3, 0.15, 0.1, 0xFF6B6B, 0, 3.35, 0.55))
    group.add(box(0.4, 0.55, 0.4, bodies[i], -0.65, 4.2, 0))
    group.add(box(0.4, 0.55, 0.4, bodies[i], 0.65, 4.2, 0))
    group.add(box(0.25, 0.4, 0.25, 0xFFAAAA, -0.65, 4.2, 0.1))
    group.add(box(0.25, 0.4, 0.25, 0xFFAAAA, 0.65, 4.2, 0.1))
    group.add(box(0.4, 0.7, 0.4, 0x333333, -0.35, 0.35, 0))
    group.add(box(0.4, 0.7, 0.4, 0x333333, 0.35, 0.35, 0))

    group.position.set(pos[0], 0, pos[1])
    group.userData = { 
      baseZ: pos[1], 
      walkZ: pos[1] + 3.5,
      isWorking: false,
      index: i
    }
    
    scene.add(group)
    characters.push(group)
  })
}

function createDecor() {}

function updateCharacters() {
  const time = Date.now() * 0.001
  const isWorking = systemStatus.value === 'working'
  
  characters.forEach((char, i) => {
    char.userData.isWorking = isWorking
    
    if (isWorking) {
      char.position.y = Math.sin(time * 6 + i) * 0.12
      char.position.z = char.userData.walkZ + Math.sin(time * 0.8) * 1.2
    } else {
      char.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.025)
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
  
  const width = container.clientWidth
  const height = container.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function removeVisitor(id) {
  visitors.value = visitors.value.filter(v => v.id !== id)
}

onMounted(() => {
  setTimeout(init, 100)
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

.container { 
  width: 100vw; 
  height: 100vh; 
  display: flex; 
  flex-direction: column; 
}

.canvas { 
  flex: 1; 
  width: 100%;
  overflow: hidden;
}
.canvas canvas {
  display: block;
}

.ui-panel {
  height: 110px;
  min-height: 110px;
  background: linear-gradient(180deg, #2C2C3E 0%, #1A1A2E 100%);
  border-top: 4px solid #E74C3C;
  display: flex;
  padding: 8px;
  gap: 8px;
}

.ui-section {
  background: #3A3A4A;
  border: 3px solid #000;
  padding: 6px;
}

.ui-section.notes { flex: 1; }
.ui-section.status { width: 260px; }
.ui-section.visitors { flex: 1; }

.section-title {
  font-size: 10px;
  color: #F1C40F;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.notes-content p {
  font-size: 8px;
  color: #AAA;
  margin: 1px 0;
}

.status-buttons {
  display: flex;
  gap: 4px;
}

.status-btn {
  flex: 1;
  background: #2A2A3A;
  border: 2px solid #000;
  color: #FFF;
  padding: 4px 2px;
  font-size: 8px;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.status-btn:hover { background: #4A4A5A; }
.status-btn.active { background: #E74C3C; border-color: #FFF; }
.status-btn.alert.active { background: #FF0000; animation: blink 0.5s infinite; }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.btn-icon { font-size: 12px; }

.visitor-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 60px;
  overflow-y: auto;
}

.visitor-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #2A2A3A;
  padding: 3px 5px;
  font-size: 8px;
}

.visitor-avatar { font-size: 12px; }
.visitor-name { flex: 1; color: #CCC; }

.leave-btn {
  background: #E74C3C;
  border: 1px solid #000;
  color: #FFF;
  font-size: 7px;
  padding: 2px 4px;
  cursor: pointer;
  font-family: inherit;
}
</style>
