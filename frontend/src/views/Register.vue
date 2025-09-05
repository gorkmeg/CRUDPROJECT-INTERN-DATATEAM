<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="card-title">Kayıt Ol</h1>
      <p class="subtitle">Yeni bir hesap oluşturun</p>

      <form @submit.prevent="registerUser" class="login-form">
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

        <button type="submit" class="register-btn" :disabled="!username.trim() || !password.trim()">
          Kayıt Ol
        </button>
      </form>

      <div class="actions">
        <button @click="goLogin" class="action-btn secondary-btn">
          Hesabınız var mı? Giriş yapın
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
      
      <p v-if="message" class="info-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import API from "../api.js";

const router = useRouter();
const username = ref("");
const password = ref("");
const message = ref("");

const registerUser = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    message.value = "Lütfen kullanıcı adı ve şifre girin";
    return;
  }

  try {
    const res = await API.post("/register", {
      username: username.value.trim(),
      password: password.value.trim()
    });
    message.value = res.data.message;
  } catch (err) {
    message.value = "Kayıt sırasında hata oluştu";
    console.error(err);
  }
};

const goBack = () => {
  router.push("/");
};

const goLogin = () => {
  router.push('/login');
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
  box-shadow: 10px 10px 20px #28a745, -10px -10px 20px #28a745;
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

.register-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 6px 6px 15px rgba(40, 167, 69, 0.2);
}

.register-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #218838, #1e7e34);
  transform: translateY(-4px);
  box-shadow: 8px 8px 20px rgba(40, 167, 69, 0.4);
}

.register-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.actions {
  margin-top: 16px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #6b7280;
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}
.action-btn:hover {
  color: #3b82f6;
  background: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 2px 2px 5px #cdd5dd;
}
.action-btn svg {
  width: 18px;
  height: 18px;
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

.info-message {
  margin-top: 24px;
  padding: 16px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #0050b3;
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