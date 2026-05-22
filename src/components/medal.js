// Medalla virtual descargable (PNG / PDF con sesión)
import { jsPDF } from 'jspdf';
import { getProgress } from './gamification.js';
import { getPlayerNickname, getSchoolProfile } from './profile.js';
import { showModal, showToast } from './ui.js';
import { syncAchievementMedal } from '../services/firebase.js';

const MEDAL_SIZE = 640;

function drawMedalCanvas(ctx, data) {
  const w = MEDAL_SIZE;
  const h = MEDAL_SIZE;
  const cx = w / 2;
  const cy = h / 2 + 10;

  const grad = ctx.createRadialGradient(cx, cy - 20, 40, cx, cy, 280);
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Anillo exterior
  ctx.beginPath();
  ctx.arc(cx, cy, 220, 0, Math.PI * 2);
  const ring = ctx.createLinearGradient(0, 0, w, h);
  ring.addColorStop(0, '#2dd4bf');
  ring.addColorStop(0.5, '#8b5cf6');
  ring.addColorStop(1, '#06b6d4');
  ctx.strokeStyle = ring;
  ctx.lineWidth = 14;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 200, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cinta superior
  ctx.fillStyle = '#6d28d9';
  ctx.beginPath();
  ctx.moveTo(cx - 90, 55);
  ctx.lineTo(cx + 90, 55);
  ctx.lineTo(cx + 70, 95);
  ctx.lineTo(cx - 70, 95);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 22px Sora, Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('UNIVERSIDAD SIMÓN BOLÍVAR', cx, 82);
  ctx.font = '600 14px Inter, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Sede Cúcuta · LOGIKA', cx, 102);

  // Estrella central
  ctx.fillStyle = '#2dd4bf';
  ctx.font = 'bold 72px Sora, sans-serif';
  ctx.fillText('★', cx, cy + 25);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 28px Sora, Inter, sans-serif';
  ctx.fillText(data.achievementTitle, cx, cy + 75);

  ctx.font = '600 36px Sora, Inter, sans-serif';
  ctx.fillStyle = '#2dd4bf';
  const name = data.displayName || 'Estudiante';
  ctx.fillText(name, cx, cy + 120);

  if (data.subtitle) {
    ctx.font = '500 18px Inter, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(data.subtitle, cx, cy + 155);
  }

  ctx.font = '500 16px Inter, sans-serif';
  ctx.fillStyle = '#64748b';
  const dateStr = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  ctx.fillText(dateStr, cx, cy + 185);

  ctx.font = '600 14px Inter, sans-serif';
  ctx.fillStyle = '#a78bfa';
  ctx.fillText(`+${data.xp || 0} XP · Nivel ${data.level || 1}`, cx, h - 45);
}

function buildMedalData(achievementTitle, subtitle = '') {
  const progress = getProgress();
  const school = getSchoolProfile();
  const nickname = getPlayerNickname() || progress.username;
  return {
    achievementTitle,
    subtitle: subtitle || (school ? `${school.schoolName} · Grado ${school.grade}` : ''),
    displayName: school?.studentName || nickname,
    xp: progress.xp,
    level: progress.level
  };
}

function renderMedalToCanvas(data) {
  const canvas = document.createElement('canvas');
  canvas.width = MEDAL_SIZE;
  canvas.height = MEDAL_SIZE;
  const ctx = canvas.getContext('2d');
  drawMedalCanvas(ctx, data);
  return canvas;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadMedalPng(data) {
  const canvas = renderMedalToCanvas(data);
  canvas.toBlob((blob) => {
    if (blob) {
      const safe = (data.displayName || 'logika').replace(/\s+/g, '_').slice(0, 24);
      downloadBlob(blob, `medalla-logika-${safe}.png`);
      showToast('Medalla descargada en PNG.', 'success');
    }
  }, 'image/png', 1);
}

export function downloadMedalPdf(data) {
  const canvas = renderMedalToCanvas(data);
  const img = canvas.toDataURL('image/png', 1);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = pdf.internal.pageSize.getWidth();
  const size = 160;
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pw, 297, 'F');
  pdf.addImage(img, 'PNG', (pw - size) / 2, 40, size, size);
  pdf.setTextColor(200, 200, 200);
  pdf.setFontSize(11);
  pdf.text('Certificado digital LOGIKA — Universidad Simón Bolívar Sede Cúcuta', pw / 2, 220, {
    align: 'center'
  });
  const safe = (data.displayName || 'logika').replace(/\s+/g, '_').slice(0, 24);
  pdf.save(`medalla-logika-${safe}.pdf`);
  showToast('Medalla guardada en PDF.', 'success');
}

export function showMedalCelebration(achievementTitle, subtitle = '') {
  const data = buildMedalData(achievementTitle, subtitle);
  const isLoggedIn = getProgress().isLoggedIn;

  syncAchievementMedal({
    displayName: data.displayName,
    achievementTitle: data.achievementTitle,
    subtitle: data.subtitle,
    xp: data.xp,
    level: data.level
  });

  const preview = renderMedalToCanvas(data);
  const previewUrl = preview.toDataURL('image/png');

  const bodyHtml = `
    <div class="medal-preview-wrap">
      <img src="${previewUrl}" alt="Vista previa de tu medalla" class="medal-preview-img" width="320" height="320"/>
      <p class="medal-preview-name"><strong>${data.displayName}</strong></p>
      <p class="medal-preview-title">${achievementTitle}</p>
      ${data.subtitle ? `<p class="text-small text-muted">${data.subtitle}</p>` : ''}
    </div>
    <div class="medal-download-actions">
      <button type="button" class="btn btn-primary btn-block" id="btn-medal-png">Descargar imagen (PNG)</button>
      ${
        isLoggedIn
          ? '<button type="button" class="btn btn-secondary btn-block" id="btn-medal-pdf">Descargar PDF en alta calidad</button>'
          : '<p class="medal-login-hint text-small">Inicia sesión para descargar la medalla en <strong>PDF</strong> de mayor calidad.</p>'
      }
    </div>
  `;

  const modal = showModal('¡Tu medalla LOGIKA!', bodyHtml, { confirmLabel: 'Cerrar' });

  setTimeout(() => {
    document.getElementById('btn-medal-png')?.addEventListener('click', () => downloadMedalPng(data));
    document.getElementById('btn-medal-pdf')?.addEventListener('click', () => {
      if (!getProgress().isLoggedIn) {
        showToast('Inicia sesión para descargar el PDF.', 'warning');
        return;
      }
      downloadMedalPdf(data);
    });
  }, 50);

  return modal;
}
