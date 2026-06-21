// ============================================
// ilustrasi.js — SVG vector mempelai
// Dipakai di undangan.html dan edit.html
// ============================================

const ILUSTRASI = {

    // ======================================
    // PRIA
    // ======================================
    'pria-songkok': {
      label: 'Songkok',
      hint:  'Kemeja + peci/songkok',
      svg: `<svg viewBox="0 0 80 92" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M0 92 Q0 70 40 66 Q80 70 80 92Z" opacity="0.9"/>
        <rect x="33" y="54" width="14" height="14" rx="2"/>
        <ellipse cx="40" cy="42" rx="21" ry="23"/>
        <rect x="22" y="20" width="36" height="14" rx="2"/>
        <rect x="17" y="32" width="46" height="5" rx="2"/>
        <path d="M33 66 L28 74 M47 66 L52 74"
          fill="none" stroke="currentColor" stroke-width="2" opacity="0.6"/>
      </svg>`
    },
  
    'pria-jas': {
      label: 'Jas Formal',
      hint:  'Jas western formal',
      svg: `<svg viewBox="0 0 80 92" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M0 92 Q0 68 40 64 Q80 68 80 92Z" opacity="0.9"/>
        <path d="M26 92 L35 68 L40 74 L45 68 L54 92Z" opacity="0.72"/>
        <rect x="33" y="54" width="14" height="12" rx="2"/>
        <ellipse cx="40" cy="42" rx="21" ry="23"/>
        <path d="M19 40 Q19 18 40 17 Q61 18 61 40 Q61 26 40 24 Q19 26 19 40Z"/>
      </svg>`
    },
  
    'pria-casual': {
      label: 'Batik Casual',
      hint:  'Kemeja batik / casual',
      svg: `<svg viewBox="0 0 80 92" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M2 92 Q2 70 40 66 Q78 70 78 92Z" opacity="0.9"/>
        <rect x="33" y="54" width="14" height="14" rx="2"/>
        <ellipse cx="40" cy="42" rx="21" ry="23"/>
        <path d="M19 42 Q18 19 40 18 Q62 19 61 42 Q60 26 40 25 Q20 26 19 42Z"/>
        <path d="M33 66 L28 78 M47 66 L52 78"
          fill="none" stroke="currentColor" stroke-width="2.5" opacity="0.65"/>
        <path d="M33 72 Q40 76 47 72"
          fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.65"/>
      </svg>`
    },
  
    // ======================================
    // WANITA
    // ======================================
    'wanita-hijab-kebaya': {
      label: 'Hijab Kebaya',
      hint:  'Hijab + kebaya tradisional',
      svg: `<svg viewBox="0 0 80 98" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M0 98 Q0 72 40 68 Q80 72 80 98Z" opacity="0.9"/>
        <path d="M0 98 Q4 74 16 67 Q26 72 40 72 Q54 72 64 67 Q76 74 80 98Z" opacity="0.78"/>
        <ellipse cx="40" cy="44" rx="18" ry="20"/>
        <path d="M22 44 Q22 20 40 19 Q58 20 58 44
                 Q58 60 52 66 Q46 70 40 70
                 Q34 70 28 66 Q22 60 22 44Z"/>
        <path d="M34 70 Q40 74 46 70"
          fill="none" stroke="currentColor" stroke-width="2.5"/>
        <path d="M30 72 Q40 78 50 72"
          fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.7"/>
      </svg>`
    },
  
    'wanita-hijab-modern': {
      label: 'Hijab Modern',
      hint:  'Hijab gaya modern',
      svg: `<svg viewBox="0 0 80 98" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M0 98 Q0 72 40 68 Q80 72 80 98Z" opacity="0.9"/>
        <path d="M2 98 Q6 76 18 68 Q26 72 40 72" opacity="0.82"/>
        <path d="M78 98 Q74 76 62 68 Q54 72 40 72" opacity="0.82"/>
        <ellipse cx="40" cy="44" rx="18" ry="20"/>
        <path d="M22 44 Q22 19 40 18 Q58 19 58 44
                 Q58 62 52 67 Q46 72 40 72
                 Q34 72 28 67 Q22 62 22 44Z"/>
      </svg>`
    },
  
    'wanita-nohijab': {
      label: 'Tanpa Hijab',
      hint:  'Rambut panjang',
      svg: `<svg viewBox="0 0 80 98" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M8 98 Q8 72 40 68 Q72 72 72 98Z" opacity="0.9"/>
        <rect x="33" y="58" width="14" height="12" rx="2"/>
        <ellipse cx="40" cy="44" rx="20" ry="22"/>
        <path d="M20 42 Q18 18 40 17 Q62 18 60 42 Q62 26 40 24 Q18 26 20 42Z"/>
        <path d="M19 44 Q14 60 14 84"
          fill="none" stroke="currentColor" stroke-width="10"
          stroke-linecap="round" opacity="0.82"/>
        <path d="M61 44 Q66 60 66 84"
          fill="none" stroke="currentColor" stroke-width="10"
          stroke-linecap="round" opacity="0.82"/>
      </svg>`
    }
  }
  
  // ============================================
  // Helper: render ilustrasi ke dalam elemen
  // ============================================
  function renderIlustrasi(elId, ilustrasiId) {
    const el   = document.getElementById(elId)
    const data = ILUSTRASI[ilustrasiId]
    if (!el || !data) return
    el.innerHTML   = data.svg
    el.style.color = 'var(--gold)'
  }
  
  // ============================================
  // Helper: buat grid picker ilustrasi
  // ============================================
  function buatIlustrasiPicker(containerId, jenis, nilaiSaat, onPilih) {
    const container = document.getElementById(containerId)
    if (!container) return
  
    const entries = Object.entries(ILUSTRASI)
      .filter(([key]) => key.startsWith(jenis))
  
    container.innerHTML = entries.map(([key, data]) => `
      <div class="ilustrasi-option ${key === nilaiSaat ? 'active' : ''}"
        id="opt-${key}"
        onclick="pilihIlustrasi('${containerId}', '${key}', '${jenis}')"
        title="${data.hint}">
        <div class="ilustrasi-preview" style="color:var(--gold)">
          ${data.svg}
        </div>
        <span class="ilustrasi-label">${data.label}</span>
      </div>
    `).join('')
  }
  
  function pilihIlustrasi(containerId, key, jenis) {
    // Update active state di picker
    const entries = Object.keys(ILUSTRASI).filter(k => k.startsWith(jenis))
    entries.forEach(k => {
      const el = document.getElementById('opt-' + k)
      if (el) el.classList.toggle('active', k === key)
    })
    // Callback ke caller
    if (typeof window._onPilihIlustrasi === 'function') {
      window._onPilihIlustrasi(key, jenis)
    }
  }