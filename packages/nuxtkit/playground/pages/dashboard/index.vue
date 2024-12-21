<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBackHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="login-card">
    <h1 class="login-title">Welcome back!</h1>
    <p class="login-message">✅ You have successfully logged in.</p>
    <button class="back-button" @click="goBackHome">Go Back to Home</button>
  </div>
</template>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 12px;
  background-color: #e6ffed;
  box-shadow: 0 4px 12px rgba(0, 128, 0, 0.2);
  text-align: center;
  border: 1px solid #4caf50;
}

.login-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 1rem;
}

.login-message {
  font-size: 1rem;
  color: #388e3c;
  margin-bottom: 1.5rem;
}

.back-button {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 8px;
  background-color: #4caf50;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s;
}

.back-button:hover {
  background-color: #388e3c;
}
</style>
