
import Config from '../config';

const headers = new Headers();
headers.append('Content-Type', 'application/json');

export default {
  checkUpdate() {
    return fetch(`http://111.230.176.228/api/checkupdate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        version: Config.VERSION
      }),
    }).then(ret => {
      try {
        return JSON.parse(ret._bodyText);
      } catch (exception) {
        console.log(exception);
        return {};
      }
    }).catch(() => {
      return {};
    });
  }
};
