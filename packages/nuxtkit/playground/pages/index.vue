<script setup lang="ts">
import { LoginViewModel } from '~/feature/login-view-model';
import { Symbols } from '../symbols';

const vm = useInstance<LoginViewModel>(Symbols.DI.Feature.Login.ViewModel);

await vm.onBeforeMount()
</script>

<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="vm.onLogin()">
      <h1 class="login-title">Login</h1>

      <input
        id="username"
        type="text"
        v-model="vm.state.username"
        placeholder="Username"
        class="input"
      />

      <input
        id="password"
        type="password"
        v-model="vm.state.password"
        placeholder="Password"
        class="input"
      />

      <button type="submit" :disabled="vm.state.isLoading" class="btn">
        <span v-if="vm.state.isLoading" class="spinner"></span>
        <span v-else>Login</span>
      </button>

      <p v-if="vm.state.error" class="label">{{ vm.state.error }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100dvh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background-color: #0e0e0e;
}

.login-form {
  padding: 2rem;
  border-radius: 12px;
  background: #1c1c1e;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
  width: 340px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.login-title {
  text-align: center;
  color: #f4f4f4;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.input {
  padding: 0.9rem;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: #2c2c2e;
  color: #f4f4f4;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.input::placeholder {
  color: #aaa;
}

.input:focus {
  border-color: #007bff;
}

.btn {
  padding: 0.9rem;
  border: none;
  border-radius: 8px;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.label {
  text-align: center;
  color: #f4f4f4;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
