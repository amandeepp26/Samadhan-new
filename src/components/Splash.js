import {Image, View} from 'react-native';
export default function Splash() {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Image
        source={require('../../assets/splash.png')}
        style={{width: '100%', height: '100%'}}
      />
    </View>
  );
}
