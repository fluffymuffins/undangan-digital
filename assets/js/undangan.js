// ============================================
// undangan.js — versi final
// Basic/Premium, ilustrasi, auto-hide sections
// ============================================

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key)
}

let undanganId = null

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  const namaTamu = getParam('to')
  const elNama   = document.getElementById('nama-tamu')
  if (elNama) {
    elNama.textContent = namaTamu
      ? decodeURIComponent(namaTamu)
      : 'Tamu Undangan'
  }

  const slug = getParam('slug') || 'budi-rani'
  await muatUndangan(slug)
  await muatUcapan()
})

// ============================================
// MUAT UNDANGAN
// ============================================
async function muatUndangan(slug) {
  const { data, error } = await db
    .from('invitations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    console.error('Undangan tidak ditemukan:', error)
    return
  }

  undanganId = data.id

  applyColorPalette(data)
  isiKonten(data)
  renderFotoMempelai(data)
  applyToggleSections(data)
  renderGaleri(data)
  renderVideo(data.video_url)

  if (data.tanggal_resepsi) {
    jalankanCountdown(
      data.tanggal_resepsi + 'T' + (data.jam_resepsi || '11:00') + ':00'
    )
  }

  if (data.musik_url) {
    const audio = document.getElementById('bg-music')
    if (audio) audio.src = data.musik_url
  }
}

// ============================================
// RENDER FOTO / ILUSTRASI MEMPELAI
// Basic  → ilustrasi SVG
// Premium → foto asli (atau ilustrasi kalau belum upload)
// ============================================
function renderFotoMempelai(data) {
  const elPria   = document.getElementById('foto-pria')
  const elWanita = document.getElementById('foto-wanita')

  if (data.paket === 'premium' && data.foto_pria) {
    // Foto asli pria
    if (elPria) {
      elPria.innerHTML = `
        <img src="${escHtml(data.foto_pria)}"
          alt="Foto mempelai pria"
          style="width:100%;height:100%;object-fit:cover;display:block"/>
      `
    }
  } else {
    // Ilustrasi pria
    const ilustId = data.ilustrasi_pria || 'pria-songkok'
    if (elPria) {
      const d = ILUSTRASI[ilustId]
      if (d) {
        elPria.innerHTML   = d.svg
        elPria.style.color = 'var(--gold)'
        elPria.style.padding = '16px'
      }
    }
  }

  if (data.paket === 'premium' && data.foto_wanita) {
    // Foto asli wanita
    if (elWanita) {
      elWanita.innerHTML = `
        <img src="${escHtml(data.foto_wanita)}"
          alt="Foto mempelai wanita"
          style="width:100%;height:100%;object-fit:cover;display:block"/>
      `
    }
  } else {
    // Ilustrasi wanita
    const ilustId = data.ilustrasi_wanita || 'wanita-hijab-kebaya'
    if (elWanita) {
      const d = ILUSTRASI[ilustId]
      if (d) {
        elWanita.innerHTML   = d.svg
        elWanita.style.color = 'var(--gold)'
        elWanita.style.padding = '16px'
      }
    }
  }
}

// ============================================
// ISI KONTEN
// ============================================
function isiKonten(d) {
  isiEl('nama-mempelai-cover', null, 'innerHTML',
    `${escHtml(d.nama_pria)} <em>&</em> ${escHtml(d.nama_wanita)}`)
  if (d.tanggal_resepsi) {
    isiEl('tanggal-cover',  formatTanggal(d.tanggal_resepsi))
    isiEl('footer-tanggal', formatTanggalPendek(d.tanggal_resepsi))
  }
  isiEl('footer-nama', `${d.nama_pria} & ${d.nama_wanita}`)

  isiEl('pria-nama-full',   d.nama_pria_full)
  isiEl('pria-ortu',        d.ortu_pria)
  isiEl('wanita-nama-full', d.nama_wanita_full)
  isiEl('wanita-ortu',      d.ortu_wanita)

  // Quotes
  isiEl('quotes-section-title', d.quotes_title || 'Firman Allah')
  isiEl('quotes-source',        d.quotes_source)

  const arabicEl = document.getElementById('quotes-text')
  if (arabicEl) {
    if (d.show_quotes_arabic === false) arabicEl.style.display = 'none'
    else arabicEl.textContent = d.quotes_text || ''
  }

  const transEl = document.getElementById('quotes-translation-text')
  if (transEl) {
    if (d.quotes_translation) {
      transEl.textContent   = d.quotes_translation
      transEl.style.display = 'block'
    } else {
      transEl.style.display = 'none'
    }
  }

  // Acara
  if (d.tanggal_akad) {
    isiEl('akad-hari',    hariDari(d.tanggal_akad))
    isiEl('akad-tanggal', formatTanggal(d.tanggal_akad))
  }
  isiEl('akad-jam',    (d.jam_akad    || '08.00') + ' WIB')
  isiEl('akad-tempat', d.tempat_akad)
  isiEl('akad-alamat', d.alamat_akad)

  if (d.tanggal_resepsi) {
    isiEl('resepsi-hari',    hariDari(d.tanggal_resepsi))
    isiEl('resepsi-tanggal', formatTanggal(d.tanggal_resepsi))
  }
  isiEl('resepsi-jam',    (d.jam_resepsi    || '11.00') + ' WIB')
  isiEl('resepsi-tempat', d.tempat_resepsi)
  isiEl('resepsi-alamat', d.alamat_resepsi)

  // Love story
  const lsEl = document.getElementById('love-story-text')
  if (lsEl && d.love_story) {
    lsEl.innerHTML = escHtml(d.love_story).replace(/\n/g, '<br/>')
  }

  // Maps
  if (d.maps_embed) {
    const iframe = document.getElementById('maps-iframe')
    if (iframe) iframe.src = d.maps_embed
  }
  if (d.maps_url) {
    const btn = document.getElementById('btn-maps')
    if (btn) btn.href = d.maps_url
  }
  isiEl('maps-nama',   d.tempat_resepsi)
  isiEl('maps-alamat', d.alamat_resepsi)

  // Gift
  isiEl('gift-bank-name',      d.gift_bank_name)
  isiEl('gift-account-number', d.gift_account_number)
  isiEl('gift-account-name',   d.gift_account_name)
  isiEl('gift-address',        d.gift_address)

  if (!d.gift_bank_name && !d.gift_account_number) {
    const el = document.getElementById('gift-bank-card')
    if (el) el.style.display = 'none'
  }
  if (!d.gift_address) {
    const el = document.getElementById('gift-address-card')
    if (el) el.style.display = 'none'
  }
}

// ============================================
// TOGGLE SECTIONS + AUTO-HIDE EMPTY
// ============================================
function applyToggleSections(d) {
  // Toggle manual dari klien
  const map = {
    'section-quotes':     d.show_quotes,
    'section-love-story': d.show_love_story,
    'section-countdown':  d.show_countdown,
    'section-galeri':     d.show_galeri,
    'section-video':      d.show_video,
    'section-maps':       d.show_maps,
    'section-gift':       d.show_gift,
    'section-rsvp':       d.show_rsvp,
    'section-wishes':     d.show_wishes
  }

  Object.entries(map).forEach(([id, tampil]) => {
    const el = document.getElementById(id)
    if (el && tampil === false) el.style.display = 'none'
  })

  // Bismillah
  const bismillah = document.getElementById('el-bismillah')
  if (bismillah && d.show_bismillah === false) {
    bismillah.style.display = 'none'
  }

  // AUTO-HIDE: section yang toggle ON tapi isinya kosong
  // Maps: sembunyikan kalau tidak ada embed dan tidak ada url
  if (d.show_maps !== false) {
    const hasMaps = (d.maps_embed && d.maps_embed.trim()) ||
                    (d.maps_url && d.maps_url.trim())
    if (!hasMaps) {
      const el = document.getElementById('section-maps')
      if (el) el.style.display = 'none'
    }
  }

  // Video: sembunyikan kalau tidak ada url
  if (d.show_video !== false) {
    if (!d.video_url || !d.video_url.trim()) {
      const el = document.getElementById('section-video')
      if (el) el.style.display = 'none'
    }
  }

  // Love story: sembunyikan kalau teks kosong
  if (d.show_love_story !== false) {
    if (!d.love_story || !d.love_story.trim()) {
      const el = document.getElementById('section-love-story')
      if (el) el.style.display = 'none'
    }
  }
}

// ============================================
// GALERI
// Basic  → tampilkan pesan upgrade
// Premium → tampilkan foto
// ============================================
function renderGaleri(data) {
  const section = document.getElementById('section-galeri')

  // Basic: sembunyikan section galeri sepenuhnya
  if (data.paket === 'basic') {
    if (section) section.style.display = 'none'
    return
  }

  // Premium: tampilkan foto atau pesan kosong
  const grid  = document.getElementById('galeri-grid')
  const fotos = data.galeri || []

  if (!fotos.length) {
    if (grid) grid.innerHTML = `
      <p style="text-align:center;color:var(--teks-redup);
                font-size:13px;padding:40px;grid-column:1/-1">
        Foto belum tersedia.
      </p>`
    return
  }

  if (grid) {
    grid.innerHTML = fotos.map((url, i) => `
      <div class="galeri-item reveal"
        onclick="bukaLightbox('${escHtml(url)}')"
        style="cursor:pointer">
        <img src="${escHtml(url)}" alt="Foto ${i + 1}"
          loading="lazy"
          style="width:100%;height:100%;object-fit:cover;display:block"/>
      </div>
    `).join('')
  }
}

function bukaLightbox(url) {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.92);
    z-index:9999;display:flex;align-items:center;
    justify-content:center;cursor:pointer;padding:24px
  `
  overlay.innerHTML = `
    <img src="${escHtml(url)}"
      style="max-width:90vw;max-height:90vh;object-fit:contain;
             border:1px solid rgba(201,169,110,0.3)"/>
  `
  overlay.onclick = () => document.body.removeChild(overlay)
  document.body.appendChild(overlay)
}

// ============================================
// VIDEO YOUTUBE
// ============================================
function renderVideo(url) {
  if (!url) return
  const embedUrl = getYoutubeEmbedUrl(url)
  if (!embedUrl) return
  const iframe = document.getElementById('video-iframe')
  if (iframe) iframe.src = embedUrl
}

function getYoutubeEmbedUrl(url) {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/
  )
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : null
}

// ============================================
// UCAPAN
// ============================================
async function muatUcapan() {
  if (!undanganId) return
  const { data } = await db
    .from('wishes')
    .select('*')
    .eq('invitation_id', undanganId)
    .order('created_at', { ascending: false })
    .limit(20)

  const list = document.getElementById('daftar-ucapan')
  if (!list) return
  list.innerHTML = ''

  if (!data || !data.length) {
    list.innerHTML = `
      <p style="text-align:center;color:var(--teks-redup);
                font-size:13px;padding:24px 0">
        Belum ada ucapan. Jadilah yang pertama!
      </p>`
    return
  }

  data.forEach(w => {
    const item = document.createElement('div')
    item.className = 'ucapan-item'
    item.innerHTML = `
      <div class="ucapan-header">
        <span class="ucapan-dari">${escHtml(w.nama)}</span>
        <span class="ucapan-waktu">${waktuRelatif(w.created_at)}</span>
      </div>
      <p class="ucapan-teks">${escHtml(w.pesan)}</p>
    `
    list.appendChild(item)
  })
}

// ============================================
// RSVP
// ============================================
async function kirimRSVP(e) {
  e.preventDefault()
  if (!undanganId) return

  const status   = document.getElementById('rsvp-status')
  const btnKirim = e.target.querySelector('button[type="submit"]')
  const nama     = document.getElementById('rsvp-nama').value.trim()
  const hadir    = document.querySelector('input[name="hadir"]:checked')?.value
  const jumlah   = parseInt(document.getElementById('rsvp-jumlah').value) || 1
  const pesan    = document.getElementById('rsvp-pesan').value.trim()

  if (!nama || !hadir) {
    status.textContent = 'Mohon lengkapi nama dan konfirmasi kehadiran.'
    return
  }

  status.textContent = 'Mengirim...'
  btnKirim.disabled  = true

  const { error } = await db.from('rsvp').insert({
    invitation_id: undanganId, nama, hadir, jumlah, pesan
  })

  if (error) {
    status.textContent = 'Gagal mengirim. Coba lagi ya.'
    btnKirim.disabled  = false
    return
  }

  status.textContent = '✓ Terima kasih! Konfirmasi kamu sudah diterima.'
  document.getElementById('form-rsvp').reset()
  btnKirim.disabled = false
}

// ============================================
// UCAPAN SUBMIT
// ============================================
async function kirimUcapan(e) {
  e.preventDefault()
  if (!undanganId) return

  const nama     = document.getElementById('ucapan-nama').value.trim()
  const pesan    = document.getElementById('ucapan-pesan').value.trim()
  const btnKirim = e.target.querySelector('button[type="submit"]')
  if (!nama || !pesan) return

  btnKirim.disabled = true
  const { error } = await db.from('wishes').insert({
    invitation_id: undanganId, nama, pesan
  })

  if (error) {
    alert('Gagal mengirim ucapan.')
    btnKirim.disabled = false
    return
  }

  document.getElementById('form-ucapan').reset()
  btnKirim.disabled = false

  const list = document.getElementById('daftar-ucapan')
  const item = document.createElement('div')
  item.className = 'ucapan-item'
  item.innerHTML = `
    <div class="ucapan-header">
      <span class="ucapan-dari">${escHtml(nama)}</span>
      <span class="ucapan-waktu">Baru saja</span>
    </div>
    <p class="ucapan-teks">${escHtml(pesan)}</p>
  `
  list.prepend(item)
  const kosong = list.querySelector('p')
  if (kosong) kosong.remove()
}

// ============================================
// COPY GIFT
// ============================================
function copyGift(elId, btn) {
  const el = document.getElementById(elId)
  if (!el) return
  navigator.clipboard.writeText(el.textContent.trim()).then(() => {
    const asli = btn.textContent
    btn.textContent = '✓ Disalin!'
    setTimeout(() => btn.textContent = asli, 2000)
  })
}

// ============================================
// APPLY COLOR PALETTE
// ============================================
function applyColorPalette(data) {
  const root = document.documentElement
  const bg   = data.color_primary   || '#0f0e0c'
  const acc  = data.color_secondary || '#c9a96e'
  const lite = data.color_accent    || '#e8d5a3'

  root.style.setProperty('--bg',          bg)
  root.style.setProperty('--gold',        acc)
  root.style.setProperty('--gold-terang', lite)
  root.style.setProperty('--gold-gelap',  dimHex(acc, 0.65))
  root.style.setProperty('--border',      hexToRgba(acc, 0.2))
}

// ============================================
// BUKA UNDANGAN
// ============================================
function bukaUndangan() {
  const cover  = document.getElementById('cover')
  const konten = document.getElementById('konten')

  cover.classList.add('curtain-up')

  setTimeout(() => {
    cover.style.display = 'none'
    konten.classList.remove('hidden')
    // Double rAF ensures browser paints before observer fires
    requestAnimationFrame(() => requestAnimationFrame(() => initScrollReveal()))
  }, 780)
}

// ============================================
// COUNTDOWN
// ============================================
function jalankanCountdown(targetISO) {
  const target = new Date(targetISO)
  function perbarui() {
    const selisih = target - new Date()
    if (selisih <= 0) {
      ['cd-hari','cd-jam','cd-menit','cd-detik'].forEach(id => {
        const el = document.getElementById(id)
        if (el) el.textContent = '00'
      })
      return
    }
    const hari  = Math.floor(selisih / 86400000)
    const jam   = Math.floor((selisih % 86400000) / 3600000)
    const menit = Math.floor((selisih % 3600000)  / 60000)
    const detik = Math.floor((selisih % 60000)    / 1000)
    const set = (id, val) => {
      const el = document.getElementById(id)
      if (!el) return
      const newVal = String(val).padStart(2, '0')
      if (el.textContent !== newVal) {
        el.classList.remove('flip-animate')
        void el.offsetWidth // reflow to restart animation
        el.textContent = newVal
        el.classList.add('flip-animate')
      }
    }
    set('cd-hari', hari); set('cd-jam', jam)
    set('cd-menit', menit); set('cd-detik', detik)
  }
  perbarui()
  setInterval(perbarui, 1000)
}

// ============================================
// SCROLL REVEAL
// ============================================
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12 })

  document.querySelectorAll('.reveal').forEach(el => {
    // Stagger siblings: each .reveal within the same parent gets incremental delay
    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'))
    const idx = siblings.indexOf(el)
    if (idx > 0) el.style.transitionDelay = `${idx * 0.12}s`
    observer.observe(el)
  })
}

// ============================================
// MUSIK
// ============================================
let musikJalan = false
function toggleMusic() {
  const audio = document.getElementById('bg-music')
  const btn   = document.getElementById('music-btn')
  if (!audio.src || audio.src === window.location.href) return
  if (musikJalan) {
    audio.pause()
    btn.textContent = '♪'
    btn.classList.remove('playing')
  } else {
    audio.play()
    btn.textContent = '♬'
    btn.classList.add('playing')
  }
  musikJalan = !musikJalan
}

// ============================================
// HELPERS
// ============================================
function isiEl(id, teks, mode = 'textContent', htmlVal = null) {
  const el = document.getElementById(id)
  if (!el || (teks === null && htmlVal === null)) return
  if (mode === 'innerHTML') el.innerHTML = htmlVal || teks
  else if (teks) el.textContent = teks
}

function formatTanggal(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

function formatTanggalPendek(isoDate) {
  const d  = new Date(isoDate + 'T00:00:00')
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd} · ${mm} · ${d.getFullYear()}`
}

function hariDari(isoDate) {
  return new Date(isoDate + 'T00:00:00')
    .toLocaleDateString('id-ID', { weekday: 'long' })
}

function waktuRelatif(isoString) {
  const selisih = Date.now() - new Date(isoString)
  const menit   = Math.floor(selisih / 60000)
  if (menit < 1)  return 'Baru saja'
  if (menit < 60) return `${menit} menit lalu`
  const jam = Math.floor(menit / 60)
  if (jam < 24)   return `${jam} jam lalu`
  return `${Math.floor(jam / 24)} hari lalu`
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}

function dimHex(hex, factor) {
  if (!hex?.startsWith('#')) return hex
  const r = Math.round(parseInt(hex.slice(1,3),16) * factor)
  const g = Math.round(parseInt(hex.slice(3,5),16) * factor)
  const b = Math.round(parseInt(hex.slice(5,7),16) * factor)
  return `rgb(${r},${g},${b})`
}

function hexToRgba(hex, alpha) {
  if (!hex?.startsWith('#')) return `rgba(201,169,110,${alpha})`
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${alpha})`
}