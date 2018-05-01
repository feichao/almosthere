
import Config from '../config';

const headers = new Headers();
headers.append('Content-Type', 'application/json');

export default {
  checkUpdate() {
    return fetch(`https://almosthere.0xfc.cn/api/checkupdate`, {
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
