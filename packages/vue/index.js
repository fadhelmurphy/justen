import { ref, onUnmounted } from 'vue';

function createStore(initializer) {
  const store = createStoreBase(initializer);

  const useStore = (selector = (s) => s) => {
    const selected = ref(selector(store.getState()));

    const unsub = store.subscribe(() => {
      selected.value = selector(store.getState());
    });

    onUnmounted(() => {
      unsub();
    });

    return selected;
  };

  useStore.getState = store.getState;
  useStore.setState = store.setState;
  useStore.subscribe = store.subscribe;

  return useStore;
}

function createStoreBase(initializer) {
  let state = {};
  const listeners = new Set();

  const getState = () => state;

  const setState = (partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
    listeners.forEach((fn) => fn());
  };

  state = initializer(setState, getState);

  const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  return { getState, setState, subscribe };
}

export { createStore };
