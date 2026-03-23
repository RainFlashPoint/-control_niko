<template>
  <div class="container">
    <!-- 背景层 -->
    <img src="/bg-scene.png" class="bg-img" />
    
    <!-- 角色层 -->
    <div class="chars-layer">
      <div 
        v-for="(char, i) in characters" 
        :key="i"
        class="char-box"
        :style="getCharStyle(i)"
        @click="selectChar(i)"
      >
        <img :src="getCharImg(i)" class="char-img" :class="{ speaking: char.speaking }" />
        <div class="char-name">{{ char.name }}</div>
      </div>
    </div>
    
    <div class="side-panel">
      <div class="panel-title">🐉 龙虾状态</div>
      <div class="status-list">
        <div class="status-item" @click="selectChar(0)">
          <span class="status-icon">🧑‍💼</span>
          <span class="status-label">大总管</span>
          <span class="status-value" :class="{ active: activeChar === 0 }">{{ activeChar === 0 ? '对话中' : '在线' }}</span>
        </div>
        <div class="status-item" @click="selectChar(1)">
          <span class="status-icon">📊</span>
          <span class="status-label">市场调研员</span>
          <span class="status-value" :class="{ active: activeChar === 1 }">{{ activeChar === 1 ? '对话中' : '在线' }}</span>
        </div>
        <div class="status-item">
          <span class="status-icon">🤖</span>
          <span class="status-label">模型</span>
          <span class="status-value">MiniMax-M2.5</span>
        </div>
        <div class="status-item">
          <span class="status-icon">💬</span>
          <span class="status-label">今日消息</span>
          <span class="status-value">{{ messageCount }}</span>
        </div>
        <div class="status-item">
          <span class="status-icon">⏱️</span>
          <span class="status-label">运行时长</span>
          <span class="status-value">{{ uptime }}</span>
        </div>
        <div class="status-item">
          <span class="status-icon">⚡</span>
          <span class="status-label">Token消耗</span>
          <span class="status-value">{{ tokenUsage }}</span>
        </div>
      </div>
    </div>
    
    <!-- 聊天面板 -->
    <div class="chat-panel" :class="{ visible: chatVisible }">
      <div class="chat-header">
        <span class="chat-title">💬 {{ characters[activeChar]?.name || '对话' }}</span>
        <button class="close-btn" @click="chatVisible = false">×</button>
      </div>
      <div class="chat-messages" ref="chatBox">
        <div 
          v-for="(msg, i) in messages[activeChar]" 
          :key="i"
          class="message"
          :class="{ self: msg.from === 'user', ai: msg.from === 'ai' }"
        >
          <div class="msg-avatar">{{ msg.from === 'user' ? '👤' : characters[activeChar]?.avatar }}</div>
          <div class="msg-content">{{ msg.text }}</div>
        </div>
        <div v-if="characters[activeChar]?.speaking" class="typing">
          <span>输入中...</span>
        </div>
      </div>
      <div class="chat-input">
        <input 
          v-model="inputText" 
          placeholder="发送消息..."
          @keyup.enter="sendMessage"
          :disabled="characters[activeChar]?.speaking"
        />
        <button @click="sendMessage" :disabled="characters[activeChar]?.speaking || !inputText.trim()">发送</button>
      </div>
    </div>
    
    <div class="ui-panel">
      <div class="ui-section notes">
        <div class="section-title">📝 昨日小记</div>
        <div class="notes-content">
          <p>• 研究自动化AI测试工具</p>
          <p>• 探索1人公司创业方向</p>
          <p>• 优化龙虾控制台展示</p>
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
        </div>
      </div>
      
      <div class="ui-section visitors">
        <div class="section-title">👥 访客列表</div>
        <div class="visitor-list">
          <div class="visitor-item">
            <span class="visitor-avatar">🧑‍💻</span>
            <span class="visitor-name">访客A</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const systemStatus = ref('working')
const mainStatus = ref('工作中')
const messageCount = ref(2)
const uptime = ref('刚刚')
const tokenUsage = ref('0K')

const chatVisible = ref(false)
const activeChar = ref(0)
const inputText = ref('')
const chatBox = ref(null)

const characters = ref([
  { 
    name: '大总管', 
    avatar: '🧑‍💼', 
    x: 15, 
    speaking: false,
    prompt: '你是糖糖，宏至的AI私人助手。一只布偶猫的形象。聪明、高效、偶尔毒舌但从不恶意。回答简洁直接。'
  },
  { 
    name: '市场调研员', 
    avatar: '📊', 
    x: 75, 
    speaking: false,
    prompt: '你是PD（产品经理），擅长市场分析、数据调研、用户需求分析。说话专业、严谨，喜欢用数据和案例分析问题。'
  }
])

// 每个角色的独立对话历史
const messages = ref([[], []])

const characters2 = ref([])
const frameIndex = ref(0)

let animationId = null
let lastFrameTime = 0
let lastMoveTime = 0
const FRAME_INTERVAL = 500

const charImages = [
  '/final1.png', '/final2.png', '/final3.png', '/final4.png',
  '/final5.png', '/final6.png', '/final7.png', '/final8.png'
]

function initChars() {
  characters2.value = [
    { x: 15 },
    { x: 75 }
  ]
}

function getCharImg(i) {
  const base = i * 4
  const idx = base + (frameIndex.value % 4)
  return charImages[idx]
}

function getCharStyle(i) {
  const char = characters2.value[i]
  if (!char) return {}
  
  const bounce = systemStatus.value === 'working' 
    ? Math.sin(frameIndex.value * 1.5 + i) * 5 
    : 0
  
  return {
    left: char.x + '%',
    bottom: '12%',
    width: '6%'
  }
}

function selectChar(i) {
  activeChar.value = i
  chatVisible.value = true
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || characters.value[activeChar.value].speaking) return
  
  // 添加用户消息
  messages.value[activeChar.value].push({ from: 'user', text })
  inputText.value = ''
  
  // 滚动到底部
  await nextTick()
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight
  }
  
  // 角色开始"输入中"
  characters.value[activeChar.value].speaking = true
  
  // 模拟AI回复（实际项目中这里调用API）
  setTimeout(() => {
    const char = characters.value[activeChar.value]
    const reply = generateReply(activeChar.value, text)
    
    messages.value[activeChar.value].push({ from: 'ai', text: reply })
    char.speaking = false
    
    // 滚动到底部
    nextTick(() => {
      if (chatBox.value) {
        chatBox.value.scrollTop = chatBox.value.scrollHeight
      }
    })
  }, 1000 + Math.random() * 1000)
}

function generateReply(charIndex, userMsg) {
  const msg = userMsg.toLowerCase()
  
  if (charIndex === 0) {
    // 大总管 - 糖糖风格
    if (msg.includes('你好') || msg.includes('hello')) return '你好呀！有什么需要帮忙的？'
    if (msg.includes('天气')) return '北京今天天气不错，适合工作！'
    if (msg.includes('做什么')) return '我可以帮你处理各种任务，比如查资料、写代码、管理项目等。'
    if (msg.includes('累')) return '工作辛苦了！适当休息一下~'
    return '收到！我会帮你处理这个问题的 😊'
  } else {
    // 市场调研员 - PD风格
    if (msg.includes('你好') || msg.includes('hello')) return '你好！我是市场调研员，有什么分析需求吗？'
    if (msg.includes('市场')) return '根据最新数据，这个领域的市场规模约为XX亿，年增长率15%左右。'
    if (msg.includes('用户')) return '目标用户画像：25-40岁，一二线城市，月入1W+，有贷款需求...'
    if (msg.includes('竞争')) return '竞品分析显示，头部玩家占据了约60%的市场份额...'
    return '这个问题需要进一步数据分析，我会整理相关报告给你 📊'
  }
}

function update() {}

function loop() {
  const now = performance.now()
  if (!lastFrameTime) lastFrameTime = now
  if (now - lastFrameTime >= FRAME_INTERVAL) {
    frameIndex.value = (frameIndex.value + 1) % 4
    lastFrameTime = now
  }
  
  update()
  animationId = requestAnimationFrame(loop)
}

onMounted(() => {
  initChars()
  loop()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
body { font-family: 'Courier New', monospace; background: #1a1a2e; }

.container {
  width: 100vw; height: 100vh;
  position: relative;
  overflow: hidden;
}

.bg-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.chars-layer {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.char-box {
  position: absolute;
  width: 6%;
  transform: translateX(-50%);
  cursor: pointer;
  transition: transform 0.2s;
}

.char-box:hover {
  transform: translateX(-50%) scale(1.05);
}

.char-box.speaking {
  animation: bounce 0.5s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}

.char-name {
  text-align: center;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: -5px;
}

.char-img {
  width: 100%;
  height: auto;
  display: block;
  image-rendering: pixelated;
  mix-blend-mode: multiply;
  background: transparent;
}

.char-img.speaking {
  filter: brightness(1.2);
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
.status-item { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; cursor: pointer; }
.status-item:hover { background: rgba(255,255,255,0.1); }
.status-icon { font-size: 16px; }
.status-label { flex: 1; font-size: 10px; color: #888; }
.status-value { font-size: 11px; color: #4ECDC4; font-weight: bold; }
.status-value.active { color: #F1C40F; }

/* 聊天面板 */
.chat-panel {
  position: absolute;
  bottom: 120px;
  right: 240px;
  width: 320px;
  height: 400px;
  background: #2C2C3E;
  border: 3px solid #E74C3C;
  border-radius: 12px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  transform: translateY(20px);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s;
}

.chat-panel.visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #1a1a2e;
  border-bottom: 2px solid #E74C3C;
  border-radius: 8px 8px 0 0;
}

.chat-title { color: #F1C40F; font-size: 14px; }

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 20px;
  cursor: pointer;
}

.close-btn:hover { color: #E74C3C; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  display: flex;
  gap: 8px;
  max-width: 85%;
}

.message.self {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.ai {
  align-self: flex-start;
}

.msg-avatar {
  width: 28px;
  height: 28px;
  background: #3A3A4A;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.msg-content {
  background: #3A3A4A;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #DDD;
  line-height: 1.4;
}

.message.self .msg-content {
  background: #E74C3C;
}

.typing {
  font-size: 12px;
  color: #888;
  padding: 5px;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 10px;
  background: #1a1a2e;
  border-top: 2px solid #E74C3C;
  border-radius: 0 0 8px 8px;
}

.chat-input input {
  flex: 1;
  background: #3A3A4A;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  color: #DDD;
  font-size: 12px;
}

.chat-input input:focus {
  outline: 2px solid #E74C3C;
}

.chat-input button {
  background: #E74C3C;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  color: #FFF;
  cursor: pointer;
  font-size: 12px;
}

.chat-input button:hover {
  background: #c0392b;
}

.chat-input button:disabled {
  background: #555;
  cursor: not-allowed;
}

.ui-panel {
  height: 110px;
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(180deg, #2C2C3E 0%, #1A1A2E 100%);
  border-top: 4px solid #E74C3C; display: flex; padding: 8px; gap: 8px;
  z-index: 100;
}
.ui-section { background: #3A3A4A; border: 3px solid #000; padding: 6px; }
.ui-section.notes { flex: 1; }
.ui-section.status { width: 200px; }
.ui-section.visitors { flex: 1; }
.section-title { font-size: 10px; color: #F1C40F; margin-bottom: 4px; }
.notes-content p { font-size: 8px; color: #AAA; margin: 1px 0; }

.status-buttons { display: flex; gap: 4px; }
.status-btn {
  flex: 1; background: #2A2A3A; border: 2px solid #000; color: #FFF;
  padding: 4px; font-size: 8px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center;
}
.status-btn.active { background: #E74C3C; }
.btn-icon { font-size: 12px; }

.visitor-list { }
.visitor-item { display: flex; align-items: center; gap: 4px; background: #2A2A3A; padding: 3px 5px; font-size: 8px; }
.visitor-avatar { font-size: 12px; }
.visitor-name { color: #CCC; }
</style>
