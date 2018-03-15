'use strict';

import { NativeModules, NativeAppEventEmitter } from 'react-native';

const AMapLocation = NativeModules.AMapLocation;

const LOCATION_MODE = {
  BATTERY_SAVING: AMapLocation.Battery_Saving,
  DEVICE_SENSORS: AMapLocation.Device_Sensors,
  HIGHT_ACCURACY: AMapLocation.Hight_Accuracy
};

const LOCATION_PROTOCOL = {
  HTTP: AMapLocation.HTTP,
  HTTPS: AMapLocation.HTTPS,
};

const noop = () => {};

AMapLocation.init(null);

export default {
  LOCATION_MODE,
  LOCATION_PROTOCOL,
  getLocation(options = {
    locationMode: LOCATION_MODE.BATTERY_SAVING,     // 设置定位模式, 可选的模式有高精度、仅设备、仅网络. 默认为高精度模式.
    gpsFirst: false,                                // 设置是否 gps 优先, 只在高精度模式下有效. 默认关闭.
    httpTimeout: 300000,                            // 设置网络请求超时时间. 默认为30秒. 在仅设备模式下无效.
    interval: 2000,                                 // 设置连续定位间隔.
    needAddress: true,                              // 设置是否返回逆地理地址信息. 默认是true.
    onceLocation: true,                             // 设置是否单次定位. 默认是 true.
    locationCacheEnable: true,                      // 设置是否开启缓存, 默认为true.
    onceLocationLatest: false,                      // 设置是否等待wifi刷新, 默认为false. 如果设置为true, 会自动变为单次定位, 持续定位时不要使用
    locationProtocol: LOCATION_PROTOCOL.HTTP,       // 设置网络请求的协议。可选HTTP或者HTTPS。默认为HTTP
    sensorEnable: false,                            // 设置是否使用传感器。默认是false
    allowsBackgroundLocationUpdates: false          // 设置是否允许后台定位
  }) {
    if (typeof options === 'object') {
      AMapLocation.setOptions(options)
    }

    AMapLocation.getLocation();
    return new Promise((resolve, reject) => {
      NativeAppEventEmitter.addListener('amap.location.onLocationResult', result => {
        if (result.code !== undefined || result.error) {
          reject(result);
        } else {
          resolve(result);
        }
      });
    });
  },
};
