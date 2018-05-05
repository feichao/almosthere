const getTimeStr = (num) => {
  if (!+num) {
    return '00';
  }
  return num.toString().length === 1 ? ('0' + num) : num;
};

const getTimeSeconds = (datetime) => {
	if (datetime instanceof Array) {
		return datetime[0] * 3600 + datetime[1] * 60 + datetime[2];
	}
	return NaN;
};

const getFriendlyDis = (num) => {
  const _num = +num;
  if (!_num) {
    return 0;
  }

  if (num > 1000) {
    return Math.round(num / 1000) + ' 公里';
  }

  return Math.round(num) + ' 米';
};

export default {
  getTimeStr,
  getTimeSeconds,
  getFriendlyDis
};
