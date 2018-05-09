const GET_LOCATION_TIMEOUT = 5000;
export default {
  STORAGE: {
    LOCATIONS: 'locations',
    SETTINGS: 'settings'
  },
  GET_LOCATION_TIMEOUT,
  ALERT_PERIOD: {
    ONCE: 0,
    PERIOD: 1
  },
  MAX_DAY_SECONDS: 24 * 3600,
  LOCATION_RESULT: 'amap.location.onLocationResult'
};
