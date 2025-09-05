// app/composables/useNotifications.ts
import { reactive } from 'vue';

export interface Notification {
  id: number;
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const state = reactive({
  items: [] as Notification[],
  nextId: 1,
});

export function useNotifications() {
  function notify(message: string, type: Notification['type'] = 'info') {
    const id = state.nextId++;
    state.items.push({ id, type, message });
    // auto-dismiss after 2s
    setTimeout(() => remove(id), 2000);
  }

  function remove(id: number) {
    const i = state.items.findIndex((n) => n.id === id);
    if (i !== -1) state.items.splice(i, 1);
  }

  function clear() {
    state.items.length = 0;
  }

  return {
    items: state.items,
    notify,
    remove,
    clear,
  };
}
