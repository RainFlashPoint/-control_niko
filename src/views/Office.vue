<template>
  <div class="container">
    <div ref="canvasContainer" class="canvas"></div>
    
    <!-- 信息面板 -->
    <div class="info-panel">
      <div class="panel-header">
        <span class="logo">🎭</span>
        <span class="title">OpenClaw 3D</span>
        <span class="live-dot"></span>
      </div>
      
      <div class="panel-content">
        <div class="section">
          <div class="section-title">👥 工作状态</div>
          <div class="role-cards">
            <div v-for="role in roles" :key="role.id" class="role-card" :class="role.status">
              <span class="avatar">{{ role.avatar }}</span>
              <div class="info">
                <span class="name">{{ role.name }}</span>
                <span class="task" v-if="role.currentTask">{{ role.currentTask }}</span>
                <span class="status-text" v-else>空闲中</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">⏰ 定时任务</div>
          <div class="task-list">
            <div v-for="task in cronJobs.slice(0, 4)" :key="task.id" class="task-item">
              <span>{{ task.name }}</span>
              <span class="schedule">{{ task.schedule }}</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">⚡ 技能</div>
          <div class="skill-tags">
            <span v-for="skill in skills" :key="skill.name" class="skill-tag">{{ skill.name }}</span>
          </div>
        </div>
      </div>
      
      <div class="panel-footer">
        <span>{{ systemInfo.hostname }}</span>
        <span>{{ systemInfo.uptime }}</span>
      </div>
    </div>

    <!-- 底部状态 -->
    <div class="status-bar">
      <span>🏢 OpenClaw 科技有限公司</span>
      <span class="time">{{ currentTime }}</span>
      <span :class="{ active: activeCount > 0 }">
        <span class="dot"></span>
        {{ activeCount }} 工作中
      </span>
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
const systemInfo = ref({ hostname: '-', uptime: '0s' })
const currentTime = ref('')
const activeCount = ref(0)

let scene, camera, renderer, characters = [], desks = []
let animationId = null

function init() {
  // 场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB)
  scene.fog = new THREE.Fog(0x87CEEB, 50, 150)

  // 相机
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 25, 40)
  camera.lookAt(0, 5, 0)

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  canvasContainer.value.appendChild(renderer.domElement)

  // 灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(20, 30, 20)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // 地面
  const groundGeometry = new THREE.PlaneGeometry(100, 60)
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.5
  ground.receiveShadow = true
  scene.add(ground)

  // 人行道
  const sidewalkGeometry = new THREE.PlaneGeometry(100, 15)
  const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 })
  const sidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial)
  sidewalk.rotation.x = -Math.PI / 2
  sidewalk.position.set(0, 0.01, -20)
  scene.add(sidewalk)

  // 办公楼
  createOffice()

  // 工位
  createDesks()

  // 装饰
  createDecorations()

  // 角色（初始位置）
  createCharacters()

  // 动画
  animate()

  // 窗口大小调整
  window.addEventListener('resize', onWindowResize)
}

function createOffice() {
  // 主体
  const buildingGeometry = new THREE.BoxGeometry(60, 25, 20)
  const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 })
  const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
  building.position.set(0, 12, -15)
  building.castShadow = true
  building.receiveShadow = true
  scene.add(building)

  // 窗户
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const windowGeometry = new THREE.PlaneGeometry(6, 5)
      const isActive = Math.random() > 0.4
      const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: isActive ? 0x90EE90 : 0x87CEEB,
        emissive: isActive ? 0x90EE90 : 0x000000,
        emissiveIntensity: isActive ? 0.3 : 0
      })
      const window = new THREE.Mesh(windowGeometry, windowMaterial)
      window.position.set(-20 + col * 10, 5 + row * 7, -4.9)
      scene.add(window)
    }
  }

  // 屋顶
  const roofGeometry = new THREE.BoxGeometry(62, 2, 22)
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 })
  const roof = new THREE.Mesh(roofGeometry, roofMaterial)
  roof.position.set(0, 25, -15)
  scene.add(roof)
}

function createDesks() {
  const deskPositions = [
    { x: -15, z: 5 },
    { x: 0, z: 5 },
    { x: 15, z: 5 }
  ]

  deskPositions.forEach((pos, index) => {
    // 桌面
    const topGeometry = new THREE.BoxGeometry(8, 0.5, 4)
    const topMaterial = new THREE.MeshStandardMaterial({ color: 0xDEB887 })
    const top = new THREE.Mesh(topGeometry, topMaterial)
    top.position.set(pos.x, 4, pos.z)
    top.castShadow = true
    scene.add(top)

    // 桌腿
    const legGeometry = new THREE.BoxGeometry(0.5, 4, 0.5)
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    const leg1 = new THREE.Mesh(legGeometry, legMaterial)
    leg1.position.set(pos.x - 3.5, 2, pos.z - 1.5)
    scene.add(leg1)
    const leg2 = new THREE.Mesh(legGeometry, legMaterial)
    leg2.position.set(pos.x + 3.5, 2, pos.z - 1.5)
    scene.add(leg2)
    const leg3 = new THREE.Mesh(legGeometry, legMaterial)
    leg3.position.set(pos.x - 3.5, 2, pos.z + 1.5)
    scene.add(leg3)
    const leg4 = new THREE.Mesh(legGeometry, legMaterial)
    leg4.position.set(pos.x + 3.5, 2, pos.z + 1.5)
    scene.add(leg4)

    // 显示器
    const monitorGeometry = new THREE.BoxGeometry(3, 2, 0.3)
    const monitorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
    const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial)
    monitor.position.set(pos.x, 5.5, pos.z)
    scene.add(monitor)

    // 屏幕
    const screenGeometry = new THREE.PlaneGeometry(2.5, 1.5)
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x0066CC })
    const screen = new THREE.Mesh(screenGeometry, screenMaterial)
    screen.position.set(pos.x, 5.5, pos.z + 0.2)
    scene.add(screen)

    // 键盘
    const keyboardGeometry = new THREE.BoxGeometry(2.5, 0.2, 1)
    const keyboardMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 })
    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial)
    keyboard.position.set(pos.x, 4.3, pos.z + 1.5)
    scene.add(keyboard)

    desks.push({ x: pos.x, z: pos.z, index })
  })
}

function createDecorations() {
  // 树
  const treePositions = [
    { x: -30, z: -15 },
    { x: 30, z: -15 },
    { x: -25, z: -22 }
  ]
  
  treePositions.forEach(pos => {
    // 树干
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 4, 8)
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.set(pos.x, 2, pos.z)
    scene.add(trunk)

    // 树叶
    const foliageGeometry = new THREE.SphereGeometry(2.5, 8, 8)
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 })
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial)
    foliage.position.set(pos.x, 5.5, pos.z)
    scene.add(foliage)
  })

  // 打印机
  const printerGeometry = new THREE.BoxGeometry(2, 1.5, 2)
  const printerMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC })
  const printer = new THREE.Mesh(printerGeometry, printerMaterial)
  printer.position.set(25, 0.75, 5)
  scene.add(printer)

  // 会议室
  const meetingGeometry = new THREE.BoxGeometry(8, 4, 6)
  const meetingMaterial = new THREE.MeshStandardMaterial({ color: 0xADD8E6, transparent: true, opacity: 0.5 })
  const meeting = new THREE.Mesh(meetingGeometry, meetingMaterial)
  meeting.position.set(25, 2, -5)
  scene.add(meeting)
}

function createCharacters() {
  const colors = [0x4A90D9, 0xFF6B9D, 0x5CB85C]
  
  desks.forEach((desk, index) => {
    const group = new THREE.Group()
    
    // 身体
    const bodyGeometry = new THREE.CapsuleGeometry(0.8, 2, 4, 8)
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: colors[index] })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 2.5
    group.add(body)

    // 头
    const headGeometry = new THREE.SphereGeometry(0.8, 16, 16)
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFE4C4 })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 4.5
    group.add(head)

    // 眼睛
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8)
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial)
    eye1.position.set(-0.25, 4.6, 0.7)
    group.add(eye1)
    const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial)
    eye2.position.set(0.25, 4.6, 0.7)
    group.add(eye2)

    // 光环
    const haloGeometry = new THREE.TorusGeometry(1, 0.1, 8, 32)
    const haloMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0xFFD700, emissiveIntensity: 0.5 })
    const halo = new THREE.Mesh(haloGeometry, haloMaterial)
    halo.position.y = 5.8
    halo.rotation.x = Math.PI / 2
    halo.visible = false
    group.add(halo)

    group.position.set(desk.x, 0, desk.z - 3)
    group.userData = { 
      index, 
      deskX: desk.x, 
      deskZ: desk.z - 3,
      walkingZ: desk.z - 8,
      isWorking: false,
      halo
    }
    
    scene.add(group)
    characters.push(group)
  })
}

function updateCharacters() {
  const time = Date.now() * 0.001

  characters.forEach((char, index) => {
    const role = roles.value[index]
    const isWorking = role?.status === 'working'
    char.userData.isWorking = isWorking

    // 显示/隐藏光环
    char.userData.halo.visible = isWorking
    
    // 动画
    if (isWorking) {
      // 工作状态：轻微晃动
      char.position.y = Math.sin(time * 3) * 0.1
      char.rotation.z = Math.sin(time * 2) * 0.05
      // 走动
      char.position.z = char.userData.walkingZ + Math.sin(time * 0.5) * 2
    } else {
      // 空闲：呼吸动画
      char.scale.setScalar(1 + Math.sin(time) * 0.02)
      char.position.z = char.userData.deskZ
      char.rotation.z = 0
    }
  })
}

function animate() {
  animationId = requestAnimationFrame(animate)
  updateCharacters()
  renderer.render(scene, camera)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
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
  if (renderer) renderer.dispose()
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { overflow: hidden; font-family: 'Microsoft YaHei', sans-serif; }

.container { width: 100vw; height: 100vh; position: relative; }
.canvas { width: 100%; height: 100%; }

.info-panel {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 220px;
  background: rgba(255,255,255,0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 100;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.logo { font-size: 16px; }
.title { flex: 1; font-weight: bold; font-size: 12px; }
.live-dot { width: 6px; height: 6px; background: #5CB85C; border-radius: 50%; animation: pulse 1s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.panel-content { max-height: 280px; overflow-y: auto; }
.section { padding: 10px 12px; border-bottom: 1px solid #eee; }
.section:last-child { border-bottom: none; }
.section-title { font-size: 11px; color: #666; margin-bottom: 8px; font-weight: bold; }

.role-cards { display: flex; flex-direction: column; gap: 5px; }
.role-card { display: flex; align-items: center; gap: 6px; padding: 6px; background: #f9f9f9; border-radius: 6px; }
.role-card.working { background: #e6ffe6; }
.avatar { font-size: 14px; }
.info { flex: 1; display: flex; flex-direction: column; }
.info .name { font-size: 11px; font-weight: bold; }
.info .task, .info .status-text { font-size: 9px; color: #666; }
.info .task { color: #5CB85C; }

.task-list { display: flex; flex-direction: column; gap: 4px; }
.task-item { display: flex; justify-content: space-between; font-size: 10px; }
.schedule { color: #999; font-size: 9px; }

.skill-tags { display: flex; flex-wrap: wrap; gap: 3px; }
.skill-tag { font-size: 9px; padding: 2px 5px; background: #f0f0f0; border-radius: 6px; color: #666; }

.panel-footer { display: flex; justify-content: space-between; padding: 8px 12px; background: #f5f5f5; font-size: 9px; color: #999; }

.status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35px;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: #fff;
  font-size: 12px;
  z-index: 100;
}

.status-bar .dot { width: 6px; height: 6px; border-radius: 50%; background: #999; margin-right: 5px; }
.status-bar .active .dot { background: #5CB85C; animation: pulse 1s infinite; }
</style>
