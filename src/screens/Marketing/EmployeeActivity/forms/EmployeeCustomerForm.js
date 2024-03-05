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

let userID = 0, compayID = 0, branchID = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;

const EmployeeCustomerForm = ({ navigation, route }) => {

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [isSnackbarVisible, setIsSnackbarVisible] = React.useState("");

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState('');

  const isFocused = useIsFocused();
  const [state, setState] = useState({
    company_name: "",
    contact_person: "",
    designation: "",
    mobile_no: "",
    phone_no: "",
    email_id: "",
    address: "",
    pincode: "",
    district_refno: "",
    state_refno: "",
    view_status: "1",
  });

  const [error, setError] = useState({
    company_name: false,
    contact_person: false,
    designation: false,
    mobile_no: false,
    phone_no: false,
    email_id: false,
    address: false,
    pincode: false,
    district_refno: false,
    state_refno: false,
  });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const fetchUser = async () => {
    const data = JSON.parse(await AsyncStorage.getItem("user"));
    userID = data.UserID;
    branchID = data.Sess_branch_refno;
    compayID = data.Sess_company_refno;
    fetchState();
  };
  useEffect(() => {
    if (isFocused) {
      fetchUser();
    }
  }, [isFocused]);

  const fetchState = () => {
    Provider.createDFCommon(Provider.API_URLS.GetStateDetails)
      .then((res) => {
        if (res.data.data) setStates(res.data.data);
      })
      .catch((error) => console.log(error));
  };

  const fetchDistricts = (state_refno) => {
    Provider.createDFCommon(Provider.API_URLS.GetDistrictDetailsByStateRefno, {
      data: {
        Sess_UserRefno: userID,
        state_refno,
      },
    })
      .then((res) => {
        if (res.data.data) setDistricts(res.data.data);
      })
      .catch((error) => console.log(error));
  };

  const handleSubmit = () => {
    let errors = false;
    if (state.company_name.length === 0) {
      setError((state) => ({ ...state, company_name: true }));
      errors = true;
    }
    if (state.mobile_no.length !== 10) {
      setError((state) => ({ ...state, mobile_no: true }));
      errors = true;
    }

    if (!errors) {
      setIsButtonLoading(true);
      let params = {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: compayID,
          Sess_branch_refno: branchID,
          ...state,
        }
      };
      Provider.createDFEmployee(Provider.API_URLS.employee_create_clientdata, params)
        .then((response) => {
          setIsButtonLoading(false);
          if (response.data && response.data.code === 200) {
            if (response.data.data.Created == 1) {
              if (route.params.type == "newAccount") {
                route.params.fetchCompany("1");
              }
              else if (route.params.type == "client") {
                route.params.fetchData();
              }
              else {
                route.params.fetchCustomers("add");
              }
              navigation.goBack();
            }
            else {
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
        }).catch((e) => {
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
            label="Company Name"
            onChangeText={(text) => {
              setState((state) => ({
                ...state,
                company_name: text,
              }));

              setError((state) => ({
                ...state,
                company_name: false,
              }));
            }}
            error={error.company_name}
            value={state.company_name}
          />
          <FormInput
            label="Contact Person"
            value={state.contact_person}
            onChangeText={(text) => {
              setState((state) => ({
                ...state,
                contact_person: text,
              }));

              setError((state) => ({
                ...state,
                contact_person: false,
              }));
            }}
            error={error.contact_person}
          />
          <FormInput
            label="Designation"
            value={state.designation}
            onChangeText={(text) => {
              setState((state) => ({
                ...state,
                designation: text,
              }));

              setError((state) => ({
                ...state,
                designation: false,
              }));
            }}
            error={error.designation}
          />
          <FormInput
            label="Mobile Number"
            onChangeText={(text) => {
              if (text.length < 11)
                setState((state) => ({
                  ...state,
                  mobile_no: text,
                }));

              setError((state) => ({
                ...state,
                mobile_no: false,
              }));
            }}
            keyboardType={"phone-pad"}
            value={state.mobile_no}
            error={error.mobile_no}
          />
          <FormInput
            value={state.phone_no}
            label="Telephone Number"
            onChangeText={(text) => {
              if (text.length < 11)
                setState((state) => ({
                  ...state,
                  phone_no: text,
                }));

              setError((state) => ({
                ...state,
                phone_no: false,
              }));
            }}
            error={error.phone_no}
            keyboardType={"phone-pad"}
          />
          <FormInput
            label="Email ID"
            onChangeText={(text) => {
              setState((state) => ({
                ...state,
                email_id: text,
              }));

              setError((state) => ({
                ...state,
                email_id: false,
              }));
            }}
            value={state.email_id}
            error={error.email_id}
          />
          <FormInput
            label="Address 1 "
            onChangeText={(text) => {
              setState((state) => ({
                ...state,
                address: text,
              }));

              setError((state) => ({
                ...state,
                address: false,
              }));
            }}
            value={state.address}
            error={error.address}
          />
          <FormInput
            label="State"
            type="dropdown"
            data={states.map((obj) => obj.state_name)}
            onChangeText={(text) => {
              setState((state) => ({
                ...state,
                state_refno: states.find((item) => item.state_name === text).state_refno,
                district_refno: "",
              }));

              setError((state) => ({
                ...state,
                state_refno: false,
              }));
              fetchDistricts(
                states.find((item) => item.state_name === text).state_refno
              );
            }}
            value={state.state_refno}
            error={error.state_refno}
          />
          <FormInput
            label="City"
            type="dropdown"
            data={districts.map((obj) => obj.district_name)}
            onChangeText={(text) => {
              setState((state) => ({
                ...state,
                district_refno: districts.find((item) => item.district_name === text).district_refno,
              }));

              setError((state) => ({
                ...state,
                district_refno: false,
              }));
            }}
            value={state.district_refno}
            error={error.district_refno}
          />
          <FormInput
            label="Pincode"
            onChangeText={(text) => {
              setState((state) => ({
                ...state,
                pincode: text,
              }));

              setError((state) => ({
                ...state,
                pincode: false,
              }));
            }}
            error={error.pincode}
            value={state.pincode}
            keyboardType="numeric"
          />
          <FormInput
            label="Display"
            type="check-box"
            onChangeText={(text) => {
              setState((state) => ({
                ...state,
                view_status: state.view_status === "0" ? "1" : "0",
              }));
            }}
            value={state.view_status}
          />

          <Button
            onPress={handleSubmit}
            mode="contained"
            loading={isButtonLoading}
            disabled={isButtonLoading}
            style={{ width: "100%", alignSelf: "center" }}
          >
            Submit
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

export default EmployeeCustomerForm;
