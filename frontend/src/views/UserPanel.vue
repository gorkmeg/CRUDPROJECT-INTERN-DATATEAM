<template>
    <div class="user-panel-container">
      <div class="user-panel-header">
        <button @click="goBack" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Geri Dön
        </button>
        <div v-if="user" class="user-info-section">
          <div class="user-avatar-large">{{ user.username.charAt(0).toUpperCase() }}</div>
          <h1>Hoş Geldin, {{ user.username }}</h1>
          <p class="user-role-label">{{ user.isAdmin ? 'Yönetici Paneli' : 'Kullanıcı Paneli' }}</p>
        </div>
        <div v-else class="user-info-section guest-view-large">
          <h1>Giriş Yapın</h1>
          <p>Hesap bilgilerinizi görmek için lütfen giriş yapın.</p>
          <button @click="login" class="login-btn-large">Giriş Yap</button>
        </div>
      </div>
  
      <div v-if="user" class="user-panel-content">
        <div class="content-card">
          <h2>Profil Bilgileri</h2>
          <p><strong>Kullanıcı Adı:</strong> {{ user.username }}</p>
          <p><strong>Kullanıcı ID:</strong> {{ user._id }}</p>
        </div>
  
        <div class="content-card">
          <h2>Şifre Değiştir</h2>
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label for="currentPassword">Mevcut Şifre</label>
              <input type="password" id="currentPassword" v-model="currentPassword" required />
            </div>
            <div class="form-group">
              <label for="newPassword">Yeni Şifre</label>
              <input type="password" id="newPassword" v-model="newPassword" required />
            </div>
            <div class="form-group">
              <label for="confirmNewPassword">Yeni Şifre (Tekrar)</label>
              <input type="password" id="confirmNewPassword" v-model="confirmNewPassword" required />
            </div>
            <button type="submit" class="submit-btn">Şifreyi Değiştir</button>
          </form>
          <p v-if="message" :class="message.type">{{ message.text }}</p>
        </div>
  
        <div class="content-card comments-list" v-if="!user.isAdmin">
          <h2>Yorumlarım</h2>
          <div v-if="loadingComments" class="loading-message">Yorumlar yükleniyor...</div>
          <div v-else-if="userComments.length > 0">
            <div v-for="comment in userComments" :key="comment._id" class="comment-item">
              <div v-if="editingCommentId === comment._id" class="edit-form">
                <textarea v-model="editingCommentText"></textarea>
                <div class="edit-buttons">
                  <button @click="saveComment(comment._id)" class="save-btn">Kaydet</button>
                  <button @click="cancelEdit" class="cancel-btn">İptal</button>
                </div>
              </div>
              <div v-else>
                <p class="comment-title"><strong>{{ comment.carId.brand }} {{ comment.carId.model }}</strong></p>
                <p class="comment-text">{{ comment.text }}</p>
                <div class="comment-meta">
                  <span>{{ formatDate(comment.createdAt) }}</span>
                  <div class="comment-actions">
                    <button @click="startEdit(comment)" class="action-btn edit-btn">Düzenle</button>
                    <button @click="deleteComment(comment._id)" class="action-btn delete-btn">Sil</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p class="no-comments-text">Henüz hiç yorum yapmadınız.</p>
          </div>
          <p v-if="commentError" class="error">{{ commentError }}</p>
        </div>
  
        <div v-if="user.isAdmin" class="content-card admin-panel">
          <h2>Tüm Kullanıcı Yorumları</h2>
          <div v-if="loadingComments" class="loading-message">Yorumlar yükleniyor...</div>
          <div v-else-if="allComments.length > 0">
            <div v-for="comment in allComments" :key="comment._id" class="comment-item">
              <div v-if="editingCommentId === comment._id" class="edit-form">
                <textarea v-model="editingCommentText"></textarea>
                <div class="edit-buttons">
                  <button @click="saveComment(comment._id)" class="save-btn">Kaydet</button>
                  <button @click="cancelEdit" class="cancel-btn">İptal</button>
                </div>
              </div>
              <div v-else>
                <p class="comment-title">
                  <strong>{{ comment.carId.brand }} {{ comment.carId.model }}</strong> 
                  - <em>{{ comment.userId.username || 'Bilinmeyen Kullanıcı' }}</em>
                </p>
                <p class="comment-text">{{ comment.text }}</p>
                <div class="comment-meta">
                  <span>{{ formatDate(comment.createdAt) }}</span>
                  <div class="comment-actions">
                    <button @click="startEdit(comment)" class="action-btn edit-btn">Düzenle</button>
                    <button @click="deleteComment(comment._id)" class="action-btn delete-btn">Sil</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p class="no-comments-text">Henüz hiç yorum yok.</p>
          </div>
          <p v-if="commentError" class="error">{{ commentError }}</p>
        </div>
  
        <div class="content-card">
          <button @click="logout" class="logout-btn">Çıkış Yap</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from "vue";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "../stores/auth.js";
  import axios from "axios";
  
  const router = useRouter();
  const authStore = useAuthStore();
  const user = computed(() => authStore.user);
  
  
  const currentPassword = ref("");
  const newPassword = ref("");
  const confirmNewPassword = ref("");
  const message = ref(null);
  
  const userComments = ref([]);
  const allComments = ref([]);
  const loadingComments = ref(false);
  const commentError = ref(null);
  
  const editingCommentId = ref(null);
  const editingCommentText = ref('');
  

  onMounted(() => {
    if (user.value) {
      if (user.value.isAdmin) {
        fetchAllComments();
      } else {
        fetchUserComments();
      }
    }
  });

  
  const fetchUserComments = async () => {
    loadingComments.value = true;
    commentError.value = null;
    try {
      const response = await axios.get(`http://localhost:5000/comments/user/${user.value._id}`);
      userComments.value = response.data;
    } catch (error) {
      console.error("Yorumlar alınırken hata oluştu:", error);
      commentError.value = "Yorumlar yüklenemedi. Lütfen tekrar deneyin.";
    } finally {
      loadingComments.value = false;
    }
  };
  
  const fetchAllComments = async () => {
  loadingComments.value = true;
  commentError.value = null;
  try {
    const response = await axios.get("http://localhost:5000/comments", {
      params: { userId: user.value._id }
    });
    allComments.value = response.data;
  } catch (error) {
    console.error("Tüm yorumlar alınırken hata oluştu:", error);
    commentError.value = "Yorumlar yüklenemedi. Lütfen tekrar deneyin.";
  } finally {
    loadingComments.value = false;
  }
};

  
  const startEdit = (comment) => {
    editingCommentId.value = comment._id;
    editingCommentText.value = comment.text;
  };
  
  const cancelEdit = () => {
    editingCommentId.value = null;
    editingCommentText.value = '';
  };
  
  const saveComment = async (commentId) => {
    try {
      await axios.put(`http://localhost:5000/comments/${commentId}`, {
        userId: user.value._id,
        text: editingCommentText.value,
      });
      if (user.value.isAdmin) {
        await fetchAllComments();
      } else {
        await fetchUserComments();
      }
      cancelEdit();
    } catch (error) {
      console.error("Yorum güncellenirken hata oluştu:", error);
      commentError.value = "Yorum güncellenemedi. Lütfen tekrar deneyin.";
    }
  };
  
  const deleteComment = async (commentId) => {
    if (confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
      try {
        await axios.delete(`http://localhost:5000/comments/${commentId}`, {
          params: { userId: user.value._id }
        });
        if (user.value.isAdmin) {
          await fetchAllComments();
        } else {
          await fetchUserComments();
        }
      } catch (error) {
        console.error("Yorum silinirken hata oluştu:", error);
        commentError.value = "Yorum silinemedi. Lütfen tekrar deneyin.";
      }
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  const goBack = () => {
    router.go(-1);
  };
  
  const logout = () => {
    authStore.clearUser();
    router.push("/");
  };
  
  const login = () => {
    router.push('/login');
  };
  
  const changePassword = async () => {
    if (newPassword.value !== confirmNewPassword.value) {
      message.value = { text: "Yeni şifreler eşleşmiyor.", type: "error" };
      return;
    }
    
    if (newPassword.value.length < 6) {
      message.value = { text: "Yeni şifre en az 6 karakter olmalıdır.", type: "error" };
      return;
    }
    
    try {
      const response = await axios.put(`http://localhost:5000/users/change-password/${user.value._id}`, {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      });
      
      if (response.status === 200) {
        message.value = { text: "Şifreniz başarıyla değiştirildi.", type: "success" };
        currentPassword.value = "";
        newPassword.value = "";
        confirmNewPassword.value = "";
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        message.value = { text: "Mevcut şifreniz yanlış.", type: "error" };
      } else {
        message.value = { text: "Bir hata oluştu, lütfen tekrar deneyin.", type: "error" };
      }
      console.error("Şifre değiştirme hatası:", error);
    }
  };

  //kullanıcının verileri dogru mu kontrolu 
  // console.log("user:", user.value);



  </script>
   
  <style scoped>
  .user-panel-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    background: linear-gradient(135deg, #f0f4f8, #e7eef6);
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
  }
  .user-panel-header {
    width: 100%;
    max-width: 800px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 24px;
    padding: 32px 40px;
    backdrop-filter: blur(20px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    text-align: center;
    margin-bottom: 24px;
  }
  .back-btn {
    position: absolute;
    top: 24px;
    left: 24px;
    background: #e2e8f0;
    color: #4b5563;
    width: auto;
    padding: 10px 15px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: normal;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
  }
  .back-btn:hover {
    background: #cbd5e1;
    transform: none;
  }
  .back-btn svg {
    width: 20px;
    height: 20px;
  }
  .user-info-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .user-avatar-large {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    color: white;
    font-weight: bold;
    font-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
    margin-bottom: 16px;
  }
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }
  .user-role-label {
    margin: 8px 0 0 0;
    font-size: 1rem;
    color: #6b7280;
  }
  .guest-view-large {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .guest-view-large h1 {
    font-size: 2rem;
  }
  .guest-view-large p {
    margin: 10px 0 20px 0;
    color: #6c757d;
  }
  .login-btn-large {
    padding: 14px 28px;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    border: none;
    border-radius: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 4px 10px rgba(40, 167, 69, 0.2);
  }
  .login-btn-large:hover {
    background: linear-gradient(135deg, #218838, #1e7e34);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(40, 167, 69, 0.3);
  }
  .user-panel-content {
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .content-card {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 20px;
    padding: 24px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .content-card h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #334155;
    margin-top: 0;
    margin-bottom: 16px;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
  }
  .content-card p {
    margin: 8px 0;
    font-size: 1rem;
    color: #4b5563;
  }
  .logout-btn {
    padding: 10px 20px;
    background: linear-gradient(135deg, #ef4444, #f87171);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    margin-top: 16px;
  }
  .logout-btn:hover {
    background: linear-gradient(135deg, #dc2626, #ef4444);
    box-shadow: 0 6px 15px rgba(239, 68, 68, 0.4);
    transform: translateY(-2px);
  }
  .settings-text {
    color: #a0a0a0;
    font-style: italic;
  }
  .form-group {
    margin-bottom: 15px;
  }
  .form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
    color: #334155;
  }
  .form-group input {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: none;
    background: #f0f4f8;
    box-shadow: inset 2px 2px 5px #dbe3e8, inset -2px -2px 5px #ffffff;
  }
  .form-group input:focus {
    outline: none;
    box-shadow: inset 2px 2px 5px #dbe3e8, inset -2px -2px 5px #ffffff, 0 0 0 3px #3b82f640;
  }
  .submit-btn {
    width: 100%;
    padding: 12px;
    margin-top: 10px;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
  }
  .submit-btn:hover {
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
  }
  .error {
    color: #ef4444;
    margin-top: 10px;
    font-weight: 500;
  }
  .success {
    color: #28a745;
    margin-top: 10px;
    font-weight: 500;
  }
  .comments-list {
    background-color: #f7f9fc;
  }
  .comment-item {
    border-bottom: 1px solid #e0e6ed;
    padding: 15px 0;
  }
  .comment-item:last-child {
    border-bottom: none;
  }
  .comment-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 5px;
    color: #334155;
  }
  .comment-text {
    font-size: 0.9rem;
    color: #4b5563;
    line-height: 1.5;
    margin-bottom: 8px;
  }
  .comment-meta {
    font-size: 0.8rem;
    color: #9ca3af;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .no-comments-text {
    text-align: center;
    color: #a0a0a0;
    font-style: italic;
    padding: 20px;
  }
  .loading-message {
    text-align: center;
    color: #6b7280;
    padding: 20px;
  }
  
  .edit-form {
    display: flex;
    flex-direction: column;
  }
  
  .edit-form textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    min-height: 80px;
    resize: vertical;
    margin-bottom: 10px;
  }
  
  .edit-buttons {
    display: flex;
    gap: 10px;
  }
  
  .save-btn,
  .cancel-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: bold;
  }
  
  .save-btn {
    background-color: #4caf50;
    color: white;
  }
  
  .cancel-btn {
    background-color: #e5e7eb;
    color: #4b5563;
  }
  
  .comment-actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    transition: background-color 0.2s;
  }
  
  .action-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .edit-btn {
    background-color: #f1f5f9;
    color: #3b82f6;
  }
  
  .edit-btn:hover {
    background-color: #e2e8f0;
  }
  
  .delete-btn {
    background-color: #f1f5f9;
    color: #ef4444;
  }
  
  .delete-btn:hover {
    background-color: #e2e8f0;
  }
  </style>
  