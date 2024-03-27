import { StyleSheet, Text, View, LogBox, ScrollView, Image, Pressable } from "react-native";
import React from "react";
import Provider from "../../api/Provider";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CreateSCCards from "../../components/SCCards";
import { Styles } from "../../styles/styles";
import { Modal, Portal, Button } from "react-native-paper";
import Header from "../../components/Header";
import { theme } from "../../theme/apptheme";

let userID = null;
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);
const Design = ({ route, navigation }) => {
  const [modalOpen, setModalOpen] = useState(null);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(0);
  const isFocused = useIsFocused();
  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      fetchCategories();
      fetchGroups();
    }
  };
  const goToForm = (workgiven) => {
    setModalOpen(false);
    navigation.navigate("DesignYourDreamForm", { selectedProperty, workgiven });
  };

  useEffect(() => {
    if (isFocused) {
      const getuser = async () => await GetUserID();
      getuser();
    }
  }, [isFocused]);

  const fetchGroups = () => {
    const params = {
      data: {
        Sess_UserRefno: userID,
        group_refno: "all",
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getgroupname_designyourdream_enquiryform,
      params
    )
      .then((res) => {
        setGroups(res.data.data);
      })
      .catch((error) => console.log(error));
  };
  const fetchCategories = () => {
    const params = {
      data: {
        Sess_UserRefno: userID,
        propertytype_refno: "all",
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.getpropertytypename_designyourdream_enquiryform,
      params
    )
      .then((res) => {
        if (res.data.data) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <Portal>
        <Modal
          visible={modalOpen}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            width: '90%',
            alignSelf: 'center',
          }}
          onDismiss={() => setModalOpen(false)}>
          <Text
            style={{
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: 20,
              marginBottom: 30,
            }}>
            Select Type
          </Text>
          {groups.map(obj => (
            <Button
              mode="contained"
              key={obj.group_refno}
              onPress={() => goToForm(obj)}
              style={{marginBottom: 15}}>
              <Text>{obj.group_name}</Text>
            </Button>
          ))}
        </Modal>
      </Portal>

      <Header navigation={navigation} title="Design Your Dream" />
      <ScrollView>
      <View
        style={[Styles.flexRow,Styles.marginTop8, Styles.paddingHorizontal16, Styles.flexWrap]}>
        {categories.map(obj => {
          return (
            <Pressable
              onPress={() => {
                setSelectedProperty(obj);
                setModalOpen(true);
              }}
              style={{
                height: 200,
                width: '100%',
                marginTop: 15,
                alignSelf: 'center',
              }}>
              <Image
                resizeMode="cover"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 12,
                }}
                source={{
                  uri: obj.propertytype_image,
                }}
              />
              <Pressable
                onPress={() => {
                  setSelectedProperty(obj);
                  setModalOpen(true);
                }}
                style={{
                  backgroundColor: 'white',
                  width: '60%',
                  position: 'absolute',
                  alignItems: 'center',
                  alignSelf: 'center',
                  bottom: 10,
                  paddingVertical: 7,
                  borderRadius: 10,
                }}>
                <Text
                  style={[
                    Styles.fontSize16,
                    Styles.fontBold,
                    {color: theme.colors.primary},
                  ]}>
                  {obj.propertytype_name}
                </Text>
              </Pressable>
            </Pressable>
            // <View
            //   style={[Styles.width50per, Styles.padding4, Styles.paddingTop8]}
            //   key={obj.propertytype_refno}>
            //   <CreateSCCards
            //     image={obj.propertytype_image}
            //     title={obj.propertytype_name}
            //     cardClick={() => {
            //       setSelectedProperty(obj);
            //       setModalOpen(true);
            //     }}
            //     id={obj.propertytype_refno}
            //   />
            // </View>
          );
        })}
      </View>
      </ScrollView>
    </>
  );
};

export default Design;
