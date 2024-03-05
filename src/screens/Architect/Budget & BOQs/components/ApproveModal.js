import {View, Text, Image, Platform, ScrollView, PermissionsAndroid, Pressable, Modal} from 'react-native';
import React from 'react';
import {
  Button,
  Dialog,
  HelperText,
  Portal,
  RadioButton,
  Subheading,
  TextInput,
} from 'react-native-paper';
import * as ImagePicker from 'react-native-image-picker';
import uuid from 'react-native-uuid';

import {Styles} from '../../../../styles/styles';
import { theme } from "../../../../theme/apptheme";
import {useState} from 'react';
import {communication} from '../../../../utils/communication';
import Provider from '../../../../api/Provider';
import {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import {AWSImagePath} from '../../../../utils/paths';
//#region camera related changes
import * as DocumentPicker from "react-native-document-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
//#endregion


//#region camera related changes
function getFileType(url, setImage) {
  const fileExtension = url.type.split("/").pop().toLowerCase();
  if (
    fileExtension === "jpg" ||
    fileExtension === "jpeg" ||
    fileExtension === "png" ||
    fileExtension === "gif"
  ) {
    setImage(url.uri);
  } else if (fileExtension === "pdf") {
    setImage("pdf");
  } else if (fileExtension === "doc" || fileExtension === "docx") {
    setImage("doc");
  } else if (fileExtension === "xls" || fileExtension === "xlsx") {
    setImage("xls");
  }
}
//#endregion
let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_CompanyAdmin_UserRefno = 0;
const ApproveModal = ({open, setOpen, budget_refno, callback}) => {
  const [remarks, setRemarks] = useState('');
  const [response, setResponse] = useState([]);
  const [approvedThrough, setApprovedThrough] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({
    remarks: false,
    approved_through: false,
  });

  const [designImage, setDesignImage] = useState(null);
  const [image, setImage] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const isFocused = useIsFocused();
  const fetchUser = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('user'));
    Sess_UserRefno = data.UserID;
    Sess_company_refno = data.Sess_company_refno;
    Sess_branch_refno = data.Sess_branch_refno;
    Sess_CompanyAdmin_UserRefno = data.Sess_CompanyAdmin_UserRefno;
    FetchData();
  };

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  //#region camera related changes
  const [isVisible, setIsVisible] = useState(false);
  const getCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
    }
  };

  const pickDocument = async () => {
    try {
      const documentPickerResult = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles], // Allow all document types
      });
      console.log("document--->", documentPickerResult);
      setFilePath(documentPickerResult[0]);
      setIsVisible(false);
      getFileType(documentPickerResult[0], setImage);
      // }

      setIsVisible(false);

      if (route.params.type === "edit" || route.params.type === "verify") {
        setIsImageReplaced(true);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };
  const openCamera = async () => {
    // await getCameraPermission();
    const result = await ImagePicker.launchCamera({
      allowsEditing: true,
      quality: 1,
    });
    console.warn("camera result is--->", result);
    if (!result.canceled) {
      setFilePath(result.assets[0]);
      getFileType(result.assets[0], setImage);
      setIsVisible(false);
      if (route.params.type === "edit" || route.params.type === "verify") {
        setIsImageReplaced(true);
      }
    }
  };

  //#endregion


  const FetchData = async (toPending, text) => {
    let params = {
      data: {
        Sess_UserRefno: Sess_UserRefno,
        Sess_company_refno: Sess_company_refno,
        Sess_branch_refno: Sess_branch_refno,
        Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
      },
    };
    try {
      const data = await Provider.getcontractordesignwise(params, () => {});
      setResponse(data.response);
    } catch (e) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchUser();
  }, [isFocused]);


  const ValidateEstimationStatus = () => {
    let isValid = true;

    if (remarks.length === 0) {
      isValid = false;
      setErrors(state => ({...state, remarks: true}));
    }
    if (approvedThrough === '') {
      isValid = false;
      setErrors(state => ({...state, approved_through: true}));
    }

    if (isValid) {
      setIsButtonLoading(true);
      const datas = new FormData();
      const params = {
        Sess_UserRefno,
          budget_refno,
          budget_remarks: remarks,
          reponse_refno: approvedThrough,
      };

      datas.append("data", JSON.stringify(params));
      datas.append(
        "attach_approved_proof",
        filePath != null && filePath != undefined && filePath.type != undefined && filePath.type != null
          ? {
            name: "appimage1212.jpg",
            // type: filePath.type + "/*",
            type: filePath.type || filePath.mimeType,
            uri: filePath.uri,
            // uri: Platform.OS === "android" ? filePath.uri : filePath.uri.replace("file://", ""),
          }
          : ""
      );

      Provider.createDFArchitectWithHeader(
        Provider.API_URLS.architect_budget_finallytakeproject_update,
        datas,
      )
        .then(res => {
          setIsButtonLoading(false);
          console.log('finaaly take', res.data);
          setOpen(false);
          callback();
        })
        .catch(error => {
          setIsButtonLoading(false);
          console.log(error);
        });
    }
  };
  return (
    <Portal>
      <Dialog visible={open} dismissable={false}>
        <Dialog.Title>Estimation Status</Dialog.Title>
        <Dialog.Content>
          <ScrollView keyboardShouldPersistTaps="handled">
            <TextInput
              mode="outlined"
              dense
              style={[Styles.backgroundColor]}
              label="Remarks/Reason"
              value={remarks}
              onChangeText={text => {
                setRemarks(text);
                setErrors(state => ({...state, remarks: false}));
              }}
              error={errors.remarks}
            />
            <HelperText type="error" visible={errors.remarks}>
              {communication.InvalidRemarks}
            </HelperText>
            <View>
              <Subheading style={[Styles.marginBottom12]}>
                Client Approved Through
              </Subheading>
              <RadioButton.Group
                onValueChange={value => {
                  setApprovedThrough(value);
                  setErrors(state => ({...state, approved_through: false}));
                }}
                value={approvedThrough}>
                {response?.map((item, idx) => (
                  <RadioButton.Item
                    key={idx}
                    position="leading"
                    style={[Styles.paddingVertical2]}
                    labelStyle={[Styles.textLeft, Styles.paddingStart4]}
                    label={item.reponse_name}
                    value={item.reponse_refno}
                  />
                ))}
              </RadioButton.Group>
              <HelperText type="error" visible={errors.approved_through}>
                {communication.InvalidClientApprovedThrough}
              </HelperText>
            </View>

            <Subheading>Attach Client Approved Proof</Subheading>
            <View
              style={[Styles.flexRow, Styles.flexAlignEnd, Styles.marginTop16]}>
              <Image
                source={{uri: image}}
                style={[Styles.width64, Styles.height64, Styles.border1]}
              />
              <Button mode="text" onPress={() => setIsVisible(true)}>
                {filePath !== null || image !== null ? "Replace" : "Attachment / Slip Copy"}
              </Button>
            </View>
            {/* camera related changes */}
          <Modal
            visible={isVisible}
            animationType="fade" // You can customize the animation type
            transparent={true}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  height: 150,
                  width: "85%",
                  borderRadius: 5,
                  padding: 20,
                  alignSelf: "center", // Center the content horizontally
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    alignSelf: "center",
                    marginTop: 10,
                  }}
                >
                  <Pressable
                    onPress={(e) => {
                      openCamera();
                    }}
                    style={{ padding: 10, alignItems: "center" }}
                  >
                    <Icon
                      name="camera-outline"
                      color={theme.colors.primary}
                      type="ionicon"
                      size={40}
                    />
                    <Button mode="text">Camera</Button>
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      pickDocument();
                    }}
                    style={{ padding: 10, alignItems: "center" }}
                  >
                    <Icon
                      name="folder-outline"
                      color={theme.colors.primary}
                      type="ionicon"
                      size={40}
                    />
                    <Button mode="text">Gallery</Button>
                  </Pressable>
                </View>
                <Pressable
                  onPress={(e) => {
                    setIsVisible(!isVisible);
                  }}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    marginBottom: 10,
                  }}
                >
                  <Icon
                    name="close-circle"
                    color={"red"}
                    type="ionicon"
                    size={30}
                  />
                </Pressable>
              </View>
            </View>
          </Modal>
          {/* camera related changes */}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions style={[Styles.padding16]}>
          <Button
            mode="outlined"
            onPress={() => {
              setOpen(false);
            }}>
            Close
          </Button>
          <Button
            style={[Styles.marginStart12]}
            mode="contained"
            onPress={ValidateEstimationStatus}
            loading={isButtonLoading}
            disabled={isButtonLoading}
            >
            Confirm
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ApproveModal;
