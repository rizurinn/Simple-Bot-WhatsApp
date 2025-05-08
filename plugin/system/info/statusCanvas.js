const os = require('os');
const { performance } = require('perf_hooks');
const { sizeFormatter } = require('human-readable');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

const formatUptime = (uptime) => {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const calculatePercentage = (used, total) => Math.floor((used / total) * 100);

let handler = async (m, { sock }) => {
  try {
    const timestampStart = performance.now();
    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model.trim() : 'Unknown';
    const cpuCount = cpus.length;
    const botUptime = process.uptime();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = calculatePercentage(usedMem, totalMem);
    const platform = os.platform();
    const hostname = os.hostname();
    const timestampEnd = performance.now();
    const latency = timestampEnd - timestampStart;

    await sock.sendMessage(m.chat, { react: { text: '📊', key: m.key } });

    const canvasWidth = 1200;
    const canvasHeight = 675;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, '#3949ab');
    gradient.addColorStop(1, '#5c6bc0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < canvasWidth; i += 20) {
      for (let j = 0; j < canvasHeight; j += 20) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(i, j, 10, 10);
      }
    }

    ctx.shadowColor = '#7986cb';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SERVER STATUS', canvasWidth / 2, 90);
    ctx.shadowBlur = 0;

    const now = new Date();
    ctx.font = '20px Arial';
    ctx.fillStyle = '#c5cae9';
    ctx.textAlign = 'right';
    ctx.fillText(`Generated: ${now.toLocaleString()}`, canvasWidth - 50, 130);

    const cardX = 80;
    const cardY = 160;
    const cardWidth = canvasWidth - 160;
    const cardHeight = canvasHeight - 220;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 20);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const infoX = cardX + 40;
    let currentY = cardY + 60;
    const lineHeight = 50;

    const drawInfoItem = (icon, label, value) => {
      ctx.fillStyle = '#9fa8da';
      ctx.font = '24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(icon, infoX, currentY);
      ctx.fillStyle = '#e8eaf6';
      ctx.font = '22px Arial';
      ctx.fillText(label, infoX + 40, currentY);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Arial';
      ctx.fillText(value, infoX + 180, currentY);
      currentY += lineHeight;
    };

    drawInfoItem('⚙',  'CPU:',     cpuModel.substring(0, 35) + (cpuModel.length > 35 ? '...' : ''));
    drawInfoItem('●',  'Cores:',   `${cpuCount} cores`);
    drawInfoItem('#',  'System:',  `${platform} (${hostname})`);
    drawInfoItem('⏱',  'Uptime:',  formatUptime(botUptime));
    drawInfoItem('⚡',  'Latency:', `${latency.toFixed(2)} ms`);

    currentY += 20;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Memory Usage', infoX, currentY);
    currentY += 40;

    const barWidth = 500;
    const barHeight = 30;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(infoX, currentY, barWidth, barHeight, 15);
    ctx.fill();

    const fillWidth = (memPercentage / 100) * barWidth;
    const barGradient = ctx.createLinearGradient(infoX, currentY, infoX + fillWidth, currentY);
    if (memPercentage < 60) {
      barGradient.addColorStop(0, '#4caf50');
      barGradient.addColorStop(1, '#81c784');
    } else if (memPercentage < 85) {
      barGradient.addColorStop(0, '#ffa726');
      barGradient.addColorStop(1, '#ffcc80');
    } else {
      barGradient.addColorStop(0, '#f44336');
      barGradient.addColorStop(1, '#ef9a9a');
    }
    ctx.fillStyle = barGradient;
    ctx.beginPath();
    ctx.roundRect(infoX, currentY, fillWidth, barHeight, 15);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${memPercentage}%`, infoX + (fillWidth / 2), currentY + 20);

    currentY += barHeight + 30;
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${format(usedMem)} / ${format(totalMem)}`, infoX, currentY);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(canvasWidth - 100, canvasHeight - 100, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(50, 50, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 30, cardY + 200);
    ctx.lineTo(cardX + cardWidth - 30, cardY + 200);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cardX + 600, cardY + 30);
    ctx.lineTo(cardX + 600, cardY + cardHeight - 30);
    ctx.stroke();

    ctx.fillStyle = '#c5cae9';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Powered by Node.js', canvasWidth / 2, canvasHeight - 30);

    const outputPath = path.join(__dirname, 'modern-server-info.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    await sock.sendMessage(m.chat, {
      image: fs.readFileSync(outputPath),
      caption: '📊 *Server Status Report* | Modern Dashboard'
    }, { quoted: m });

    fs.unlinkSync(outputPath);
  } catch (err) {
    console.error(err);
    await m.reply('Terjadi kesalahan dalam memuat informasi server.');
  }
};

handler.tags = ['info'];
handler.command = ['status'];

module.exports = handler;