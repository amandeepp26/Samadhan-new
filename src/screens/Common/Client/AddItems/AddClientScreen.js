import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, SafeAreaView } from "react-native";
import {
  Card,
  Checkbox,
  HelperText,
  Snackbar,
  Subheading,
  TextInput,
} from "react-native-paper";
import Provider from "../../../../api/Provider";
import Dropdown from "../../../../components/Dropdown";
import { Styles } from "../../../../styles/styles";
import { theme } from "../../../../theme/apptheme";
import { communication } from "../../../../utils/communication";
import { APIConverter } from "../../../../utils/apiconverter";
import DFButton from "../../../../components/Button";
import RadioGroup from "react-native-radio-buttons-group";
import { projectLoginTypes } from "../../../../utils/credentials";

let userID = 0,
  Sess_company_refno = 0,
  Sess_branch_refno = 0,
  Sess_group_refno = 0,
  Sess_group_refno_extra_1 = 0,
  Sess_CompanyAdmin_UserRefno = 0,
  Sess_CompanyAdmin_group_refno = 0,
  Sess_designation_refno = 0;

const AddClientScreen = ({ route, navigation }) => {
  let addedBy = false;
  if (route.params.data) {
    addedBy = route.params.data.addedBy;
  }

  const [companyName, setCompanyName] = useState(
    route.params.type === "edit" ? route.params.data.companyName : ""
  );
  const [companyNameInvalid, setCompanyNameInvalid] = useState(false);
  const companyNameRef = useRef({});

  const [contactName, setContactName] = useState(
    route.params.type === "edit" ? route.params.data.contactPerson : ""
  );
  const [contactNameInvalid, setContactNameInvalid] = useState(false);
  const contactNameRef = useRef({});

  const [contactNumber, setContactNumber] = useState(
    route.params.type === "edit" ? route.params.data.contactMobileNumber : ""
  );
  const [contactNumberInvalid, setContactNumberInvalid] = useState(false);
  const contactNumberRef = useRef({});

  const [address, setAddress] = useState(
    route.params.type === "edit" ? route.params.data.address1 : ""
  );
  const [addressInvalid, setAddressInvalid] = useState("");
  const addressRef = useRef({});

  const [cityFullData, setCityFullData] = React.useState([]);
  const [cityData, setCityData] = React.useState([]);
  const [cityName, setCityName] = React.useState(
    route.params.type === "edit" ? route.params.data.cityName : ""
  );
  const [errorCN, setCNError] = React.useState(false);
  const cityRef = useRef({});

  const [statesFullData, setStatesFullData] = React.useState([]);
  const [statesData, setStatesData] = React.useState([]);
  const [stateName, setStateName] = React.useState(
    route.params.type === "edit" ? route.params.data.stateName : ""
  );
  const [errorSN, setSNError] = React.useState(false);

  const [refFullData, setRefFullData] = React.useState([]);
  const [refData, setRefData] = React.useState([]);
  const [refName, setRefName] = React.useState(
    route.params.type === "edit" ? route.params.data.stateName : ""
  );
  const [errorRef, setRefError] = React.useState(false);

  const [pincode, setPincode] = useState(
    route.params.type === "edit" ? route.params.data.pincode : ""
  );
  const [pincodeInvalid, setPincodeInvalid] = useState(false);
  const pincodenRef = useRef({});

  const [gstNumber, setGSTNumber] = useState(
    route.params.type === "edit" ? route.params.data.gstNumber : ""
  );
  const [gstNumberInvalid, setGSTNumberInvalid] = useState(false);
  const gstNumberRef = useRef({});

  const [panNumber, setPANNumber] = useState(
    route.params.type === "edit" ? route.params.data.pan : ""
  );
  const [panNumberInvalid, setPANNumberInvalid] = useState(false);
  const panNumberRef = useRef({});

  const [serviceTypeRoles, setServiceTypeRoles] = useState([
    {
      title: "Vendor",
      isChecked:
        route.params.type === "edit" &&
          route.params.data.serviceType &&
          route.params.data.serviceType.indexOf("14") !== -1
          ? true
          : false,
    },
    {
      title: "Supplier",
      isChecked:
        route.params.type === "edit" &&
          route.params.data.serviceType &&
          route.params.data.serviceType.indexOf("13") !== -1
          ? true
          : false,
    },
    {
      title: "Client",
      isChecked:
        route.params.type === "edit" &&
          route.params.data.serviceType &&
          route.params.data.serviceType.indexOf("8") !== -1
          ? true
          : route.params.type == "client" ||
            route.params.type == "source_client"
            ? true
            : false,
    },
  ]);

  const [buyerTypeID, setBuyerTypeID] = useState(0);
  const [BTRadioButtons, setBTRadioButtons] = useState([
    {
      id: "1", // acts as primary key, should be unique and non-empty string
      label: "PREMIUM",
      selected: false,
      value: "1",
    },
    {
      id: "2",
      label: "GOLD",
      selected: false,
      value: "2",
    },
    {
      id: "3",
      label: "SILVER",
      selected: false,
      value: "3",
    },
  ]);

  function onPressBTRadioButton(radioButtonsArray) {

    setBTRadioButtons(radioButtonsArray);
    // setIsBuyerCategoryError(false);
    // radioButtonsArray.map((r) => {
    //   if (r.selected === true) {
    //     setBuyerTypeID(r.value);
    //   }
    // });
  }

  const [serviceTypeInvalid, setServiceTypeInvalid] = useState(false);

  const [checked, setChecked] = React.useState(
    route.params.type === "edit" ? route.params.data.display : true
  );

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [isDealer, setIsDealer] = React.useState(false);
  const [isBT, setIsBT] = React.useState(false);
  const [isServiceProvideOnlyClient, setIsServiceProvideOnlyClient] =
    React.useState(false);
  const [isBuyerCategoryError, setIsBuyerCategoryError] = React.useState(false);

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      Sess_CompanyAdmin_UserRefno = JSON.parse(userData).Sess_CompanyAdmin_UserRefno;
      Sess_company_refno = JSON.parse(userData).Sess_company_refno;
      Sess_branch_refno = JSON.parse(userData).Sess_branch_refno;
      Sess_group_refno = JSON.parse(userData).Sess_group_refno;
      Sess_group_refno_extra_1 = JSON.parse(userData).Sess_group_refno_extra_1;
      Sess_CompanyAdmin_group_refno = JSON.parse(userData).Sess_CompanyAdmin_group_refno;
      Sess_designation_refno = JSON.parse(userData).Sess_designation_refno;

      if (
        JSON.parse(userData).Sess_group_refno ==
        projectLoginTypes.DEF_DEALER_GROUP_REFNO
      ) {
        setIsDealer(true);
        FetchBuyerCategory();
        if (
          route.params != null &&
          (route.params.type == "client" ||
            route.params.type == "source_client")
        ) {
          setIsServiceProvideOnlyClient(true);
        }
        FetchReferences();
      } else {
        setIsDealer(false);
      }

      FetchStates();
    }
  };

  const FetchBuyerCategory = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.BuyerCategoryDiscountDealerBrandSetup,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let buyerCat = [];
            response.data.data.map((data) => {
              if (
                route.params.type === "edit" &&
                route.params.data.buyerCategoryName != "" &&
                route.params.data.buyerCategoryName == data.buyercategory_name
              ) {
                setBuyerTypeID(data.buyercategory_refno);
              }

              buyerCat.push({
                id: data.buyercategory_refno,
                label: data.buyercategory_name,
                selected:
                  route.params.type === "edit" &&
                    route.params.data.buyerCategoryName != "" &&
                    route.params.data.buyerCategoryName == data.buyercategory_name
                    ? true
                    : false,
                value: data.buyercategory_refno,
              });
            });

            setBTRadioButtons(buyerCat);

            if (route.params.type === "edit") {
              if (route.params.data.serviceType.includes("8")) {
                setIsServiceProvideOnlyClient(true);
                setIsBT(false);
              }
            }
          } else {
            setIsBT(true);
          }
        } else {
          setIsBT(true);
        }
      })
      .catch((e) => { });
  };

  const FetchReferences = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: Sess_company_refno.toString(),
        Sess_branch_refno: Sess_branch_refno.toString(),
        Sess_designation_refno: Sess_designation_refno.toString(),
      },
    };

    Provider.createDFCommon(
      Provider.API_URLS.getreferenceby_clientcreateform,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let refData = [];

            response.data.data.map((data) => {
              refData.push({
                refer_user_refno: data.refer_user_refno,
                employee_user_refno: data.employee_user_refno,
                employee_name: data.employee_name,
                employee_designation: data.employee_designation,
                displayName:
                  data.employee_designation == ""
                    ? data.employee_name
                    : data.employee_name +
                    " (" +
                    data.employee_designation +
                    ")",
              });
            });

            setRefFullData(refData);
            const ref = refData.map((data) => data.displayName);
            setRefData(ref);
            if (route.params.type === "edit") {

              let d = refData.find((el) => {
                return (
                  el.refer_user_refno === route.params.data.refer_user_refno
                );
              });

              if (d != null) {
                setRefName(d.displayName);
              }
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchStates = () => {
    Provider.createDFCommon(Provider.API_URLS.GetStateDetails)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setStatesFullData(response.data.data);
            const states = response.data.data.map((data) => data.stateName);
            setStatesData(states);
            if (route.params.type === "edit") {
              FetchCities(route.params.data.stateName, response.data.data);
            }
          }
        }
      })
      .catch((e) => { });
  };

  const FetchCities = (stateName, stateData) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        state_refno: stateData
          ? stateData.find((el) => {
            return el.stateName === stateName;
          }).stateID
          : statesFullData.find((el) => {
            return el.stateName === stateName;
          }).stateID,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.GetDistrictDetailsByStateRefno,
      params
    )
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            response.data.data = APIConverter(response.data.data);
            setCityFullData(response.data.data);
            const cities = response.data.data.map((data) => data.cityName);
            setCityData(cities);
          }
        }
      })
      .catch((e) => { });
  };

  useEffect(() => {
    if (route.params.type !== "edit") {
      setCompanyName("");
      setContactName("");
      setContactNumber("");
      setAddress("");
      setStateName("");
      setCityName("");
      setPincode("");
      setGSTNumber("");
      setPANNumber("");
      setCompanyNameInvalid(false);
      setContactNameInvalid(false);
      setContactNumberInvalid(false);
      setAddressInvalid(false);
      setSNError(false);
      setCNError(false);
      setPincodeInvalid(false);
      setGSTNumberInvalid(false);
      setPANNumberInvalid(false);
      setServiceTypeInvalid(false);
    }

    GetUserID();
  }, []);

  const onCompanyNameChanged = (tex) => {
    const text = tex.replace(/[^a-zA-Z\s]/g, "");
    setCompanyName(text);
    setCompanyNameInvalid(false);
  };
  const onContactNameChanged = (tex) => {
    const text = tex.replace(/[^a-zA-Z\s]/g, "");
    setContactName(text);
    setContactNameInvalid(false);
  };
  const onContactNumberChanged = (text) => {
    setContactNumber(text);
    setContactNumberInvalid(false);
  };
  const onAddressChanged = (text) => {
    setAddress(text);
    setAddressInvalid(false);
  };

  const onRefSelected = (selectedItem) => {
    setRefName(selectedItem);
    setRefError(false);
  };

  const onStateNameSelected = (selectedItem) => {
    setStateName(selectedItem);
    setSNError(false);
    cityRef.current.reset();
    setCityName("");
    FetchCities(selectedItem);
  };
  const onCityNameSelected = (selectedItem) => {
    setCityName(selectedItem);
    setCNError(false);
  };
  const onPincodeChanged = (text) => {
    setPincode(text);
    setPincodeInvalid(false);
  };
  const onGSTNumberChanged = (text) => {
    setGSTNumber(text);
    setGSTNumberInvalid(false);
  };
  const onPANNumberChanged = (text) => {
    setPANNumber(text);
    setPANNumberInvalid(false);
  };

  const InsertData = () => {
    let arrServiceTypeRole = [];
    serviceTypeRoles.map((k) => {
      if (k.isChecked) {
        if (k.title === "Vendor") {
          arrServiceTypeRole.push("14");
        } else if (k.title === "Supplier") {
          arrServiceTypeRole.push("13");
        } else if (k.title === "Client") {
          arrServiceTypeRole.push("8");
        }
      }
    });
    const params = {
      data: {
        Sess_UserRefno: userID,
        Sess_CompanyAdmin_UserRefno: Sess_CompanyAdmin_UserRefno,
        Sess_company_refno: Sess_company_refno.toString(),
        Sess_branch_refno: Sess_branch_refno.toString(),
        Sess_group_refno: Sess_group_refno.toString(),
        Sess_group_refno_extra_1: Sess_group_refno_extra_1.toString(),
        Sess_CompanyAdmin_group_refno: Sess_CompanyAdmin_group_refno.toString(),
        company_name: companyName,
        contact_person: contactName,
        contact_person_mobile_no: contactNumber,
        address: address,
        state_refno: statesFullData.find((el) => {
          return el.stateName && el.stateName === stateName;
        }).stateID,
        district_refno: cityFullData.find((el) => {
          return el.cityName && el.cityName === cityName;
        }).cityID,
        pincode: pincode,
        gst_no: gstNumber,
        pan_no: panNumber,
        client_role_refno: arrServiceTypeRole,
        buyercategory_refno: buyerTypeID,
        view_status: checked ? "1" : "0",
      },
    };

    if (isDealer) {
      params.data.refer_user_refno = refFullData.find((el) => {
        return el.displayName && el.displayName === refName;
      }).refer_user_refno;
    } else {
      params.data.refer_user_refno = "0";
    }
    Provider.createDFCommon(Provider.API_URLS.ClientCreate, params)
      .then((response) => {
        if (response.data && response.data.code === 200) {
          if (
            route.params.type == "source_client" ||
            route.params.type == "expenses_client"
          ) {
            route.params.fetchClientList();
            navigation.goBack();
          } else {
            route.params.fetchData("add");
            navigation.goBack();
          }
        } else {
          setSnackbarText(communication.InsertError);
          setSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };

  const UpdateData = () => {
    let arrServiceTypeRole = [];
    serviceTypeRoles.map((k) => {
      if (k.isChecked) {
        if (k.title === "Vendor") {
          arrServiceTypeRole.push("14");
        } else if (k.title === "Supplier") {
          arrServiceTypeRole.push("13");
        } else if (k.title === "Client") {
          arrServiceTypeRole.push("8");
        }
      }
    });
    const params = {
      data: {
        client_user_refno: route.params.data.client_user_refno,
        Sess_UserRefno: userID,
        company_name: companyName,
        contact_person: contactName,
        contact_person_mobile_no: contactNumber,
        address: address,
        state_refno:
          stateName == null
            ? 0
            : statesFullData.find((el) => {
              return el.stateName && el.stateName === stateName;
            }).stateID,
        district_refno: cityFullData.find((el) => {
          return el.cityName && el.cityName === cityName;
        }).cityID,
        pincode: pincode,
        gst_no: gstNumber,
        pan_no: panNumber,
        client_role_refno: arrServiceTypeRole,
        buyercategory_refno: buyerTypeID,
        view_status: checked ? "1" : "0",
      },
    };

    if (isDealer) {
      params.data.refer_user_refno = refFullData.find((el) => {
        return el.displayName && el.displayName === refName;
      }).refer_user_refno;
    } else {
      params.data.refer_user_refno = "0";
    }

    Provider.createDFCommon(Provider.API_URLS.ClientUpdate, params)
      .then((response) => {
        if (
          response.data &&
          response.data.code === 200 &&
          response.data.data.Updated == 1
        ) {
          route.params.fetchData("update");
          navigation.goBack();
        } else {
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setIsButtonLoading(false);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const ValidateData = () => {
    let isValid = true;
    if (companyName.length === 0) {
      setCompanyNameInvalid(true);
      isValid = false;
    }
    if (contactNumber.length === 0) {
      setContactNumberInvalid(true);
      isValid = false;
    }

    if (isDealer) {
      const objrefBy = refFullData.find((el) => {
        return el.displayName && el.displayName === refName;
      });
      if (refName == null || refName.length === 0 || !objrefBy) {
        setRefError(true);
        isValid = false;
      }
    }

    if (addedBy == false) {
      if (address.length === 0) {
        setAddressInvalid(true);
        isValid = false;
      }
      const objState = statesFullData.find((el) => {
        return el.stateName && el.stateName === stateName;
      });
      if (stateName == null || stateName.length === 0 || !objState) {
        setSNError(true);
        isValid = false;
      }
      const objCity = cityFullData.find((el) => {
        return el.cityName && el.cityName === cityName;
      });
      if (cityName == null || cityName.length === 0 || !objCity) {
        setCNError(true);
        isValid = false;
      }
    }

    if (isDealer && isServiceProvideOnlyClient) {
      if (buyerTypeID == 0) {
        isValid = false;
        setIsBuyerCategoryError(true);
      }
    }

    const objServiceTypeRoles = serviceTypeRoles.find((el) => {
      return el.isChecked;
    });
    if (!objServiceTypeRoles) {
      setServiceTypeInvalid(true);
      isValid = false;
    }

    if (isDealer && refName == "") {
      setRefError(true);
      isValid = false;
    }

    if (isValid) {
      setIsButtonLoading(true);
      if (route.params.type === "edit") {
        UpdateData();
      } else {
        InsertData();
      }
    }
  };

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor, { marginBottom: 64 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[Styles.paddingHorizontal16, Styles.paddingTop16]}>
          {isDealer && (
            <>
              <Dropdown
                label="Reference By"
                data={refData}
                onSelected={onRefSelected}
                isError={errorRef}
                selectedItem={refName}
              />
              <HelperText type="error" visible={errorRef}>
                Please select reference
              </HelperText>
            </>
          )}

          <TextInput
            ref={companyNameRef}
            disabled={addedBy}
            mode="flat"
            dense
            label="Name / Company Name"
            value={companyName}
            returnKeyType="next"
            onSubmitEditing={() => contactNameRef.current.focus()}
            onChangeText={onCompanyNameChanged}
            style={{ backgroundColor: "white" }}
            error={companyNameInvalid}
          />
          <HelperText type="error" visible={companyNameInvalid}>
            {communication.InvalidCompanyName}
          </HelperText>
          <TextInput
            ref={contactNameRef}
            disabled={addedBy}
            mode="flat"
            dense
            label="Contact Person"
            value={contactName}
            returnKeyType="next"
            onSubmitEditing={() => contactNumberRef.current.focus()}
            onChangeText={onContactNameChanged}
            style={{ backgroundColor: "white" }}
            error={contactNameInvalid}
          />
          <HelperText type="error" visible={contactNameInvalid}>
            {communication.InvalidContactPerson}
          </HelperText>
          <TextInput
            ref={contactNumberRef}
            disabled={addedBy}
            mode="flat"
            dense
            keyboardType="number-pad"
            maxLength={10}
            label="Contact Mobile No."
            value={contactNumber}
            returnKeyType="next"
            onSubmitEditing={() => addressRef.current.focus()}
            onChangeText={onContactNumberChanged}
            style={{ backgroundColor: "white" }}
            error={contactNumberInvalid}
          />
          <HelperText type="error" visible={contactNumberInvalid}>
            {communication.InvalidContactMobileNo}
          </HelperText>
          <TextInput
            ref={addressRef}
            disabled={addedBy}
            mode="flat"
            dense
            label="Address"
            value={address}
            returnKeyType="next"
            onSubmitEditing={() => pincodenRef.current.focus()}
            onChangeText={onAddressChanged}
            style={{ backgroundColor: "white" }}
            error={addressInvalid}
          />
          <HelperText type="error" visible={addressInvalid}>
            {communication.InvalidAddress}
          </HelperText>
          <Dropdown
            label="State"
            data={statesData}
            forceDisable={addedBy}
            onSelected={onStateNameSelected}
            isError={errorSN}
            selectedItem={stateName}
          />
          <HelperText type="error" visible={errorSN}>
            {communication.InvalidState}
          </HelperText>
          <Dropdown
            label="City"
            data={cityData}
            forceDisable={addedBy}
            onSelected={onCityNameSelected}
            isError={errorCN}
            selectedItem={cityName}
            reference={cityRef}
          />
          <HelperText type="error" visible={errorCN}>
            {communication.InvalidCity}
          </HelperText>
          <TextInput
            ref={pincodenRef}
            mode="flat"
            disabled={addedBy}
            dense
            keyboardType="number-pad"
            maxLength={6}
            label="Pincode"
            value={pincode}
            returnKeyType="next"
            onSubmitEditing={() => gstNumberRef.current.focus()}
            onChangeText={onPincodeChanged}
            style={{ backgroundColor: "white" }}
            error={pincodeInvalid}
          />
          <HelperText type="error" visible={pincodeInvalid}>
            {communication.InvalidPincode}
          </HelperText>
          <TextInput
            ref={gstNumberRef}
            mode="flat"
            disabled={addedBy}
            maxLength={15}
            dense
            label="GST No."
            value={gstNumber}
            returnKeyType="next"
            onSubmitEditing={() => panNumberRef.current.focus()}
            onChangeText={onGSTNumberChanged}
            style={{ backgroundColor: "white" }}
            error={gstNumberInvalid}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <HelperText type="error" visible={gstNumberInvalid}>
            {communication.InvalidGSTNo}
          </HelperText>
          <TextInput
            ref={panNumberRef}
            mode="flat"
            disabled={addedBy}
            dense
            maxLength={10}
            label="PAN No."
            value={panNumber}
            returnKeyType="done"
            onChangeText={onPANNumberChanged}
            style={{ backgroundColor: "white" }}
            error={panNumberInvalid}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <HelperText type="error" visible={panNumberInvalid}>
            {communication.InvalidPANNo}
          </HelperText>
          <Subheading style={{ paddingTop: 24, fontWeight: "bold" }}>
            Service Provider Roles
          </Subheading>
          <View style={[Styles.flexRow]}>
            {serviceTypeRoles.map((k, i) => {
              return (
                <View key={i} style={[Styles.flex1]}>
                  <Checkbox.Item
                    label={k.title}
                    position="leading"
                    style={[Styles.paddingHorizontal0]}
                    labelStyle={[
                      Styles.textLeft,
                      Styles.paddingStart4,
                      Styles.fontSize14,
                    ]}
                    color={theme.colors.primary}
                    status={k.isChecked ? "checked" : "unchecked"}
                    onPress={() => {
                      let temp = serviceTypeRoles.map((u) => {
                        if (k.title === u.title) {
                          if (
                            k.title === u.title &&
                            u.title.toLowerCase() == "client" &&
                            !u.isChecked
                          ) {
                            setIsServiceProvideOnlyClient(true);
                          } else {
                            if (
                              k.title === u.title &&
                              u.title.toLowerCase() == "client" &&
                              u.isChecked
                            ) {
                              setIsServiceProvideOnlyClient(false);
                            }
                          }
                          return { ...u, isChecked: !u.isChecked };
                        }
                        return u;
                      });
                      setServiceTypeInvalid(false);
                      setServiceTypeRoles(temp);
                    }}
                  />
                </View>
              );
            })}
          </View>
          <HelperText type="error" visible={serviceTypeInvalid}>
            {communication.InvalidServiceTypeRole}
          </HelperText>

          {isDealer && isServiceProvideOnlyClient && (
            <>
              <Subheading style={{ paddingTop: 8, fontWeight: "bold" }}>
                Select Customer / Buyer Type
              </Subheading>
              {!isBT ? (
                <View>
                  <RadioGroup
                    containerStyle={[Styles.marginTop16]}
                    layout="row"
                    radioButtons={BTRadioButtons}
                    onPress={setBuyerTypeID}
                    selectedId={buyerTypeID}
                    isError
                  />
                  <HelperText type="error" visible={isBuyerCategoryError}>
                    Please select buyer category
                  </HelperText>
                </View>
              ) : (
                <Subheading style={[Styles.errorColor]}>
                  Please Create Buyer Category
                </Subheading>
              )}
            </>
          )}

          <View style={{ width: 160 }}>
            <Checkbox.Item
              label="Display"
              position="leading"
              style={[Styles.paddingHorizontal0]}
              labelStyle={[Styles.textLeft, Styles.paddingStart4]}
              color={theme.colors.primary}
              status={checked ? "checked" : "unchecked"}
              onPress={() => setChecked(!checked)}
            />
          </View>
        </View>
      </ScrollView>
      <View
        style={[
          Styles.backgroundColor,
          Styles.width100per,
          Styles.padding16,
          { position: "absolute", bottom: 0, elevation: 3 },
        ]}
      >
        <Card.Content>
          <DFButton
            mode="contained"
            onPress={ValidateData}
            title="SAVE"
            loader={isButtonLoading}
          />
        </Card.Content>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: theme.colors.error }}
      >
        {snackbarText}
      </Snackbar>
    </View>
    </SafeAreaView>
  );
};
export default AddClientScreen;