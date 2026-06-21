// ============================================
// edit.js — versi final (Basic/Premium)
// ============================================

const PAKET_FITUR = {
  basic:   ['mempelai','acara','konten','tampilan','tamu','galeri','musik','akun'],
  premium: ['mempelai','acara','konten','tampilan','tamu','galeri','musik','akun',
            'lokasi','statistik','pengaturan']
}

const PAKET_MINIMUM = {
  lokasi: 'Premium', statistik: 'Premium', pengaturan: 'Premium'
}

const PALETTES = [
  { nama: 'Elegan Gelap',  primary: '#0f0e0c', secondary: '#c9a96e', accent: '#e8d5a3' },
  { nama: 'Floral Rosé',   primary: '#1a1015', secondary: '#c9879a', accent: '#e8c5cf' },
  { nama: 'Sage Forest',   primary: '#141a12', secondary: '#8fad7c', accent: '#c4d9b8' },
  { nama: 'Navy Klasik',   primary: '#0d1b2a', secondary: '#a8c5e0', accent: '#d4e8f4' },
  { nama: 'Champagne',     primary: '#1a1710', secondary: '#d4b896', accent: '#ede5d8' },
  { nama: 'Deep Purple',   primary: '#120d1a', secondary: '#b89fd4', accent: '#ddd4f0' },
]

let undanganData    = null
let undanganSlug    = null
let daftarTamu      = []
let pilihanIlustrasi = { pria: null, wanita: null }

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await db.auth.getSession()
  if (!session) { window.location.href = 'login.html'; return }

  const emailEl = document.getElementById('editor-email')
  if (emailEl) emailEl.textContent = session.user.email

  renderPaletteGrid()
  await muatDataUndangan(session.user.id)
})

// ============================================
// MUAT DATA UNDANGAN
// ============================================
async function muatDataUndangan(userId) {
  const { data, error } = await db
    .from('invitations')
    .select('*')
    .eq('owner_id', userId)
    .single()

  if (error || !data) {
    tampilStatus('Undangan tidak ditemukan. Hubungi admin.', 'error')
    return
  }

  undanganData = data
  undanganSlug = data.slug

  isiForm()
  setupTabsByPaket()
  setupGaleriByPaket()
  setupFotoMempelaiByPaket()
  await cekLockStatus()

  const baseUrl  = window.location.origin
  const linkFull = `${baseUrl}/undangan.html?slug=${undanganSlug}`
  setVal('link-undangan', linkFull)
  const prevEl = document.getElementById('btn-preview')
  if (prevEl) prevEl.href = linkFull

  muatDaftarTamu()
  renderGaleri()
}

// ============================================
// SETUP GALERI BERDASARKAN PAKET
// ============================================
function setupGaleriByPaket() {
  const locked = document.getElementById('galeri-locked-msg')
  const panel  = document.getElementById('galeri-upload-panel')
  if (!undanganData) return

  if (undanganData.paket === 'basic') {
    if (locked) locked.style.display = 'block'
    if (panel)  panel.style.display  = 'none'
  } else {
    if (locked) locked.style.display = 'none'
    if (panel)  panel.style.display  = 'block'
  }
}

// ============================================
// SETUP FOTO MEMPELAI BERDASARKAN PAKET
// ============================================
function setupFotoMempelaiByPaket() {
  const panelIlustrasi = document.getElementById('panel-ilustrasi')
  const panelFoto      = document.getElementById('panel-foto-upload')
  if (!undanganData) return

  const isPremium = undanganData.paket === 'premium'

  if (panelIlustrasi) panelIlustrasi.style.display = isPremium ? 'none'  : 'block'
  if (panelFoto)      panelFoto.style.display      = isPremium ? 'block' : 'none'

  if (!isPremium) {
    // Init illustration pickers for Basic
    pilihanIlustrasi.pria   = undanganData.ilustrasi_pria   || 'pria-songkok'
    pilihanIlustrasi.wanita = undanganData.ilustrasi_wanita || 'wanita-hijab-kebaya'

    buatIlustrasiPicker('picker-pria',   'pria',   pilihanIlustrasi.pria,   null)
    buatIlustrasiPicker('picker-wanita', 'wanita', pilihanIlustrasi.wanita, null)

    // Setup callback
    window._onPilihIlustrasi = (key, jenis) => {
      pilihanIlustrasi[jenis] = key
    }
  } else {
    // Show existing photos for Premium
    renderPreviewFotoMempelai('pria',   undanganData.foto_pria)
    renderPreviewFotoMempelai('wanita', undanganData.foto_wanita)
  }
}

// ============================================
// SIMPAN ILUSTRASI (Basic)
// ============================================
async function simpanIlustrasi() {
  if (!undanganData) return

  const { error } = await db.from('invitations').update({
    ilustrasi_pria:   pilihanIlustrasi.pria   || 'pria-songkok',
    ilustrasi_wanita: pilihanIlustrasi.wanita || 'wanita-hijab-kebaya',
    updated_at:       new Date().toISOString()
  }).eq('id', undanganData.id)

  if (error) { tampilStatus('Gagal: ' + error.message, 'error'); return }
  tampilStatus('✓ Ilustrasi berhasil disimpan!', 'ok')
}

// ============================================
// UPLOAD FOTO MEMPELAI (Premium)
// ============================================
async function uploadFotoMempelai(jenis, input) {
  const file = input.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    tampilStatus('Ukuran foto maksimal 2MB.', 'error')
    input.value = ''
    return
  }

  tampilStatus(`Mengupload foto ${jenis}...`, 'ok')

  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `${undanganData.id}/${jenis}-${Date.now()}.${ext}`

  // Hapus foto lama kalau ada
  const urlLama = jenis === 'pria'
    ? undanganData.foto_pria
    : undanganData.foto_wanita

  if (urlLama) {
    const marker = '/object/public/mempelai/'
    const idx    = urlLama.indexOf(marker)
    if (idx !== -1) {
      await db.storage.from('mempelai').remove([urlLama.substring(idx + marker.length)])
    }
  }

  const { error: uploadError } = await db.storage
    .from('mempelai').upload(path, file, { upsert: true })

  if (uploadError) {
    tampilStatus('Gagal upload: ' + uploadError.message, 'error')
    input.value = ''
    return
  }

  const { data: { publicUrl } } = db.storage.from('mempelai').getPublicUrl(path)

  const updateData = jenis === 'pria'
    ? { foto_pria: publicUrl }
    : { foto_wanita: publicUrl }
  updateData.updated_at = new Date().toISOString()

  const { error: updateError } = await db.from('invitations')
    .update(updateData).eq('id', undanganData.id)

  if (updateError) {
    tampilStatus('Gagal simpan: ' + updateError.message, 'error')
    input.value = ''
    return
  }

  if (jenis === 'pria') undanganData.foto_pria  = publicUrl
  else                  undanganData.foto_wanita = publicUrl

  renderPreviewFotoMempelai(jenis, publicUrl)
  tampilStatus(`✓ Foto ${jenis} berhasil diupload!`, 'ok')
  input.value = ''
}

// ============================================
// HAPUS FOTO MEMPELAI (Premium)
// ============================================
async function hapusFotoMempelai(jenis) {
  const url = jenis === 'pria' ? undanganData.foto_pria : undanganData.foto_wanita
  if (!url) return

  const marker = '/object/public/mempelai/'
  const idx    = url.indexOf(marker)
  if (idx !== -1) {
    await db.storage.from('mempelai').remove([url.substring(idx + marker.length)])
  }

  const updateData = jenis === 'pria'
    ? { foto_pria: '' }
    : { foto_wanita: '' }
  updateData.updated_at = new Date().toISOString()

  await db.from('invitations').update(updateData).eq('id', undanganData.id)

  if (jenis === 'pria') undanganData.foto_pria  = ''
  else                  undanganData.foto_wanita = ''

  renderPreviewFotoMempelai(jenis, null)
  tampilStatus(`✓ Foto ${jenis} dihapus.`, 'ok')
}

// Render preview foto mempelai di editor
function renderPreviewFotoMempelai(jenis, url) {
  const wrap    = document.getElementById(`preview-${jenis}`)
  const btnHapus = document.getElementById(`btn-hapus-${jenis}`)
  if (!wrap) return

  if (url) {
    wrap.innerHTML = `
      <img src="${escHtml(url)}" alt="Foto ${jenis}"
        style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>
    `
    if (btnHapus) btnHapus.style.display = 'block'
  } else {
    wrap.innerHTML = '<div class="foto-placeholder">👤</div>'
    if (btnHapus) btnHapus.style.display = 'none'
  }
}

// ============================================
// SETUP TABS BERDASARKAN PAKET
// ============================================
function setupTabsByPaket() {
  const paket = undanganData?.paket || 'basic'
  const tabTerbatas = ['lokasi', 'statistik', 'pengaturan']

  tabTerbatas.forEach(fitur => {
    const btn = document.getElementById('tab-btn-' + fitur)
    if (!btn) return
    if (!cekAkses(fitur)) {
      btn.classList.add('locked')
      btn.title = `Upgrade ke ${PAKET_MINIMUM[fitur]} untuk mengakses`
    }
  })

  const badge = document.getElementById('paket-badge')
  if (badge) {
    badge.textContent = paket === 'premium' ? 'Premium' : 'Basic'
    badge.className   = 'paket-badge paket-' + paket
  }
}

function cekAkses(fitur) {
  const paket = undanganData?.paket || 'basic'
  return (PAKET_FITUR[paket] || []).includes(fitur)
}

// ============================================
// ISI SEMUA FORM
// ============================================
function isiForm() {
  const d = undanganData

  setVal('nama-pria',        d.nama_pria)
  setVal('nama-pria-full',   d.nama_pria_full)
  setVal('ortu-pria',        d.ortu_pria)
  setVal('nama-wanita',      d.nama_wanita)
  setVal('nama-wanita-full', d.nama_wanita_full)
  setVal('ortu-wanita',      d.ortu_wanita)
  setVal('tanggal-akad',     d.tanggal_akad    || '')
  setVal('jam-akad',         d.jam_akad        || '')
  setVal('tanggal-resepsi',  d.tanggal_resepsi || '')
  setVal('jam-resepsi',      d.jam_resepsi     || '')
  setVal('tempat-akad',      d.tempat_akad     || '')
  setVal('alamat-akad',      d.alamat_akad     || '')
  setVal('tempat-resepsi',   d.tempat_resepsi  || '')
  setVal('alamat-resepsi',   d.alamat_resepsi  || '')

  setCheck('tog-bismillah',    d.show_bismillah)
  setCheck('tog-quotes',       d.show_quotes)
  setCheck('tog-quotes-arabic',d.show_quotes_arabic)
  setCheck('tog-love-story',   d.show_love_story)
  setCheck('tog-countdown',    d.show_countdown)
  setCheck('tog-galeri',       d.show_galeri)
  setCheck('tog-video',        d.show_video)
  setCheck('tog-maps',         d.show_maps)
  setCheck('tog-gift',         d.show_gift)
  setCheck('tog-rsvp',         d.show_rsvp)
  setCheck('tog-wishes',       d.show_wishes)

  setVal('quotes-title',       d.quotes_title       || 'Firman Allah')
  setVal('quotes-text',        d.quotes_text        || '')
  setVal('quotes-translation', d.quotes_translation || '')
  setVal('quotes-source',      d.quotes_source      || '')
  setVal('love-story',         d.love_story         || '')
  setVal('gift-bank-name',      d.gift_bank_name      || '')
  setVal('gift-account-number', d.gift_account_number || '')
  setVal('gift-account-name',   d.gift_account_name   || '')
  setVal('gift-address',        d.gift_address        || '')
  setVal('video-url',           d.video_url           || '')
  setVal('maps-url-edit',       d.maps_url            || '')
  setVal('maps-embed-edit',     d.maps_embed          || '')
  setVal('musik-url-edit',      d.musik_url           || '')
  setVal('input-slug',          d.slug                || '')

  if (d.musik_url) {
    const audio = document.getElementById('musik-preview')
    const wrap  = document.getElementById('musik-preview-wrap')
    if (audio && wrap) { audio.src = d.musik_url; wrap.style.display = 'block' }
  }

  const primary   = d.color_primary   || '#0f0e0c'
  const secondary = d.color_secondary || '#c9a96e'
  const accent    = d.color_accent    || '#e8d5a3'
  setColorField('primary',   primary)
  setColorField('secondary', secondary)
  setColorField('accent',    accent)
  sorotPaletteAktif(primary, secondary, accent)

  setElText('akun-email',   d.client_email || '—')
  setElText('akun-paket',   d.paket === 'premium' ? 'Premium' : 'Basic')
  setElText('akun-expires', d.expires_at
    ? new Date(d.expires_at).toLocaleDateString('id-ID')
    : 'Selamanya')
}

// ============================================
// CEK LOCK STATUS
// ============================================
async function cekLockStatus() {
  if (!undanganData) return
  try {
    const { data } = await db.rpc('cek_lock_status', { inv_id: undanganData.id })
    const banner = document.getElementById('lock-banner')
    const msgEl  = document.getElementById('lock-message')
    const lockEl = document.getElementById('akun-lock-status')
    if (data?.is_locked) {
      if (banner) banner.style.display = 'flex'
      if (msgEl)  msgEl.textContent    = data.reason
      if (lockEl) { lockEl.textContent = '🔒 Terkunci'; lockEl.style.color = '#e07070' }
    } else {
      if (lockEl) { lockEl.textContent = '✓ Aktif'; lockEl.style.color = '#6dc898' }
    }
  } catch (e) { /* non-blocking */ }
}

// ============================================
// SIMPAN — MEMPELAI
// ============================================
async function simpanMempelai() {
  if (!undanganData) return
  const { error } = await db.from('invitations').update({
    nama_pria:        getVal('nama-pria'),
    nama_pria_full:   getVal('nama-pria-full'),
    ortu_pria:        getVal('ortu-pria'),
    nama_wanita:      getVal('nama-wanita'),
    nama_wanita_full: getVal('nama-wanita-full'),
    ortu_wanita:      getVal('ortu-wanita'),
    updated_at:       new Date().toISOString()
  }).eq('id', undanganData.id)
  if (error) { tampilStatus('Gagal: ' + error.message, 'error'); return }
  tampilStatus('✓ Data mempelai berhasil disimpan!', 'ok')
}

// ============================================
// SIMPAN — ACARA
// ============================================
async function simpanAcara() {
  if (!undanganData) return
  const { error } = await db.from('invitations').update({
    tanggal_akad:    getVal('tanggal-akad')    || null,
    jam_akad:        getVal('jam-akad'),
    tanggal_resepsi: getVal('tanggal-resepsi') || null,
    jam_resepsi:     getVal('jam-resepsi'),
    tempat_akad:     getVal('tempat-akad'),
    alamat_akad:     getVal('alamat-akad'),
    tempat_resepsi:  getVal('tempat-resepsi'),
    alamat_resepsi:  getVal('alamat-resepsi'),
    updated_at:      new Date().toISOString()
  }).eq('id', undanganData.id)
  if (error) { tampilStatus('Gagal: ' + error.message, 'error'); return }
  tampilStatus('✓ Data acara berhasil disimpan!', 'ok')
}

// ============================================
// SIMPAN — KONTEN
// ============================================
async function simpanKonten() {
  if (!undanganData) return
  const { error } = await db.from('invitations').update({
    show_bismillah:     getCheck('tog-bismillah'),
    show_quotes:        getCheck('tog-quotes'),
    show_quotes_arabic: getCheck('tog-quotes-arabic'),
    show_love_story:    getCheck('tog-love-story'),
    show_countdown:     getCheck('tog-countdown'),
    show_galeri:        getCheck('tog-galeri'),
    show_video:         getCheck('tog-video'),
    show_maps:          getCheck('tog-maps'),
    show_gift:          getCheck('tog-gift'),
    show_rsvp:          getCheck('tog-rsvp'),
    show_wishes:        getCheck('tog-wishes'),
    quotes_title:        getVal('quotes-title'),
    quotes_text:         getVal('quotes-text'),
    quotes_translation:  getVal('quotes-translation'),
    quotes_source:       getVal('quotes-source'),
    love_story:          getVal('love-story'),
    gift_bank_name:      getVal('gift-bank-name'),
    gift_account_number: getVal('gift-account-number'),
    gift_account_name:   getVal('gift-account-name'),
    gift_address:        getVal('gift-address'),
    video_url:           getVal('video-url'),
    updated_at:          new Date().toISOString()
  }).eq('id', undanganData.id)
  if (error) { tampilStatus('Gagal: ' + error.message, 'error'); return }
  tampilStatus('✓ Konten berhasil disimpan!', 'ok')
}

// ============================================
// SIMPAN — TAMPILAN
// ============================================
async function simpanTampilan() {
  if (!undanganData) return
  const primary   = getVal('color-primary-hex')   || '#0f0e0c'
  const secondary = getVal('color-secondary-hex') || '#c9a96e'
  const accent    = getVal('color-accent-hex')    || '#e8d5a3'
  const { error } = await db.from('invitations').update({
    color_primary: primary, color_secondary: secondary,
    color_accent: accent, updated_at: new Date().toISOString()
  }).eq('id', undanganData.id)
  if (error) { tampilStatus('Gagal: ' + error.message, 'error'); return }
  undanganData.color_primary = primary
  undanganData.color_secondary = secondary
  undanganData.color_accent = accent
  tampilStatus('✓ Tampilan berhasil disimpan!', 'ok')
}

// ============================================
// SIMPAN — LOKASI
// ============================================
async function simpanLokasi() {
  if (!undanganData || !cekAkses('lokasi')) return
  const { error } = await db.from('invitations').update({
    maps_url: getVal('maps-url-edit'),
    maps_embed: getVal('maps-embed-edit'),
    updated_at: new Date().toISOString()
  }).eq('id', undanganData.id)
  if (error) { tampilStatus('Gagal: ' + error.message, 'error'); return }
  tampilStatus('✓ Lokasi berhasil disimpan!', 'ok')
}

// ============================================
// GALERI (Premium only)
// ============================================
async function uploadFoto(input) {
  const file = input.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    tampilStatus('Ukuran foto maksimal 2MB.', 'error')
    input.value = ''; return
  }
  const galeriSaat = undanganData.galeri || []
  if (galeriSaat.length >= 6) {
    tampilStatus('Maksimal 6 foto.', 'error')
    input.value = ''; return
  }
  tampilStatus('Mengupload foto...', 'ok')
  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `${undanganData.id}/${Date.now()}.${ext}`
  const { error: uploadError } = await db.storage
    .from('galeri').upload(path, file, { upsert: false })
  if (uploadError) {
    tampilStatus('Gagal upload: ' + uploadError.message, 'error')
    input.value = ''; return
  }
  const { data: { publicUrl } } = db.storage.from('galeri').getPublicUrl(path)
  const galariBaru = [...galeriSaat, publicUrl]
  const { error: updateError } = await db.from('invitations').update({
    galeri: galariBaru, updated_at: new Date().toISOString()
  }).eq('id', undanganData.id)
  if (updateError) {
    tampilStatus('Gagal simpan: ' + updateError.message, 'error')
    input.value = ''; return
  }
  undanganData.galeri = galariBaru
  renderGaleri()
  tampilStatus('✓ Foto berhasil diupload!', 'ok')
  input.value = ''
}

async function hapusFoto(url) {
  const marker = '/object/public/galeri/'
  const idx    = url.indexOf(marker)
  if (idx !== -1) {
    await db.storage.from('galeri').remove([url.substring(idx + marker.length)])
  }
  const galariBaru = (undanganData.galeri || []).filter(u => u !== url)
  await db.from('invitations').update({
    galeri: galariBaru, updated_at: new Date().toISOString()
  }).eq('id', undanganData.id)
  undanganData.galeri = galariBaru
  renderGaleri()
  tampilStatus('✓ Foto dihapus.', 'ok')
}

function renderGaleri() {
  const grid = document.getElementById('galeri-editor-grid')
  const area = document.getElementById('upload-area')
  if (!grid) return
  const fotos = undanganData?.galeri || []
  grid.innerHTML = fotos.map((url, i) => `
    <div class="galeri-foto-item">
      <img src="${escHtml(url)}" alt="Foto ${i + 1}" loading="lazy"/>
      <button class="btn-hapus-foto"
        onclick="hapusFoto('${escHtml(url)}')"
        title="Hapus">✕</button>
    </div>
  `).join('')
  if (area) area.style.display = fotos.length >= 6 ? 'none' : 'flex'
}

// ============================================
// SIMPAN — MUSIK
// ============================================
async function simpanMusik() {
  if (!undanganData) return
  const url = getVal('musik-url-edit')
  const { error } = await db.from('invitations').update({
    musik_url: url, updated_at: new Date().toISOString()
  }).eq('id', undanganData.id)
  if (error) { tampilStatus('Gagal: ' + error.message, 'error'); return }
  const audio = document.getElementById('musik-preview')
  const wrap  = document.getElementById('musik-preview-wrap')
  if (audio && wrap && url) { audio.src = url; wrap.style.display = 'block' }
  undanganData.musik_url = url
  tampilStatus('✓ Musik berhasil disimpan!', 'ok')
}

// ============================================
// STATISTIK
// ============================================
async function muatStatistik() {
  if (!undanganData || !cekAkses('statistik')) return
  const { data } = await db.from('rsvp').select('*')
    .eq('invitation_id', undanganData.id).order('created_at', { ascending: false })
  if (!data) return
  const total = data.length
  const hadir = data.filter(r => r.hadir === 'hadir').length
  const ragu  = data.filter(r => r.hadir === 'ragu').length
  const tidak = data.filter(r => r.hadir === 'tidak').length
  const tamu  = data.reduce((s,r) => s + (r.jumlah || 1), 0)
  setElHTML('stat-grid', `
    <div class="stat-card"><span class="stat-num">${total}</span><span class="stat-label">Total RSVP</span></div>
    <div class="stat-card stat-hadir"><span class="stat-num">${hadir}</span><span class="stat-label">Hadir</span></div>
    <div class="stat-card stat-ragu"><span class="stat-num">${ragu}</span><span class="stat-label">Mungkin</span></div>
    <div class="stat-card stat-tidak"><span class="stat-num">${tidak}</span><span class="stat-label">Tidak Hadir</span></div>
    <div class="stat-card"><span class="stat-num">${tamu}</span><span class="stat-label">Est. Tamu</span></div>
  `)
  const list = document.getElementById('rsvp-list-editor')
  if (!list) return
  list.innerHTML = !data.length
    ? '<p class="tamu-kosong">Belum ada RSVP masuk.</p>'
    : data.map(r => `
        <div class="rsvp-item">
          <div class="rsvp-info">
            <span class="rsvp-nama">${escHtml(r.nama)}</span>
            <span class="rsvp-waktu">${waktuRelatif(r.created_at)}</span>
          </div>
          <div class="rsvp-detail">
            <span class="rsvp-badge rsvp-${r.hadir}">${labelHadir(r.hadir)}</span>
            <span class="rsvp-jumlah">${r.jumlah} orang</span>
            ${r.pesan ? `<span class="rsvp-pesan">"${escHtml(r.pesan)}"</span>` : ''}
          </div>
        </div>`).join('')
}

async function exportRSVP() {
  if (!cekAkses('statistik')) return
  const { data } = await db.from('rsvp').select('*')
    .eq('invitation_id', undanganData.id).order('created_at')
  if (!data) return
  const header = 'Nama,Kehadiran,Jumlah,Pesan,Waktu'
  const rows   = data.map(r =>
    `"${r.nama}","${labelHadir(r.hadir)}","${r.jumlah}","${r.pesan||''}","${new Date(r.created_at).toLocaleString('id-ID')}"`
  )
  const blob = new Blob(['\ufeff' + [header,...rows].join('\n')],
    { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `rsvp-${undanganSlug}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

function labelHadir(val) {
  return val === 'hadir' ? 'Hadir' : val === 'ragu' ? 'Mungkin' : 'Tidak Hadir'
}

// ============================================
// SLUG CUSTOM
// ============================================
async function simpanSlug() {
  if (!undanganData || !cekAkses('pengaturan')) return
  const slugBaru = getVal('input-slug')
    .toLowerCase().replace(/[^a-z0-9-]/g,'-')
    .replace(/-+/g,'-').replace(/^-|-$/g,'')
  if (!slugBaru) { tampilStatus('Slug tidak boleh kosong.', 'error'); return }
  if (slugBaru === undanganData.slug) { tampilStatus('Slug tidak berubah.', 'ok'); return }
  const { error } = await db.from('invitations').update({
    slug: slugBaru, updated_at: new Date().toISOString()
  }).eq('id', undanganData.id)
  if (error) {
    tampilStatus(
      (error.message.includes('unique') || error.message.includes('duplicate'))
        ? 'Slug sudah dipakai.' : 'Gagal: ' + error.message,
      'error'
    )
    return
  }
  undanganData.slug = slugBaru
  undanganSlug      = slugBaru
  setVal('input-slug', slugBaru)
  const linkFull = `${window.location.origin}/undangan.html?slug=${slugBaru}`
  setVal('link-undangan', linkFull)
  const prevEl = document.getElementById('btn-preview')
  if (prevEl) prevEl.href = linkFull
  tampilStatus('✓ URL berhasil diperbarui!', 'ok')
}

// ============================================
// GANTI PASSWORD
// ============================================
async function gantiPassword(e) {
  e.preventDefault()
  const passwordBaru = document.getElementById('password-baru').value
  const konfirmasi   = document.getElementById('password-konfirmasi').value
  const btnSubmit    = e.target.querySelector('button[type="submit"]')
  if (passwordBaru !== konfirmasi) { tampilStatus('Password tidak cocok.', 'error'); return }
  if (passwordBaru.length < 8)    { tampilStatus('Password minimal 8 karakter.', 'error'); return }
  btnSubmit.disabled = true; btnSubmit.textContent = 'Memproses...'
  const { error } = await db.auth.updateUser({ password: passwordBaru })
  btnSubmit.disabled = false; btnSubmit.textContent = 'Ganti Password'
  if (error) { tampilStatus('Gagal: ' + error.message, 'error'); return }
  tampilStatus('✓ Password berhasil diganti!', 'ok')
  document.getElementById('form-ganti-password').reset()
  document.getElementById('password-strength-bar').style.width = '0'
  document.getElementById('password-strength-label').textContent = ''
}

function cekKekuatanPassword(val) {
  const bar   = document.getElementById('password-strength-bar')
  const label = document.getElementById('password-strength-label')
  if (!bar || !label) return
  let skor = 0
  if (val.length >= 8)                         skor++
  if (val.length >= 12)                        skor++
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) skor++
  if (/[0-9]/.test(val))                       skor++
  if (/[^A-Za-z0-9]/.test(val))               skor++
  const level = [
    { w:'0%',   color:'transparent', teks:'' },
    { w:'25%',  color:'#e07070',     teks:'Lemah' },
    { w:'50%',  color:'#e09050',     teks:'Cukup' },
    { w:'75%',  color:'var(--gold)', teks:'Baik' },
    { w:'100%', color:'#6dc898',     teks:'Kuat' },
  ][Math.min(skor,4)]
  bar.style.width = level.w; bar.style.background = level.color
  label.textContent = level.teks; label.style.color = level.color
}

// ============================================
// COLOR PALETTE
// ============================================
function renderPaletteGrid() {
  const grid = document.getElementById('palette-grid')
  if (!grid) return
  grid.innerHTML = PALETTES.map((p,i) => `
    <div class="palette-swatch" id="swatch-${i}" onclick="pilihPalette(${i})">
      <div class="palette-dots">
        <div class="palette-dot" style="background:${p.primary}"></div>
        <div class="palette-dot" style="background:${p.secondary}"></div>
        <div class="palette-dot" style="background:${p.accent}"></div>
      </div>
      <div class="palette-nama">${p.nama}</div>
    </div>
  `).join('')
}

function pilihPalette(idx) {
  const p = PALETTES[idx]
  if (!p) return
  setColorField('primary', p.primary)
  setColorField('secondary', p.secondary)
  setColorField('accent', p.accent)
  sorotPaletteAktif(p.primary, p.secondary, p.accent)
}

function sorotPaletteAktif(primary, secondary, accent) {
  document.querySelectorAll('.palette-swatch').forEach((el, i) => {
    const p = PALETTES[i]
    el.classList.toggle('active',
      p.primary === primary && p.secondary === secondary && p.accent === accent)
  })
}

function syncColorInput(field, hex) {
  const el = document.getElementById(`color-${field}-hex`)
  if (el) el.value = hex
}

function syncColorPick(field, hex) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return
  const el = document.getElementById(`color-${field}-pick`)
  if (el) el.value = hex
}

async function ekstrakWarnaDariFoto() {
  const fotos = undanganData?.galeri || []
  if (!fotos.length) { tampilStatus('Upload foto ke Galeri terlebih dahulu.', 'error'); return }
  const btn = document.getElementById('btn-ekstrak')
  btn.textContent = 'Mengekstrak...'; btn.disabled = true
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise((res, rej) => {
      img.onload = res; img.onerror = rej
      img.src = fotos[0] + '?t=' + Date.now()
    })
    const ct      = new ColorThief()
    const palette = ct.getPalette(img, 3)
    const toHex   = ([r,g,b]) => '#' + [r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('')
    const primary   = toHex(palette[0])
    const secondary = toHex(palette[1])
    const accent    = toHex(palette[2])
    setColorField('primary', primary)
    setColorField('secondary', secondary)
    setColorField('accent', accent)
    sorotPaletteAktif(primary, secondary, accent)
    tampilStatus('✓ Warna berhasil diekstrak! Klik Simpan Tampilan untuk menerapkan.', 'ok')
  } catch (e) {
    tampilStatus('Gagal ekstrak warna. Coba foto lain atau atur manual.', 'error')
  }
  btn.textContent = '✦ Ekstrak Warna dari Foto Galeri'; btn.disabled = false
}

// ============================================
// DAFTAR TAMU
// ============================================
function muatDaftarTamu() {
  const tersimpan = localStorage.getItem('tamu_' + undanganSlug)
  daftarTamu = tersimpan ? JSON.parse(tersimpan) : []
  renderDaftarTamu()
}

function simpanDaftarTamu() {
  localStorage.setItem('tamu_' + undanganSlug, JSON.stringify(daftarTamu))
}

function tambahTamu() {
  const input = document.getElementById('input-tamu')
  const nama  = input.value.trim()
  if (!nama) return
  daftarTamu.push(nama)
  simpanDaftarTamu(); renderDaftarTamu()
  input.value = ''; input.focus()
}

function hapusTamu(index) {
  daftarTamu.splice(index, 1)
  simpanDaftarTamu(); renderDaftarTamu()
}

function renderDaftarTamu() {
  const list    = document.getElementById('tamu-list')
  const baseUrl = window.location.origin
  if (!daftarTamu.length) {
    list.innerHTML = '<p class="tamu-kosong">Belum ada tamu. Tambahkan di atas.</p>'
    return
  }
  list.innerHTML = daftarTamu.map((nama, i) => {
    const link = `${baseUrl}/undangan.html?slug=${undanganSlug}&to=${encodeURIComponent(nama)}`
    return `
      <div class="tamu-item">
        <div class="tamu-info">
          <span class="tamu-nama">${escHtml(nama)}</span>
          <span class="tamu-link">${escHtml(link)}</span>
        </div>
        <div class="tamu-aksi">
          <button class="btn-tamu-copy"
            onclick="copyTamuLink('${escHtml(link)}', this)">Salin</button>
          <button class="btn-tamu-hapus"
            onclick="hapusTamu(${i})">Hapus</button>
        </div>
      </div>`
  }).join('')
}

function copyTamuLink(link, btn) {
  navigator.clipboard.writeText(link).then(() => {
    btn.textContent = '✓'
    setTimeout(() => btn.textContent = 'Salin', 1500)
  })
}

function copyLink() {
  const linkEl = document.getElementById('link-undangan')
  if (!linkEl) return
  navigator.clipboard.writeText(linkEl.value).then(() => {
    const btn = document.querySelector('.btn-copy')
    btn.textContent = '✓ Disalin!'
    setTimeout(() => btn.textContent = 'Salin Link', 1500)
  })
}

// ============================================
// TAB NAVIGATION
// ============================================
function bukaTab(nama, btnEl) {
  if (!cekAkses(nama) && PAKET_MINIMUM[nama]) {
    tampilStatus(`Upgrade ke paket ${PAKET_MINIMUM[nama]} untuk mengakses.`, 'error')
    return
  }
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
  document.getElementById('tab-' + nama).classList.add('active')
  btnEl.classList.add('active')
  if (nama === 'statistik') muatStatistik()
}

// ============================================
// LOGOUT
// ============================================
async function logout() {
  await db.auth.signOut()
  window.location.href = 'login.html'
}

// ============================================
// STATUS NOTIFIKASI
// ============================================
function tampilStatus(pesan, tipe = 'ok') {
  const el = document.getElementById('save-status')
  if (!el) return
  el.style.transition = 'none'; el.style.opacity = '0'
  el.textContent = pesan
  el.className = 'save-status ' + (tipe === 'ok' ? 'status-ok' : 'status-error')
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.4s ease'; el.style.opacity = '1'
      setTimeout(() => { el.style.opacity = '0' }, 3500)
    })
  })
}

// ============================================
// HELPERS
// ============================================
function setVal(id, val) {
  const el = document.getElementById(id); if (el) el.value = val || ''
}
function getVal(id) {
  const el = document.getElementById(id); return el ? el.value.trim() : ''
}
function setCheck(id, val) {
  const el = document.getElementById(id); if (el) el.checked = val !== false
}
function getCheck(id) {
  const el = document.getElementById(id); return el ? el.checked : true
}
function setColorField(field, hex) {
  const p = document.getElementById(`color-${field}-pick`)
  const h = document.getElementById(`color-${field}-hex`)
  if (p) p.value = hex; if (h) h.value = hex
}
function setElText(id, val) {
  const el = document.getElementById(id); if (el) el.textContent = val || ''
}
function setElHTML(id, html) {
  const el = document.getElementById(id); if (el) el.innerHTML = html
}
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}
function waktuRelatif(isoString) {
  const s = Date.now() - new Date(isoString)
  const m = Math.floor(s/60000)
  if (m<1) return 'Baru saja'
  if (m<60) return `${m} menit lalu`
  const j = Math.floor(m/60)
  if (j<24) return `${j} jam lalu`
  return `${Math.floor(j/24)} hari lalu`
}