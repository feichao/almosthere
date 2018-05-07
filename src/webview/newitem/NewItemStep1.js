import React, { Component } from 'react';
import {
  Platform,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ToastAndroid,
  ScrollView,
  Keyboard
} from 'react-native';
import Styles from './NewItemStep1.style';

import { MapView } from 'react-native-amap3d';

import { AMapLocation } from '../../modules';
import { AMap } from '../../service';

export default class NewItemStep1 extends Component {
  constructor(props) {
    super(props);
    this.selectLocation = this.selectLocation.bind(this);
    this.searchLocation = this.searchLocation.bind(this);
    this.navigateToNewItemStep2 = this.navigateToNewItemStep2.bind(this);

    this.checkTimer = undefined;
    this.isFirst = true;
    this.state = {
      currentLocation: {
        latitude: 39.9056,
        longitude: 116.4012
      },
      selectedLocation: {
        latitude: 39.9056,
        longitude: 116.4012
      },
      selectedAddress: undefined,
      markerActive: false,
      searchText: '',
      loadingLocation: true,
      loadingSearch: false,
      isShowSuggestions: false,
      suggestions: []
    };
  }
  componentDidMount() {
    ToastAndroid.show('定位中...', ToastAndroid.SHORT);
    AMapLocation.getLocation().then(position => {
      const { longitude, latitude } = position.coordinate;
      this.setState({
        currentLocation: {
          longitude, latitude
        },
        selectedLocation: {
          longitude, latitude
        }
      }, () => {
        this.selectLocation({ nativeEvent: this.state.selectedLocation });
      });
    });
  }
  componentWillUnmount() {
    clearTimeout(this.checkTimer);
  }
  selectLocation({ nativeEvent }) {
    const { longitude, latitude } = nativeEvent;
    if (!longitude || !latitude) {
      return;
    }

    this.setState({
      loadingLocation: true,
      markerActive: false,
      selectedAddress: undefined,
      selectedLocation: { longitude, latitude }
    });

    clearTimeout(this.checkTimer);
    this.checkTimer = setTimeout(() => {
      AMap.getLocationInfo(longitude, latitude).then(ret => {
        try {
          const result = JSON.parse(ret._bodyText);
          if (result.regeocode && typeof result.regeocode.formatted_address === 'string') {
            this.setState({
              markerActive: true,
              selectedAddress: result.regeocode.formatted_address
            });
          } else {
            ToastAndroid.show('获取位置信息失败...', ToastAndroid.SHORT);
          }
        } catch (exception) {
          console.log(exception);
        }
      }).finally(() => {
        this.setState({
          loadingLocation: false
        });
      });
    }, 300);
  }
  searchLocation() {
    const { searchText, loadingSearch } = this.state;
    if (searchText.length < 2) {
      ToastAndroid.show('至少输入 2 个字', ToastAndroid.SHORT);
      return;
    }

    ToastAndroid.show('正在搜索...', ToastAndroid.SHORT);
    if (loadingSearch) {
      return;
    }

    Keyboard.dismiss();

    this.setState({
      loadingSearch: true,
      suggestions: []
    });
    AMap.search(searchText).then(ret => {
      try {
        const result = JSON.parse(ret._bodyText);
        if (result && Array.isArray(result.pois) && result.pois.length) {
          this.setState({
            suggestions: result.pois,
            isShowSuggestions: true
          });
        } else {
          ToastAndroid.show('没有查到任何数据', ToastAndroid.SHORT);
        }
      } catch (exception) {
        ToastAndroid.show('搜索出错', ToastAndroid.SHORT);
        console.log(exception);
      }
    }).finally(() => {
      ToastAndroid.show('搜索完成', ToastAndroid.SHORT);
      this.setState({
        loadingSearch: false
      });
    });;
  }
  selectedSuggestion(sug) {
    return () => {
      const { location } = sug;
      const [longitude, latitude] = location.split(',').map(a => +a);
      this.setState({
        markerActive: false,
      });

      setTimeout(() => {
        this.setState({
          markerActive: true,
          isShowSuggestions: false,
          currentLocation: { longitude, latitude },
          selectedLocation: { longitude, latitude },
          selectedAddress: `${sug.pname}${sug.cityname}${sug.adname}${sug.address}`
        });
      }, 100);
    };
  }
  navigateToNewItemStep2() {
    if (!this.state.selectedAddress) {
      ToastAndroid.show('请选择一个地点', ToastAndroid.SHORT);
      return;
    }

    if (this.state.loadingLocation) {
      ToastAndroid.show('正在查询地点...', ToastAndroid.SHORT)
      return;
    }

    const { navigate } = this.props.navigation;
    navigate('NewItemStep2', Object.assign({}, this.state.selectedLocation, {
      name: this.state.searchText,
      address: this.state.selectedAddress
    }));
  }
  render() {
    const { currentLocation, selectedLocation, selectedAddress, markerActive, searchText, isShowSuggestions, suggestions } = this.state;
    const selectedAddressSubString = typeof selectedAddress === 'string' && selectedAddress.length > 30 ?
      `${selectedAddress.substring(0, 30)}...` : selectedAddress;

    return (
      <View style={Styles.container}>
        <View style={Styles.searchContainer}>
          <View style={Styles.searchInnerContainer}>
            <TextInput style={Styles.searchInput} placeholder='输入内容查找地点' onChangeText={(searchText) => this.setState({ searchText })} value={searchText} />
            <TouchableOpacity style={Styles.searchBtn} activeOpacity={0.75} onPress={this.searchLocation}>
              <Text style={Styles.searchBtnText}>搜索</Text>
            </TouchableOpacity>
          </View>
        </View>
        {
          isShowSuggestions && (
            <ScrollView style={Styles.suggestions}>
              {
                suggestions.map(data => (
                  <TouchableOpacity key={data.id} activeOpacity={0.75} onPress={this.selectedSuggestion(data)}>
                    <View style={Styles.itemBlock}>
                      <Text style={Styles.itemName}>{data.name}</Text>
                      <Text style={Styles.itemAddress}>{data.pname}{data.cityname}{data.adname}, {data.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              }
            </ScrollView>
          )
        }
        <MapView style={Styles.map} coordinate={currentLocation} showsCompass={false} zoomEnabled zoomLevel={15} scrollEnabled locationEnabled showsLocationButton onPress={this.selectLocation}>
          {
            markerActive && (
              <MapView.Marker active={markerActive} coordinate={selectedLocation} title={selectedAddressSubString} />
            )
          }
        </MapView>
        <TouchableOpacity style={Styles.nextStepBtn} activeOpacity={0.75} onPress={this.navigateToNewItemStep2}>
          <Text style={Styles.nextStepBtnText}>下一步</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
