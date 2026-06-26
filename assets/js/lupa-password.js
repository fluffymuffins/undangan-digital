// ============================================
// lupa-password.js
// ============================================

async function kirimReset(e) {
    e.preventDefault()
  
    const email    = document.getElementById('reset-email').value.trim()
    const errorEl  = document.getElementById('reset-error')
    const btn      = document.getElementById('btn-reset')
  
    errorEl.textContent = ''
    btn.disabled        = true
    btn.textContent     = 'Mengirim...'
  
    const { error } = await db.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html'
    })
  
    btn.disabled    = false
    btn.textContent = 'Kirim Link Reset'
  
    if (error) {
      errorEl.textContent = 'Gagal mengirim. Pastikan email sudah terdaftar.'
      errorEl.style.color = '#e07070'
      return
    }
  
    // Tampilkan panel sukses
    document.getElementById('panel-form').style.display   = 'none'
    document.getElementById('panel-sukses').style.display = 'block'
  }