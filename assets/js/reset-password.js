// ============================================
// reset-password.js
// Halaman tujuan setelah klik link di email
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Supabase otomatis baca token dari URL hash (#access_token=...)
    const { data: { session }, error } = await db.auth.getSession()
  
    if (error || !session) {
      // Token tidak valid atau sudah expired
      document.getElementById('panel-form').style.display  = 'none'
      document.getElementById('panel-error').style.display = 'block'
    }
  })
  
  async function simpanPasswordBaru(e) {
    e.preventDefault()
  
    const passwordBaru  = document.getElementById('password-baru').value
    const konfirmasi    = document.getElementById('password-konfirmasi').value
    const errorEl       = document.getElementById('reset-error')
    const btn           = document.getElementById('btn-simpan')
  
    errorEl.textContent = ''
  
    if (passwordBaru !== konfirmasi) {
      errorEl.textContent = 'Password tidak cocok.'
      return
    }
  
    if (passwordBaru.length < 8) {
      errorEl.textContent = 'Password minimal 8 karakter.'
      return
    }
  
    btn.disabled    = true
    btn.textContent = 'Menyimpan...'
  
    const { error } = await db.auth.updateUser({ password: passwordBaru })
  
    btn.disabled    = false
    btn.textContent = 'Simpan Password Baru'
  
    if (error) {
      errorEl.textContent = 'Gagal: ' + error.message
      return
    }
  
    document.getElementById('panel-form').style.display   = 'none'
    document.getElementById('panel-sukses').style.display = 'block'
  
    // Logout setelah reset supaya klien login ulang dengan password baru
    setTimeout(() => db.auth.signOut(), 2000)
  }
  
  function cekKekuatan(val) {
    const bar   = document.getElementById('strength-bar')
    const label = document.getElementById('strength-label')
    if (!bar || !label) return
  
    let skor = 0
    if (val.length >= 8)                         skor++
    if (val.length >= 12)                        skor++
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) skor++
    if (/[0-9]/.test(val))                       skor++
    if (/[^A-Za-z0-9]/.test(val))               skor++
  
    const level = [
      { w: '0%',   color: 'transparent', teks: '' },
      { w: '25%',  color: '#e07070',     teks: 'Lemah' },
      { w: '50%',  color: '#e09050',     teks: 'Cukup' },
      { w: '75%',  color: 'var(--gold)', teks: 'Baik' },
      { w: '100%', color: '#6dc898',     teks: 'Kuat' },
    ][Math.min(skor, 4)]
  
    bar.style.width      = level.w
    bar.style.background = level.color
    label.textContent    = level.teks
    label.style.color    = level.color
  }