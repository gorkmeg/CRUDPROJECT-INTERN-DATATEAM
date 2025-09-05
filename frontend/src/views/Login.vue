<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="card-title">Giriş Yap</h1>
      <p class="subtitle">Yorumları görmek ve yorum yapmak için giriş yapın</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="username">Kullanıcı Adı</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Kullanıcı adınızı girin"
            required
            class="input-field"
          />
        </div>
        
        <div class="input-group">
          <label for="password">Şifre</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Şifrenizi girin"
            required
            class="input-field"
          />
        </div>
        
        <button type="submit" class="primary-btn" :disabled="!username.trim() || !password.trim()">
          Giriş Yap
        </button>
      </form>

      <div class="actions">
        <button @click="goRegister" class="action-btn secondary-btn">
          Hesabınız yok mu? Kayıt olun
        </button>
      </div>

      <div class="actions">
        <button @click="goBack" class="action-btn secondary-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span>Geri Dön</span>
        </button>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const error = ref('');

const handleLogin = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = 'Lütfen kullanıcı adı ve şifre girin';
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value.trim(),
        password: password.value.trim()
      })
    });
    
    if (response.ok) {
      const userData = await response.json();
      authStore.setUser(userData);
      router.push('/Dashboard');
    } else {
      error.value = 'Kullanıcı adı veya şifre hatalı';
    }
  } catch (err) {
    error.value = 'Giriş yapılırken bir hata oluştu';
    console.error(err);
  }
};

const goBack = () => {
  router.push('/');
};

const goRegister = () => {
  router.push('/register');
};
</script>

<style scoped>


.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

.login-card {
  background: #f0f4f8;
  border-radius: 28px;
  padding: 48px;
  box-shadow: 10px 10px 20px #91bae2, -10px -10px 20px #91bae2;
  width: 100%;
  max-width: 440px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.card-title {
  color: #1f2937;
  margin-bottom: 12px;
  font-size: 2.2rem;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
}

.subtitle {
  color: #6b7280;
  margin-bottom: 40px;
  font-size: 1rem;
}

.login-form {
  margin-bottom: 32px;
}

.input-group {
  margin-bottom: 24px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 10px;
  color: #374151;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.input-field {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: #f0f4f8;
  box-shadow: inset 5px 5px 10px #cdd5dd, inset -5px -5px 10px #ffffff;
}

.input-field:focus {
  outline: none;
  box-shadow: inset 2px 2px 5px #cdd5dd, inset -2px -2px 5px #ffffff, 0 0 0 3px #3b82f640;
}

.actions {
  margin-top: 16px;
}

.primary-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 6px 6px 15px rgba(59, 130, 246, 0.2);
}

.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  transform: translateY(-4px);
  box-shadow: 8px 8px 20px rgba(59, 130, 246, 0.4);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.secondary-btn {
  background: #e2e8f0;
  color: #4b5563;
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
  box-shadow: 4px 4px 10px #cdd5dd, -4px -4px 10px #ffffff;
}
.secondary-btn:hover {
  background: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 6px 6px 12px #cdd5dd, -6px -6px 12px #ffffff;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}
.action-btn:hover {
  color: #3b82f6;
}
.action-btn svg {
  width: 18px;
  height: 18px;
}

.error-message {
  margin-top: 24px;
  padding: 16px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  border-radius: 12px;
  font-size: 0.95rem;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 24px;
  }
  
  .card-title {
    font-size: 1.8rem;
  }
}
</style>