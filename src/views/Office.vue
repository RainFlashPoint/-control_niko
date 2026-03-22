<template>
  <div class="office-container">
    <!-- 动漫办公室背景 -->
    <div class="office-bg">
      <!-- 天空 -->
      <div class="sky">
        <div class="cloud cloud-1">☁️</div>
        <div class="cloud cloud-2">☁️</div>
        <div class="sun">☀️</div>
      </div>
      
      <!-- 城市背景 -->
      <div class="city-bg">
        <div class="building b1">🏢</div>
        <div class="building b2">🏨</div>
        <div class="building b3">🏬</div>
      </div>
      
      <!-- 办公楼 -->
      <div class="office-building">
        <div class="building-wall">
          <div class="windows-row">
            <div class="window w-active"></div>
            <div class="window"></div>
            <div class="window w-active"></div>
            <div class="window"></div>
          </div>
          <div class="windows-row">
            <div class="window"></div>
            <div class="window w-active"></div>
            <div class="window"></div>
            <div class="window w-active"></div>
          </div>
        </div>
        <div class="building-door">🚪</div>
        <div class="building-sign">🏢 OpenClaw 公司</div>
      </div>
      
      <!-- 地面 -->
      <div class="ground">
        <div class="road">
          <div class="road-line"></div>
          <div class="road-line"></div>
        </div>
        <div class="sidewalk">
          <div class="tree">🌳</div>
          <div class="bench">🪑</div>
          <div class="tree">🌲</div>
        </div>
      </div>
    </div>

    <!-- 公司入口 -->
    <div class="entrance">
      <div class="door-frame">
        <div class="glass-door"></div>
      </div>
      <div class="reception">📋 接待台</div>
    </div>

    <!-- 办公区 -->
    <div class="workspace">
      <!-- 工位1 -->
      <div class="workstation ws-1">
        <div class="desk">
          <div class="desk-surface">
            <div class="monitor">
              <div class="screen" :class="{ active: isWorking(0) }"></div>
            </div>
            <div class="keyboard"></div>
          </div>
          <div class="desk-body"></div>
          <div class="desk-legs"><div class="leg"></div><div class="leg"></div></div>
        </div>
        <div class="desk-items">
          <div class="lamp">💡</div>
          <div class="plant-small">🪴</div>
        </div>
        <div class="chair" :class="{ moving: isWorking(0) }"></div>
      </div>
      
      <!-- 工位2 -->
      <div class="workstation ws-2">
        <div class="desk">
          <div class="desk-surface">
            <div class="monitor">
              <div class="screen" :class="{ active: isWorking(1) }"></div>
            </div>
            <div class="keyboard"></div>
          </div>
          <div class="desk-body"></div>
          <div class="desk-legs"><div class="leg"></div><div class="leg"></div></div>
        </div>
        <div class="desk-items">
          <div class="coffee">☕</div>
          <div class="books">📚</div>
        </div>
        <div class="chair" :class="{ moving: isWorking(1) }"></div>
      </div>
      
      <!-- 工位3 -->
      <div class="workstation ws-3">
        <div class="desk">
          <div class="desk-surface">
            <div class="monitor dual">
              <div class="screen" :class="{ active: isWorking(2) }"></div>
            </div>
            <div class="keyboard"></div>
          </div>
          <div class="desk-body"></div>
          <div class="desk-legs"><div class="leg"></div><div class="leg"></div></div>
        </div>
        <div class="desk-items">
          <div class="clock-small">🕔</div>
          <div class="toy">🎮</div>
        </div>
        <div class="chair" :class="{ moving: isWorking(2) }"></div>
      </div>
    </div>

    <!-- 公共设施 -->
    <div class="facilities">
      <div class="printer-area">🖨️</div>
      <div class="meeting-room">
        <div class="glass"></div>
        <div class="room-sign">会议室</div>
      </div>
      <div class="kitchen">
        <span>🧊</span><span>📻</span>
      </div>
      <div class="sofa-area">🛋️</div>
    </div>

    <!-- 老板屋 -->
    <div class="boss-room">
      <div class="boss-door"></div>
      <div class="boss-window">
        <div class="curtain"></div>
      </div>
      <div class="boss-sign">👔 总经理室</div>
      <div class="boss-desk">💻</div>
    </div>

    <!-- 动漫角色 -->
    <div 
      v-for="(role, index) in roles" 
      :key="role.id"
      class="character"
      :class="{ 'working': role.status === 'working', 'idle': role.status === 'idle', 'has-task': role.currentTask }"
      :style="getCharacterStyle(index)"
    >
      <!-- 光环 -->
      <div class="halo" v-if="role.currentTask">
        <div class="halo-ring"></div>
      </div>
      
      <div class="char-body">
        <!-- 头发 -->
        <div class="hair" :class="getHairStyle(index)"></div>
        
        <!-- 头部 -->
        <div class="head">
          <div class="face">
            <div class="eyes">
              <div class="eye" :class="{ blink: isBlinking }"></div>
              <div class="eye" :class="{ blink: isBlinking }"></div>
            </div>
            <div class="blush"></div>
            <div class="mouth" :class="{ smile: role.status === 'idle' }"></div>
          </div>
        </div>
        
        <!-- 身体 -->
        <div class="body">
          <div class="torso" :class="role.shirtColor || 'shirt-blue'">
            <div class="tie" v-if="index % 2 === 0">👔</div>
          </div>
          <div class="arms">
            <div class="arm" :class="{ typing: role.status === 'working' }"></div>
            <div class="arm" :class="{ typing: role.status === 'working' }"></div>
          </div>
        </div>
        
        <!-- 腿部 -->
        <div class="legs">
          <div class="leg" :class="{ walking: role.status === 'working' }"></div>
          <div class="leg" :class="{ walking: role.status === 'working' }"></div>
        </div>
      </div>
      
      <!-- 名字 -->
      <div class="name-tag">
        <span class="name">{{ role.name }}</span>
        <span class="status-dot" :class="role.status"></span>
      </div>
      
      <!-- 任务气泡 -->
      <div class="task-bubble" v-if="role.currentTask">
        <span>{{ role.currentTask }}</span>
      </div>
    </div>

    <!-- 信息面板 -->
    <div class="info-panel">
      <div class="panel-header">
        <span class="logo">🎭</span>
        <span class="title">OpenClaw</span>
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

    <!-- 底部状态栏 -->
    <div class="status-bar">
      <span class="company-name">🏢 OpenClaw 科技有限公司</span>
      <span class="time">{{ currentTime }}</span>
      <span class="status" :class="{ active: isAnyWorking }">
        <span class="dot"></span>
        {{ activeCount }} 工作中
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const roles = ref([])
const cronJobs = ref([])
const skills = ref([])
const systemInfo = ref({ hostname: '-', uptime: '0s' })
const currentTime = ref('')
const isBlinking = ref(false)
let timer = null

const positions = [
  { idle: { x: 10, y: 50 }, working: { x: 16, y: 45 } },
  { idle: { x: 40, y: 50 }, working: { x: 46, y: 45 } },
  { idle: { x: 70, y: 50 }, working: { x: 76, y: 45 } }
]

function getCharacterStyle(index) {
  const pos = roles.value[index]?.status === 'working' ? positions[index].working : positions[index].idle
  return { left: `${pos.x}%`, top: `${pos.y}%` }
}

function getHairStyle(index) {
  return ['hair-short', 'hair-long', 'hair-curly'][index % 3]
}

function isWorking(index) {
  return roles.value[index]?.status === 'working'
}

const activeCount = computed(() => roles.value.filter(r => r.status === 'working').length)
const isAnyWorking = computed(() => activeCount.value > 0)

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
    }
  } catch (e) {
    console.error('获取数据失败:', e)
  }
}

onMounted(() => {
  updateTime()
  setInterval(() => { isBlinking.value = true; setTimeout(() => isBlinking.value = false, 200) }, 4000)
  timer = setInterval(() => { updateTime(); fetchData() }, 3000)
  fetchData()
})

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Microsoft YaHei', sans-serif; overflow: hidden; }

.office-container { width: 100vw; height: 100vh; position: relative; background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 30%, #8B4513 30%, #654321 100%); overflow: hidden; }

/* 天空 */
.sky { position: absolute; top: 0; left: 0; right: 0; height: 35%; background: linear-gradient(180deg, #87CEEB 0%, #B0E0E6 100%); }
.cloud { position: absolute; font-size: 40px; animation: cloudMove 25s linear infinite; }
.cloud-1 { top: 5%; animation-duration: 30s; }
.cloud-2 { top: 10%; left: 80%; animation-duration: 35s; }
@keyframes cloudMove { from { transform: translateX(0); } to { transform: translateX(-120vw); } }
.sun { position: absolute; top: 3%; right: 10%; font-size: 50px; animation: sunGlow 4s ease-in-out infinite; }
@keyframes sunGlow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

/* 城市 */
.city-bg { position: absolute; bottom: 65%; left: 0; right: 0; display: flex; justify-content: space-around; padding: 0 5%; }
.building { font-size: 50px; opacity: 0.6; }

/* 办公楼 */
.office-building { position: absolute; bottom: 35%; left: 5%; width: 90%; height: 30%; }
.building-wall { width: 100%; height: 100%; background: linear-gradient(180deg, #f5f5f5 0%, #e0e0e0 100%); border: 3px solid #999; display: flex; flex-direction: column; justify-content: space-around; padding: 15px; }
.windows-row { display: flex; justify-content: space-around; }
.window { width: 60px; height: 40px; background: #87CEEB; border: 3px solid #666; opacity: 0.5; }
.window.w-active { background: #90EE90; opacity: 1; animation: lightFlicker 2s infinite; }
@keyframes lightFlicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
.building-door { position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 25px; }
.building-sign { position: absolute; bottom: -45px; left: 50%; transform: translateX(-50%); font-size: 12px; font-weight: bold; color: #fff; background: #333; padding: 3px 10px; border-radius: 3px; }

/* 地面 */
.ground { position: absolute; bottom: 0; left: 0; right: 0; height: 35%; }
.road { height: 40%; background: #555; }
.road-line { position: absolute; width: 40px; height: 4px; background: #FFD700; top: 50%; }
.road-line:nth-child(1) { left: 15%; }
.road-line:nth-child(2) { left: 60%; }
.sidewalk { height: 60%; background: #C0C0C0; display: flex; align-items: center; justify-content: space-around; padding: 0 5%; }
.tree { font-size: 35px; }
.bench { font-size: 25px; }

/* 入口 */
.entrance { position: absolute; bottom: 25%; left: 42%; width: 16%; height: 12%; }
.door-frame { width: 60px; height: 90px; background: #444; margin: 0 auto; border-radius: 5px 5px 0 0; }
.glass-door { width: 50px; height: 80px; background: rgba(173,216,230,0.6); margin: 5px auto; border: 2px solid #666; }
.reception { text-align: center; font-size: 10px; color: #333; margin-top: 3px; }

/* 办公区 */
.workspace { position: absolute; bottom: 3%; left: 3%; width: 65%; height: 28%; display: flex; justify-content: space-around; align-items: flex-end; }
.workstation { position: relative; width: 100px; height: 85px; }
.desk { position: relative; }
.desk-surface { width: 100%; height: 6px; background: linear-gradient(180deg, #DEB887 0%, #D2B48C 100%); border-radius: 3px; display: flex; justify-content: center; align-items: flex-end; gap: 3px; padding: 2px; }
.monitor { width: 30px; height: 22px; background: #333; border-radius: 2px; padding: 2px; }
.monitor.dual { width: 45px; }
.screen { width: 100%; height: 100%; background: #1a1a2e; border-radius: 1px; }
.screen.active { background: #0066CC; animation: workScreen 1s infinite; }
@keyframes workScreen { 0%, 100% { background: #0066CC; } 50% { background: #0088FF; } }
.keyboard { width: 20px; height: 3px; background: #444; border-radius: 1px; }
.desk-body { width: 100%; height: 25px; background: linear-gradient(180deg, #DEB887 0%, #C4A76C 100%); border-radius: 0 0 3px 3px; }
.desk-legs { display: flex; justify-content: space-between; padding: 0 8px; }
.leg { width: 6px; height: 20px; background: #8B4513; }
.desk-items { position: absolute; top: -20px; left: 0; right: 0; display: flex; justify-content: space-around; }
.lamp, .coffee, .clock-small, .books, .toy, .plant-small { font-size: 14px; }
.chair { position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); width: 20px; height: 16px; background: #333; border-radius: 4px 4px 0 0; transition: transform 0.3s; }
.chair.moving { animation: chairRock 0.5s ease-in-out infinite; }
@keyframes chairRock { 0%, 100% { transform: translateX(-50%) rotate(-2deg); } 50% { transform: translateX(-50%) rotate(2deg); } }

/* 设施 */
.facilities { position: absolute; bottom: 3%; right: 3%; width: 28%; height: 28%; display: flex; flex-wrap: wrap; gap: 8px; }
.printer-area, .meeting-room, .kitchen, .sofa-area { width: 48%; height: 48%; background: rgba(255,255,255,0.85); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; position: relative; }
.meeting-room { background: rgba(200,220,255,0.85); }
.glass { position: absolute; top: 10px; left: 10%; width: 80%; height: 40%; background: rgba(173,216,230,0.5); border: 2px solid #fff; }
.room-sign { position: absolute; bottom: 5px; font-size: 10px; color: #333; }
.kitchen span { margin: 2px; font-size: 18px; }

/* 老板屋 */
.boss-room { position: absolute; bottom: 32%; right: 5%; width: 18%; height: 18%; background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%); border: 3px solid #8B4513; border-radius: 5px; }
.boss-door { position: absolute; bottom: 0; left: 30%; width: 40%; height: 35%; background: #654321; border-radius: 3px 3px 0 0; }
.boss-window { position: absolute; top: 8px; left: 10%; width: 80%; height: 35%; background: #87CEEB; border: 2px solid #fff; }
.curtain { width: 100%; height: 20%; background: #DC143C; position: absolute; top: 0; }
.boss-sign { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 9px; font-weight: bold; color: #333; white-space: nowrap; }
.boss-desk { position: absolute; bottom: 3px; right: 10%; font-size: 14px; }

/* 角色 */
.character { position: absolute; z-index: 100; transition: all 0.5s ease; }
.character.working { animation: workBounce 0.5s ease-in-out infinite; }
.character.idle { animation: idleBreathe 2s ease-in-out infinite; }
@keyframes workBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes idleBreathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }

/* 光环 */
.halo { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); width: 24px; height: 12px; }
.halo-ring { width: 100%; height: 100%; border: 2px solid gold; border-radius: 50%; animation: haloSpin 2s linear infinite; }
@keyframes haloSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* 角色身体 */
.char-body { display: flex; flex-direction: column; align-items: center; }
.hair { position: relative; }
.hair-short .hair-front { width: 26px; height: 10px; background: #4A3728; border-radius: 12px 12px 0 0; position: absolute; top: -6px; left: 50%; transform: translateX(-50%); }
.hair-long .hair-front { width: 28px; height: 16px; background: #2C1810; border-radius: 14px 14px 4px 4px; position: absolute; top: -10px; left: 50%; transform: translateX(-50%); }
.hair-curly .hair-front { width: 30px; height: 12px; background: #8B4513; border-radius: 50%; position: absolute; top: -8px; left: 50%; transform: translateX(-50%); }

.head { width: 28px; height: 28px; background: #FFE4C4; border-radius: 50%; position: relative; }
.face { position: relative; width: 100%; height: 100%; }
.eyes { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
.eye { width: 5px; height: 7px; background: #333; border-radius: 50%; }
.eye.blink { height: 2px; }
.blush { position: absolute; top: 13px; width: 16px; height: 5px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
.blush::before, .blush::after { content: ''; width: 5px; height: 3px; background: #FFB6C1; border-radius: 50%; }
.mouth { position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); width: 5px; height: 2px; background: #FF6B6B; border-radius: 0 0 2px 2px; }
.mouth.smile { height: 4px; width: 7px; }

.body { position: relative; margin-top: -2px; }
.torso { width: 20px; height: 24px; border-radius: 4px 4px 0 0; position: relative; }
.shirt-blue { background: linear-gradient(180deg, #4A90D9 0%, #357ABD 100%); }
.shirt-pink { background: linear-gradient(180deg, #FF6B9D 0%, #E05580 100%); }
.shirt-green { background: linear-gradient(180deg, #5CB85C 0%, #4CAE4C 100%); }
.tie { position: absolute; top: 4px; left: 50%; transform: translateX(-50%); font-size: 7px; }
.arms { position: absolute; top: 6px; left: -5px; right: -5px; display: flex; justify-content: space-between; }
.arm { width: 7px; height: 16px; background: inherit; border-radius: 3px; }
.arm.typing { animation: typing 0.2s infinite alternate; }
@keyframes typing { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }

.legs { display: flex; gap: 3px; margin-top: -2px; }
.leg { width: 7px; height: 16px; background: #333; border-radius: 0 0 2px 2px; }
.leg.walking { animation: walk 0.3s infinite alternate; }
@keyframes walk { from { transform: translateX(-1px); } to { transform: translateX(1px); } }

.name-tag { display: flex; align-items: center; gap: 3px; margin-top: 4px; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 8px; font-size: 9px; }
.name { font-weight: bold; color: #333; }
.status-dot { width: 5px; height: 5px; border-radius: 50%; }
.status-dot.idle { background: #999; }
.status-dot.working { background: #5CB85C; animation: pulse 1s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.task-bubble { position: absolute; top: -28px; left: 50%; transform: translateX(-50%); background: #fff; padding: 2px 6px; border-radius: 6px; font-size: 8px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }

/* 信息面板 */
.info-panel { position: absolute; top: 15px; right: 15px; width: 220px; background: rgba(255,255,255,0.95); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 200; overflow: hidden; }
.panel-header { display: flex; align-items: center; gap: 6px; padding: 10px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
.logo { font-size: 16px; }
.title { flex: 1; font-weight: bold; font-size: 12px; }
.live-dot { width: 6px; height: 6px; background: #5CB85C; border-radius: 50%; animation: pulse 1s infinite; }
.panel-content { max-height: 280px; overflow-y: auto; }
.section { padding: 10px 12px; border-bottom: 1px solid #eee; }
.section:last-child { border-bottom: none; }
.section-title { font-size: 11px; color: #666; margin-bottom: 8px; font-weight: bold; }
.role-cards { display: flex; flex-direction: column; gap: 5px; }
.role-card { display: flex; align-items: center; gap: 6px; padding: 6px; background: #f9f9f9; border-radius: 6px; }
.role-card.working { background: #e6ffe6; }
.avatar { font-size: 14px; }
.info { flex: 1; display: flex; flex-direction: column; }
.info .name { font-size: 11px; }
.info .task, .info .status-text { font-size: 9px; color: #666; }
.info .task { color: #5CB85C; }

.task-list { display: flex; flex-direction: column; gap: 4px; }
.task-item { display: flex; justify-content: space-between; font-size: 10px; }
.schedule { color: #999; font-size: 9px; }

.skill-tags { display: flex; flex-wrap: wrap; gap: 3px; }
.skill-tag { font-size: 9px; padding: 2px 5px; background: #f0f0f0; border-radius: 6px; color: #666; }

.panel-footer { display: flex; justify-content: space-between; padding: 8px 12px; background: #f5f5f5; font-size: 9px; color: #999; }

/* 状态栏 */
.status-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 35px; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; color: #fff; font-size: 12px; }
.company-name { font-weight: bold; }
.time { color: #aaa; }
.status { display: flex; align-items: center; gap: 5px; }
.status .dot { width: 6px; height: 6px; border-radius: 50%; background: #999; }
.status.active .dot { background: #5CB85C; animation: pulse 1s infinite; }
</style>
