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

const AddDealerDepartmentScreen = ({ route, navigation }) => {
   //#region Variables
  const [departmentFullData, setDepartmentFullData] = React.useState([]);
  const [departmentData, setDepartmentData] = React.useState([]);
  const [departmentName, setDepartmentName] = React.useState(route?.params?.type === "edit" ? route.params.data.departmentName : "");
  const [departmentError, setDepartmentError] = React.useState(false);

  const [checked, setChecked] = React.useState(route.params.type === "edit" ? route.params.data.display : true);
  
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
 //#endregion 

 //#region Functions
  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      DealerID = JSON.parse(userData).UserID;
        FetchDepartments();
    }
  };

  useEffect(() => {
    GetUserID();
  }, []);

  const FetchDepartments = () => {
    Provider.getAll("master/getdepartments")
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = response.data.data.filter((el) => {
              return el.display;
            });
            setDepartmentFullData(response.data.data);
            const departments = response.data.data.map((data) => data.departmentName);
            setDepartmentData(departments);
          }
        }
      })
      .catch((e) => {});
  };

  const onDepartmentSelected = (selectedItem) => {
    setDepartmentName(selectedItem);
    setDepartmentError(false);
  };

  const InsertDepartment = () => {
    Provider.create("master/insertuserdepartments", { 
        UserType: 4,
        UserId: DealerID,
        DepartmentID: departmentFullData.find((el) => {
          return el.departmentName === departmentName;
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

  const UpdateDepartment = () => {
    Provider.create("master/updateuserdepartment", { 
      UserType: 4,
      UserId: DealerID,
      DepartmentID: departmentFullData.find((el) => {
        return el.departmentName === departmentName;
      }).id,
      ID: route.params.data.id, 
      Display: checked 
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

  const ValidateDepartmentName = () => {
    let isValid = true;
    if (departmentName.length === 0) {
        setDepartmentError(true);
      isValid = false;
    }
    if (isValid) {
      if (route.params.type === "edit") {
        UpdateDepartment();
      } else {
        InsertDepartment();
      }
    }
  };
 //#endregion 
  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Add Department" />
      <ScrollView style={[Styles.flex1, Styles.backgroundColor, { marginBottom: 64 }]} keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
        <Dropdown label="Department Name" data={departmentData} onSelected={onDepartmentSelected} isError={departmentError} selectedItem={departmentName} />
          <HelperText type="error" visible={departmentError}>
            {communication.InvalidDepartmentID}
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
          <Button mode="contained" onPress={ValidateDepartmentName}>
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

export default AddDealerDepartmentScreen;
