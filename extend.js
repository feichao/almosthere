import { AsyncStorage, DeviceEventEmitter } from 'react-native';
import Storage from 'react-native-storage';
import PushNotification from 'react-native-push-notification';
import PushNotificationAndroid from 'react-native-push-notification';

import { Locations, Settings } from './src/model';

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

/**
 * PushNotification
 */
PushNotificationAndroid.registerNotificationActions(['稍后提醒', '不再提醒']);
DeviceEventEmitter.addListener('notificationActionReceived', function(action){
  const info = JSON.parse(action.dataJSON);
  const locationId = info.locationId;
  if (info.action === '稍后提醒' && locationId !== undefined) {
    Locations.saveLocation({
      id: locationId,
      alartLater: true
    });
  } else if (info.action === '不再提醒' && locationId !== undefined) {
    Locations.saveLocation({
      id: locationId,
      alertTomorrow: true
    });
  }
});
PushNotification.configure({
  onRegister: function (token) {
  },
  onNotification: function (notification) {
  },
});