export default {
  checkUpdate(version) {
    return fetch(`http://almosthere.0xfc.cn/api/checkupdate`, {
      method: 'POST',
      data: {
        version
      }
    });
  }
};
