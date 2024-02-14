import {Image,Text, TouchableOpacity, View} from 'react-native';
import { Icon } from 'react-native-elements';
import { Styles } from '../styles/styles';
export default function Header({navigation,title}) {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.goBack();
      }}
      style={{
        padding: 12,
        paddingVertical: 20,
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#d3d3d3',
        backgroundColor: '#fff',
      }}>
      <Icon name="arrow-back-outline" type="ionicon" color="#000" />
      <Text
        style={[
          Styles.fontBold,
          Styles.fontSize20,
          Styles.primaryColor,
          {marginLeft: 20},
        ]}>
       {title}
      </Text>
    </TouchableOpacity>
  );
}
