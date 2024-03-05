import { View, Text, ScrollView } from "react-native";
import React from "react";
import FormInput from "../common/Input";
import { Styles } from "../../../../styles/styles";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import Provider from "../../../../api/Provider";
import { Button, Snackbar } from "react-native-paper";
import { communication } from "../../../../utils/communication";
import { theme } from "../../../../theme/apptheme";

let userID = 0,
  compayID = 0,
  branchID = 0;

const AddMeetingPerson = ({ navigation, route }) => {
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [isSnackbarVisible, setIsSnackbarVisible] = React.useState("");

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");

  const isFocused = useIsFocused();
  const [state, setState] = useState({
    myclient_detail_refno: "0",
    contact_name: "",
    designation: "",
    mobile: "",
    telephone: "",
    email: "",
  });

  const [error, setError] = useState({
    contact_name: false,
    designation: false,
    mobile: false,
    telephone: false,
    email: false,
  });

  const fetchUser = async () => {
    const data = JSON.parse(await AsyncStorage.getItem("user"));
    userID = data.UserID;
    branchID = data.Sess_branch_refno;
    compayID = data.Sess_company_refno;

    if (route.params.type === "edit") {
      setState((state) => ({
        myclient_detail_refno: route.params.data.myclient_detail_refno,
        contact_name: route.params.data.contact_person,
        designation: route.params.data.designation,
        mobile: route.params.data.mobile_no,
        telephone: route.params.data.phone_no,
        email: route.params.data.email_id,
      }));
    } else if (route.params.type === "newContact") {
      setState((state) => ({
        myclient_detail_refno: route.params.data.myclient_detail_refno,
      }));
    }
  };
  useEffect(() => {
    if (isFocused) {
      fetchUser();
    }
  }, [isFocused]);

  const handleSubmit = () => {
    let errors = false;

    if (state?.contact_name.trim() == "") {
      setError((state) => ({ ...state, contact_name: true }));
      errors = true;
    }

    if (state?.mobile?.length !== 10) {
      setError((state) => ({ ...state, mobile: true }));
      errors = true;
    }
    // if (
    //   state?.email?.trim() != "" &&
    //   !String(state.email)
    //     .toLowerCase()
    //     .match(
    //       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    //     )
    // ) {
    //   setError((state) => ({ ...state, email: true }));
    //   errors = true;
    // }
    if (errors) {
      setSnackbarText("Enter all data with * marks");
      setSnackbarVisible(true);
    }
    if (!errors) {
      setIsButtonLoading(true);
      let params = null;
      if (route.params.type === "edit") {
        params = {
          data: {
            Sess_UserRefno: userID,
            Sess_company_refno: compayID,
            Sess_branch_refno: branchID,
            myclient_detail_refno: state.myclient_detail_refno,
            contact_person: state.contact_name,
            designation: state.designation,
            mobile_no: state.mobile,
            phone_no: state.telephone,
            email_id: state.email,
          },
        };
      } else if (
        route.params.type === "newContact" ||
        route.params.type === "add"
      ) {
        params = {
          data: {
            Sess_UserRefno: userID,
            Sess_company_refno: compayID,
            Sess_branch_refno: branchID,
            myclient_refno: route.params.data.myclient_refno,
            contact_person: state.contact_name,
            designation: state.designation,
            mobile_no: state.mobile,
            phone_no: state.telephone,
            email_id: state.email,
          },
        };
      }

      let url = "";

      if (route.params.type === "edit") {
        url = Provider.API_URLS.employee_update_client_contactdata;
      } else if (
        route.params.type === "newContact" ||
        route.params.type === "add"
      ) {
        url = Provider.API_URLS.employeeactivity_addnew_contact;
      }

      console.log("params:", params);
      Provider.createDFEmployee(url, params)
        .then((response) => {
          console.log("resp:", response.data.data);
          setIsButtonLoading(false);
          if (response.data && response.data.code === 200) {
            if (response.data.data.Updated == 1) {
              route.params.fetchCustomers("update");
              navigation.goBack();
            } else if (response.data.data.Created == 1) {
              if (route.params.type === "newContact") {
                route.params.contactPersonList(
                  route.params.data.myclient_refno
                );
                navigation.goBack();
              } else if (route.params.type === "add") {
                route.params.fetchCustomers("add");
                navigation.goBack();
              }
            } else {
              setSnackbarText(response.data.message);
              setSnackbarVisible(true);
            }
          } else if (response.data.code === 304) {
            setSnackbarText(communication.AlreadyExists);
            setSnackbarVisible(true);
          } else {
            setSnackbarText(communication.InsertError);
            setSnackbarVisible(true);
          }
        })
        .catch((e) => {
          // console.log(e);
          setIsButtonLoading(false);
          setSnackbarText(communication.NetworkError);
          setSnackbarVisible(true);
        });
    }
  };

  return (
    <View style={[Styles.flex1, Styles.backgroundColor]}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={[Styles.flex1, Styles.padding16, { background: "#fff" }]}>
          <FormInput
            label="Contact Person *"
            onChangeText={(text) => {
              const cleanedText = text.replace(/[^\w\s]/gi, "");
              setError((prev) => ({
                ...prev,
                contact_name: false,
              }));
              setState((state) => ({
                ...state,
                contact_name: cleanedText,
              }));
            }}
            value={state.contact_name}
            error={error.contact_name}
          />
          <FormInput
            label="Designtion"
            onChangeText={(text) => {
              setError((prev) => ({
                ...prev,
                designation: false,
              }));
              setState((state) => ({
                ...state,
                designation: text,
              }));
            }}
            value={state.designation}
          />

          <FormInput
            label="Mobile Number *"
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, "");
              setError((prev) => ({
                ...prev,
                mobile: false,
              }));
              if (numericValue.length < 11)
                setState((state) => ({
                  ...state,
                  mobile: numericValue,
                }));
            }}
            keyboardType={"phone-pad"}
            value={state.mobile}
            error={error.mobile}
          />
          <FormInput
            value={state.telephone}
            label="Telephone Number"
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, "");
              setError((prev) => ({
                ...prev,
                telephone: false,
              }));
              if (numericValue.length < 11)
                setState((state) => ({
                  ...state,
                  telephone: numericValue,
                }));
            }}
            keyboardType={"phone-pad"}
            error={error.telephone}
          />
          <FormInput
            label="Email ID"
            onChangeText={(text) => {
              setError((prev) => ({
                ...prev,
                email: false,
              }));
              setState((state) => ({
                ...state,
                email: text,
              }));
            }}
            value={state.email}
            error={error.email}
          />

          <Button
            onPress={handleSubmit}
            mode="contained"
            loading={isButtonLoading}
            disabled={isButtonLoading}
            style={[Styles.marginTop16, { width: "100%", alignSelf: "center" }]}
          >
            {route.params.type === "edit" ? "Update" : "Add"} Contact
          </Button>
        </View>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        style={{ backgroundColor: theme.colors.error }}
      >
        {snackbarText}
      </Snackbar>
    </View>
  );
};

export default AddMeetingPerson;
