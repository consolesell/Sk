// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBx-cS3l5_49Q2-xs5hqe5BKs79Laz4B0o",
  authDomain: "leotu-5c2b5.firebaseapp.com",
  databaseURL: "https://leotu-5c2b5-default-rtdb.firebaseio.com",
  projectId: "leotu-5c2b5",
  storageBucket: "leotu-5c2b5.firebasestorage.app",
  messagingSenderId: "694359717732",
  appId: "1:694359717732:web:1e79cc09e8e991f7322c71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM elements
let usernameRef = document.getElementById("username");
let passwordRef = document.getElementById("password");
let submitBtn = document.querySelector("button");
let eyeL = document.querySelector(".eyeball-l");
let eyeR = document.querySelector(".eyeball-r");
let handL = document.querySelector(".hand-l");
let handR = document.querySelector(".hand-r");

// Toggle between login and signup
let isLoginMode = true;
submitBtn.textContent = "Login";

// Eye and hand animations
let normalEyeStyle = () => {
  eyeL.style.cssText = `
    left:0.6em;
    top: 0.6em;
  `;
  eyeR.style.cssText = `
    right:0.6em;
    top:0.6em;
  `;
};

let normalHandStyle = () => {
  handL.style.cssText = `
    height: 2.81em;
    top:8.4em;
    left:7.5em;
    transform: rotate(0deg);
  `;
  handR.style.cssText = `
    height: 2.81em;
    top: 8.4em;
    right: 7.5em;
    transform: rotate(0deg)
  `;
};

usernameRef.addEventListener("focus", () => {
  eyeL.style.cssText = `
    left: 0.75em;
    top: 1.12em;  
  `;
  eyeR.style.cssText = `
    right: 0.75em;
    top: 1.12em;
  `;
  normalHandStyle();
});

passwordRef.addEventListener("focus", () => {
  handL.style.cssText = `
    height: 6.56em;
    top: 3.87em;
    left: 11.75em;
    transform: rotate(-155deg);    
  `;
  handR.style.cssText = `
    height: 6.56em;
    top: 3.87em;
    right: 11.75em;
    transform: rotate(155deg);
  `;
  normalEyeStyle();
});

document.addEventListener("click", (e) => {
  let clickedElem = e.target;
  if (clickedElem != usernameRef && clickedElem != passwordRef) {
    normalEyeStyle();
    normalHandStyle();
  }
});

// Firebase Authentication functions
const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User signed up:", userCredential.user);
    alert("Sign-up successful! Welcome!");
    usernameRef.value = "";
    passwordRef.value = "";
    window.location.href = "homepage.html"; // Redirect to homepage
  } catch (error) {
    console.error("Sign-up error:", error.message);
    alert(`Sign-up failed: ${error.message}`);
  }
};

const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in:", userCredential.user);
    alert("Login successful! Welcome back!");
    usernameRef.value = "";
    passwordRef.value = "";
    window.location.href = "homepage.html"; // Redirect to homepage
  } catch (error) {
    console.error("Sign-in error:", error.message);
    alert(`Login failed: ${error.message}`);
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
    alert("You have been signed out.");
    submitBtn.textContent = "Login";
    isLoginMode = true;
  } catch (error) {
    console.error("Sign-out error:", error.message);
    alert(`Sign-out failed: ${error.message}`);
  }
};

const toggleMode = () => {
  isLoginMode = !isLoginMode;
  submitBtn.textContent = isLoginMode ? "Login" : "Sign Up";
};

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = usernameRef.value.trim();
  const password = passwordRef.value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  if (isLoginMode) {
    await signIn(email, password);
  } else {
    await signUp(email, password);
  }
});

const toggleLink = document.createElement("a");
toggleLink.href = "#";
toggleLink.textContent = "Switch to Sign Up";
toggleLink.style.display = "block";
toggleLink.style.marginTop = "10px";
toggleLink.style.textAlign = "center";
toggleLink.style.color = "#007bff";
document.querySelector("form").appendChild(toggleLink);

toggleLink.addEventListener("click", (e) => {
  e.preventDefault();
  toggleMode();
  toggleLink.textContent = isLoginMode ? "Switch to Sign Up" : "Switch to Login";
});

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user.email);
    document.querySelector("form").style.display = "none";
    toggleLink.style.display = "none";
    submitBtn.style.display = "none";
    
    let logoutBtn = document.getElementById("logout");
    if (!logoutBtn) {
      logoutBtn = document.createElement("button");
      logoutBtn.id = "logout";
      logoutBtn.textContent = "Logout";
      logoutBtn.style.margin = "20px auto";
      logoutBtn.style.display = "block";
      document.querySelector(".container").appendChild(logoutBtn);
      logoutBtn.addEventListener("click", signOutUser);
    }
  } else {
    console.log("No user is signed in.");
    document.querySelector("form").style.display = "block";
    toggleLink.style.display = "block";
    submitBtn.style.display = "block";
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) logoutBtn.remove();
  }
});