import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { saveBooking } from "./bookings.js";

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

document.addEventListener("DOMContentLoaded", () => {
  const getLocationBtn = document.getElementById("getLocationBtn");
  const retryLocationBtn = document.getElementById("retryLocation");
  const proceedBtn = document.getElementById("proceed");
  const loading = document.getElementById("loading");
  const locationInfo = document.getElementById("locationInfo");
  const error = document.getElementById("error");
  const prompt = document.getElementById("prompt");
  const latitude = document.getElementById("latitude");
  const longitude = document.getElementById("longitude");
  const accuracy = document.getElementById("accuracy");
  const mapLink = document.getElementById("mapLink");

  function hideAllMessages() {
    loading.classList.add("hidden");
    locationInfo.classList.add("hidden");
    error.classList.add("hidden");
    prompt.classList.add("hidden");
  }

  function showError(message) {
    error.textContent = message;
    error.classList.remove("hidden");
  }

  async function saveLocationAndRedirect(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const acc = position.coords.accuracy;

    latitude.textContent = lat.toFixed(6);
    longitude.textContent = lng.toFixed(6);
    accuracy.textContent = Math.round(acc);

    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    mapLink.innerHTML = `<a href="${googleMapsUrl}" target="_blank">View on Google Maps</a>`;

    loading.classList.add("hidden");
    locationInfo.classList.remove("hidden");
    getLocationBtn.disabled = false;

    const service = localStorage.getItem("selectedService");
    const user = auth.currentUser;
    if (user && service) {
      await saveBooking(user.uid, service, { lat, lng, accuracy: acc });
      window.location.href = "bookings.html";
    }
  }

  function getLocation() {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by this browser.");
      return;
    }

    hideAllMessages();
    loading.classList.remove("hidden");
    getLocationBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      saveLocationAndRedirect,
      (err) => {
        loading.classList.add("hidden");
        getLocationBtn.disabled = false;
        let errorMessage = "Unable to retrieve your location.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = "Location access denied by user.";
          prompt.classList.remove("hidden");
          setTimeout(() => prompt.classList.add("hidden"), 2000);
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable.";
        } else if (err.code === err.TIMEOUT) {
          errorMessage = "Location request timed out.";
        }
        showError(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  getLocationBtn.addEventListener("click", getLocation);
  retryLocationBtn.addEventListener("click", getLocation);
  proceedBtn.addEventListener("click", () => {
    window.location.href = "homepage.html";
  });

  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      getLocation(); // Auto-trigger location request
    }
  });
});