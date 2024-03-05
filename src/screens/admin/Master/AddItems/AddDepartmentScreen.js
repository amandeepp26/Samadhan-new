import React from "react";
import {ScrollView, View, TextInput, SafeAreaView} from 'react-native';
import { Card, Checkbox, HelperText, Snackbar,  } from "react-native-paper";
import Provider from "../../../../api/Provider";
import { Styles } from "../../../../styles/styles";
import { theme } from "../../../../theme/apptheme";
import { communication } from "../../../../utils/communication";
import DFButton from "../../../../components/Button";
import Header from "../../../../components/Header";
import ButtonComponent from "../../../../components/Button";


const AddDepartmentScreen = ({ route, navigation }) => {
  //#region Variables
  const [departmentNameError, setDepartmentNameError] = React.useState(false);
  const [departmentName, setDepartmentName] = React.useState(route.params.type === "edit" ? route.params.data.departmentName : "");
  const [checked, setChecked] = React.useState(route.params.type === "edit" ? route.params.data.display : true);

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  //#endregion

  //#region Functions
  const onDepartmentNameChanged = (text) => {
    setDepartmentName(text);
    setDepartmentNameError(false);
  };

  const InsertDepartmentName = () => {
    Provider.createDFAdmin(Provider.API_URLS.DepartmentNameCreate, {
      data: {
        Sess_UserRefno: "2",
        department_name: departmentName,
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

  const UpdateDepartmentName = () => {
    Provider.createDFAdmin(Provider.API_URLS.DepartmentNameUpdate, {
      data: {
        Sess_UserRefno: "2",
        department_refno: route.params.data.id,
        department_name: departmentName,
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

  const ValidateDepartmentName = () => {
    let isValid = true;
    if (departmentName.length === 0) {
      setDepartmentNameError(true);
      isValid = false;
    }
    if (isValid) {
      setIsButtonLoading(true);
      if (route.params.type === "edit") {
        UpdateDepartmentName();
      } else {
        InsertDepartmentName();
      }
    }
  };
  //#endregion

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header title="Add Department" navigation={navigation} />
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor, {marginBottom: 64}]}
        keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
          <TextInput
            underlineColor="transparent"
            placeholderTextColor={theme.colors.textColorDark}
            style={[Styles.textinput, {marginTop: 5, width: '95%'}]}
            dense
            placeholder="Department Name"
            value={departmentName}
            onChangeText={onDepartmentNameChanged}
            error={departmentNameError}
          />
          <HelperText type="error" visible={departmentNameError}>
            {communication.InvalidDepartmentName}
          </HelperText>
          <View style={{width: 160}}>
            <Checkbox.Item
              label="Display"
              position="leading"
              labelStyle={{textAlign: 'left', paddingLeft: 8}}
              color={theme.colors.primary}
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
            onPress={ValidateDepartmentName}
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

export default AddDepartmentScreen;
