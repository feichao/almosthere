import React, { Component } from 'react';
import {
  Platform,
  Image,
  Text,
  View
} from 'react-native';
import Config from '../../config';
import Styles from './About.style';
import LogoBG from '../../assets/imgs/logo-bg.png';
export default class About extends Component {
  render() {
    return (
      <View style={Styles.container}>
        <Image style={Styles.logoBg} source={LogoBG}></Image>
        <Text style={Styles.welcome}>
          到这儿 v{Config.VERSION}
        </Text>
        <Text style={Styles.instructions}>
          Just for darling Kaier
        </Text>
        <Text style={Styles.powerby}>
          { `Author: Frank Wan\nEmail: len.may@foxmail.com` }
        </Text>
      </View>
    );
  }
}
