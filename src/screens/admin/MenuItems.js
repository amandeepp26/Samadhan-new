import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {Styles} from '../../styles/styles';
import { theme } from '../../theme/apptheme';

function MenuItems({route, navigation}) {
  const data = route.params.data;

  const [selectedItem, setSelectedItem] = React.useState(null);

  const handleMenuItemPress = item => {
    setSelectedItem(item);
  };

  return (
    <SafeAreaView style={{flex: 1,backgroundColor:'#fff'}}>
      <TouchableOpacity
        onPress={() => {
          setSelectedItem(null);
          navigation.goBack();
        }}
        style={{
          padding: 12,
          paddingVertical: 30,
          alignItems: 'flex-start',
          borderBottomWidth:1,
          borderColor:'#d3d3d3',
          backgroundColor: '#fff',
        }}>
        <Icon name="arrow-back-outline" type="ionicon" color="#000" />
      </TouchableOpacity>
      <ScrollView>
      <View style={{flexDirection: 'row'}}>
        {/* Left side (Green menu bar) */}
        <View style={{backgroundColor: '#72A05F', width: '35%'}}>
          {data?.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => handleMenuItemPress(item)}
              style={{
                padding: 15,
                paddingVertical: 20,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderColor: '#d3d3d3',
                backgroundColor: selectedItem === item ? theme.colors.primary : null, // Highlight selected item
              }}>
              <Text
                style={[
                  Styles.textColorWhite,
                  Styles.fontSize16,
                  {textAlign: 'center', fontWeight: '500'},
                ]}>
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Right side (White section for data) */}
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            paddingTop: 10,
          }}>
          {selectedItem?.items?.map((nestedItem, nestedIndex) => (
            <View
              key={nestedIndex}
              style={{
                width: '50%',
                marginBottom: 12,
                marginTop: 15,
                alignItems: 'center',
              }}>
              <Image
                src={nestedItem.icon}
                style={{width: '36%', height: 43, borderRadius: 8}}
              />
              <Text
                style={[
                  Styles.textColorDark,
                  Styles.marginTop12,
                  {fontWeight: '500', fontSize: 11.5, textAlign: 'center',paddingHorizontal:5},
                ]}>
                {nestedItem.title}
              </Text>
            </View>
          ))}
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default MenuItems;
