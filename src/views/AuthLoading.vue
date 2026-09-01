
<template>
  <div class="auth-loading">
    <div class="auth-loading__content">
      <!-- Logo -->
      <img
        src="@/assets/images/quidly-logo.png"
        alt="Quidly"
        class="auth-loading__logo"
      />

      <!-- Animated loader -->
      <div class="auth-loading__spinner">
        <div class="spinner-ring"></div>
      </div>

      <h2>Signing you in</h2>

      <p>
        Please wait while we securely connect your account...
      </p>

      <div class="auth-loading__dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-loading {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b0a14;
  color: white;
  font-family: inherit;
}

.auth-loading__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 24px;
}

.auth-loading__logo {
  width: 180px;
  height: auto;
  margin-bottom: 45px;
}

.auth-loading__spinner {
  width: 58px;
  height: 58px;
  margin-bottom: 28px;
  position: relative;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(255, 255, 255, 0.12);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.auth-loading h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.auth-loading p {
  margin: 10px 0 0;
  max-width: 360px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
  line-height: 1.6;
}

.auth-loading__dots {
  display: flex;
  gap: 6px;
  margin-top: 22px;
}

.auth-loading__dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  opacity: 0.25;
  animation: pulse 1.2s infinite ease-in-out;
}

.auth-loading__dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.auth-loading__dots span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  80%,
  100% {
    opacity: 0.25;
    transform: scale(0.8);
  }

  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
