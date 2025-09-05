<template>
  <div class="landing-container">
    <div class="landing-card">
      <h1 class="card-title">Araç Yorumları</h1>
      <p class="subtitle">Hesabınız yoksa kayıt olun veya giriş yapın</p>
      <div class="actions">
        <router-link to="/register" class="btn register-btn">Kayıt Ol</router-link>
        <router-link to="/login" class="btn login-btn">Giriş Yap</router-link>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.landing-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

.landing-card {
  background: #f0f4f8;
  border-radius: 28px;
  padding: 48px;
  box-shadow: 10px 10px 20px #cdd5dd, -10px -10px 20px #ffffff;
  width: 100%;
  max-width: 440px;
  text-align: center;
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

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn {
  padding: 16px 32px;
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 6px 6px 15px rgba(0,0,0,0.1);
  color: white;
}

.btn:hover {
  transform: translateY(-4px);
  box-shadow: 8px 8px 20px rgba(0,0,0,0.2);
}

.register-btn {
  background: linear-gradient(135deg, #28a745, #20c997);
}
.register-btn:hover {
  background: linear-gradient(135deg, #218838, #1e7e34);
}

.login-btn {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}
.login-btn:hover {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

@media (max-width: 480px) {
  .landing-card {
    padding: 30px 24px;
  }
  .card-title {
    font-size: 1.8rem;
  }
  .actions {
    flex-direction: column;
    gap: 16px;
  }
}
</style>