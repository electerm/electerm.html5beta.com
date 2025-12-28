import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Translation mapping from Chinese to English
const titleTranslations = {
  'electerm: 工作区': 'Electerm Workspace',
  electerm终端背景设置: 'Electerm Terminal Background Settings',
  electerm连接跳跃: 'Electerm Connection Jump',
  electerm使用演示: 'Electerm Usage Demo',
  electerm主题设置和编辑: 'Electerm Theme Settings and Editing',
  electerm批量输入和镜像输入内容到多个终端: 'Electerm Batch and Mirror Input to Multiple Terminals',
  'electerm:同步数据到electerm云服务': 'Electerm Sync Data to Cloud Service',
  'electerm: 书签创建,编辑,导入导出以及其他操作': 'Electerm Bookmark Operations',
  'electerm: sftp路径跟终端路径同步功能': 'Electerm SFTP Path Sync with Terminal',
  'electerm: 终端和sftp同屏显示': 'Electerm Terminal and SFTP Split View',
  electerm快速命令: 'Electerm Quick Commands',
  'electerm: 使用大模型AI接口生成命令和命令提示': 'Electerm AI Command Generation',
  'electerm: 查看ssh服务器信息，包括内存,处理器,运行时间，进程，磁盘和网络等': 'Electerm View SSH Server Info',
  'electerm: 批量操作': 'Electerm Batch Operations',
  'electerm: 连接跳转': 'Electerm Connection Hop',
  'electerm: 本地到远程的ssh隧道': 'Electerm Local to Remote SSH Tunnel',
  'electerm: 远程到本地的ssh隧道': 'Electerm Remote to Local SSH Tunnel',
  'electerm: 动态转发socks代理': 'Electerm Dynamic SOCKS Proxy',
  'electerm: 会话布局': 'Electerm Session Layout',
  'electerm: 数据导入导出': 'Electerm Data Import Export',
  'electerm: 使用自定义css来控制应用样式': 'Electerm Custom CSS Styling',
  'electerm: 启动时打开书签': 'Electerm Open Bookmarks on Startup',
  'electerm: 使用系统标题栏': 'Electerm Use System Title Bar',
  'electerm sftp: 使用压缩传输加速文件夹传输': 'Electerm SFTP Compressed Transfer',
  'electerm: 终端关键词高亮': 'Electerm Terminal Keyword Highlighting',
  'electerm sftp: 检查文件信息&编辑文件权限': 'Electerm SFTP File Info and Permissions',
  'electerm: 设置启动密码': 'Electerm Set Startup Password',
  'electerm: 改变应用透明度': 'Electerm Change App Transparency',
  'electerm: 编辑快捷键': 'Electerm Edit Hotkeys',
  'electerm: 打开网页': 'Electerm Open Webpage',
  'electerm: telnet': 'Electerm Telnet',
  'electerm: serialport': 'Electerm Serial Port',
  'electerm: ftp': 'Electerm FTP',
  'electerm: vnc': 'Electerm VNC',
  'electerm设置：设置本地启动目录': 'Electerm Set Local Startup Directory',
  'electerm: 选中终端文本自动复制': 'Electerm Auto Copy on Select',
  'electerm: 改变字体设置': 'Electerm Change Font Settings',
  'electerm: 放大缩小': 'Electerm Zoom In Out',
  'electerm: 多实例': 'Electerm Multiple Instances',
  'electerm: 使用sftp传输文件和文件夹': 'Electerm SFTP Transfer Files and Folders'
}

const videosPath = path.join(__dirname, 'videos.json')
const data = JSON.parse(fs.readFileSync(videosPath, 'utf8'))

// Add videoSlug and titleEn to each video
data.videos = data.videos.map(video => {
  const titleEn = titleTranslations[video.title] || video.title
  const slug = titleEn
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

  return {
    ...video,
    titleEn,
    videoSlug: slug
  }
})

// Write back to file
fs.writeFileSync(videosPath, JSON.stringify(data, null, 2), 'utf8')

console.log(`✅ Added titleEn and videoSlug to ${data.videos.length} videos`)
console.log('\nSample translations:')
data.videos.slice(0, 5).forEach(v => {
  console.log(`  ${v.title}`)
  console.log(`  → ${v.titleEn}`)
  console.log(`  → ${v.videoSlug}\n`)
})
