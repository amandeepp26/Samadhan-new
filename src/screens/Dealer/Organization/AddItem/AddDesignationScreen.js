import React, { useEffect } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Button, Card, Checkbox, HelperText, Snackbar, TextInput } from "react-native-paper";
import Provider from "../../../../api/Provider";
import { Styles } from "../../../../styles/styles";
import { theme } from "../../../../theme/apptheme";
import { communication } from "../../../../utils/communication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../../../components/Header";

let DealerID = 0;
const AddDealerDesignationScreen = ({ route, navigation }) => {
   //#region Variables

  const [designationFullData, setDesignationFullData] = React.useState([]);
  const [designationData, setDesignationData] = React.useState([]);
  const [designationName, setDesignationName] = React.useState(route.params.type === "edit" ? route.params.data.designationName : "");
  const [designationError, setDesignationError] = React.useState(false);

  const [checked, setChecked] = React.useState(route.params.type === "edit" ? route.params.data.display : true);
  const [reportingAuthority, setReportingAuthority] = React.useState(route.params.type === "edit" ? route.params.data.reportingAuthority : false);

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
   //#endregion 

 //#region Functions

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      DealerID = JSON.parse(userData).UserID;
        FetchDesignations();
    }
  };

  useEffect(() => {
    GetUserID();
  }, []);

  const FetchDesignations = () => {
    Provider.getAll("master/getdesignations")
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = response.data.data.filter((el) => {
              return el.display;
            });
            setDesignationFullData(response.data.data);
            const designation = response.data.data.map((data) => data.designationName);
            setDesignationData(designation);
          }
        }
      })
      .catch((e) => {});
  };

  const onDesignationSelected = (selectedItem) => {
    setDesignationName(selectedItem);
    setDesignationError(false);
  };

  const InsertDesignation = () => {
    Provider.create("master/insertuserdesignation", { 
        UserType:4,
        UserId: DealerID,
        DesignationID: designationFullData.find((el) => {
            return el.designationName === designationName;
          }).id, 
        Display: checked 
    })
      .then((response) => {
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
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const UpdateDesignation = () => {
    Provider.create("master/updateuserdesignation", { 
        ID: route.params.data.id, 
        UserType: 4,
        UserId: DealerID,
        DesignationID: designationFullData.find((el) => {
            return el.designationName === designationName;
          }).id, 
        Display: checked,
        ReportingAuthority: reportingAuthority
    })
      .then((response) => {
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
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const ValidateDesignationName = () => {
    let isValid = true;
    if (designationName.length === 0) {
        setDesignationError(true);
      isValid = false;
    }
    if (isValid) {
      if (route.params.type === "edit") {
        UpdateDesignation();
      } else {
        InsertDesignation();
      }
    }
  };
 //#endregion 

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} />
      <ScrollView style={[Styles.flex1, Styles.backgroundColor, { marginBottom: 64 }]} keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
        <Dropdown label="Designation Name" data={designationData} onSelected={onDesignationSelected} isError={designationError} selectedItem={designationName} />
          <HelperText type="error" visible={designationError}>
            {communication.InvalidDesignationID}
          </HelperText>
          <View style={{ width: 160 }}>
            <Checkbox.Item
              label="Reporting Authority"
              color={theme.colors.primary}
              position="leading"
              labelStyle={{ textAlign: "left", paddingLeft: 8 }}
              status={reportingAuthority ? "checked" : "unchecked"}
              onPress={() => {
                setReportingAuthority(!reportingAuthority);
              }}
            />
          </View>
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
          <Button mode="contained" onPress={ValidateDesignationName}>
            SAVE
          </Button>
        </Card.Content>
      </View>
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000} style={{ backgroundColor: theme.colors.error }}>
        {snackbarText}
      </Snackbar>
    </View>
    </SafeAreaView>
  );
};

export default AddDealerDesignationScreen;
