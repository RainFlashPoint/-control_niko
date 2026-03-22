/**
 * OpenClaw 状态收集服务
 * 真实连接 OpenClaw 数据
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const OCLAW_DIR = path.join(process.env.HOME || '/Users/hongzhi', '.openclaw');

// 读取 agents 配置
function getAgents() {
  const agentsDir = path.join(OCLAW_DIR, 'agents');
  if (!fs.existsSync(agentsDir)) return [];
  
  return fs.readdirSync(agentsDir).filter(f => {
    return fs.statSync(path.join(agentsDir, f)).isDirectory();
  });
}

// 读取单个 agent 的会话信息
function getAgentSessions(agentName) {
  const sessionsFile = path.join(OCLAW_DIR, 'agents', agentName, 'sessions', 'sessions.json');
  if (!fs.existsSync(sessionsFile)) return null;
  
  try {
    const data = JSON.parse(fs.readFileSync(sessionsFile, 'utf-8'));
    const sessionKey = `agent:${agentName}:main`;
    return data[sessionKey] || null;
  } catch (e) {
    return null;
  }
}

// 读取 cron 任务
function getCronJobs() {
  const cronFile = path.join(OCLAW_DIR, 'cron', 'jobs.json');
  if (!fs.existsSync(cronFile)) return [];
  
  try {
    const data = JSON.parse(fs.readFileSync(cronFile, 'utf-8'));
    return (data.jobs || []).map(job => ({
      id: job.id,
      name: job.name,
      enabled: job.enabled,
      schedule: formatSchedule(job.schedule),
      nextRun: job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toLocaleString('zh-CN') : '-',
      lastRun: job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs).toLocaleString('zh-CN') : '-',
      status: job.state?.lastRunStatus || 'unknown'
    }));
  } catch (e) {
    return [];
  }
}

function formatSchedule(schedule) {
  if (!schedule) return '-';
  if (schedule.kind === 'cron') return schedule.expr || '-';
  if (schedule.kind === 'every') return `每${schedule.everyMs / 1000}秒`;
  if (schedule.kind === 'at') return '一次性';
  return '-';
}

// 读取技能列表
function getSkills() {
  const skillsDir = path.join(OCLAW_DIR, 'workspace', 'skills');
  if (!fs.existsSync(skillsDir)) return [];
  
  return fs.readdirSync(skillsDir).filter(f => {
    return fs.statSync(path.join(skillsDir, f)).isDirectory();
  }).map(name => ({
    name,
    description: `自定义技能: ${name}`,
    status: 'active'
  }));
}

// 读取系统信息
function getSystemInfo() {
  return {
    hostname: process.env.HOSTNAME || 'MacBook-Pro',
    platform: process.platform,
    uptime: formatUptime(process.uptime()),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
  };
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

// 角色映射
const agentAvatars = {
  'main': { avatar: '🐱', name: '糖糖', color: 'shirt-blue' },
  'pd': { avatar: '🧸', name: 'PD助手', color: 'shirt-pink' }
};

// API: 获取所有角色状态
app.get('/api/roles', (req, res) => {
  const agents = getAgents();
  const roles = agents.map(agentName => {
    const session = getAgentSessions(agentName);
    const config = agentAvatars[agentName] || { avatar: '🤖', name: agentName, color: 'shirt-green' };
    
    // 判断状态：最近更新时间在5分钟内认为在工作
    const now = Date.now();
    const lastUpdate = session?.updatedAt || 0;
    const isActive = (now - lastUpdate) < 5 * 60 * 1000;
    
    return {
      id: agentName,
      name: config.name,
      avatar: config.avatar,
      shirtColor: config.color,
      status: isActive ? 'working' : 'idle',
      location: isActive ? 'walking' : 'desk',
      currentTask: isActive ? '处理任务中...' : null,
      lastActive: session?.updatedAt ? new Date(session.updatedAt).toLocaleString('zh-CN') : '-',
      sessionId: session?.sessionId || '-'
    };
  });
  
  res.json({ code: 0, data: roles });
});

// API: 获取 OpenClaw 整体状态
app.get('/api/status', (req, res) => {
  const agents = getAgents();
  const roles = agents.map(agentName => {
    const session = getAgentSessions(agentName);
    const now = Date.now();
    const lastUpdate = session?.updatedAt || 0;
    const isActive = (now - lastUpdate) < 5 * 60 * 1000;
    return { id: agentName, isActive };
  });
  
  res.json({
    code: 0,
    data: {
      cronJobs: getCronJobs(),
      skills: getSkills(),
      totalAgents: agents.length,
      activeAgents: roles.filter(r => r.isActive).length,
      systemInfo: getSystemInfo()
    }
  });
});

// API: 刷新数据
app.post('/api/refresh', (req, res) => {
  res.json({ code: 0, message: '数据已刷新', timestamp: new Date().toISOString() });
});

// API: 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🎭 OpenClaw 状态收集服务 (真实版)      ║
║   端口: ${PORT}                            ║
║                                         ║
║   API 列表：                              ║
║   GET  /api/roles    角色状态            ║
║   GET  /api/status   整体状态            ║
║   POST /api/refresh  刷新数据            ║
╚═══════════════════════════════════════════╝
  `);
});
