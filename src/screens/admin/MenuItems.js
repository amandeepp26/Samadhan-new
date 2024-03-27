import React, {useEffect, useRef} from 'react';
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
import {theme} from '../../theme/apptheme';
import Header from '../../components/Header';

function MenuItems({route, navigation}) {
  const data = route.params?.data;
  console.warn('menu data is---->',data[0].items)
  const scrollViewRef = useRef(null);
  const [selectedItem, setSelectedItem] = React.useState(
    route.params?.item || null,
  );

  const title=route.params?.title
  useEffect(() => {
    handleMenuItemPress(route.params.item);
  }, [route.params]);

  const handleMenuItemPress = item => {
    setSelectedItem(item);
    scrollViewRef.current?.scrollTo({y: 0, animated: true});
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      {/* <TouchableOpacity
        onPress={() => {
          setSelectedItem(null);
          navigation.goBack();
        }}
        style={{
          padding: 12,
          paddingVertical: 20,
          alignItems: 'flex-start',
          borderBottomWidth: 1,
          borderColor: '#d3d3d3',
          backgroundColor: '#fff',
        }}>
        <Icon name="arrow-back-outline" type="ionicon" color="#000" />
      </TouchableOpacity> */}
      <Header title={title} navigation={navigation} />
      <View style={{flexDirection: 'row', flex: 1}}>
        {/* Left side (Green menu bar) */}
        <View style={{backgroundColor: '#72A05F', width: '30%'}}>
          <ScrollView showsVerticalScrollIndicator={false} >
            {data?.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  if(item.items)
                  {handleMenuItemPress(item)}
                  else{navigation.navigate(item.navigation)}
                }}
                style={{
                  padding: 15,
                  paddingVertical: 20,
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  borderColor: '#d3d3d3',
                  backgroundColor:
                    selectedItem === item ? theme.colors.primary : null, // Highlight selected item
                }}>
                <Text
                  style={[
                    Styles.textColorWhite,
                    Styles.fontSize14,
                    {textAlign: 'center', fontWeight: '500'},
                  ]}>
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Right side (White section for data) */}
        <ScrollView style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingTop: 10,
            }}>
            {selectedItem?.items?.map((nestedItem, nestedIndex) => (
              <Pressable
                onPress={() => navigation.navigate(nestedItem.navigation)}
                key={nestedIndex}
                style={{
                  width: '32%',
                  marginBottom: 12,
                  marginTop: 15,
                  alignItems: 'center',
                }}>
                <Image
                  resizeMode="contain"
                  src={nestedItem.icon}
                  style={{width: '43%', height: 37}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop12,
                    {
                      fontWeight: '500',
                      fontSize: 11,
                      textAlign: 'center',
                      paddingHorizontal: 5,
                    },
                  ]}>
                  {nestedItem.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default MenuItems;
