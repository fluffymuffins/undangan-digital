// ============================================
// ORNAMEN DEKORATIF — SVG Generator
// ============================================

const ORNAMEN = {}

// Horizontal divider: fade line ◇ ✦ ◇ line fade
// uid harus unik per instance untuk mencegah konflik gradient ID di DOM
ORNAMEN.divider = function(uid) {
  var gl = 'orn-gl-' + uid
  var gr = 'orn-gr-' + uid
  return '<svg width="240" height="16" viewBox="0 0 240 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<defs>' +
      '<linearGradient id="' + gl + '">' +
        '<stop offset="0%" stop-color="#c9a96e" stop-opacity="0"/>' +
        '<stop offset="100%" stop-color="#c9a96e" stop-opacity="0.4"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + gr + '">' +
        '<stop offset="0%" stop-color="#c9a96e" stop-opacity="0.4"/>' +
        '<stop offset="100%" stop-color="#c9a96e" stop-opacity="0"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<line x1="0" y1="8" x2="98" y2="8" stroke="url(#' + gl + ')" stroke-width="0.6"/>' +
    '<path d="M102 8L105 5.5L108 8L105 10.5Z" fill="none" stroke="#c9a96e" stroke-width="0.6" opacity="0.5"/>' +
    '<path d="M120 2L121.5 7L127 8L121.5 9L120 14L118.5 9L113 8L118.5 7Z" fill="#c9a96e" opacity="0.8"/>' +
    '<path d="M132 8L135 5.5L138 8L135 10.5Z" fill="none" stroke="#c9a96e" stroke-width="0.6" opacity="0.5"/>' +
    '<line x1="142" y1="8" x2="240" y2="8" stroke="url(#' + gr + ')" stroke-width="0.6"/>' +
    '</svg>'
}

// Corner bracket — orientasi kiri atas; gunakan CSS transform untuk rotasi pojok lain
ORNAMEN.pojok = function() {
  return '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M3 31L3 7Q3 3 7 3L31 3" fill="none" stroke="#c9a96e" stroke-width="0.8" stroke-linecap="round" opacity="0.45"/>' +
    '<circle cx="3" cy="3" r="2.5" fill="none" stroke="#c9a96e" stroke-width="0.6" opacity="0.55"/>' +
    '<circle cx="3" cy="3" r="1" fill="#c9a96e" opacity="0.5"/>' +
    '<circle cx="3" cy="31" r="1" fill="#c9a96e" opacity="0.3"/>' +
    '<circle cx="31" cy="3" r="1" fill="#c9a96e" opacity="0.3"/>' +
    '</svg>'
}

function initOrnamen() {
  // Ganti semua .ornament text dengan SVG divider
  var uid = 0
  document.querySelectorAll('.ornament').forEach(function(el) {
    el.innerHTML = ORNAMEN.divider(uid++)
    el.style.display = 'flex'
    el.style.justifyContent = 'center'
    el.style.opacity = '1'
  })

  // Tambah 4 corner brackets ke .kepada-box
  var kepada = document.querySelector('.kepada-box')
  if (kepada) {
    kepada.style.position = 'relative'
    var corners = [
      { top: '0',    left: '0',  tr: '' },
      { top: '0',    right: '0', tr: 'scaleX(-1)' },
      { bottom: '0', left: '0',  tr: 'scaleY(-1)' },
      { bottom: '0', right: '0', tr: 'scale(-1,-1)' },
    ]
    corners.forEach(function(c) {
      var div = document.createElement('div')
      div.style.cssText = 'position:absolute;line-height:0;pointer-events:none;'
      if (c.top    !== undefined) div.style.top    = c.top
      if (c.right  !== undefined) div.style.right  = c.right
      if (c.bottom !== undefined) div.style.bottom = c.bottom
      if (c.left   !== undefined) div.style.left   = c.left
      if (c.tr) div.style.transform = c.tr
      div.innerHTML = ORNAMEN.pojok()
      kepada.appendChild(div)
    })
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOrnamen)
} else {
  initOrnamen()
}
