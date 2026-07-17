// ───────────────────────────────────────
// DATA & STATE
// ───────────────────────────────────────
const CATEGORIES = [
  { id:'wifi',      icon:'📶', label:'WiFi / Red',        bg:'#EFF6FF', border:'#BFDBFE' },
  { id:'monitor',   icon:'🖥️',  label:'Monitor / Proyector', bg:'#F5F3FF', border:'#DDD6FE' },
  { id:'banio',     icon:'🚻',  label:'Baños',            bg:'#FFF7ED', border:'#FED7AA' },
  { id:'banca',     icon:'🪑',  label:'Bancas / Mesas',   bg:'#F0FFF4', border:'#BBF7D0' },
  { id:'luz',       icon:'💡',  label:'Iluminación',      bg:'#FEFCE8', border:'#FEF08A' },
  { id:'ac',        icon:'❄️',  label:'Aire Acond.',      bg:'#F0F9FF', border:'#BAE6FD' },
  { id:'puerta',    icon:'🚪',  label:'Puertas / Acceso', bg:'#FFF1F2', border:'#FECDD3' },
  { id:'limpieza',  icon:'🧹',  label:'Limpieza',         bg:'#F0FDFA', border:'#99F6E4' },
  { id:'otro',      icon:'🔧',  label:'Otro',             bg:'#F9FAFB', border:'#E5E7EB' },
];

const USERS = {
  alumno: { name:'Ana García', email:'a.garcia@universidad.edu.mx', role:'Alumno', initials:'AG' },
  maestro: { name:'Dr. Carlos Mendoza', email:'c.mendoza@universidad.edu.mx', role:'Maestro', initials:'CM' },
  admin: { name:'Lic. Roberto Sánchez', email:'r.sanchez@universidad.edu.mx', role:'Administrador', initials:'RS' },
};

let currentUser = null;
let currentRole = 'alumno';
let selectedCategory = null;
let selectedUrgency = null;
let filterStatus = 'all';
let reports = [
  { id:1, userId:'maestro', category:'wifi', location:'Edificio B, Sala de Maestros', desc:'La señal WiFi es muy débil, apenas permite cargar páginas básicas. Afecta la preparación de clases.', urgency:'media', status:'progress', date:'2025-06-10', role:'maestro' },
  { id:2, userId:'alumno', category:'monitor', location:'Aula 105, Edificio A', desc:'El proyector no muestra colores correctamente, todo sale azulado. Los alumnos no pueden ver bien las presentaciones.', urgency:'alta', status:'pending', date:'2025-06-11', role:'alumno' },
  { id:3, userId:'alumno', category:'banca', location:'Patio central', desc:'Varias bancas del patio están rotas o con tornillos sueltos, representa un riesgo de caída.', urgency:'baja', status:'done', date:'2025-06-08', role:'alumno' },
  { id:4, userId:'maestro', category:'ac', location:'Edificio C, Aula 301', desc:'El aire acondicionado no enfría bien. En temporada de calor es insoportable para dar clases.', urgency:'alta', status:'review', date:'2025-06-12', role:'maestro' },
];
let nextId = 5;

// ───────────────────────────────────────
// LOGIN
// ───────────────────────────────────────
function setRole(r) {
  currentRole = r;
  document.querySelectorAll('.role-tab').forEach((t,i) => {
    t.classList.toggle('active', ['alumno','maestro','admin'][i] === r);
  });
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  err.style.display = 'none';

  // Credenciales fijas para maestro y administrador
  const MAESTRO_EMAIL = 'maestro@un.edu.mx';
  const MAESTRO_PASS  = 'Maestro.2025';
  const ADMIN_EMAIL   = 'admin@un.edu.mx';
  const ADMIN_PASS    = 'Admin.2025';

  if (currentRole === 'maestro') {
    if (email !== MAESTRO_EMAIL || pass !== MAESTRO_PASS) {
      err.style.display = 'block'; return;
    }
    currentUser = { ...USERS['maestro'], email };
    showDashboard(); return;
  }

  if (currentRole === 'admin') {
    if (email !== ADMIN_EMAIL || pass !== ADMIN_PASS) {
      err.style.display = 'block'; return;
    }
    currentUser = { ...USERS['admin'], email };
    showDashboard(); return;
  }

  // Alumno: correo al{matricula}@un.edu.mx — contraseña Uv.{matricula}
  const alumnoMatch = email.match(/^al(\d+)@un\.edu\.mx$/);
  if (!alumnoMatch) {
    err.style.display = 'block'; return;
  }
  const matricula = alumnoMatch[1];
  const expectedPass = `Uv.${matricula}`;
  if (pass !== expectedPass) {
    err.style.display = 'block'; return;
  }

  currentUser = {
    name: `Alumno ${matricula}`,
    email: email,
    role: 'Alumno',
    initials: 'AL',
    matricula: matricula,
  };
  showDashboard();
}

document.getElementById('login-password').addEventListener('keypress', e => {
  if (e.key === 'Enter') handleLogin();
});

function handleLogout() {
  currentUser = null;
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  showScreen('screen-login');
}

// ───────────────────────────────────────
// DASHBOARD
// ───────────────────────────────────────
function showDashboard() {
  showScreen('screen-dashboard');
  const isAdmin = currentRole === 'admin';

  // Nav
  document.getElementById('nav-avatar').textContent = currentUser.initials;
  document.getElementById('nav-name').textContent = currentUser.name;
  document.getElementById('nav-role').textContent = currentUser.role;

  // Greeting
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  document.getElementById('dash-greeting').textContent = `${greet}, ${currentUser.name.split(' ')[0]} 👋`;

  // Admin vs user
  document.getElementById('admin-filters').style.display = isAdmin ? 'block' : 'none';
  document.getElementById('btn-new-report').style.display = isAdmin ? 'none' : '';
  document.getElementById('quick-report-panel').style.display = isAdmin ? 'none' : '';
  document.getElementById('reports-panel-title').textContent = isAdmin ? 'Todos los reportes' : 'Mis Reportes';
  document.getElementById('reports-panel-sub').textContent = isAdmin ? 'Gestiona y actualiza el estado de los reportes' : 'Historial de fallas reportadas';
  document.getElementById('dash-subtitle').textContent = isAdmin
    ? 'Revisa y gestiona los reportes del campus'
    : 'Aquí están tus reportes activos';

  renderCatGrid();
  renderCatPicker();
  renderReports();
  updateStats();
}

function getMyReports() {
  if (currentRole === 'admin') return reports;
  return reports.filter(r => r.role === currentRole);
}

function updateStats() {
  const mine = getMyReports();
  document.getElementById('stat-total').textContent = mine.length;
  document.getElementById('stat-pending').textContent = mine.filter(r=>r.status==='pending').length;
  document.getElementById('stat-progress').textContent = mine.filter(r=>r.status==='progress').length;
  document.getElementById('stat-done').textContent = mine.filter(r=>r.status==='done').length;
}

// ───────────────────────────────────────
// REPORTS
// ───────────────────────────────────────
function renderReports() {
  let list = getMyReports();
  if (currentRole === 'admin' && filterStatus !== 'all') {
    list = list.filter(r => r.status === filterStatus);
  }

  const container = document.getElementById('reports-list');
  if (!list.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">📋</div>
      <h3>Sin reportes ${filterStatus !== 'all' ? 'en esta categoría' : 'aún'}</h3>
      <p>${currentRole === 'admin' ? 'No hay reportes que mostrar' : 'Cuando envíes un reporte aparecerá aquí'}</p>
    </div>`;
    return;
  }

  container.innerHTML = list.slice().reverse().map(r => {
    const cat = CATEGORIES.find(c=>c.id===r.category) || CATEGORIES[8];
    const statusInfo = getStatusInfo(r.status);
    const urgIcon = r.urgency === 'alta' ? '🔴' : r.urgency === 'media' ? '🟡' : '🟢';
    return `<div class="report-item" onclick="openDetail(${r.id})">
      <div class="report-cat-icon" style="background:${cat.bg};">${cat.icon}</div>
      <div class="report-info">
        <div class="report-title">${cat.label} — ${r.location}</div>
        <div class="report-meta">
          <span>${r.date}</span>
          <span>${urgIcon} ${r.urgency.charAt(0).toUpperCase()+r.urgency.slice(1)} urgencia</span>
          ${currentRole === 'admin' ? `<span>👤 ${r.role === 'maestro' ? 'Maestro' : 'Alumno'}</span>` : ''}
        </div>
      </div>
      <span class="report-badge ${statusInfo.cls}">${statusInfo.label}</span>
    </div>`;
  }).join('');
}

function filterReports(status) {
  filterStatus = status;
  document.querySelectorAll('.filter-tab').forEach(t => {
    t.classList.toggle('active', t.textContent.toLowerCase().includes(
      status === 'all' ? 'todos' : status === 'pending' ? 'pendientes' : status === 'progress' ? 'proceso' : 'resueltos'
    ));
  });
  renderReports();
}

function getStatusInfo(s) {
  return {
    pending:  { cls:'badge-pending',  label:'Pendiente' },
    progress: { cls:'badge-progress', label:'En proceso' },
    done:     { cls:'badge-done',     label:'Resuelto' },
    review:   { cls:'badge-review',   label:'En revisión' },
  }[s] || { cls:'badge-pending', label:'Pendiente' };
}

// ───────────────────────────────────────
// CATEGORY GRID (side panel)
// ───────────────────────────────────────
function renderCatGrid() {
  document.getElementById('cat-grid').innerHTML = CATEGORIES.map(c =>
    `<div class="cat-card" style="background:${c.bg}; border-color:${c.border}" onclick="openNewReport('${c.id}')">
      <div class="cat-card-icon">${c.icon}</div>
      <div class="cat-card-label">${c.label}</div>
    </div>`
  ).join('');
}

function renderCatPicker() {
  document.getElementById('cat-picker').innerHTML = CATEGORIES.map(c =>
    `<div class="cat-pick-item" id="pick-${c.id}" onclick="selectCategory('${c.id}')">
      <div class="cat-pick-icon">${c.icon}</div>
      <div class="cat-pick-label">${c.label}</div>
    </div>`
  ).join('');
}

// ───────────────────────────────────────
// NEW REPORT
// ───────────────────────────────────────
function openNewReport(catId) {
  selectedCategory = catId || null;
  selectedUrgency = null;

  document.getElementById('report-location').value = '';
  document.getElementById('report-desc').value = '';
  document.querySelectorAll('.cat-pick-item').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.urgency-btn').forEach(el => el.className = 'urgency-btn');
  if (catId) {
    document.getElementById('pick-' + catId)?.classList.add('selected');
  }
  openModal('modal-new');
}

function selectCategory(id) {
  selectedCategory = id;
  document.querySelectorAll('.cat-pick-item').forEach(el => el.classList.remove('selected'));
  document.getElementById('pick-' + id).classList.add('selected');
}

function setUrgency(u) {
  selectedUrgency = u;
  document.querySelectorAll('.urgency-btn').forEach(el => el.className = 'urgency-btn');
  document.getElementById('urg-'+u).className = `urgency-btn selected-${u === 'baja' ? 'low' : u === 'media' ? 'med' : 'high'}`;
}

function submitReport() {
  const loc = document.getElementById('report-location').value.trim();
  const desc = document.getElementById('report-desc').value.trim();

  if (!selectedCategory) { showToast('⚠️ Selecciona una categoría'); return; }
  if (!loc) { showToast('⚠️ Indica la ubicación'); return; }
  if (!desc) { showToast('⚠️ Describe la falla'); return; }
  if (!selectedUrgency) { showToast('⚠️ Selecciona el nivel de urgencia'); return; }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  reports.push({
    id: nextId++,
    userId: currentRole,
    category: selectedCategory,
    location: loc,
    desc: desc,
    urgency: selectedUrgency,
    status: 'pending',
    date: dateStr,
    role: currentRole,
  });

  closeModal('modal-new');
  renderReports();
  updateStats();
  showToast('✅ Reporte enviado correctamente');
}

// ───────────────────────────────────────
// DETAIL
// ───────────────────────────────────────
function openDetail(id) {
  const r = reports.find(x=>x.id===id);
  if (!r) return;
  const cat = CATEGORIES.find(c=>c.id===r.category) || CATEGORIES[8];
  const si = getStatusInfo(r.status);
  const urgLabel = r.urgency === 'alta' ? '🔴 Alta' : r.urgency === 'media' ? '🟡 Media' : '🟢 Baja';

  const isAdmin = currentRole === 'admin';

  document.getElementById('modal-detail-body').innerHTML = `
    <div class="detail-cat-header" style="background:${cat.bg}; color:${cat.border.replace('#','').length === 6 ? '#1B3A6B' : '#1B3A6B'}; border:1.5px solid ${cat.border};">
      <div class="detail-cat-icon">${cat.icon}</div>
      <div>
        <div class="detail-cat-label">${cat.label}</div>
        <div class="detail-cat-title">${r.location}</div>
      </div>
    </div>
    <div class="detail-grid">
      <div class="detail-field"><label>Estado actual</label><p><span class="report-badge ${si.cls}">${si.label}</span></p></div>
      <div class="detail-field"><label>Urgencia</label><p>${urgLabel}</p></div>
      <div class="detail-field"><label>Fecha de reporte</label><p>${r.date}</p></div>
      <div class="detail-field"><label>Reportado por</label><p>${r.role === 'maestro' ? '👨‍🏫 Maestro' : '🎓 Alumno'}</p></div>
    </div>
    <div>
      <div class="detail-desc-label">Descripción</div>
      <div class="detail-desc">${r.desc}</div>
    </div>
    ${isAdmin ? `
    <div class="status-update">
      <label>Actualizar estado:</label>
      <select class="form-select" id="status-select" style="flex:1; margin:0;" onchange="updateStatus(${id}, this.value)">
        <option value="pending" ${r.status==='pending'?'selected':''}>⏳ Pendiente</option>
        <option value="progress" ${r.status==='progress'?'selected':''}>🔄 En proceso</option>
        <option value="review" ${r.status==='review'?'selected':''}>🔍 En revisión</option>
        <option value="done" ${r.status==='done'?'selected':''}>✅ Resuelto</option>
      </select>
    </div>` : ''}
  `;

  openModal('modal-detail');
}

function updateStatus(id, status) {
  const r = reports.find(x=>x.id===id);
  if (r) {
    r.status = status;
    renderReports();
    updateStats();
    showToast('✅ Estado actualizado');
    closeModal('modal-detail');
  }
}

// ───────────────────────────────────────
// UTILITIES
// ───────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => {
    if (e.target === o) o.classList.remove('active');
  });
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
