// ============================================
// ORNAMEN DEKORATIF — SVG Generator
// ============================================

const ORNAMEN = {}

// ── Divider horizontal: fade line ◇ ✦ ◇ line fade ──
// uid harus unik per instance untuk mencegah konflik gradient ID di DOM
ORNAMEN.divider = function(uid) {
  var gl = 'orn-gl-' + uid
  var gr = 'orn-gr-' + uid
  return '<svg width="240" height="16" viewBox="0 0 240 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<defs>' +
      '<linearGradient id="' + gl + '"><stop offset="0%" stop-color="#c9a96e" stop-opacity="0"/><stop offset="100%" stop-color="#c9a96e" stop-opacity="0.4"/></linearGradient>' +
      '<linearGradient id="' + gr + '"><stop offset="0%" stop-color="#c9a96e" stop-opacity="0.4"/><stop offset="100%" stop-color="#c9a96e" stop-opacity="0"/></linearGradient>' +
    '</defs>' +
    '<line x1="0" y1="8" x2="98" y2="8" stroke="url(#' + gl + ')" stroke-width="0.6"/>' +
    '<path d="M102 8L105 5.5L108 8L105 10.5Z" fill="none" stroke="#c9a96e" stroke-width="0.6" opacity="0.5"/>' +
    '<path d="M120 2L121.5 7L127 8L121.5 9L120 14L118.5 9L113 8L118.5 7Z" fill="#c9a96e" opacity="0.8"/>' +
    '<path d="M132 8L135 5.5L138 8L135 10.5Z" fill="none" stroke="#c9a96e" stroke-width="0.6" opacity="0.5"/>' +
    '<line x1="142" y1="8" x2="240" y2="8" stroke="url(#' + gr + ')" stroke-width="0.6"/>' +
    '</svg>'
}

// ── Corner bracket berleaf — orientasi kiri atas (48×48) ──
// Leaf kecil tumbuh di sepanjang lengan bracket
ORNAMEN.pojokFloral = function() {
  return '<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M4 46L4 10Q4 4 10 4L46 4" fill="none" stroke="#c9a96e" stroke-width="0.8" stroke-linecap="round" opacity="0.42"/>' +
    '<circle cx="4" cy="4" r="3.5" fill="none" stroke="#c9a96e" stroke-width="0.6" opacity="0.5"/>' +
    '<circle cx="4" cy="4" r="1.5" fill="#c9a96e" opacity="0.45"/>' +
    '<path d="M4 22 C0 19 0 13 4 15 C4 19 4 22 4 22Z" fill="#c9a96e" opacity="0.22"/>' +
    '<path d="M4 35 C0 32 0 26 4 28 C4 32 4 35 4 35Z" fill="#c9a96e" opacity="0.18"/>' +
    '<path d="M22 4 C19 0 13 0 15 4 C19 4 22 4 22 4Z" fill="#c9a96e" opacity="0.22"/>' +
    '<path d="M35 4 C32 0 26 0 28 4 C32 4 35 4 35 4Z" fill="#c9a96e" opacity="0.18"/>' +
    '<circle cx="4" cy="46" r="1.2" fill="#c9a96e" opacity="0.3"/>' +
    '<circle cx="46" cy="4" r="1.2" fill="#c9a96e" opacity="0.3"/>' +
    '</svg>'
}

// ── Botanical corner branch — orientasi kiri atas (90×90) ──
// Branch memancar dari pojok kiri atas; mirror via CSS transform untuk pojok lain
ORNAMEN.branchCorner = function() {
  return '<svg width="90" height="90" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M2 2 C25 2 55 8 90 18" fill="none" stroke="#c9a96e" stroke-width="0.9" opacity="0.2"/>' +
    '<path d="M2 2 C2 25 8 55 18 90" fill="none" stroke="#c9a96e" stroke-width="0.9" opacity="0.2"/>' +
    '<path d="M2 2 C16 16 32 22 56 28" fill="none" stroke="#c9a96e" stroke-width="0.6" opacity="0.16"/>' +
    '<path d="M28 4 C24 0 18 1 20 5 C24 5 28 4 28 4Z" fill="#c9a96e" opacity="0.18"/>' +
    '<path d="M56 10 C52 5 46 7 48 11 C52 11 56 10 56 10Z" fill="#c9a96e" opacity="0.15"/>' +
    '<path d="M4 28 C0 24 1 18 5 20 C5 24 4 28 4 28Z" fill="#c9a96e" opacity="0.18"/>' +
    '<path d="M10 56 C5 52 7 46 11 48 C11 52 10 56 10 56Z" fill="#c9a96e" opacity="0.15"/>' +
    '<path d="M28 14 C24 10 25 5 29 7 C30 11 28 14 28 14Z" fill="#c9a96e" opacity="0.13"/>' +
    '<path d="M46 24 C42 20 44 15 48 17 C48 21 46 24 46 24Z" fill="#c9a96e" opacity="0.12"/>' +
    '<circle cx="2" cy="2" r="2.5" fill="#c9a96e" opacity="0.28"/>' +
    '<circle cx="44" cy="22" r="1.8" fill="#c9a96e" opacity="0.18"/>' +
    '<circle cx="18" cy="90" r="1.5" fill="#c9a96e" opacity="0.14"/>' +
    '<circle cx="90" cy="18" r="1.5" fill="#c9a96e" opacity="0.14"/>' +
    '</svg>'
}

// ── Botanical sprig vertikal — untuk di atas section heading (44×26) ──
ORNAMEN.sprig = function() {
  return '<svg width="44" height="26" viewBox="0 0 44 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<line x1="22" y1="26" x2="22" y2="12" stroke="#c9a96e" stroke-width="0.7" opacity="0.42"/>' +
    '<path d="M22 21 C14 17 12 9 19 8 C22 14 22 21 22 21Z" fill="#c9a96e" opacity="0.22"/>' +
    '<path d="M22 21 C30 17 32 9 25 8 C22 14 22 21 22 21Z" fill="#c9a96e" opacity="0.22"/>' +
    '<path d="M22 15 C16 12 15 6 21 5 C22 10 22 15 22 15Z" fill="#c9a96e" opacity="0.17"/>' +
    '<path d="M22 15 C28 12 29 6 23 5 C22 10 22 15 22 15Z" fill="#c9a96e" opacity="0.17"/>' +
    '<circle cx="22" cy="10" r="2.5" fill="#c9a96e" opacity="0.42"/>' +
    '<circle cx="22" cy="10" r="1" fill="none" stroke="#c9a96e" stroke-width="0.4" opacity="0.5"/>' +
    '</svg>'
}

// ── SVG Gem untuk acara-gem (18×18) ──
ORNAMEN.gem = function() {
  return '<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M9 1L10.5 7L16 9L10.5 11L9 17L7.5 11L2 9L7.5 7Z" fill="#c9a96e" opacity="0.82"/>' +
    '<path d="M9 4L10 7.5L13.5 9L10 10.5L9 14L8 10.5L4.5 9L8 7.5Z" fill="none" stroke="#c9a96e" stroke-width="0.3" opacity="0.5"/>' +
    '</svg>'
}

// ── Fallback pojok sederhana (tetap ada untuk kompatibilitas) ──
ORNAMEN.pojok = function() {
  return ORNAMEN.pojokFloral()
}

// ============================================
// INIT
// ============================================
function initOrnamen() {

  // 1. Ganti semua .ornament text dengan SVG divider
  var uid = 0
  document.querySelectorAll('.ornament').forEach(function(el) {
    el.innerHTML = ORNAMEN.divider(uid++)
    el.style.display = 'flex'
    el.style.justifyContent = 'center'
    el.style.opacity = '1'
  })

  // 2. Corner berleaf di .kepada-box
  var kepada = document.querySelector('.kepada-box')
  if (kepada) {
    kepada.style.position = 'relative'
    var kepadaCorners = [
      { top: '0',    left: '0',  tr: '' },
      { top: '0',    right: '0', tr: 'scaleX(-1)' },
      { bottom: '0', left: '0',  tr: 'scaleY(-1)' },
      { bottom: '0', right: '0', tr: 'scale(-1,-1)' },
    ]
    kepadaCorners.forEach(function(c) {
      var div = document.createElement('div')
      div.style.cssText = 'position:absolute;line-height:0;pointer-events:none;'
      if (c.top    !== undefined) div.style.top    = c.top
      if (c.right  !== undefined) div.style.right  = c.right
      if (c.bottom !== undefined) div.style.bottom = c.bottom
      if (c.left   !== undefined) div.style.left   = c.left
      if (c.tr) div.style.transform = c.tr
      div.innerHTML = ORNAMEN.pojokFloral()
      kepada.appendChild(div)
    })
  }

  // 3. Botanical corner branches di 4 pojok #cover
  var cover = document.getElementById('cover')
  if (cover) {
    var coverCorners = [
      { top: '0',    left: '0',  tr: '' },
      { top: '0',    right: '0', tr: 'scaleX(-1)' },
      { bottom: '0', left: '0',  tr: 'scaleY(-1)' },
      { bottom: '0', right: '0', tr: 'scale(-1,-1)' },
    ]
    coverCorners.forEach(function(c) {
      var div = document.createElement('div')
      div.style.cssText = 'position:absolute;line-height:0;pointer-events:none;'
      if (c.top    !== undefined) div.style.top    = c.top
      if (c.right  !== undefined) div.style.right  = c.right
      if (c.bottom !== undefined) div.style.bottom = c.bottom
      if (c.left   !== undefined) div.style.left   = c.left
      if (c.tr) div.style.transform = c.tr
      div.innerHTML = ORNAMEN.branchCorner()
      cover.appendChild(div)
    })
  }

  // 4. Botanical sprig di atas setiap section-header h2
  document.querySelectorAll('.section-header h2').forEach(function(h2) {
    var wrap = document.createElement('div')
    wrap.className = 'heading-with-sprig'
    var sprigEl = document.createElement('div')
    sprigEl.style.cssText = 'display:flex;justify-content:center;'
    sprigEl.innerHTML = ORNAMEN.sprig()
    h2.parentNode.insertBefore(wrap, h2)
    wrap.appendChild(sprigEl)
    wrap.appendChild(h2)
  })

  // 5. Ganti teks ◆ di .acara-gem dengan SVG gem
  document.querySelectorAll('.acara-gem').forEach(function(el) {
    el.innerHTML = ORNAMEN.gem()
    el.style.fontSize = '0'
    el.style.lineHeight = '0'
    el.style.display = 'flex'
    el.style.justifyContent = 'center'
    el.style.margin = '12px 0'
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOrnamen)
} else {
  initOrnamen()
}
