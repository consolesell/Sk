import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Firebase configuration (replace with your own config)
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    }
});

// Logout functionality
document.getElementById("logout").addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});

// Sticky header
window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");
    header.classList.toggle("sticky", window.scrollY > 0);
});

// Carousel functionality
const carouselItems = document.querySelectorAll(".carousel-item");
let currentSlide = 0;

function showSlide(index) {
    carouselItems.forEach((item, i) => {
        item.style.transform = `translateX(${(i - index) * 100}%)`;
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % carouselItems.length;
    showSlide(currentSlide);
}

// Image slider functionality for each carousel item
carouselItems.forEach((item) => {
    const images = item.querySelectorAll(".image-slider img");
    let currentImage = 0;

    if (images.length > 0) {
        images[0].classList.add("active");

        setInterval(() => {
            images[currentImage].classList.remove("active");
            currentImage = (currentImage + 1) % images.length;
            images[currentImage].classList.add("active");
        }, 3000); // Change image every 3 seconds
    }
});

// Auto-slide carousel
showSlide(currentSlide);
setInterval(nextSlide, 5000); // Change slide every 5 seconds