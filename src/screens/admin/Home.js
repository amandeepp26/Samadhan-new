import { View ,Text, StyleSheet, Image, TextInput, ScrollView} from "react-native";
import ButtonComponent from "../../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Styles } from "../../styles/styles";
import { Icon } from "react-native-elements";
import { theme } from "../../theme/apptheme";
import { Title } from "react-native-paper";

function HomeScreen({navigation, loginUser}) {

  return (
    <View
      style={[
        Styles.backgroundColorFullWhite,
        {flex: 1, paddingHorizontal: 20},
      ]}>
      {/* Header */}
      <View style={style.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View>
            <Image
              src="https://i.pinimg.com/originals/7d/34/d9/7d34d9d53640af5cfd2614c57dfa7f13.png"
              style={{width: 50, height: 50, borderRadius: 50}}
            />
            <View
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 50,
                padding: 2,
                width: 25,
                height: 25,
                justifyContent: 'center',
                position: 'absolute',
                bottom: -5,
                right: -5,
              }}>
              <Icon
                name="menu-outline"
                type="ionicon"
                color={'white'}
                size={18}
              />
            </View>
          </View>
          <View style={Styles.marginHorizontal12}>
            <Text
              style={[Styles.fontBold, Styles.fontSize20, Styles.primaryColor]}>
              Hey Abdul
            </Text>
            <Text>Admin</Text>
          </View>
        </View>
        <Icon name="notifications" type="ionicon" size={27} color={'#FFDB58'} />
      </View>
      <ScrollView style={{marginHorizontal: -20}}>
        {/* Body */}
        <View
          style={{
            backgroundColor: '#f5f5f5',
            paddingTop: 20,
            elevation: 3,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            // marginHorizontal: -20,
            // paddingHorizontal:20
          }}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#d3d3d3',
              backgroundColor: '#fff',
              color: '#000',
              width: '90%',
              alignSelf: 'center',
              borderRadius: 20,
              paddingLeft: 20,
            }}
            placeholder="Search"
          />
          <Icon
            name="search"
            type="ionicon"
            color={'#000'}
            style={{
              position: 'absolute',
              top: 28, // Adjust the top position to align the icon vertically
              left: 15, // Adjust the left position to align the icon horizontally
            }}
          />
          {/* Users box */}
          <View style={style.borderBox}>
            <Title
              style={[
                Styles.marginTop16,
                Styles.fontBold,
                Styles.fontSize20,
                {marginLeft: 10},
                Styles.fontBold,
              ]}>
              Users
            </Title>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                paddingVertical: 10,
              }}>
              <View style={{alignItems: 'center'}}>
                <View
                  style={{
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: 50,
                    width: 55,
                    height: 55,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      Styles.fontBold,
                      Styles.textColorWhite,
                      Styles.fontSize18,
                    ]}>
                    12
                  </Text>
                </View>
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Dealer
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <View
                  style={{
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: 50,
                    width: 55,
                    height: 55,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      Styles.fontBold,
                      Styles.textColorWhite,
                      Styles.fontSize18,
                    ]}>
                    13
                  </Text>
                </View>
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Contractor
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <View
                  style={{
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: 50,
                    width: 55,
                    height: 55,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      Styles.fontBold,
                      Styles.textColorWhite,
                      Styles.fontSize18,
                    ]}>
                    21
                  </Text>
                </View>
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  General User
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <View
                  style={{
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: 50,
                    width: 55,
                    height: 55,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      Styles.fontBold,
                      Styles.textColorWhite,
                      Styles.fontSize18,
                    ]}>
                    48
                  </Text>
                </View>
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Client
                </Text>
              </View>
            </View>
          </View>

          <View style={style.borderBox}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                marginVertical: 15,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  borderWidth: 1,
                  borderRadius: 15,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderColor: '#d3d3d3',
                }}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/8622/8622624.png"
                  style={{width: 50, height: 50}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Approve
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  borderWidth: 1,
                  borderRadius: 15,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderColor: '#d3d3d3',
                }}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/6520/6520475.png"
                  style={{width: 50, height: 50}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Pending
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  borderWidth: 1,
                  borderRadius: 15,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderColor: '#d3d3d3',
                }}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/128/458/458594.png"
                  style={{width: 50, height: 50}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Decline
                </Text>
              </View>
            </View>
          </View>

          <View style={style.borderBox}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginVertical: 15,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  borderWidth: 1,
                  borderRadius: 15,
                  paddingHorizontal: 10,
                  borderColor: '#d3d3d3',
                }}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/7787/7787144.png"
                  style={{width: 40, height: 40}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    {fontWeight: '600', fontSize: 14, marginLeft: 10},
                  ]}>
                  {' '}
                  General Enquiry
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  borderWidth: 1,
                  borderRadius: 15,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderColor: '#d3d3d3',
                }}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/8883/8883183.png"
                  style={{width: 40, height: 40}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    {fontWeight: '600', fontSize: 16, marginLeft: 10},
                  ]}>
                  {' '}
                  BOQ Enquiry
                </Text>
              </View>
            </View>
          </View>

          {/* Serviec catlague */}
          <View style={style.borderBox}>
            <Title
              style={[
                Styles.marginTop16,
                Styles.fontBold,
                Styles.fontSize20,
                {marginLeft: 10},
                Styles.fontBold,
              ]}>
              Service Catalouge
            </Title>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                paddingVertical: 10,
              }}>
              <View style={{alignItems: 'center'}}>
                <View
                  style={{
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: 50,
                    width: 55,
                    height: 55,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    src="https://cdn-icons-png.flaticon.com/512/3769/3769455.png"
                    style={{width: 35, height: 35}}
                  />
                </View>
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Work Floor
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/1527/1527531.png"
                  style={{width: 55, height: 55}}
                />

                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Work Location
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/1225/1225959.png"
                  style={{width: 55, height: 55}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Design Type
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/10703/10703134.png"
                  style={{width: 55, height: 55}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Add more
                </Text>
              </View>
            </View>
          </View>

          {/* Serviec catlague */}
          <View style={style.borderBox}>
            <Title
              style={[
                Styles.marginTop16,
                Styles.fontBold,
                Styles.fontSize20,
                {marginLeft: 10},
                Styles.fontBold,
              ]}>
              Masters
            </Title>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                paddingVertical: 10,
              }}>
              <View style={{alignItems: 'center'}}>
                <View
                  style={{
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: 50,
                    width: 55,
                    height: 55,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    src="https://cdn-icons-png.flaticon.com/512/3769/3769455.png"
                    style={{width: 35, height: 35}}
                  />
                </View>
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Work Floor
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/1527/1527531.png"
                  style={{width: 55, height: 55}}
                />

                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Work Location
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/1225/1225959.png"
                  style={{width: 55, height: 55}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Design Type
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/10703/10703134.png"
                  style={{width: 55, height: 55}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Add more
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default HomeScreen


const style = StyleSheet.create({
    header:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingVertical:20,
        paddingHorizontal:20
    },
    borderBox:{
        borderWidth:1,
        width:'90%',
        alignSelf:'center',
        marginTop:10,
        borderColor:'#d3d3d3',
        backgroundColor:'#fff',
        borderRadius:10
        
    }
})