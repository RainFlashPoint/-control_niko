<template>
  <div class="container">
    <div ref="canvasContainer" class="canvas"></div>
    
    <!-- 信息面板 -->
    <div class="info-panel">
      <div class="panel-header">
        <span class="logo">🏢</span>
        <span class="title">OpenClaw</span>
      </div>
      
      <div class="panel-content">
        <div class="section">
          <div class="section-title">👥 工作状态</div>
          <div class="role-cards">
            <div v-for="role in roles" :key="role.id" class="role-card" :class="role.status">
              <span class="avatar">{{ role.avatar }}</span>
              <div class="info">
                <span class="name">{{ role.name }}</span>
                <span class="task" v-if="role.currentTask">工作中</span>
                <span class="status-text" v-else>空闲</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">⏰ 定时任务</div>
          <div class="task-list">
            <div v-for="task in cronJobs.slice(0, 3)" :key="task.id" class="task-item">
              <span>{{ task.name }}</span>
            </div>
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
const roles = ref([])
const cronJobs = ref([])
const skills = ref([])
const systemInfo = ref({ hostname: '', uptime: '' })
const currentTime = ref('')
const activeCount = ref(0)

let scene, camera, renderer, characters = []
let animationId = null

// 配色
const C = {
  sky: 0x87CEEB,
  ground: 0x7CB342,
  road: 0x607D8B,
  building: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
  window: 0xFFE066,
  windowOff: 0x4A4A4A,
  desk: 0x8D6E63,
  chair: 0x5D4037,
  person: [0xFF6B6B, 0x4ECDC4, 0x45B7D1],
  tree: 0x228B22,
  tree2: 0x2E7D32
}

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(C.sky)

  // 等轴测
  const aspect = window.innerWidth / window.innerHeight
  const view = 30
  camera = new THREE.OrthographicCamera(-view * aspect, view * aspect, view, -view, 1, 1000)
  camera.position.set(40, 40, 40)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasContainer.value.appendChild(renderer.domElement)

  // 灯光
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  const dir = new THREE.DirectionalLight(0xffffff, 0.4)
  dir.position.set(30, 50, 30)
  scene.add(dir)

  // 地面
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshLambertMaterial({ color: C.ground })
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  // 道路
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 12),
    new THREE.MeshLambertMaterial({ color: C.road })
  )
  road.rotation.x = -Math.PI / 2
  road.position.y = 0.01
  road.position.z = 15
  scene.add(road)

  // 建筑
  createBuildings()
  
  // 工位
  createDesks()
  
  // 角色
  createCharacters()
  
  // 装饰
  createDecor()

  animate()
  window.addEventListener('resize', onWindowResize)
}

function addBox(w, h, d, color, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color })
  )
  mesh.position.set(x, y, z)
  return mesh
}

function createBuildings() {
  // 主楼
  const mainBuilding = addBox(35, 20, 15, C.building[0], 0, 10, -10)
  scene.add(mainBuilding)

  // 副楼
  scene.add(addBox(15, 12, 10, C.building[1], -25, 6, 0))
  scene.add(addBox(15, 15, 12, C.building[2], 25, 7.5, -5))

  // 窗户
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const on = Math.random() > 0.3
      scene.add(addBox(3, 3, 0.2, on ? C.window : C.windowOff, -12 + col * 6, 5 + row * 5.5, 0.1))
    }
  }

  // 更多窗户
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      scene.add(addBox(2.5, 2.5, 0.2, Math.random() > 0.5 ? C.window : C.windowOff, -30 + col * 5, 4 + row * 4, 0.1))
      scene.add(addBox(2.5, 2.5, 0.2, Math.random() > 0.5 ? C.window : C.windowOff, 18 + col * 5, 4 + row * 4.5, 0.1))
    }
  }
}

function createDesks() {
  const positions = [[-12, 5], [0, 5], [12, 5]]
  
  positions.forEach((pos, i) => {
    // 桌
    scene.add(addBox(5, 0.4, 3, C.desk, pos[0], 3, pos[1]))
    scene.add(addBox(0.4, 3, 0.4, C.desk, pos[0] - 2, 1.5, pos[1] - 1))
    scene.add(addBox(0.4, 3, 0.4, C.desk, pos[0] + 2, 1.5, pos[1] - 1))
    scene.add(addBox(0.4, 3, 0.4, C.desk, pos[0] - 2, 1.5, pos[1] + 1))
    scene.add(addBox(0.4, 3, 0.4, C.desk, pos[0] + 2, 1.5, pos[1] + 1))

    // 显示器
    scene.add(addBox(2, 1.5, 0.2, 0x333333, pos[0], 4.3, pos[1] - 1.4))
    scene.add(addBox(1.5, 1, 0.1, 0x4FC3F7, pos[0], 4.3, pos[1] - 1.25))

    // 键盘
    scene.add(addBox(1.5, 0.2, 0.8, 0x424242, pos[0], 3.3, pos[1] + 0.5))

    // 椅子
    scene.add(addBox(1.2, 0.3, 1.2, C.chair, pos[0], 1, pos[1] + 1.5))
    scene.add(addBox(1.2, 1.5, 0.3, C.chair, pos[0], 2, pos[1] + 2))
  })
}

function createCharacters() {
  const positions = [[-12, 8], [0, 8], [12, 8]]
  
  positions.forEach((pos, i) => {
    const group = new THREE.Group()
    
    // 身体
    const body = addBox(1, 1.5, 0.8, C.person[i], 0, 1.75, 0)
    group.add(body)
    
    // 头
    const head = addBox(0.8, 0.8, 0.8, 0xFFDDC4, 0, 3.2, 0)
    group.add(head)
    
    // 眼睛
    group.add(addBox(0.12, 0.12, 0.1, 0x333333, -0.2, 3.3, 0.4))
    group.add(addBox(0.12, 0.12, 0.1, 0x333333, 0.2, 3.3, 0.4))
    
    // 嘴巴
    group.add(addBox(0.2, 0.08, 0.1, 0xFF6B6B, 0, 3.0, 0.4))

    // 光环
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.08, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xFFD700 })
    )
    halo.position.y = 4
    halo.rotation.x = Math.PI / 2
    halo.visible = false
    group.add(halo)

    group.position.set(pos[0], 0, pos[1])
    group.userData = { 
      baseZ: pos[1], 
      walkZ: pos[1] + 3,
      isWorking: false,
      halo
    }
    
    scene.add(group)
    characters.push(group)
  })
}

function createDecor() {
  // 树
  const trees = [[-30, -5], [30, -5], [-35, 8], [35, 8], [-20, 20], [20, 20]]
  trees.forEach(t => {
    scene.add(addBox(1.5, 4, 1.5, 0x8B4513, t[0], 2, t[1]))
    scene.add(addBox(3, 3, 3, C.tree, t[0], 5, t[1]))
    scene.add(addBox(2.5, 2.5, 2.5, C.tree2, t[0], 6.5, t[1]))
  })

  // 打印机
  scene.add(addBox(1.2, 1, 1.2, 0xBDBDBD, 22, 0.5, 5))

  // 会议室
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(6, 3, 4),
    new THREE.MeshLambertMaterial({ color: 0xE3F2FD, transparent: true, opacity: 0.5 })
  )
  glass.position.set(22, 1.5, -5)
  scene.add(glass)

  // 老板屋
  scene.add(addBox(8, 4, 6, '#FFF9C4', -25, 2, -10))
  scene.add(addBox(8.5, 0.5, 6.5, '#FFD54F', -25, 4.25, -10))
}

function updateCharacters() {
  const time = Date.now() * 0.001
  
  characters.forEach((char, i) => {
    const role = roles.value[i]
    const isWorking = role?.status === 'working'
    char.userData.isWorking = isWorking
    char.userData.halo.visible = isWorking
    
    if (isWorking) {
      // 工作动画
      char.position.y = Math.sin(time * 4 + i) * 0.15
      char.position.z = char.userData.walkZ + Math.sin(time) * 1.5
    } else {
      // 空闲动画
      char.scale.setScalar(1 + Math.sin(time + i) * 0.02)
      char.position.z = char.userData.baseZ
      char.position.y = 0
    }
    
    if (char.userData.halo.visible) {
      char.userData.halo.rotation.z += 0.03
    }
  })
}

function animate() {
  animationId = requestAnimationFrame(animate)
  updateCharacters()
  renderer.render(scene, camera)
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight
  const view = 30
  camera.left = -view * aspect
  camera.right = view * aspect
  camera.top = view
  camera.bottom = -view
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

async function fetchData() {
  try {
    const [rolesRes, statusRes] = await Promise.all([
      fetch('http://localhost:3001/api/roles').then(r => r.json()).catch(() => ({ code: 0, data: [] })),
      fetch('http://localhost:3001/api/status').then(r => r.json()).catch(() => ({ code: 0, data: {} }))
    ])
    
    if (rolesRes.code === 0) roles.value = rolesRes.data
    if (statusRes.code === 0) {
      cronJobs.value = statusRes.data.cronJobs || []
      skills.value = statusRes.data.skills || []
      systemInfo.value = statusRes.data.systemInfo || {}
      activeCount.value = roles.value.filter(r => r.status === 'working').length
    }
  } catch (e) {
    console.error('获取数据失败:', e)
  }
}

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}

let dataTimer = null

onMounted(() => {
  init()
  updateTime()
  dataTimer = setInterval(() => {
    updateTime()
    fetchData()
  }, 3000)
  fetchData()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (dataTimer) clearInterval(dataTimer)
  window.removeEventListener('resize', onWindowResize)
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }

.container { width: 100vw; height: 100vh; position: relative; }
.canvas { width: 100%; height: 100%; }

.info-panel {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 180px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  z-index: 100;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
  font-size: 13px;
}

.panel-content { padding: 10px; }

.section { margin-bottom: 10px; }
.section:last-child { margin-bottom: 0; }
.section-title { font-size: 10px; color: #888; margin-bottom: 6px; }

.role-cards { display: flex; flex-direction: column; gap: 4px; }
.role-card { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  padding: 6px 8px; 
  background: #f8f8f8; 
  border-radius: 8px;
  font-size: 11px;
}
.role-card.working { background: #E8F5E9; }

.task-list { display: flex; flex-direction: column; gap: 3px; }
.task-item { font-size: 10px; color: #666; padding: 3px 0; border-bottom: 1px solid #eee; }
</style>
