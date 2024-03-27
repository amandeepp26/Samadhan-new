import React, { Component } from 'react';
import { TouchableOpacity as Button } from 'react-native';
import { hasValue } from '../utils/Helper';

const TouchableOpacity = (props) => {
    let { activeOpacity } = props;
    return <Button activeOpacity={hasValue(activeOpacity) ? activeOpacity : 0.6}  {...props} />
}
export default TouchableOpacity
