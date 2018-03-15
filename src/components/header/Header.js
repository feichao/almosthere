import React, { Component } from 'react';
import {
  View,
  Text,
  Image
} from 'react-native';
import Styles from './Header.style';

export default class Header extends Component {
  render() {
    return (
      <View style={Styles.container}>
        <Image style={Styles.logo} source={this.props.logo}></Image>
        <Text style={Styles.title}>{this.props.title}</Text>
      </View>
    );
  }
}
