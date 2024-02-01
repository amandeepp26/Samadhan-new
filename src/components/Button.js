import * as React from 'react';
import {View} from 'react-native';
import {
  Button,
  Snackbar,
  TextInput,
  Title,
  HelperText,
  Text,
} from 'react-native-paper';
import { Styles } from '../styles/styles';
import { theme } from '../theme/apptheme';

export default function ButtonComponent({isButtonLoading,text,onPress,light}) {
  return (
    <Button
      mode="contained"
      style={[Styles.marginTop16, light ? {backgroundColor:theme.colors.primaryLight}: Styles.primaryBgColor,{borderRadius:10,width:'85%',alignSelf:'center'}]}
      loading={isButtonLoading}
      disabled={isButtonLoading}
      onPress={() => onPress()}>
      {text}
    </Button>
  );
}
