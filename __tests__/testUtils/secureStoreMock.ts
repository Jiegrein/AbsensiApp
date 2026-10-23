/** In-memory stand-in for expo-secure-store so tests can seed and inspect stored keys. */
export const createSecureStoreMock = () => {
  const store = new Map<string, string>();
  return {
    store,
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
};
