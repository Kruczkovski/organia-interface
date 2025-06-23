import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
console.log('URL lida do .env →', import.meta.env.VITE_SUPABASE_URL);
console.log('KEY tamanho      →', (import.meta.env.VITE_SUPABASE_ANON_KEY || '').length);


// Pegue as variáveis do .env injetadas pelo Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const form = document.querySelector('form')
const loginError = document.getElementById('login-error')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  loginError.classList.add('hidden')
  loginError.textContent = ''

  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error(error)
    loginError.textContent = error.message
    loginError.classList.remove('hidden')
  } else {
    // Redireciona para a home (ajuste se seu dashboard for outro)
    window.location.href = '/index.html'
  }
})
