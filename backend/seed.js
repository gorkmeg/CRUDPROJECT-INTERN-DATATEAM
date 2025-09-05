const mongoose = require('mongoose');
const Car = require('./models/Car');

const brandsData = [
  {
    name: "BMW",
    models: [
      { name: "M5 CS", price: 93500, images: ["https://www.bmw-m.com/content/dam/bmw/marketBMW_M/www_bmw-m_com/topics/magazine-article-pool/2021/entwickler-faq/bmw-m5-cs-cp-03.jpg", "https://www.log.com.tr/wp-content/uploads/2021/02/2021-bmw-m5-cs-7.jpg"] },
      { name: "320i", price: 50000, images: ["https://cdn.motor1.com/images/mgl/P33J9G/s1/2022-bmw-3er-limousine.jpg", "https://www.otomobil.com.tr/wp-content/uploads/2022/08/Yeni-BMW-320i-konsol.jpg"] },
      { name: "i7", price: 150000, images: ["", ""] },
      { name: "X5", price: 85000, images: ["", ""] },
    ],
  },
  {
    name: "Audi",
    models: [
      { name: "RS6", price: 149500, images: ["", ""] },
      { name: "A8 L", price: 139200, images: ["", "", ""] },
      { name: "Q7", price: 70000, images: ["", ""] },
      { name: "A3 Sedan", price: 45000, images: ["", ""] },
    ],
  },
  {
    name: "Mercedes-Benz",
    models: [
      { name: "C 200", price: 65000, images: ["", ""] },
      { name: "E 220", price: 80000, images: ["", ""] },
      { name: "EQS", price: 180000, images: ["", ""] },
    ],
  },
  {
    name: "Toyota",
    models: [
      { name: "Corolla", price: 35000, images: ["", ""] },
      { name: "RAV4", price: 45000, images: ["", ""] },
      { name: "C-HR", price: 38000, images: ["", ""] },
    ],
  },
  {
    name: "Volkswagen",
    models: [
      { name: "Golf", price: 30000, images: ["", ""] },
      { name: "Passat", price: 50000, images: ["", ""] },
      { name: "Tiguan", price: 55000, images: ["", ""] },
    ],
  },
  {
    name: "Ford",
    models: [
      { name: "Focus", price: 32000, images: ["", ""] },
      { name: "Mustang Mach-E", price: 65000, images: ["", ""] },
      { name: "Kuga", price: 48000, images: ["", ""] },
    ],
  },
  {
    name: "Fiat",
    models: [
      { name: "Egea", price: 28000, images: ["", ""] },
      { name: "500", price: 25000, images: ["", ""] },
      { name: "Panda", price: 20000, images: ["", ""] },
    ],
  },
  {
    name: "Honda",
    models: [
      { name: "Civic", price: 40000, images: ["", ""] },
      { name: "CR-V", price: 55000, images: ["", ""] },
    ],
  },
  {
    name: "Nissan",
    models: [
      { name: "Qashqai", price: 42000, images: ["", ""] },
      { name: "Juke", price: 35000, images: ["", ""] },
    ],
  },
  {
    name: "Hyundai",
    models: [
      { name: "i20", price: 29000, images: ["", ""] },
      { name: "Tucson", price: 48000, images: ["", ""] },
    ],
  },
  {
    name: "Kia",
    models: [
      { name: "Sportage", price: 47000, images: ["", ""] },
      { name: "Ceed", price: 34000, images: ["", ""] },
    ],
  },
  {
    name: "Peugeot",
    models: [
      { name: "3008", price: 58000, images: ["", ""] },
      { name: "208", price: 30000, images: ["", ""] },
    ],
  },
  {
    name: "Renault",
    models: [
      { name: "Clio", price: 27000, images: ["", ""] },
      { name: "Megane Sedan", price: 38000, images: ["", ""] },
    ],
  },
  {
    name: "Skoda",
    models: [
      { name: "Octavia", price: 36000, images: ["", ""] },
      { name: "Superb", price: 49000, images: ["", ""] },
    ],
  },
];

const seedDatabase = async () => {
    try {
        const carCount = await Car.countDocuments();
        
        if (carCount === 0) {
            console.log('Veritabanında hiç araba bulunamadı. Başlangıç verileri yükleniyor...');
            
            const carsToInsert = [];
            brandsData.forEach(brand => {
                brand.models.forEach(model => {
                    carsToInsert.push({
                        brand: brand.name,
                        model: model.name,
                        price: model.price,
                        images: model.images,
                    });
                });
            });

            await Car.insertMany(carsToInsert);
            console.log(`${carsToInsert.length} adet araba başarıyla eklendi.`);
        } else {
            console.log('Veritabanında araba kaydı mevcut, veri eklenmeyecek.');
        }

    } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
    }
};

module.exports = seedDatabase;
