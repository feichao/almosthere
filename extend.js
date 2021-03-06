import { AsyncStorage } from 'react-native';
import Storage from 'react-native-storage';

/**
 * Storage
 */
const storage = new Storage({
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: true,
});

global.storage = storage;
