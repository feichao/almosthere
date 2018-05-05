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
  Linking
} from 'react-native';

import Styles from './Home.style';

import SplashScreen from 'react-native-splash-screen';

import { Utils } from 'react-native-amap3d';
import { Locations, Settings } from '../../model';

import { AMapLocation } from '../../modules';
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
    this.watchLocation = this.watchLocation.bind(this);

    this.showOperateView = this.showOperateView.bind(this);

    this.watchLocationTimer = null;
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
  }
  componentWillUnmount() {
    clearTimeout(this.watchLocationTimer);
  }
  checkUpdate() {
    Version.checkUpdate().then(ret => {
      const _ver = ret.version;
      if (_ver.version && _ver.downloadUrl) {
        Alert.alert('升级提示', `检测到新版本 ${_ver.version}, 是否升级?`, [
          { text: ' 下次提醒', onPress: () => console.log('update cancel'), style: 'cancel' },
          {
            text: '立即升级', onPress: () => {
              Linking.openURL(_ver.downloadUrl);
            }
          },
        ]);
      }
    }).catch(() => {});
  }
  initLocations() {
    Locations.getLocations().then(locations => {
      this.setState({
        locations: locations.filter(a => !a.deleted)
      }, () => {
        this.watchLocation();
      });
    });
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
  watchLocation() {
    clearTimeout(this.watchLocationTimer);

    const { locations } = this.state;
    const locationsEnable = locations.filter(l => l.enable);
    if (locationsEnable.length > 0) {
      Settings.getSettings().then(settings => {
        AMapLocation.getLocation({
          locationMode: settings.enableHighAccuracy ? AMapLocation.LOCATION_MODE.HIGHT_ACCURACY : AMapLocation.LOCATION_MODE.BATTERY_SAVING
        }).then(position => {
          const { longitude, latitude } = position.coordinate;
          locationsEnable.map(lo => {
            return Utils.distance(latitude, longitude, lo.latitude, lo.longitude).then(dis => {
              this.setState({
                locationDistaces: Object.assign({}, this.state.locationDistaces, {
                  [lo.id]: dis
                })
              });
            });
          });
        }).catch(error => {
          // console.log(error.code);
          // if (error.code) {
          // }
          ToastAndroid.show('正在定位...', ToastAndroid.SHORT);
        }).finally(() => {
          this.watchLocationTimer = setTimeout(() => {
            this.initLocations();
          }, Constants.Common.GET_LOCATION_TIMEOUT);
        });
      });
    }
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
        return <Text style={Styles.itemValidTip}>剩余距离: {Math.floor(distance)}m</Text>;
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
                      <Text style={Styles.itemDesc}>{data.description}</Text>
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
            <Text style={Styles.emptyTip}>点击下面按钮添加一个提醒</Text>
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
