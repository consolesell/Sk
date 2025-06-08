// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

// Enhanced Firebase configuration with logging
const firebaseConfig = {
  apiKey: "AIzaSyBx-cS3l5_49Q2-xs5hqe5BKs79Laz4B0o",
  authDomain: "leotu-5c2b5.firebaseapp.com",
  databaseURL: "https://leotu-5c2b5-default-rtdb.firebaseio.com",
  projectId: "leotu-5c2b5",
  storageBucket: "leotu-5c2b5.firebasestorage.app",
  messagingSenderId: "694359717732",
  appId: "1:694359717732:web:1e79cc09e8e991f7322c71"
};

// Initialize Firebase with enhanced logging
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Enhanced logging system
class AuthLogger {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.logSession('AUTH_SESSION_START');
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  logSession(event, data = {}) {
    const logEntry = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      event: event,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionDuration: Date.now() - this.startTime,
      ...data
    };
    
    console.group(`🚗 AutoFlow Auth Log - ${event}`);
    console.log('Session ID:', this.sessionId);
    console.log('Timestamp:', logEntry.timestamp);
    console.log('Event:', event);
    if (Object.keys(data).length > 0) {
      console.log('Data:', data);
    }
    console.groupEnd();

    // Log to Firebase Analytics
    try {
      logEvent(analytics, event.toLowerCase(), {
        session_id: this.sessionId,
        custom_parameter: JSON.stringify(data)
      });
    } catch (error) {
      console.warn('Failed to log to Firebase Analytics:', error);
    }
  }

  logError(error, context = '') {
    const errorData = {
      error_code: error.code || 'UNKNOWN_ERROR',
      error_message: error.message || error.toString(),
      context: context,
      stack_trace: error.stack || 'No stack trace available'
    };

    this.logSession('AUTH_ERROR', errorData);
    
    // Enhanced error reporting
    console.error('🚨 AutoFlow Auth Error:', {
      sessionId: this.sessionId,
      context: context,
      error: errorData
    });
  }

  logSuccess(action, userData = {}) {
    const successData = {
      action: action,
      user_id: userData.uid || 'unknown',
      email: userData.email || 'unknown',
      email_verified: userData.emailVerified || false,
      creation_time: userData.metadata?.creationTime || null,
      last_sign_in: userData.metadata?.lastSignInTime || null
    };

    this.logSession('AUTH_SUCCESS', successData);
  }

  logPerformance(action, duration) {
    this.logSession('AUTH_PERFORMANCE', {
      action: action,
      duration_ms: duration,
      performance_rating: duration < 1000 ? 'excellent' : duration < 3000 ? 'good' : 'needs_improvement'
    });
  }
}

// Initialize logger
const authLogger = new AuthLogger();

// DOM elements
const usernameRef = document.getElementById("username");
const passwordRef = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const toggleModeBtn = document.getElementById("toggleMode");
const togglePasswordBtn = document.getElementById("togglePassword");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const switchText = document.getElementById("switch-text");
const authForm = document.querySelector(".auth-form");
const successState = document.getElementById("successState");
const loadingOverlay = document.getElementById("loadingOverlay");
const forgotPasswordLink = document.querySelector(".forgot-password");

// Application state
let isLoginMode = true;
let isLoading = false;

// Enhanced UI feedback system
class UIFeedback {
  static showLoading(message = 'Processing...') {
    isLoading = true;
    submitBtn.classList.add('loading');
    loadingOverlay.classList.add('active');
    loadingOverlay.querySelector('p').textContent = message;
    authLogger.logSession('UI_LOADING_START', { message });
  }

  static hideLoading() {
    isLoading = false;
    submitBtn.classList.remove('loading');
    loadingOverlay.classList.remove('active');
    authLogger.logSession('UI_LOADING_END');
  }

  static showError(message) {
    this.hideLoading();
    
    // Create or update error message element
    let errorElement = document.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.style.cssText = `
        background: linear-gradient(135deg, #ff4757, #ff3742);
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        font-weight: 500;
        animation: slideInDown 0.3s ease-out;
      `;
      authForm.insertBefore(errorElement, authForm.firstChild);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
      if (errorElement) {
        errorElement.style.animation = 'slideOutUp 0.3s ease-out';
        setTimeout(() => errorElement.remove(), 300);
      }
    }, 5000);

    authLogger.logSession('UI_ERROR_SHOWN', { message });
  }

  static showSuccess(message) {
    this.hideLoading();
    authForm.style.display = 'none';
    successState.style.display = 'block';
    successState.querySelector('p').textContent = message;
    authLogger.logSession('UI_SUCCESS_SHOWN', { message });
  }
}

// Enhanced authentication functions
const authActions = {
  async signUp(email, password) {
    const startTime = Date.now();
    authLogger.logSession('SIGNUP_ATTEMPT', { email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') });
    
    try {
      UIFeedback.showLoading('Creating your account...');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const duration = Date.now() - startTime;
      
      authLogger.logSuccess('SIGNUP_SUCCESS', userCredential.user);
      authLogger.logPerformance('SIGNUP', duration);
      
      UIFeedback.showSuccess('Account created successfully! Redirecting...');
      
      setTimeout(() => {
        window.location.href = "homepage.html";
      }, 2000);
      
    } catch (error) {
      authLogger.logError(error, 'SIGNUP_FAILED');
      UIFeedback.showError(this.getErrorMessage(error));
    }
  },

  async signIn(email, password) {
    const startTime = Date.now();
    authLogger.logSession('SIGNIN_ATTEMPT', { email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') });
    
    try {
      UIFeedback.showLoading('Signing you in...');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const duration = Date.now() - startTime;
      
      authLogger.logSuccess('SIGNIN_SUCCESS', userCredential.user);
      authLogger.logPerformance('SIGNIN', duration);
      
      UIFeedback.showSuccess('Welcome back! Redirecting...');
      
      setTimeout(() => {
        window.location.href = "homepage.html";
      }, 2000);
      
    } catch (error) {
      authLogger.logError(error, 'SIGNIN_FAILED');
      UIFeedback.showError(this.getErrorMessage(error));
    }
  },

  async signOut() {
    const startTime = Date.now();
    authLogger.logSession('SIGNOUT_ATTEMPT');
    
    try {
      UIFeedback.showLoading('Signing out...');
      
      await signOut(auth);
      const duration = Date.now() - startTime;
      
      authLogger.logSession('SIGNOUT_SUCCESS');
      authLogger.logPerformance('SIGNOUT', duration);
      
      this.resetUIToLogin();
      UIFeedback.hideLoading();
      
    } catch (error) {
      authLogger.logError(error, 'SIGNOUT_FAILED');
      UIFeedback.showError('Failed to sign out. Please try again.');
    }
  },

  async resetPassword(email) {
    authLogger.logSession('PASSWORD_RESET_ATTEMPT', { email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') });
    
    try {
      UIFeedback.showLoading('Sending reset email...');
      
      await sendPasswordResetEmail(auth, email);
      
      authLogger.logSession('PASSWORD_RESET_SUCCESS', { email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') });
      UIFeedback.hideLoading();
      
      alert('Password reset email sent! Check your inbox.');
      
    } catch (error) {
      authLogger.logError(error, 'PASSWORD_RESET_FAILED');
      UIFeedback.showError(this.getErrorMessage(error));
    }
  },

  getErrorMessage(error) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/operation-not-allowed': 'This operation is not allowed.',
      'auth/invalid-credential': 'Invalid login credentials. Please check your email and password.'
    };

    return errorMessages[error.code] || `Authentication error: ${error.message}`;
  },

  resetUIToLogin() {
    authForm.style.display = 'block';
    successState.style.display = 'none';
    isLoginMode = true;
    this.updateFormMode();
  },

  updateFormMode() {
    if (isLoginMode) {
      formTitle.textContent = 'Welcome Back';
      formSubtitle.textContent = 'Sign in to your account';
      submitBtn.querySelector('.btn-text').textContent = 'Sign In';
      switchText.textContent = "Don't have an account?";
      toggleModeBtn.textContent = 'Sign Up';
      forgotPasswordLink.style.display = 'inline-block';
    } else {
      formTitle.textContent = 'Join AutoFlow';
      formSubtitle.textContent = 'Create your premium account';
      submitBtn.querySelector('.btn-text').textContent = 'Sign Up';
      switchText.textContent = 'Already have an account?';
      toggleModeBtn.textContent = 'Sign In';
      forgotPasswordLink.style.display = 'none';
    }
    
    authLogger.logSession('UI_MODE_CHANGED', { mode: isLoginMode ? 'login' : 'signup' });
  }
};

// Enhanced input validation
class InputValidator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    return {
      isValid: password.length >= 6,
      errors: [
        password.length < 6 ? 'Password must be at least 6 characters long' : null,
        !/[A-Za-z]/.test(password) ? 'Password must contain at least one letter' : null,
        !/\d/.test(password) && !isLoginMode ? 'Password should contain at least one number' : null
      ].filter(Boolean)
    };
  }

  static validateForm(email, password) {
    const errors = [];
    
    if (!email.trim()) {
      errors.push('Email is required');
    } else if (!this.validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!password.trim()) {
      errors.push('Password is required');
    } else {
      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Enhanced event listeners with logging
document.addEventListener('DOMContentLoaded', () => {
  authLogger.logSession('DOM_LOADED');
  
  // Form submission
  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    const email = usernameRef.value.trim();
    const password = passwordRef.value.trim();
    
    const validation = InputValidator.validateForm(email, password);
    
    if (!validation.isValid) {
      UIFeedback.showError(validation.errors.join('. '));
      authLogger.logSession('FORM_VALIDATION_FAILED', { errors: validation.errors });
      return;
    }
    
    authLogger.logSession('FORM_SUBMITTED', { 
      mode: isLoginMode ? 'login' : 'signup',
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    });
    
    if (isLoginMode) {
      await authActions.signIn(email, password);
    } else {
      await authActions.signUp(email, password);
    }
  });

  // Mode toggle
  toggleModeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    authActions.updateFormMode();
    
    // Clear form
    usernameRef.value = '';
    passwordRef.value = '';
    
    // Remove any error messages
    const errorElement = document.querySelector('.error-message');
    if (errorElement) errorElement.remove();
  });

  // Password visibility toggle
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordRef.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordRef.setAttribute('type', type);
    
    const icon = togglePasswordBtn.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    
    authLogger.logSession('PASSWORD_VISIBILITY_TOGGLED', { visible: type === 'text' });
  });

  // Forgot password
  forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = usernameRef.value.trim();
    
    if (!email) {
      UIFeedback.showError('Please enter your email address first');
      usernameRef.focus();
      return;
    }
    
    if (!InputValidator.validateEmail(email)) {
      UIFeedback.showError('Please enter a valid email address');
      usernameRef.focus();
      return;
    }
    
    await authActions.resetPassword(email);
  });

  // Enhanced input interactions with logging
  usernameRef.addEventListener('focus', () => {
    authLogger.logSession('EMAIL_INPUT_FOCUSED');
  });

  passwordRef.addEventListener('focus', () => {
    authLogger.logSession('PASSWORD_INPUT_FOCUSED');
  });

  // Real-time validation feedback
  usernameRef.addEventListener('blur', () => {
    const email = usernameRef.value.trim();
    if (email && !InputValidator.validateEmail(email)) {
      usernameRef.style.borderColor = '#ff4757';
    } else {
      usernameRef.style.borderColor = '';
    }
  });

  passwordRef.addEventListener('input', () => {
    const password = passwordRef.value;
    const validation = InputValidator.validatePassword(password);
    
    if (!isLoginMode && password.length > 0) {
      passwordRef.style.borderColor = validation.isValid ? '#00d4aa' : '#ff4757';
    }
  });

  // Logout button (when user is signed in)
  document.addEventListener('click', (e) => {
    if (e.target.id === 'logout' || e.target.closest('#logout')) {
      e.preventDefault();
      authActions.signOut();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target === usernameRef || e.target === passwordRef)) {
      submitBtn.click();
    }
    
    if (e.key === 'Escape') {
      const errorElement = document.querySelector('.error-message');
      if (errorElement) errorElement.remove();
    }
  });

  // Page visibility change tracking
  document.addEventListener('visibilitychange', () => {
    authLogger.logSession('PAGE_VISIBILITY_CHANGED', { 
      hidden: document.hidden,
      visibilityState: document.visibilityState 
    });
  });

  // Window unload tracking
  window.addEventListener('beforeunload', () => {
    authLogger.logSession('SESSION_ENDING', {
      sessionDuration: Date.now() - authLogger.startTime
    });
  });
});

// Enhanced auth state observer with comprehensive logging
onAuthStateChanged(auth, (user) => {
  if (user) {
    authLogger.logSuccess('AUTH_STATE_CHANGED_SIGNED_IN', user);
    
    // Update UI for authenticated user
    authForm.style.display = 'none';
    successState.style.display = 'block';
    
    // Create logout button if it doesn't exist
    let logoutBtn = document.getElementById('logout');
    if (!logoutBtn) {
      logoutBtn = document.createElement('button');
      logoutBtn.id = 'logout';
      logoutBtn.className = 'logout-btn';
      logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
      successState.appendChild(logoutBtn);
    }
    
    // Update success message with user info
    const welcomeMsg = successState.querySelector('h2');
    const userEmail = user.email ? user.email.split('@')[0] : 'User';
    welcomeMsg.textContent = `Welcome${user.displayName ? ', ' + user.displayName : ''}!`;
    
    authLogger.logSession('USER_INTERFACE_UPDATED', {
      user_id: user.uid,
      email_verified: user.emailVerified,
      display_name: user.displayName || 'Not set'
    });
    
  } else {
    authLogger.logSession('AUTH_STATE_CHANGED_SIGNED_OUT');
    
    // Reset UI for unauthenticated state
    authActions.resetUIToLogin();
    
    // Remove logout button
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) logoutBtn.remove();
    
    // Clear form fields
    usernameRef.value = '';
    passwordRef.value = '';
  }
});

// Performance monitoring
window.addEventListener('load', () => {
  const loadTime = performance.now();
  authLogger.logPerformance('PAGE_LOAD', loadTime);
  
  // Log additional performance metrics
  if (performance.navigation) {
    authLogger.logSession('NAVIGATION_INFO', {
      type: performance.navigation.type,
      redirectCount: performance.navigation.redirectCount
    });
  }
  
  // Log connection info if available
  if (navigator.connection) {
    authLogger.logSession('CONNECTION_INFO', {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    });
  }
});

// Global error handler
window.addEventListener('error', (event) => {
  authLogger.logError(event.error, 'GLOBAL_ERROR');
});

window.addEventListener('unhandledrejection', (event) => {
  authLogger.logError(event.reason, 'UNHANDLED_PROMISE_REJECTION');
});

// Initialize form mode
authActions.updateFormMode();

// Log initialization complete
authLogger.logSession('AUTH_SYSTEM_INITIALIZED', {
  version: '2.0.0',
  features: [
    'enhanced_logging',
    'real_time_validation', 
    'performance_monitoring',
    'error_handling',
    'ui_animations',
    'responsive_design'
  ]
});