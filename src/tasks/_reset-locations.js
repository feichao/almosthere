import Constants from '../constants';
import Tools from '../utils';
import { Locations } from '../model';

const resetLocations = () => {
  return Locations.getLocations().then(locations => {
    const now = new Date();
    const nowTime = Tools.getTimeSeconds([now.getHours(), now.getMinutes(), now.getSeconds()]);
    
    const enableLocations = locations.filter(l => !l.deleted && l.enable);

    return enableLocations.map(location => {
      if (location.stopAlert && nowTime >  Tools.getTimeSeconds(location.arrived)) {
        location.stopAlert = false;
      }
      return location;
    });
  }).then(locations => {
    return Locations.saveLocations(locations);
  });
}

export default resetLocations;
