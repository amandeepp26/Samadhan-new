import React from "react";
import { ScrollView, View,TextInput, SafeAreaView } from "react-native";
import { Card, Checkbox, HelperText, Snackbar, } from "react-native-paper";
import Provider from "../../../../api/Provider";
import { Styles } from "../../../../styles/styles";
import { theme } from "../../../../theme/apptheme";
import { communication } from "../../../../utils/communication";
import DFButton from "../../../../components/Button";
import ButtonComponent from "../../../../components/Button";
import Header from "../../../../components/Header";

const AddWorkLocationScreen = ({ route, navigation }) => {
  //#region Variables
  const [workLocationNameError, setWorkLocationNameError] = React.useState(false);
  const [workLocationName, setWorkLocationName] = React.useState(route.params.type === "edit" ? route.params.data.workLocationName : "");
  const [checked, setChecked] = React.useState(route.params.type === "edit" ? route.params.data.display : true);

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  //#endregion

  //#region Functions
  const onWorkLocationNameChanged = (text) => {
    setWorkLocationName(text);
    setWorkLocationNameError(false);
  };

  const InsertWorkLocationName = () => {
    const params = {
      data: {
        Sess_UserRefno: "2",
        worklocation_name: workLocationName,
        view_status: checked ? 1 : 0,
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.WorkLocationCreate, params)
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

  const UpdateWorkLocationName = () => {
    const params = {
      data: {
        Sess_UserRefno: "2",
        worklocation_refno: route.params.data.id,
        worklocation_name: workLocationName,
        view_status: checked ? 1 : 0,
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.WorkLocationUpdate, params)
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

  const ValidateWorkLocationName = () => {
    let isValid = true;
    if (workLocationName.length === 0) {
      setWorkLocationNameError(true);
      isValid = false;
    }
    if (isValid) {
      setIsButtonLoading(true);
      if (route.params.type === "edit") {
        UpdateWorkLocationName();
      } else {
        InsertWorkLocationName();
      }
    }
  };

  //#endregion

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header title="Add Work Location" navigation={navigation} />
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor, {marginBottom: 64}]}
        keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
          <TextInput
            mode="outlined"
            underlineColor="transparent"
            placeholderTextColor={theme.colors.textColorDark}
            placeholder="Work Location Name"
            value={workLocationName}
            onChangeText={onWorkLocationNameChanged}
            style={Styles.textinput}
            error={workLocationNameError}
          />
          {/* <TextInput
            mode="outlined"
            label="Work Location Name"
            value={workLocationName}
            onChangeText={onWorkLocationNameChanged}
            style={{backgroundColor: 'white'}}
            error={workLocationNameError}
          /> */}
          <HelperText type="error" visible={workLocationNameError}>
            {communication.InvalidWorkLocationName}
          </HelperText>
          <View style={{width: 160}}>
            <Checkbox.Item
              label="Display"
              color={theme.colors.primary}
              position="leading"
              labelStyle={{textAlign: 'left', paddingLeft: 8}}
              status={checked ? 'checked' : 'unchecked'}
              onPress={() => {
                setChecked(!checked);
              }}
            />
          </View>
        </View>
      </ScrollView>
      <View
        style={[
          Styles.backgroundColor,
          Styles.width100per,
          Styles.marginTop32,
          Styles.padding16,
          {position: 'absolute', bottom: 0, elevation: 3},
        ]}>
        <Card.Content>
          <ButtonComponent
            mode="contained"
            onPress={ValidateWorkLocationName}
            text="SAVE"
            loader={isButtonLoading}
          />
        </Card.Content>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: theme.colors.error}}>
        {snackbarText}
      </Snackbar>
    </View>
    </SafeAreaView>
  );
};

export default AddWorkLocationScreen;
