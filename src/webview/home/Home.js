import React, { Component } from 'react';
import {
  Platform,
  Text,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  Button,
  Switch,
  Alert,
  ToastAndroid,
  Linking,
  NativeAppEventEmitter
} from 'react-native';

import Styles from './Home.style';

import SplashScreen from 'react-native-splash-screen';
import PushNotification from 'react-native-push-notification';

import { Utils } from 'react-native-amap3d';
import { Locations } from '../../model';

import Tools from '../../utils';
import { Version } from '../../service';

import Constants from '../../constants';
import Header from '../../components/header/Header';
import Logo from '../../assets/imgs/logo.png';
import Setting from '../../assets/imgs/setting.png';

export default class App extends Component {
  static navigationOptions = ({ navigation }) => {
    const { navigate } = navigation;
    return {
      headerTitle: (
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigate('About')}>
          <Header logo={Logo} title="到这儿"></Header>
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigate('Setting')}>
          <Image style={Styles.setting} source={Setting}></Image>
        </TouchableOpacity>
      ),
    };
  }
  constructor(props) {
    super(props);
    this.navigateToNewItem = this.navigateToNewItem.bind(this);
    this.navigateToEditItem = this.navigateToEditItem.bind(this);
    this.hideOpe = this.hideOpe.bind(this);
    this.initLocations = this.initLocations.bind(this);
    this.deleteLocation = this.deleteLocation.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.listenLocationResult = this.listenLocationResult.bind(this);

    this.showOperateView = this.showOperateView.bind(this);
    this.isGetLocation = false;

    this.subscribeLocationResult = null;
    this.state = {
      locations: [],
      locationDistaces: {},
      isShowOperateView: false,
      currentLocation: null
    };
  }
  componentDidMount() {
    setTimeout(() => {
      SplashScreen.hide();
      this.checkUpdate();
    }, 2000);

    this.props.navigation.addListener('willFocus', this.initLocations);
    this.props.navigation.addListener('didBlur', this.hideOpe);

    this.initLocations();
    this.listenLocationResult();
  }
  componentWillUnmount() {
    if (this.subscribeLocationResult && typeof this.subscribeLocationResult.remove === 'function') {
      console.log('unsubscribe location result');
      this.subscribeLocationResult.remove();
    }
  }
  checkUpdate() {
    Version.checkUpdate().then(ret => {
      const _ver = ret.version;
      if (_ver.version && _ver.downloadUrl) {
        Alert.alert('升级提示', `检测到新版本 ${_ver.version}, 是否升级?`, [
          { text: '下次提醒', onPress: () => console.log('update cancel'), style: 'cancel' },
          {
            text: '立即升级', onPress: () => {
              Linking.openURL(_ver.downloadUrl);
            }
          },
        ]);
      }
    }).catch(() => { });
  }
  initLocations() {
    if (this.isGetLocation) {
      return;
    }

    this.isGetLocation = true;
    Locations.getLocations().then(locations => {
      this.setState({
        locations: locations.filter(a => !a.deleted)
      });
    }).finally(() => this.isGetLocation = false);
  }
  updateLocation(location, enable) {
    location.enable = enable;
    Locations.saveLocation(location);
    this.initLocations();
  }
  deleteLocation() {
    this.setState({
      isShowOperateView: false
    }, () => {
      Alert.alert('确认删除', '确认删除提醒?', [
        { text: '取消', onPress: () => console.log('delete cancel'), style: 'cancel' },
        {
          text: '确定', onPress: () => {
            const { currentLocation } = this.state;
            currentLocation.deleted = true;
            Locations.saveLocation(currentLocation);
            this.initLocations();
          }
        },
      ]);
    });
  }
  showOperateView(location) {
    return () => {
      this.setState({
        currentLocation: location,
        isShowOperateView: true
      });
    };
  }
  hideOpe(location) {
    if (this.state.isShowOperateView) {
      this.setState({
        isShowOperateView: false
      });
    }
  }
  listenLocationResult() {
    this.subscribeLocationResult = NativeAppEventEmitter.addListener(Constants.Common.LOCATION_RESULT, result => {
      if (result.code !== undefined || result.error) {
        console.log('定位失败: ', result);
        ToastAndroid.show('正在定位...', ToastAndroid.SHORT);
      } else {
        const { longitude, latitude } = result.coordinate;
        const locationsEnable = this.state.locations.filter(l => l.enable);
        Promise.all(locationsEnable.map(lo => {
          return Utils.distance(latitude, longitude, lo.latitude, lo.longitude);
        })).then(disAll => {
          const locationDistaces = {};
          locationsEnable.forEach((lo, index) => {
            locationDistaces[lo.id] = disAll[index];
          });
          this.setState({
            locationDistaces
          });
        });
      };
    });
  }
  navigateToNewItem() {
    const { navigate } = this.props.navigation;
    navigate('NewItemStep1');
  }
  navigateToEditItem() {
    const { currentLocation } = this.state;
    const { navigate } = this.props.navigation;
    navigate('NewItemStep2', currentLocation || {});
  }
  getItemTip(data) {
    if (data.enable) {
      const distance = this.state.locationDistaces[data.id];
      if (distance) {
        return <Text style={Styles.itemValidTip}>距离目的地: {Tools.getFriendlyDis(distance)}</Text>;
      } else {
        return <Text style={Styles.itemInvalidTip}>正在定位...</Text>;
      }
    } else {
      return <Text style={Styles.itemInvalidTip}>未开启</Text>
    }
  }
  render() {
    const { locations, isShowOperateView } = this.state;
    return (
      <View style={Styles.container}>
        <TouchableOpacity style={Styles.mainView} activeOpacity={1} onPress={this.hideOpe}>
          <ScrollView style={Styles.mainScrollView}>
            {
              locations.map(data => (
                <TouchableOpacity key={data.id} activeOpacity={0.8} onPress={() => {
                  if (isShowOperateView) {
                    this.hideOpe();
                  } else {
                    this.updateLocation(data, !data.enable);
                  }
                }} onLongPress={this.showOperateView(data)}>
                  <View style={Styles.itemBlock}>
                    <View style={Styles.itemContent}>
                      <Text style={Styles.itemName}>{data.name}</Text>
                      <Text style={Styles.itemDesc}>
                        提醒时间从 {data.startOff.map(Tools.getTimeStr).join(':')} 持续到 {data.arrived.map(Tools.getTimeStr).join(':')}, 距离 {data.distance} 米时开始提醒
                      </Text>
                      {
                        this.getItemTip(data)
                      }
                    </View>
                    <Switch value={data.enable} onValueChange={(enable => this.updateLocation(data, enable))}></Switch>
                  </View>
                </TouchableOpacity>
              ))
            }
          </ScrollView>
        </TouchableOpacity>
        {
          !locations.length && (
            <View style={Styles.emptyTipContainer}>
              <Text style={Styles.emptyTip1}>
                {
                  `由于会使用到后台定位功能\n建议将 <到这儿> 放到系统白名单中\n以便为您提供更为流畅的体验`
                }
              </Text>
              <Text style={Styles.emptyTip2}>
                {
                  `点击下面按钮添加一个提醒`
                }
              </Text>
            </View>
          )
        }
        <TouchableOpacity style={Styles.addBtn} activeOpacity={0.75} onPress={this.navigateToNewItem}>
          <Text style={Styles.addBtnText}>+</Text>
        </TouchableOpacity>
        {
          isShowOperateView && (
            <View style={Styles.opeContainer}>
              <TouchableOpacity style={Styles.opeBtn1} activeOpacity={0.75} onPress={this.navigateToEditItem}>
                <Text style={Styles.opeBtnText}>编辑</Text>
              </TouchableOpacity>
              <TouchableOpacity style={Styles.opeBtn2} activeOpacity={0.75} onPress={this.deleteLocation}>
                <Text style={Styles.opeBtnText}>删除</Text>
              </TouchableOpacity>
            </View>
          )
        }
      </View>
    );
  }
}
