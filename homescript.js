import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBx-cS3l5_49Q2-xs5hqe5BKs79Laz4B0o",
  authDomain: "leotu-5c2b5.firebaseapp.com",
  databaseURL: "https://leotu-5c2b5-default-rtdb.firebaseio.com",
  projectId: "leotu-5c2b5",
  storageBucket: "leotu-5c2b5.firebasestorage.app",
  messagingSenderId: "694359717732",
  appId: "1:694359717732:web:1e79cc09e8e991f7322c71"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sticky header
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  header.classList.toggle("sticky", window.scrollY > 0);
});

// Carousel functionality
const carousel = document.querySelector(".carousel");
const items = document.querySelectorAll(".carousel-item");
let currentIndex = 0;

function showSlide(index) {
  items.forEach((item, i) => {
    item.style.transform = `translateX(${(i - index) * 100}%)`;
  });
}

setInterval(() => {
  currentIndex = (currentIndex + 1) % items.length;
  showSlide(currentIndex);
}, 5000);

// Book now buttons
document.querySelectorAll(".book-now, .cta").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const service = e.target.closest(".carousel-item")?.dataset.service || "general";
    localStorage.setItem("selectedService", service);
    window.location.href = "location.html";
  });
});

// Logout
document.getElementById("logout").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error.message);
    alert("Logout failed: " + error.message);
  }
});

// Redirect unauthenticated users
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});