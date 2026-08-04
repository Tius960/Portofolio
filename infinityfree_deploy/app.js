async function loadPortfolio() {
  try {
    const response = await fetch('data/portfolio.json');
    if (!response.ok) {
      throw new Error(`Gagal memuat: HTTP ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    renderPortfolio(data);
  } catch (error) {
    console.error(error);
    const summary = document.getElementById('summary');
    if (summary) summary.textContent = 'Data gagal dimuat: ' + error.message;
  }
}

function isPdfFile(url = '') {
  return /\.pdf$/i.test(url);
}

function normalizePath(url = '') {
  if (!url) return '';
  return url.startsWith('/') ? url.slice(1) : url;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPortfolio(data) {
  if (!data) return;

  const profilePhoto = document.getElementById('profilePhoto');
  if (profilePhoto) {
    const imagePath = normalizePath(data.profileImage || 'images/2222500135.jpg');
    profilePhoto.src = imagePath;
    profilePhoto.alt = data.name || 'Portofolio';
    profilePhoto.onerror = () => { profilePhoto.src = 'images/2222500135.jpg'; };
    profilePhoto.onclick = () => window.open(imagePath, '_blank', 'noopener');
  }

  setText('name', data.name);
  setText('title', data.title);
  setText('subtitle', data.subtitle || data.title || 'Web Developer');
  setText('summary', data.summary);
  setText('aboutText', data.aboutText || data.summary || '');

  const contact = data.contact || {};
  const heroContact = document.getElementById('heroContact');
  if (heroContact) {
    heroContact.innerHTML = `
      <a href="mailto:${escapeHtml(contact.email || '')}">${escapeHtml(contact.email || '')}</a>
      <a href="https://wa.me/62${escapeHtml((contact.whatsapp || '').replace(/^0/, ''))}" target="_blank" rel="noreferrer">WA: ${escapeHtml(contact.whatsapp || '')}</a>
      ${contact.linkedin ? `<a href="${escapeHtml(contact.linkedin)}" target="_blank" rel="noreferrer">LinkedIn</a>` : ''}
      ${contact.github ? `<a href="${escapeHtml(contact.github)}" target="_blank" rel="noreferrer">GitHub</a>` : ''}
    `;
  }

  document.getElementById('certificateCards').innerHTML = (data.certificates || []).map((cert) => {
    const fileUrl = normalizePath(cert.image);
    const previewUrl = normalizePath(cert.preview || cert.image);
    const previewHtml = previewUrl && !isPdfFile(previewUrl)
      ? `<a href="${escapeHtml(previewUrl)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(previewUrl)}" alt="Preview ${escapeHtml(cert.title)}" class="certificate-preview" /></a>`
      : `<div class="certificate-pdf-preview"><span>PDF</span><a href="${encodeURI(fileUrl)}" target="_blank" rel="noreferrer">Lihat sertifikat</a></div>`;

    return `
      <div class="certificate-card">
        ${previewHtml}
        <div>
          <h3>${escapeHtml(cert.title)}</h3>
          <p>${escapeHtml(cert.issuer)}</p>
          <p>${escapeHtml(cert.description)}</p>
          ${isPdfFile(fileUrl) ? `<a class="certificate-link" href="${encodeURI(fileUrl)}" target="_blank" rel="noreferrer">Buka dokumen</a>` : ''}
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('projectList').innerHTML = (data.projects || []).map((project) => `
    <article class="item">
      <h3>${escapeHtml(project.name)}</h3>
      <p>${escapeHtml(project.description)}</p>
      ${project.images ? `<div class="project-gallery">${project.images.map((img) => { const normalized = normalizePath(img); return `<a href="${escapeHtml(normalized)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(normalized)}" alt="${escapeHtml(project.name)}" /></a>`; }).join('')}</div>` : ''}
    </article>
  `).join('');

  document.getElementById('experienceList').innerHTML = (data.experience || []).map((item) => `
    <div>
      <strong>${escapeHtml(item.company)}</strong>
      <p>${escapeHtml(item.role)}</p>
      <small>${escapeHtml(item.period)}</small>
    </div>
  `).join('');

  document.getElementById('skillList').innerHTML = (data.skills || []).map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join('');
}

loadPortfolio();