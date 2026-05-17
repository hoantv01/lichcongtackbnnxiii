// Thay thế bằng cấu hình Firebase của dự án thực tế của bạn
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDudy2CuL7n1G9tabmBIND_tA8THGYj2nY",
  authDomain: "lichcongtackbnnxiii.firebaseapp.com",
  projectId: "lichcongtackbnnxiii",
  storageBucket: "lichcongtackbnnxiii.firebasestorage.app",
  messagingSenderId: "549236012999",
  appId: "1:549236012999:web:511b16064251ca5dc2cbe2",
  measurementId: "G-WW5V97JZ7N"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase initialized");



