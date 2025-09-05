<template>
  <div class="single-panel-container">
    <div class="top-bar">
      <div v-if="user" class="user-panel">
        <div class="user-info">
          <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
          <div class="user-details">
            <h3>{{ user.username }}</h3>
            <p class="user-role">Kullanıcı</p>
          </div>
        </div>
        <button @click="logout" class="logout-btn">Çıkış Yap</button>
        <button @click="userPanel" class="userPanel-btn">Kullanıcı Paneli</button>
      </div>
      <div v-else class="user-panel guest-view">
        <p>Giriş yapın</p>
        <button @click="loginToComment">Giriş Yap</button>
      </div>
    </div>
    
    <div class="content-panel">
      <button v-if="selectedCar || selectedBrand" @click="goBack" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Geri Dön
      </button>

      <div v-if="!selectedBrand" class="brands-view">
        <h2 class="section-title">Markalar</h2>
        <input
          v-model="search"
          type="text"
          placeholder="Araç markası ara..."
          class="search-input"
        />
        <div class="brand-cards-grid">
          <div
            v-for="brand in filteredBrands"
            :key="brand.name"
            class="brand-card"
            @click="selectBrand(brand)"
          >
            <img :src="brand.logo" :alt="brand.name + ' Logo'" class="brand-logo" />
            <span class="list-item-title">{{ brand.name }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="selectedBrand && !selectedCar" class="models-view">
        <h2 class="section-title">{{ selectedBrand.name }} Modelleri</h2>
        <div class="model-cards-list">
          <div
            v-for="model in selectedBrand.models"
            :key="model._id"
            class="model-card"
            @click="selectCar(model)"
          >
            <img :src="model.images[0]" :alt="model.name" class="model-thumb" />
            <div class="model-info">
              <span class="model-price"> {{model.brand}}  {{ model.model }} - {{ model.price.toLocaleString('eu-gm') }} €</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="selectedCar" class="car-detail-view">
        <h1 class="delcar-title">{{ selectedCar.brand }} {{ selectedCar.model }}</h1>

        <div class="slider">
          <img :src="selectedCar.images[currentSlide]" :alt="selectedCar.model" class="car-image" />
          <div class="slider-nav">
            <img 
              v-for="(img, index) in selectedCar.images" 
              :key="index" 
              :src="img"
              :class="['thumbnail', { active: currentSlide === index }]"
              @click="currentSlide = index"
            />
          </div>
        </div>

        <p class="price">{{ selectedCar.price.toLocaleString('eu-gm') }} €</p>

        <div class="comments">
          <h3>Yorumlar ({{ comments[selectedCar._id]?.length || 0 }})</h3>
          <div v-if="comments[selectedCar._id]?.length">
            <div 
              v-for="c in comments[selectedCar._id]" 
              :key="c._id" 
              class="comment-card"
            >
              <div class="avatar">{{ c.username.charAt(0).toUpperCase() }}</div>
              <div class="comment-content">
                <strong>{{ c.username }}</strong>
                <div>
                  <p>{{ c.text }}</p>
                  <small>{{ new Date(c.createdAt).toLocaleDateString() }}</small>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="no-comments">Henüz yorum yok.</p>
          
          <div v-if="user" class="add-comment">
            <textarea 
              v-model="newComments[selectedCar._id]" 
              placeholder="Yorum yaz..."
            ></textarea>
            <button @click="addComment(selectedCar._id)">Gönder</button>
          </div>
          <div v-else class="login-to-comment">
            <p>Yorum yapmak için lütfen giriş yapın.</p>
            <button @click="loginToComment">Giriş Yap</button>
          </div>
        </div>
      </div>

      <div v-else class="initial-view">
        <p>Lütfen bir marka seçin.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useAuthStore } from "../stores/auth.js";

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const search = ref("");
const currentSlide = ref(0);

const brands = ref([]);
const selectedBrand = ref(null);
const selectedCar = ref(null);
const comments = ref({});
const newComments = ref({});

const fetchCars = async () => {
  try {
    const response = await axios.get("http://localhost:5000/cars");
    const groupedBrands = response.data.reduce((acc, car) => {
      if (!acc[car.brand]) {
        const brandLogoMap = {
          "BMW": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/1024px-BMW.svg.png",
          "Audi": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Audi_logo_detail.svg/1024px-Audi_logo_detail.svg.png",
          "Mercedes-Benz": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/567px-Mercedes-Logo.svg.png",
          "Toyota": "https://www.carlogos.org/car-logos/toyota-logo-1989-download.png",
          "Volkswagen": "https://images.seeklogo.com/logo-png/15/2/volkswagen-logo-png_seeklogo-150527.png",
          "Ford": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/1200px-Ford_logo_flat.svg.png",
          "Fiat": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/FIAT_logo_%282020%29.svg/1280px-FIAT_logo_%282020%29.svg.png",
          "Honda": "https://cdn.pixabay.com/photo/2016/08/15/18/18/honda-1596081_960_720.png",
          "Nissan": "https://upload.wikimedia.org/wikipedia/commons/2/23/Nissan_2020_logo.svg",
          "Hyundai": "https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg",
          "Kia": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/KIA_logo3.svg/2560px-KIA_logo3.svg.png",
          "Peugeot": "https://cdn.worldvectorlogo.com/logos/peugeot-1.svg",
          "Renault": "https://cdn.worldvectorlogo.com/logos/renault-1.svg",
          "Skoda": "https://upload.wikimedia.org/wikipedia/commons/0/09/%C5%A0koda_nieuw.png",
        };
        acc[car.brand] = { name: car.brand, logo: brandLogoMap[car.brand] || '', models: [] };
      }
      acc[car.brand].models.push(car);
      return acc;
    }, {});
    const sortedBrands = Object.values(groupedBrands).sort((a, b) => a.name.localeCompare(b.name));
    brands.value = sortedBrands;
  } catch (error) {
    console.error("Araçlar alınırken hata oluştu:", error);
  }
};

const filteredBrands = computed(() =>
  brands.value.filter((b) => b.name.toLowerCase().includes(search.value.toLowerCase()))
);

const selectBrand = (brand) => {
  selectedBrand.value = brand;
  selectedCar.value = null;
};

const selectCar = (car) => {
  selectedCar.value = car;
  currentSlide.value = 0;
  fetchCommentsByCar(car._id);
};

const goBack = () => {
  if (selectedCar.value) {
    selectedCar.value = null;
  } else if (selectedBrand.value) {
    selectedBrand.value = null;
  }
};

const fetchCommentsByCar = async (carId) => {
  try {
    const res = await axios.get(`http://localhost:5000/comments/${carId}`);
    comments.value[carId] = res.data.reverse();
  } catch (err) {
    comments.value[carId] = [];
    console.error(`Yorumlar getirilirken hata oluştu: ${err.message}`);
  }
};

const addComment = async (carId) => {
  if (!newComments.value[carId] || newComments.value[carId].trim() === "") return;
  if (!user.value || !user.value._id) {
    console.error("Kullanıcı giriş yapmamış");
    return;
  }
  try {
    await axios.post("http://localhost:5000/comments", {
      carId,
      userId: user.value._id,
      username: user.value.username,
      text: newComments.value[carId],
    });
    newComments.value[carId] = "";
    await fetchCommentsByCar(carId);
  } catch (err) {
    console.error("Yorum gönderme hatası:", err);
  }
};

const userPanel = () => {
  router.push('/UserPanel');
}

const logout = () => {
  authStore.clearUser();
  selectedBrand.value = null;
  selectedCar.value = null;
  comments.value = {};
  newComments.value = {};
};

const loginToComment = () => {
  router.push('/login');
};

onMounted(() => {
  authStore.initAuth();
  fetchCars();
});

watch(selectedCar, () => currentSlide.value = 0);
</script>

<style scoped>
.single-panel-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  padding: 24px;
  overflow-y: auto;
  background: linear-gradient(135deg, #f0f4f8, #e7eef6);
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.8);
  padding: 12px 24px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.guest-view {
  gap: 10px;
}
.guest-view p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  font-weight: bold;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.user-details h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1f2937;
}

.user-role {
  margin: 2px 0 0 0;
  font-size: 0.8rem;
  color: #6b7280;
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
}

.logout-btn:hover {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  box-shadow: 0 6px 15px rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
}
.userPanel-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}
.userPanel-btn:hover {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
}

.content-panel {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  padding: 32px 40px;
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.back-btn {
  background: #e2e8f0;
  color: #4b5563;
  width: auto;
  padding: 10px 15px;
  border-radius: 12px;
  align-self: flex-start;
  margin-bottom: 24px;
  font-size: 0.9rem;
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}
.back-btn:hover {
  background: #cbd5e1;
  transform: none;
}
.back-btn svg {
  width: 20px;
  height: 20px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #1f2937;
}

.search-input {
  width: 100%;
  padding: 14px 20px;
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
  background: #f0f4f8;
  box-shadow: inset 2px 2px 5px #dbe3e8, inset -2px -2px 5px #ffffff;
  transition: all 0.3s ease;
}
.search-input:focus {
  outline: none;
  box-shadow: inset 2px 2px 5px #dbe3e8, inset -2px -2px 5px #ffffff, 0 0 0 3px #3b82f640;
}

.brand-cards-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
gap: 20px;
}

.brand-card {
display: flex;
align-items: center;
gap: 16px;
padding: 24px;
background: #f8fafc;
border-radius: 20px;
cursor: pointer;
box-shadow: 6px 6px 12px #dbe3e8, -6px -6px 12px #ffffff;
transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.brand-card:hover {
transform: translateY(-6px);
box-shadow: 8px 8px 16px #dbe3e8, -8px -8px 16px #ffffff;
}
.brand-card:active {
transform: translateY(-2px);
box-shadow: inset 2px 2px 5px #dbe3e8, inset -2px -2px 5px #ffffff;
}

.brand-logo {
width: 60px;
height: auto;
filter: grayscale(80%);
transition: filter 0.3s ease;
}

.brand-card:hover .brand-logo {
filter: grayscale(0%);
}

.list-item-title {
font-size: 1.1rem;
font-weight: 600;
color: #334155;
flex-grow: 1;
}

.list-item-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
}

.models-view, .car-detail-view {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.model-cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.model-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
  cursor: pointer;
  box-shadow: 4px 4px 8px #dbe3e8, -4px -4px 8px #ffffff;
  transition: all 0.3s ease;
}
.model-card:hover {
  background: #e2e8f0;
  transform: translateX(5px);
}

.model-thumb {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 12px;
}

.model-info {
  display: flex;
  flex-direction: column;
}

.model-price {
  font-size: 1rem;
  color: #1f2937;
  font-weight: bold;
}

.car-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #1f2937;
}

.slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.car-image {
  width: 100%;
  max-height: 500px;
  height: auto;
  border-radius: 20px;
  object-fit: contain;
  background: #e2e8f0;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.slider-nav {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.thumbnail {
  width: 90px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}
.thumbnail.active {
  border-color: #3b82f6;
  transform: scale(1.1);
}

.price {
  font-size: 1.6rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 24px;
}

.comments {
  margin-top: 24px;
}

h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #334155;
}

.comment-card {
  display: flex;
  gap: 16px;
  background: #f8fafc;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 16px;
  align-items: flex-start;
  box-shadow: 4px 4px 8px #dbe3e8, -4px -4px 8px #ffffff;
  transition: all 0.3s ease;
}
.comment-card:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 12px #dbe3e8, -6px -6px 12px #ffffff;
}

.avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  font-weight: bold;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.comment-content {
  flex-grow: 1;
}

.comment-content strong {
  font-size: 1.1rem;
  color: #1f2937;
}

.comment-content p {
  margin: 6px 0;
  line-height: 1.6;
  color: #4b5563;
}

.comment-content small {
  font-size: 0.85rem;
  color: #666;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.actions button {
  padding: 8px 18px;
  font-size: 0.9rem;
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.actions button svg {
  width: 16px;
  height: 16px;
}

.add-comment {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-to-comment {
  margin-top: 24px;
  text-align: center;
  padding: 24px;
  background: #f0f4f8;
  border-radius: 20px;
  border: 2px dashed #dbe3e8;
}

.login-to-comment p {
  margin: 0 0 20px 0;
  color: #6c757d;
  font-size: 1rem;
}

.login-to-comment button {
  background: linear-gradient(135deg, #28a745, #20c997);
  margin-top: 0;
}
.login-to-comment button:hover {
  background: linear-gradient(135deg, #218838, #1e7e34);
  box-shadow: 0 6px 12px rgba(40, 167, 69, 0.3);
}

textarea {
  width: 100%;
  padding: 14px 20px;
  border-radius: 16px;
  border: none;
  background: #f0f4f8;
  box-shadow: inset 2px 2px 5px #dbe3e8, inset -2px -2px 5px #ffffff;
  resize: vertical;
  min-height: 100px;
  color: #4b5563;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}
button:hover {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
}

.initial-view {
  text-align: center;
  padding: 50px;
  color: #6c757d;
  font-size: 1.2rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .single-panel-container {
    padding: 16px;
  }
  .content-panel {
    padding: 20px;
  }
  .brand-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .top-bar {
    margin-bottom: 16px;
  }
  .user-panel {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 12px 16px;
  }
  .logout-btn {
    width: auto;
    padding: 8px 12px;
  }
  .back-btn {
    padding: 8px 12px;
  }
}
</style>
