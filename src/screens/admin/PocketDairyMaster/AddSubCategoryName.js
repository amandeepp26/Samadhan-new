import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Card, Checkbox, HelperText, Snackbar, TextInput,Subheading } from "react-native-paper";
import Provider from "../../../api/Provider";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import { APIConverter } from "../../../utils/apiconverter";
import { communication } from "../../../utils/communication";
import DFButton from "../../../components/Button";
import ButtonComponent from "../../../components/Button";

let userID = 0, groupID = 0;
const AddSubCategoryNameScreen = ({ route, navigation }) => {
  //#region Variables

  const [transactionTypeFullData, setTransactionTypeFullData] = React.useState([]);
  const [transactionTypeData, setTransactionTypeData] = React.useState([]);
  const [transactionTypeName, setTransactionTypeName] = React.useState(route.params.type === "edit" ? route.params.data.transactionTypeName : "");
  const [errorTTN, setTTNError] = React.useState(false);

  const [categoryFullData, setCategoryFullData] = React.useState([]);
  const [categoryData, setCategoryData] = React.useState([]);
  const [categoryName, setCategoryName] = React.useState(route.params.type === "edit" ? route.params.data.categoryName : "");
  const [errorCT, setCTError] = React.useState(false);

  const [subCategoryNameError, setSubCategoryNameError] = React.useState(false);
  const [subCategoryName, setSubCategoryName] = React.useState(route.params.type === "edit" ? route.params.data.subCategoryName : "");

  const [notesError, setNotesError] = React.useState(false);
  const [notes, setNotes] = React.useState(route.params.type === "edit" ? route.params.data.notes : "");

  const [checked, setChecked] = React.useState(route.params.type === "edit" ? route.params.data.display : true);

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
  const [snackbarColor, setSnackbarColor] = React.useState(theme.colors.success);

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  // Entry Type changes
  const [entryTypeName, setEntryTypeName] = useState([
    {
      title: "Self",
      isChecked: route.params.type === "edit" && route.params.data.entryType && route.params.data.entryType.toString().includes("1") ? true : false,
      id: "1",
    },
    {
      title: "Company",
      isChecked: route.params.type === "edit" && route.params.data.entryType && route.params.data.entryType.toString().includes("2") ? true : false,
      id: "2",
    },
  ]);
  const [entryTypeInvalid, setEntryTypeInvalid] = useState(false);
  // Entry Type changes

  //#endregion


  useEffect(() => {
    //let isEdit = route.params.type === "edit" ? true : false;
    GetUserID();
  }, []);

  //#region Functions

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      groupID = JSON.parse(userData).Sess_group_refno;
    }

    FetchEntryType(route.params.type === "edit" ? true : false);
    FetchTransactionType();

    if (route.params.type === "edit") {
      FetchCategory(route.params.data.transtypeID);
    }
  };

  // Entry Type changes
  const FetchEntryType = (edit) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID
      },
    };
    Provider.createDFPocketDairy(Provider.API_URLS.get_pckentrytype, params)
      .then((response) => {
        
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            const entryType = [];
            response.data.data.map((data, i) => {
              let checked = false;
              if (edit && route.params.data.entryTypeName.includes(data.pck_entrytype_name)) {
                checked = true;
              }
              entryType.push({
                title: data.pck_entrytype_name,
                isChecked: checked,
                id: data.pck_entrytype_refno,
              });
            });
            setEntryTypeName(entryType);
          }
        }

      })
      .catch((e) => {
        //setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      });
  };
  // Entry Type changes


  const FetchTransactionType = () => {

    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.gettransactiontype_pcksubcategoryform_appadmin, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {

            response.data.data = APIConverter(response.data.data);
            setTransactionTypeFullData(response.data.data);
            const transactionType = response.data.data.map((data) => data.transTypeName);
            setTransactionTypeData(transactionType);

          }
        } else {
          listData[1]([]);
          setSnackbarText("No data found");
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
        //setIsLoading(false);
        //setRefreshing(false);
      })
      .catch((e) => {
        //setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        //setRefreshing(false);
      });
  };



  const FetchCategory = (transactionType) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupID,
        pck_transtype_refno: transactionType
      },
    };
    Provider.createDFAdmin(Provider.API_URLS.getpckcategoryname_pcksubcategoryform_appadmin, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {

            response.data.data = APIConverter(response.data.data);

            setCategoryFullData(response.data.data);

            const category = response.data.data.map((data) => data.categoryName);
            setCategoryData(category);
          }
        } else {
          listData[1]([]);
          setSnackbarText("No data found");
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
        }
      })
      .catch((e) => {
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
      });
  };

  const onTransactionTypeName = (selectedItem) => {
    setTransactionTypeName(selectedItem);
    let transID = transactionTypeFullData.find((el) => {
      return el.transTypeName === selectedItem;
    }).transtypeID;

    setCategoryData([]);
    setCategoryName("");

    FetchCategory(transID);
    setTTNError(false);

  };

  const onCategoryNameSelected = (selectedItem) => {
    setCategoryName(selectedItem);
    setCTError(false);
  };

  const onSubCategoryNameChanged = (text) => {
    setSubCategoryName(text);
    setSubCategoryNameError(false);
  };

  const onNotesChanged = (text) => {
    setNotes(text);
    setNotesError(false);
  };

  const InsertActivityName = () => {
    let et = [];
    entryTypeName.map((k, i) => {
      if (k.isChecked) {
        et.push(k.id.toString());
      }
    });
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_transtype_refno: transactionTypeFullData.find((el) => {
          return el.transTypeName === transactionTypeName;
        }).transtypeID,
        pck_entrytype_refno: et,
        pck_category_refno: categoryFullData.find((el) => {
          return el.categoryName === categoryName;
        }).pckCategoryID,

        sub_category_name: subCategoryName,
        notes: notes,
        view_status: checked ? 1 : 0

      },
    }
    Provider.createDFAdmin(Provider.API_URLS.pcksubcategorynamecreate_appadmin, params)
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

  const UpdateActivityName = () => {
    let et = [];
    
    entryTypeName.map((k, i) => {
      if (k.isChecked) {
        et.push(k.id.toString());
      }
    });
    let params = {
      data: {
        Sess_UserRefno: userID,
        pck_sub_category_refno: route.params.data.subcategoryID,
        pck_transtype_refno: transactionTypeFullData.find((el) => {
          return el.transTypeName === transactionTypeName;
        }).transtypeID,
        pck_entrytype_refno: et,
        pck_category_refno: categoryFullData.find((el) => {
          return el.categoryName === categoryName;
        }).pckCategoryID,
        sub_category_name: subCategoryName,
        notes: notes,
        view_status: checked ? 1 : 0
      }
    }

    Provider.createDFAdmin(Provider.API_URLS.pcksubcategorynameupdate_appadmin, params)
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

  const ValidateActivityName = () => {
    let isValid = true;

    if (transactionTypeName === "") {
      setTTNError(true);
      isValid = false;
    }

    if (categoryName === "") {
      setCTError(true);
      isValid = false;
    }

    if (subCategoryName.trim() === "") {
      setSubCategoryNameError(true);
      isValid = false;
    }

    if (isValid) {
      setIsButtonLoading(true);
      if (route.params.type === "edit") {
        UpdateActivityName();
      } else {
        InsertActivityName();
      }
    }
  };
  //#endregion

  return (
    <View style={[Styles.flex1]}>
      <ScrollView style={[Styles.flex1, Styles.backgroundColor, { marginBottom: 64 }]} keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
          {/* Entry Type changes */}
          <Subheading style={{ paddingTop: 24, fontWeight: "bold" }}>Entry Type</Subheading>
          <View style={[Styles.flexRow]}>
            {entryTypeName.map((k, i) => {
              return (
                <View key={i} style={[Styles.flex1]}>
                  <Checkbox.Item
                    label={k.title}
                    position="leading"
                    style={[Styles.paddingHorizontal0]}
                    labelStyle={[Styles.textLeft, Styles.paddingStart4, Styles.fontSize14]}
                    color={theme.colors.primary}
                    status={k.isChecked ? "checked" : "unchecked"}
                    onPress={() => {
                      let temp = entryTypeName.map((u) => {
                        if (k.title === u.title) {
                          return { ...u, isChecked: !u.isChecked };
                        }
                        return u;
                      });
                      setEntryTypeInvalid(false);
                      setEntryTypeName(temp);
                    }}
                  />
                </View>
              );
            })}
          </View>
          {/* Entry Type changes */}

          <Dropdown label="Transaction Type" data={transactionTypeData} onSelected={onTransactionTypeName} isError={errorTTN} selectedItem={transactionTypeName} />
          <HelperText type="error" visible={errorTTN}>
            {communication.InvalidTransactionTypeName}
          </HelperText>
          <Dropdown label="Category Name" data={categoryData} onSelected={onCategoryNameSelected} isError={errorCT} selectedItem={categoryName} />
          <HelperText type="error" visible={errorCT}>
            {communication.InvalidCategoryName}
          </HelperText>
          <TextInput mode="outlined" label="Sub Category Name" value={subCategoryName} returnKeyType="next" onSubmitEditing={() => ref_input2.current.focus()} onChangeText={onSubCategoryNameChanged} style={{ backgroundColor: "white" }} error={subCategoryNameError} />
          <HelperText type="error" visible={subCategoryNameError}>
            {communication.InvalidSubCategoryName}
          </HelperText>
          <TextInput mode="outlined" label="Notes" value={notes} returnKeyType="next" onSubmitEditing={() => ref_input3.current.focus()} onChangeText={onNotesChanged} style={{ backgroundColor: "white" }} error={notesError} />
          <HelperText type="error" visible={notesError}>
            {communication.InvalidNotes}
          </HelperText>
          <View style={[Styles.flexRow, Styles.marginTop16]}>
            <Checkbox.Item
              label="Display"
              style={[Styles.paddingHorizontal0]}
              color={theme.colors.primary}
              position="leading"
              labelStyle={[Styles.textLeft, Styles.paddingStart4, Styles.fontSize14]}
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
          <ButtonComponent mode="contained" onPress={ValidateActivityName} text="SAVE" loader={isButtonLoading} />
        </Card.Content>
      </View>
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000} style={{ backgroundColor: theme.colors.error }}>
        {snackbarText}
      </Snackbar>
    </View>
  );
};

export default AddSubCategoryNameScreen;

