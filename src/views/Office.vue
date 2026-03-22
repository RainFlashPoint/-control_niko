<template>
  <div class="container">
    <div ref="canvasContainer" class="canvas"></div>
    
    <!-- 底部UI面板 -->
    <div class="ui-panel">
      <div class="ui-section notes">
        <div class="section-title">昨日小记</div>
        <div class="notes-content">
          <p>• 助手A 完成代码审查</p>
          <p>• 助手B 处理用户请求</p>
          <p>• 系统运行稳定</p>
        </div>
      </div>
      
      <div class="ui-section status">
        <div class="section-title">Star 状态</div>
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
        <div class="section-title">访客列表</div>
        <div class="visitor-list">
          <div v-for="v in visitors" :key="v.id" class="visitor-item">
            <span class="visitor-avatar">{{ v.avatar }}</span>
            <span class="visitor-name">{{ v.name }}</span>
            <button class="leave-btn" @click="removeVisitor(v.id)">离开房间</button>
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
  { id: 1, name: '访客A', avatar: '👤' },
  { id: 2, name: '访客B', avatar: '👤' }
])

let scene, camera, renderer, characters = [], serverLights = []
let animationId = null

// 像素风配色
const C = {
  wall: 0xE8DCC4,
  floor: 0xC4A35A,
  floor2: 0xB8956E,
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
  poster1: 0xE74C3C,
  poster2: 0x3498DB,
  person: [0x7CFC00, 0x9932CC, 0x00CED1]
}

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB)

  // 等轴测
  const aspect = window.innerWidth / (window.innerHeight - 120)
  const view = 20
  camera = new THREE.OrthographicCamera(-view * aspect, view * aspect, view, -view, 1, 1000)
  camera.position.set(25, 25, 25)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: false })
  renderer.setSize(window.innerWidth, window.innerHeight - 120)
  renderer.setPixelRatio(1) // 像素风不用高分
  canvasContainer.value.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  const sun = new THREE.DirectionalLight(0xffffff, 0.4)
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
  for (let i = -4; i < 4; i++) {
    for (let j = -3; j < 3; j++) {
      const color = (i + j) % 2 === 0 ? C.floor : C.floor2
      scene.add(box(3, 0.2, 3, color, i * 3, 0, j * 3))
    }
  }
  
  // 墙壁
  scene.add(box(24, 12, 0.3, C.wall, 0, 6, -9))
  scene.add(box(0.3, 12, 18, C.wall, -12, 6, 0))
}

function createFurniture() {
  // 窗户
  for (let i = 0; i < 3; i++) {
    scene.add(box(4, 4, 0.2, C.window, -8 + i * 5, 8, -8.8))
    scene.add(box(0.2, 4.5, 1, C.curtain, -10 + i * 5, 8, -8.5))
  }

  // 3个工作区
  const deskPositions = [[-6, 2], [0, 2], [6, 2]]
  deskPositions.forEach((pos, i) => {
    // 桌子
    scene.add(box(4, 0.3, 2.5, C.deskTop, pos[0], 3, pos[1]))
    scene.add(box(0.3, 3, 0.3, C.desk, pos[0] - 1.7, 1.5, pos[1] - 0.8))
    scene.add(box(0.3, 3, 0.3, C.desk, pos[0] + 1.7, 1.5, pos[1] - 0.8))
    
    // 电脑
    scene.add(box(1.5, 1.2, 0.2, 0x333333, pos[0], 4.2, pos[1] - 1))
    scene.add(box(1.2, 0.8, 0.1, i === 1 ? C.screen : C.screenOff, pos[0], 4.2, pos[1] - 0.88))
    scene.add(box(0.8, 0.2, 0.6, 0x444444, pos[0], 3.3, pos[1] + 0.5))
    
    // 椅子
    scene.add(box(1, 0.2, 1, C.chair, pos[0], 1, pos[1] + 1.5))
    scene.add(box(1, 1.5, 0.2, C.chair, pos[0], 2, pos[1] + 2))
  })

  // 沙发
  scene.add(box(5, 1, 2, C.sofa, -9, 0.5, -4))
  scene.add(box(5, 1.5, 0.5, C.sofa, -9, 1.5, -5.5))

  // 床
  scene.add(box(4, 0.8, 3, C.bed, 8, 0.4, -5))
  scene.add(box(4, 1.5, 0.5, 0xFFFFFF, 8, 1.2, -6.5))
  scene.add(box(1.5, 1.5, 0.3, 0xFFFFFF, 6.5, 1.2, -6.8))

  // 书架
  for (let i = 0; i < 3; i++) {
    scene.add(box(2, 6, 0.5, C.bookshelf, -11, 3, -4 + i * 4))
    for (let j = 0; j < 4; j++) {
      const colors = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF1C40F]
      scene.add(box(1.5, 0.3, 0.8, colors[j], -11, 1 + j * 1.3, -4 + i * 4))
    }
  }

  // 咖啡机
  scene.add(box(1, 1.5, 1, C.coffee, 10, 0.75, 4))
  scene.add(box(0.8, 0.3, 0.8, 0xCCCCCC, 10, 1.65, 4))

  // 服务器机柜
  scene.add(box(2, 5, 1, C.server, 10, 2.5, -2))
  for (let i = 0; i < 4; i++) {
    const light = box(0.3, 0.3, 0.1, C.serverLight, 10.5, 4 - i * 1, -1.45)
    serverLights.push(light)
    scene.add(light)
  }

  // 盆栽
  scene.add(box(1, 2, 1, 0x8B4513, -9, 1, 5))
  scene.add(box(1.5, 1.5, 1.5, C.plant, -9, 2.5, 5))

  // 猫
  scene.add(box(1.5, 0.8, 1, C.cat, 6, 0.4, 5))

  // 装饰画
  scene.add(box(3, 2, 0.2, C.poster1, 10, 8, -8.8))
  scene.add(box(3, 2, 0.2, C.poster2, 5, 8, -8.8))

  // Central Perk 招牌
  scene.add(box(6, 1.5, 0.3, 0xFFA500, 0, 10, -8.8))
}

function createCharacters() {
  const positions = [[-6, 5], [0, 5], [6, 5]]
  
  positions.forEach((pos, i) => {
    const group = new THREE.Group()
    
    // 身体 - 像素小怪物风格
    group.add(box(1, 1.5, 0.8, C.person[i], 0, 1.75, 0))
    
    // 头
    group.add(box(0.9, 0.9, 0.9, 0x90EE90, 0, 3.2, 0))
    
    // 眼睛
    group.add(box(0.15, 0.2, 0.1, 0x000000, -0.25, 3.3, 0.45))
    group.add(box(0.15, 0.2, 0.1, 0x000000, 0.25, 3.3, 0.45))
    
    // 嘴巴
    group.add(box(0.2, 0.1, 0.1, 0x000000, 0, 2.9, 0.45))

    // 耳朵
    group.add(box(0.3, 0.4, 0.3, C.person[i], -0.5, 3.6, 0))
    group.add(box(0.3, 0.4, 0.3, C.person[i], 0.5, 3.6, 0))

    group.position.set(pos[0], 0, pos[1])
    group.userData = { 
      baseZ: pos[1], 
      walkZ: pos[1] + 3,
      isWorking: false,
      index: i
    }
    
    scene.add(group)
    characters.push(group)
  })
}

function createDecor() {
  // 地板装饰
  scene.add(box(1, 0.1, 8, 0x8B4513, 5, 0.05, 0))
}

function updateCharacters() {
  const time = Date.now() * 0.001
  const isWorking = systemStatus.value === 'working'
  
  characters.forEach((char, i) => {
    char.userData.isWorking = isWorking
    
    if (isWorking) {
      char.position.y = Math.sin(time * 5 + i) * 0.08
      char.position.z = char.userData.walkZ + Math.sin(time) * 1
    } else {
      char.scale.setScalar(1)
      char.position.z = char.userData.baseZ
      char.position.y = 0
    }
  })

  // 服务器闪烁
  const blink = Math.sin(time * 3) > 0
  serverLights.forEach(light => {
    light.material.color.setHex(blink ? 0xFF0000 : 0x440000)
  })
}

function animate() {
  animationId = requestAnimationFrame(animate)
  updateCharacters()
  renderer.render(scene, camera)
}

function onWindowResize() {
  const aspect = window.innerWidth / (window.innerHeight - 120)
  const view = 20
  camera.left = -view * aspect
  camera.right = view * aspect
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight - 120)
}

function removeVisitor(id) {
  visitors.value = visitors.value.filter(v => v.id !== id)
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onWindowResize)
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  overflow: hidden; 
  font-family: 'Courier New', monospace;
  background: #1a1a2e;
}

.container { width: 100vw; height: 100vh; display: flex; flex-direction: column; }
.canvas { flex: 1; }

/* 像素风UI面板 */
.ui-panel {
  height: 120px;
  background: linear-gradient(180deg, #2C2C3E 0%, #1A1A2E 100%);
  display: flex;
  border-top: 4px solid #E74C3C;
  padding: 10px;
  gap: 10px;
}

.ui-section {
  background: #3A3A4A;
  border: 3px solid #000;
  border-radius: 0;
  padding: 8px;
  image-rendering: pixelated;
}

.ui-section.notes { flex: 1; }
.ui-section.status { width: 280px; }
.ui-section.visitors { flex: 1; }

.section-title {
  font-size: 11px;
  color: #F1C40F;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.notes-content p {
  font-size: 9px;
  color: #AAA;
  margin: 2px 0;
}

.status-buttons {
  display: flex;
  gap: 6px;
}

.status-btn {
  flex: 1;
  background: #2A2A3A;
  border: 2px solid #000;
  color: #FFF;
  padding: 6px 4px;
  font-size: 9px;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.status-btn:hover { background: #4A4A5A; }
.status-btn.active { 
  background: #E74C3C; 
  border-color: #FFF;
}

.status-btn.alert.active { 
  background: #FF0000;
  animation: blink 0.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.btn-icon { font-size: 14px; }

.visitor-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 70px;
  overflow-y: auto;
}

.visitor-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #2A2A3A;
  padding: 4px 6px;
  font-size: 9px;
}

.visitor-avatar { font-size: 12px; }
.visitor-name { flex: 1; color: #CCC; }

.leave-btn {
  background: #E74C3C;
  border: 1px solid #000;
  color: #FFF;
  font-size: 8px;
  padding: 2px 6px;
  cursor: pointer;
  font-family: inherit;
}
</style>
