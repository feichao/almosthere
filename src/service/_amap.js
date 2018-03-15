import Config from '../config';

const key = Config.AMAP_WEB_KEY;
export default {
  getLocationInfo(longitude, latitude) {
    return fetch(`https://restapi.amap.com/v3/geocode/regeo?key=${key}&location=${longitude.toFixed(4)},${latitude.toFixed(4)}`, {
      method: 'GET'
    });
  },
  search(keywords) {
    return fetch(`https://restapi.amap.com/v3/place/text?key=${key}&keywords=${keywords}`, {
      method: 'GET'
    });
  }
};
