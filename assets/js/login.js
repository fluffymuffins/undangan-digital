// ============================================
// login.js — Proses login + smart redirect
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await db.auth.getSession()
    if (session) {
      await redirectSesuaiRole(session.user.id)
    }
  })
  
  async function login(e) {
    e.preventDefault()
  
    const email    = document.getElementById('login-email').value.trim()
    const password = document.getElementById('login-password').value
    const errorEl  = document.getElementById('login-error')
    const btnLogin = document.getElementById('btn-login')
  
    errorEl.textContent = ''
    btnLogin.disabled    = true
    btnLogin.textContent = 'Memproses...'
  
    const { data, error } = await db.auth.signInWithPassword({ email, password })
  
    if (error) {
      errorEl.textContent  = terjemahError(error.message)
      errorEl.style.color  = '#e07070'
      btnLogin.disabled    = false
      btnLogin.textContent = 'Masuk'
      return
    }
  
    errorEl.textContent  = '✓ Berhasil! Mengalihkan...'
    errorEl.style.color  = 'var(--gold)'
  
    await redirectSesuaiRole(data.user.id)
  }
  
  async function redirectSesuaiRole(userId) {
    const { data: profile } = await db
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()
  
    window.location.href = profile?.is_admin ? 'admin.html' : 'edit.html'
  }
  
  function terjemahError(msg) {
    if (msg.includes('Invalid login credentials'))
      return 'Email atau password salah. Coba lagi.'
    if (msg.includes('Email not confirmed'))
      return 'Email belum dikonfirmasi. Hubungi admin.'
    if (msg.includes('Too many requests'))
      return 'Terlalu banyak percobaan. Tunggu beberapa menit.'
    return 'Terjadi kesalahan. Coba lagi.'
  }