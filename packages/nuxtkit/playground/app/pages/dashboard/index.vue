<template>
  <div class="login-card">
    <h1 class="login-title">Welcome back!</h1>
    <p class="login-message">✅ You have successfully logged in.</p>

    <div class="actions">
      <button
        class="action-button primary"
        :disabled="state.isLoading"
        @click="onGoHome"
      >
        Go Back to Home
      </button>

      <button
        class="action-button danger"
        :disabled="state.isLoading"
        @click="onTestUnauthorized"
      >
        <span v-if="state.isLoading" class="spinner"></span>
        <span v-else>Test Unauthorized Operation</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Symbols } from '@di/symbols'
import { DashboardViewModel } from '@feature/dashboard/view-model'

const router = useRouter()
const viewModel = useInstance<DashboardViewModel>(Symbols.DI.Feature.Dashboard.ViewModel)
const state = viewModel.state;

function onGoHome() {
  router.push('/')
}

async function onTestUnauthorized() {
  await viewModel.executeUnauthorized()
}
</script>

<style scoped>
.login-card {
  max-width: 420px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 14px;
  background-color: #ffffff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid #e0e0e0;
}

.login-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 0.75rem;
}

.login-message {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-button {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.25s,
    transform 0.1s;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-button.primary {
  background-color: #4caf50;
  color: #fff;
}

.action-button.primary:hover:not(:disabled) {
  background-color: #388e3c;
}

.action-button.danger {
  background-color: #f44336;
  color: #fff;
}

.action-button.danger:hover:not(:disabled) {
  background-color: #d32f2f;
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
