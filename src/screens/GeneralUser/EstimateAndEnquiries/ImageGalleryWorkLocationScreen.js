import React, { useEffect } from "react";
import { Modal, SafeAreaView, ScrollView, View } from "react-native";
import { ActivityIndicator, Button, Snackbar, Portal, Dialog, Paragraph } from "react-native-paper";
import ImageViewer from "react-native-image-zoom-viewer";
import Provider from "../../../api/Provider";
import NoItems from "../../../components/NoItems";
import CreateSCCards from "../../../components/SCCards";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APIConverter } from "../../../utils/apiconverter";
import {
  createNavigationContainerRef,
  StackActions,
  useFocusEffect,
} from "@react-navigation/native";
import Header from "../../../components/Header";

export const navigationRef = createNavigationContainerRef();

const ImageGalleryWorkLocationScreen = ({ route, navigation }) => {
  //#region Variables

  const [isLoading, setIsLoading] = React.useState(true);
  const [imageGalleryData, setImageGalleryData] = React.useState([]);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
  const [snackbarColor, setSnackbarColor] = React.useState(theme.colors.success);
  const [isZoomShow, setIsZoomShow] = React.useState(false);
  const [imageToZoom, setImageToZoom] = React.useState([]);
  const [imageToZoomData, setImageToZoomData] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [isDialogVisible, setIsDialogVisible] = React.useState(false);
  //#endregion

  //#region Functions

  const showDialog = () => setIsDialogVisible(true);
  const hideDialog = () => setIsDialogVisible(false);

  const RedirectToProfile = () => {
    hideDialog();
    navigation.navigate("UserProfile", { from: "gu_estimate" });
  }

  const RedirectToHome = () => {
    hideDialog();
    navigation.navigate("HomeScreen");
  }

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      setUser(JSON.parse(userData));
      FetchImageGalleryData(JSON.parse(userData).UserID, JSON.parse(userData).Sess_group_refno);

      if (JSON.parse(userData).RoleID == 3 && JSON.parse(userData).Sess_profile_address == 0) {
        showDialog();
      }
    }
  };

  const FetchImageGalleryData = (UserID, Sess_group_refno) => {
    let params = {
      data: {
        Sess_UserRefno: UserID,
        Sess_group_refno: Sess_group_refno,
        service_refno: route.params.data.service_refno,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.GetserviceimagegalleryByServicerefno, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data, true);
            setImageGalleryData(response.data.data);
          }
        } else {
          setImageGalleryData([]);
          setSnackbarText("No data found");
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
        setIsLoading(false);
      })
      .catch((e) => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
      });
  };

  useEffect(() => {
    GetUserID();
    navigation.setOptions({ headerTitle: route.params.headerTitle });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const refreshScreen = () => {
        // Refresh the screen here
        GetUserID();
      };
      refreshScreen();
      return () => { };
    }, [navigationRef])
  );

  const CardImageClick = (imageToZoom, data) => {
    setImageToZoom([
      {
        url: imageToZoom,
      },
    ]);
    setImageToZoomData(data);
    setIsZoomShow(true);
  };
  //#endregion

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header title={route.params.headerTitle} navigation={navigation} />
      {isLoading ? (
        <View
          style={[
            Styles.flex1,
            Styles.flexJustifyCenter,
            Styles.flexAlignCenter,
          ]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : imageGalleryData.length > 0 ? (
        <ScrollView
          style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
          <View
            style={[
              Styles.flexRow,
              Styles.paddingHorizontal16,
              Styles.flexWrap,
              Styles.paddingTop8
            ]}>
            {imageGalleryData.map((k, i) => {
              return (
                 <View
                    key={i}
                    style={[
                      Styles.width50per,
                      Styles.padding4,
                      Styles.paddingTop8,
                    ]}>
                <CreateSCCards
                  key={i}
                  image={k.designImage}
                  title={k.workLocationName}
                  subttitle={k.designTypeName}
                  id={k.designTypeID}
                  data={k}
                  cardImageClick={CardImageClick}
                  buttonData={{
                    text: 'Go to Estimation',
                    disabled:
                      user && (user.RoleID == 3 || user.RoleID == 5)
                        ? false
                        : true,
                    click: () => {
                      setIsZoomShow(false);
                      navigation.navigate('EstimationPreviewScreen', {
                        data: k,
                        from: route.params.from,
                        isContractor: route.params.isContractor,
                        fetchData: route.params.fetchData,
                      });
                    },
                  }}
                />
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <NoItems icon="format-list-bulleted" text="No records found." />
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: snackbarColor}}>
        {snackbarText}
      </Snackbar>
      <Modal
        visible={isZoomShow}
        onRequestClose={() => setIsZoomShow(false)}
        transparent={true}>
        <View
          style={[
            Styles.flex1,
            {backgroundColor: 'rgba(0,0,0,0.85)', position: 'relative'},
          ]}>
          <Button
            mode="outlined"
            style={{
              position: 'absolute',
              bottom: 16,
              zIndex: 20,
              right: 16,
              backgroundColor: 'white',
            }}
            onPress={() => setIsZoomShow(false)}>
            Close
          </Button>
          <Button
            mode="contained"
            style={{position: 'absolute', bottom: 16, zIndex: 20, right: 114}}
            disabled={
              user && (user.RoleID == 3 || user.RoleID == 5) ? false : true
            }
            onPress={() => {
              setIsZoomShow(false);
              navigation.navigate('EstimationPreviewScreen', {
                data: imageToZoomData,
                from: route.params.from,
                isContractor: route.params.isContractor,
              });
            }}>
            Go to Estimation
          </Button>
          <ImageViewer
            imageUrls={imageToZoom}
            backgroundColor="transparent"
            style={{height: 1920}}
            renderIndicator={() => {}}
          />
        </View>
      </Modal>
      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={hideDialog}
          dismissable={false}>
          <Dialog.Title>Profile Update</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Please update your profile to create estimate</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={RedirectToProfile}>Update Profile</Button>
            <Button onPress={RedirectToHome}>Back To Home</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
    </SafeAreaView>
  );
};

export default ImageGalleryWorkLocationScreen;
