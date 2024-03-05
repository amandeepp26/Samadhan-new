import { View, Text, ScrollView } from "react-native";
import React from "react";
import { useState } from "react";
import FormInput from "../common/Input";
import { Styles } from "../../../../styles/styles";
import Provider from "../../../../api/Provider";
import { Button } from "react-native-paper";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditContact = ({ navigation, route }) => {
  const [state, setState] = useState({ ...route?.params?.data });
  const [userRefno, setUserRefno] = useState(0);
  const [companyRefno, setCompanyRefno] = useState(0);
  const [branchRefno, setBranchRefno] = useState(0);

  const isFocused = useIsFocused();
  console.log(route, "route");

  // {Sess_UserRefno:8,Sess_company_refno:1,Sess_branch_refno:1,phone_no:123123,contact_person:Ishaan21,designation:Dev,mobile_no:7021173513,email_id:Ip@gmail.com,navigation:{},mycustomer_detail_refno:3}
  console.log(state, "stateupdated");
  const handleSubmit = async () => {
    //TODO: validations to add
    Provider.createDFEmployee(
      Provider.API_URLS.employee_update_client_companydata,
      {
        data: {
          Sess_UserRefno: userRefno,
          Sess_company_refno: companyRefno,
          Sess_branch_refno: branchRefno,
          mycustomer_detail_refno: state.mycustomer_detail_refno,
          contact_person: state.contact_person,
          designation: state.designation,
          mobile_no: state.mobile_no,
          phone_no: "9029091221",
          email_id: state.email_id,
        },
      }
    ).then(
      (res) => console.log(res, "res contact")
      //navigation.navigate("CustomerList")
    );
  };

  const fetchUser = async () => {
    const data = JSON.parse(await AsyncStorage.getItem("user"));
    setUserRefno(data.UserID);
    setCompanyRefno(data.Sess_company_refno);
    setBranchRefno(data.Sess_branch_refno);
  };
  useEffect(() => {
    if (isFocused) fetchUser();
  }, [isFocused]);

  return (
    <ScrollView
      style={[Styles.flex1, { backgroundColor: "#fff" }, Styles.padding16]}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <FormInput
          label="Contact Person "
          onChangeText={(text) => {
            setState((state) => ({
              ...state,
              contact_person: text,
            }));

            //   setError((state) => ({
            //     ...state,
            //     address: false,
            //   }));
          }}
          value={state.contact_person}
          // error={error.address}
        />
        <FormInput
          label="Designation "
          onChangeText={(text) => {
            setState((state) => ({
              ...state,
              designation: text,
            }));

            //   setError((state) => ({
            //     ...state,
            //     design: false,
            //   }));
          }}
          // Ye
          value={state.designation}
          // error={error.address}
        />
        <FormInput
          label="Mobile No"
          onChangeText={(text) => {
            setState((state) => ({
              ...state,
              mobile_no: text,
            }));

            //   setError((state) => ({
            //     ...state,
            //     address: false,
            //   }));
          }}
          // Ye
          value={state.mobile_no}
          // error={error.address}
        />
        <FormInput
          label="Telephone Number "
          onChangeText={(text) => {
            setState((state) => ({
              ...state,
              phone_no: text,
            }));

            //   setError((state) => ({
            //     ...state,
            //     address: false,
            //   }));
          }}
          // Ye
          value={state.phone_no}
          // error={error.address}
        />
        <FormInput
          label="Email"
          onChangeText={(text) => {
            setState((state) => ({
              ...state,
              email_id: text,
            }));

            //   setError((state) => ({
            //     ...state,
            //     address: false,
            //   }));
          }}
          // Ye
          value={state.email_id}
          // error={error.address}
        />
        <Button
          onPress={handleSubmit}
          mode="contained"
          style={{ width: "50%", alignSelf: "center" }}
        >
          Submit
        </Button>
      </View>
    </ScrollView>
  );
};

export default EditContact;
