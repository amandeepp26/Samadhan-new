import React from "react";
import { ScrollView, View } from "react-native";
import {Card, Checkbox, HelperText, Snackbar, TextInput } from "react-native-paper";
import Provider from "../../../../api/Provider";
import { Styles } from "../../../../styles/styles";
import { theme } from "../../../../theme/apptheme";
import { communication } from "../../../../utils/communication";
import DFButton from "../../../../components/Button";
import Header from "../../../../components/Header";
import ButtonComponent from "../../../../components/Button";

const AddDesignationScreen = ({ route, navigation }) => {
  //#region Variables
  const [designationNameError, setDesignationNameError] = React.useState(false);
  const [designationName, setDesignationName] = React.useState(route.params.type === "edit" ? route.params.data.designationName : "");
  const [checked, setChecked] = React.useState(route.params.type === "edit" ? route.params.data.display : true);

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  //#endregion

  //#region Functions
  const onDesignationNameChanged = (text) => {
    setDesignationName(text);
    setDesignationNameError(false);
  };

  const InsertDesignationName = () => {
    Provider.createDFAdmin(Provider.API_URLS.DesignationNameCreate, {
      data: {
        Sess_UserRefno: "2",
        designation_name: designationName,
        view_status: checked ? 1 : 0,
      },
    })
      .then((response) => {
        setIsButtonLoading(false);
        if (response.data && response.data.code === 200) {
          route.params.fetchData("add");
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.InsertError);
          setSnackbarVisible(true);
        }
      })
      .catch((e) => {
        console.log(e);
        setIsButtonLoading(false);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const UpdateDesignationName = () => {
    Provider.createDFAdmin(Provider.API_URLS.DesignationNameUpdate, {
      data: {
        Sess_UserRefno: "2",
        designation_refno: route.params.data.id,
        designation_name: designationName,
        view_status: checked ? 1 : 0,
      },
    })
      .then((response) => {
        setIsButtonLoading(false);
        if (response.data && response.data.code === 200) {
          route.params.fetchData("update");
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
        }
      })
      .catch((e) => {
        console.log(e);
        setIsButtonLoading(false);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const ValidateDesignationName = () => {
    let isValid = true;
    if (designationName.length === 0) {
      setDesignationNameError(true);
      isValid = false;
    }
    if (isValid) {
      setIsButtonLoading(true);
      if (route.params.type === "edit") {
        UpdateDesignationName();
      } else {
        InsertDesignationName();
      }
    }
  };
  //#endregion

  return (
    <View style={[Styles.flex1]}>
      <Header title="Add Designation" navigation={navigation} />
      <ScrollView style={[Styles.flex1, Styles.backgroundColor, { marginBottom: 64 }]} keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
          <TextInput mode="outlined" label="Designation Name" value={designationName} onChangeText={onDesignationNameChanged} style={{ backgroundColor: "white" }} error={designationNameError} />
          <HelperText type="error" visible={designationNameError}>
            {communication.InvalidDesignationName}
          </HelperText>
          <View style={{ width: 160 }}>
            <Checkbox.Item
              label="Display"
              color={theme.colors.primary}
              position="leading"
              labelStyle={{ textAlign: "left", paddingLeft: 8 }}
              status={checked ? "checked" : "unchecked"}
              onPress={() => {
                setChecked(!checked);
              }}
            />
          </View>
        </View>
      </ScrollView>
      <View style={[Styles.backgroundColor, Styles.width100per, Styles.marginTop32, Styles.padding16, { position: "absolute", bottom: 0, elevation: 3 }]}>
        <Card.Content>
          <ButtonComponent mode="contained" onPress={ValidateDesignationName} text="SAVE" loader={isButtonLoading} />
        </Card.Content>
      </View>
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000} style={{ backgroundColor: theme.colors.error }}>
        {snackbarText}
      </Snackbar>
    </View>
  );
};

export default AddDesignationScreen;
