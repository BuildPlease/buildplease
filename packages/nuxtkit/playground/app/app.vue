<template>
  <NuxtPage />

  <!-- Global notifications -->
  <div class="notifications">
    <div
      v-for="n in items"
      :key="n.id"
      class="notification"
      :class="n.type"
      role="alert"
    >
      <span>{{ n.message }}</span>
      <button class="close" @click="remove(n.id)" aria-label="Dismiss">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, remove } = useNotifications()
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  font-family: 'Inter', sans-serif;
  background-color: #0e0e0e;
}

/* notifications UI */
.notifications {
  position: fixed;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 9999;
}
.notification {
  min-width: 240px;
  max-width: 360px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #fff;
  background: #222;
  box-shadow: 0 6px 16px rgba(0,0,0,.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid rgba(255,255,255,.08);
}
.notification.info    { background: #2563eb; }
.notification.success { background: #16a34a; }
.notification.warning { background: #d97706; }
.notification.error   { background: #dc2626; }
.notification .close {
  background: transparent;
  border: 0;
  color: inherit;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
}
</style>
