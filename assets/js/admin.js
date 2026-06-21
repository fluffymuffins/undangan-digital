// ============================================
// admin.js — versi final (Basic/Premium)
// ============================================

let adminSession = null

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await db.auth.getSession()
  if (!session) { window.location.href = 'login.html'; return }

  const { data: profile } = await db
    .from('profiles').select('is_admin').eq('id', session.user.id).single()
  if (!profile?.is_admin) { window.location.href = 'edit.html'; return }

  adminSession = session
  const emailEl = document.getElementById('admin-email')
  if (emailEl) emailEl.textContent = session.user.email

  await muatDashboard()
})

// ============================================
// DASHBOARD
// ============================================
async function muatDashboard() {
  const { data } = await db
    .from('invitations')
    .select('id, paket, created_at, nama_pria, nama_wanita, client_email, slug, owner_id')
    .order('created_at', { ascending: false })

  if (!data) return

  const total   = data.length
  const basic   = data.filter(d => d.paket === 'basic').length
  const premium = data.filter(d => d.paket === 'premium').length

  const statGrid = document.getElementById('admin-stat-grid')
  if (statGrid) {
    statGrid.innerHTML = `
      <div class="stat-card">
        <span class="stat-num">${total}</span>
        <span class="stat-label">Total Klien</span>
      </div>
      <div class="stat-card">
        <span class="stat-num" style="color:var(--teks-redup)">${basic}</span>
        <span class="stat-label">Basic</span>
      </div>
      <div class="stat-card">
        <span class="stat-num" style="color:#AFA9EC">${premium}</span>
        <span class="stat-label">Premium</span>
      </div>
    `
  }

  const recent = document.getElementById('recent-klien')
  if (recent) {
    const lima = data.slice(0, 5)
    recent.innerHTML = !lima.length
      ? '<p class="tamu-kosong">Belum ada klien terdaftar.</p>'
      : lima.map(k => renderKlienRow(k, false)).join('')
  }
}

// ============================================
// LOAD SEMUA KLIEN
// ============================================
async function muatKlien() {
  const list = document.getElementById('klien-list')
  if (!list) return
  list.innerHTML = '<p class="tamu-kosong">Memuat...</p>'

  const { data } = await db
    .from('invitations').select('*').order('created_at', { ascending: false })

  if (!data) { list.innerHTML = '<p class="tamu-kosong">Gagal memuat.</p>'; return }
  if (!data.length) { list.innerHTML = '<p class="tamu-kosong">Belum ada klien.</p>'; return }
  list.innerHTML = data.map(k => renderKlienRow(k, true)).join('')
}

// ============================================
// RENDER BARIS KLIEN
// ============================================
function renderKlienRow(k, showActions = false) {
  const paketColor = k.paket === 'premium' ? '#AFA9EC' : 'var(--teks-redup)'
  const paketLabel = k.paket === 'premium' ? 'Premium' : 'Basic'
  const baseUrl    = window.location.origin
  const link       = `${baseUrl}/undangan.html?slug=${k.slug}`

  return `
    <div class="klien-row">
      <div class="klien-info">
        <span class="klien-email">${escHtml(k.client_email || '—')}</span>
        <span class="klien-nama">
          ${escHtml(k.nama_pria)} & ${escHtml(k.nama_wanita)}
        </span>
      </div>
      <div class="klien-meta">
        <span class="paket-badge"
          style="color:${paketColor};border-color:${paketColor}">
          ${paketLabel}
        </span>
        <span class="klien-tgl">
          ${new Date(k.created_at).toLocaleDateString('id-ID')}
        </span>
      </div>
      ${showActions ? `
        <div class="klien-aksi">
          <a class="btn-tamu-copy"
            href="${escHtml(link)}" target="_blank">Lihat</a>
          <button class="btn-tamu-copy"
            onclick="ubahPaket('${k.id}', '${k.paket}')">Paket</button>
          <button class="btn-tamu-hapus"
            onclick="resetPassword('${k.owner_id}', '${escHtml(k.client_email||'')}')">
            Reset PW
          </button>
        </div>
      ` : ''}
    </div>
  `
}

// ============================================
// BUAT KLIEN BARU
// ============================================
async function buatKlien() {
  const email   = document.getElementById('new-email').value.trim()
  const paket   = document.getElementById('new-paket').value
  const pria    = document.getElementById('new-pria').value.trim()
  const wanita  = document.getElementById('new-wanita').value.trim()
  const expires = document.getElementById('new-expires').value
  const btn     = document.getElementById('btn-buat-klien')

  if (!email || !pria || !wanita) {
    tampilStatus('Semua field wajib diisi.', 'error'); return
  }

  btn.disabled = true; btn.textContent = 'Memproses...'

  const { data: { session } } = await db.auth.getSession()

  const body = {
    action: 'create', email, paket,
    nama_pria: pria, nama_wanita: wanita
  }
  if (expires) body.expires_at = new Date(expires).toISOString()

  const res = await fetch(`${FUNCTIONS_URL}/create-client`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(body)
  })

  const result = await res.json()
  btn.disabled = false; btn.textContent = 'Buat Akun Klien'

  if (!result.sukses) { tampilStatus('Gagal: ' + result.error, 'error'); return }

  document.getElementById('new-email').value  = ''
  document.getElementById('new-pria').value   = ''
  document.getElementById('new-wanita').value = ''
  document.getElementById('new-expires').value = ''

  const baseUrl = window.location.origin
  document.getElementById('kred-email').textContent    = result.email
  document.getElementById('kred-password').textContent = result.password
  document.getElementById('kred-paket').textContent    =
    result.paket === 'premium' ? 'Premium (Dengan Foto)' : 'Basic (Tanpa Foto)'
  document.getElementById('kred-link').textContent     =
    `${baseUrl}/undangan.html?slug=${result.slug}`

  bukaModal('modal-kredensial')
  tampilStatus('✓ Akun berhasil dibuat!', 'ok')
}

// ============================================
// RESET PASSWORD
// ============================================
async function resetPassword(userId, email) {
  if (!confirm(`Reset password untuk ${email}?`)) return
  const { data: { session } } = await db.auth.getSession()

  const res = await fetch(`${FUNCTIONS_URL}/create-client`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ action: 'reset', user_id: userId })
  })

  const result = await res.json()
  if (!result.sukses) { tampilStatus('Gagal: ' + result.error, 'error'); return }

  document.getElementById('reset-sub').textContent      = `Password baru untuk ${email}`
  document.getElementById('reset-password').textContent = result.password
  bukaModal('modal-reset')
}

// ============================================
// UBAH PAKET KLIEN
// ============================================
async function ubahPaket(invId, paketSaat) {
  const label   = paketSaat === 'basic' ? 'basic' : 'premium'
  const paketBaru = prompt(
    `Paket saat ini: ${label}\nMasukkan paket baru (basic / premium):`,
    label
  )
  if (!paketBaru || paketBaru.toLowerCase() === label) return
  if (!['basic','premium'].includes(paketBaru.toLowerCase())) {
    tampilStatus('Paket tidak valid. Gunakan: basic atau premium.', 'error'); return
  }
  const { error } = await db.from('invitations').update({
    paket: paketBaru.toLowerCase(), updated_at: new Date().toISOString()
  }).eq('id', invId)
  if (error) { tampilStatus('Gagal: ' + error.message, 'error'); return }
  tampilStatus(`✓ Paket berhasil diubah ke ${paketBaru}.`, 'ok')
  muatKlien()
}

// ============================================
// COPY SEMUA KREDENSIAL (format WA)
// ============================================
function copySemuaKredensial() {
  const email    = document.getElementById('kred-email').textContent
  const password = document.getElementById('kred-password').textContent
  const paket    = document.getElementById('kred-paket').textContent
  const link     = document.getElementById('kred-link').textContent
  const loginUrl = window.location.origin + '/login.html'

  const teks =
    `🎊 *Undangan Digital — Akses Klien*\n\n` +
    `📧 Email: ${email}\n` +
    `🔑 Password: ${password}\n` +
    `📦 Paket: ${paket}\n\n` +
    `🔗 Link Login Editor:\n${loginUrl}\n\n` +
    `🔗 Link Undangan:\n${link}\n\n` +
    `Silakan login dan edit undanganmu.\n` +
    `Disarankan ganti password setelah login pertama.`

  navigator.clipboard.writeText(teks).then(() => {
    tampilStatus('✓ Kredensial disalin! Siap dikirim via WA.', 'ok')
  })
}

function copyKred(elId, btn) {
  const teks = document.getElementById(elId).textContent
  navigator.clipboard.writeText(teks).then(() => {
    btn.textContent = '✓'
    setTimeout(() => btn.textContent = 'Salin', 1500)
  })
}

// ============================================
// TAB
// ============================================
function bukaTab(nama, btnEl) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
  document.getElementById('tab-' + nama).classList.add('active')
  btnEl.classList.add('active')
  if (nama === 'klien') muatKlien()
}

function bukaModal(id) { document.getElementById(id).classList.remove('hidden') }
function tutupModal(id) { document.getElementById(id).classList.add('hidden') }

async function logout() {
  await db.auth.signOut()
  window.location.href = 'login.html'
}

function tampilStatus(pesan, tipe = 'ok') {
  const el = document.getElementById('save-status')
  if (!el) return
  el.style.transition = 'none'; el.style.opacity = '0'
  el.textContent = pesan
  el.className = 'save-status ' + (tipe === 'ok' ? 'status-ok' : 'status-error')
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.4s ease'; el.style.opacity = '1'
      setTimeout(() => { el.style.opacity = '0' }, 3000)
    })
  })
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}