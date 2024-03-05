import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {View, ScrollView} from 'react-native';
import {
  Card,
  Checkbox,
  HelperText,
  Snackbar,
  Subheading,
  TextInput,
} from 'react-native-paper';
import Provider from '../../../../api/Provider';
import Dropdown from '../../../../components/Dropdown';
import {Styles} from '../../../../styles/styles';
import {theme} from '../../../../theme/apptheme';
import {communication} from '../../../../utils/communication';
import {APIConverter} from '../../../../utils/apiconverter';
import DFButton from '../../../../components/Button';
import RadioGroup from 'react-native-radio-buttons-group';
import {projectLoginTypes} from '../../../../utils/credentials';

let userID = 0,
  Sess_company_refno = 0,
  Sess_branch_refno = 0,
  Sess_CompanyAdmin_UserRefno = 0,
  Sess_designation_refno = 0;

const AddTransportationScreen = ({route, navigation}) => {
  let addedBy = false;
  if (route.params.data) {
    addedBy = route.params.data.addedBy;
  }

  const [transporterName, setTransporterName] = useState(
    route.params.type === 'edit' ? route.params.data.data.item.transport_name : '',
  );
  const [vehicleRegistrationNo, setVehicleRegistrationNo] = useState(
    route.params.type === 'edit' ? route.params.data.data.item.vehicle_registration_no : '',
  );
    const [vehicleRegistrationNoInvalid, setVehicleRegistrationNoInvalid] = useState(false);
  const vehicleRegistrationNumberRef = useRef({});
  const [driverName, setDrivername] = useState(
    route.params.type === 'edit' ? route.params.data.data.item.driver_name : '',
  );
   const [driverNameInvalid, setDriverNameInvalid] = useState(false);
  const driverNameRef = useRef({});
  const [driverLicenseNo, setDriverLicenseNo] = useState(
    route.params.type === 'edit' ? route.params.data.data.item.driver_licence_no : '',
  );
  const [driverLicenseNoInvalid, setDriverLicenseNoInvalid] = useState(false);
  const driverLicenseNumberRef = useRef({});
  const [companyNameInvalid, setCompanyNameInvalid] = useState(false);
  const companyNameRef = useRef({});

  const [contactName, setContactName] = useState(
    route.params.type === 'edit' ? route.params.data.contactPerson : '',
  );
  const [contactNameInvalid, setContactNameInvalid] = useState(false);
  const contactNameRef = useRef({});

  const [contactNumber, setContactNumber] = useState(
    route.params.type === 'edit' ? route.params.data.data.item.mobile_no : '',
  );
  const [contactNumberInvalid, setContactNumberInvalid] = useState(false);
  const contactNumberRef = useRef({});

  const [address, setAddress] = useState(
    route.params.type === 'edit' ? route.params.data.data.item.address : '',
  );
  const [addressInvalid, setAddressInvalid] = useState('');
  const addressRef = useRef({});

  const [cityFullData, setCityFullData] = React.useState([]);
  const [cityData, setCityData] = React.useState([]);
  const [cityName, setCityName] = React.useState(
    route.params.type === 'edit' ? route.params.data.cityName : '',
  );
  const [errorCN, setCNError] = React.useState(false);
  const cityRef = useRef({});

  const [statesFullData, setStatesFullData] = React.useState([]);
  const [statesData, setStatesData] = React.useState([]);
  const [stateName, setStateName] = React.useState(
    route.params.type === 'edit' ? route.params.data.stateName : '',
  );
  const [errorSN, setSNError] = React.useState(false);

    const [branchFullData, setBranchFullData] = React.useState([]);
  const [branchData, setBranchData] = React.useState([]);
  const [branchName, setBranchName] = React.useState(
    route.params.type === 'edit' ? route.params.data.data.item.branch_name : '',
  );
  const [refFullData, setRefFullData] = React.useState([]);
  const [refData, setRefData] = React.useState([]);
  const [refName, setRefName] = React.useState(
    route.params.type === 'edit' ? route.params.data.stateName : '',
  );
  const [errorRef, setRefError] = React.useState(false);

  const [pincode, setPincode] = useState(
    route.params.type === 'edit' ? route.params.data.data.item.pincode : '',
  );
  const [pincodeInvalid, setPincodeInvalid] = useState(false);
  const pincodenRef = useRef({});

  const [gstNumber, setGSTNumber] = useState(
    route.params.type === 'edit' ? route.params.data.gstNumber : '',
  );
  const [gstNumberInvalid, setGSTNumberInvalid] = useState(false);
  const gstNumberRef = useRef({});

  const [panNumber, setPANNumber] = useState(
    route.params.type === 'edit' ? route.params.data.pan : '',
  );
  const [panNumberInvalid, setPANNumberInvalid] = useState(false);
  const panNumberRef = useRef({});

  const [serviceTypeRoles, setServiceTypeRoles] = useState([
    {
      title: 'Vendor',
      isChecked:
        route.params.type === 'edit' &&
        route.params.data.serviceType &&
        route.params.data.serviceType.indexOf('14') !== -1
          ? true
          : false,
    },
    {
      title: 'Supplier',
      isChecked:
        route.params.type === 'edit' &&
        route.params.data.serviceType &&
        route.params.data.serviceType.indexOf('13') !== -1
          ? true
          : false,
    },
    {
      title: 'Client',
      isChecked:
        route.params.type === 'edit' &&
        route.params.data.serviceType &&
        route.params.data.serviceType.indexOf('8') !== -1
          ? true
          : route.params.type == 'client' ||
            route.params.type == 'source_client'
          ? true
          : false,
    },
  ]);

  const [buyerTypeID, setBuyerTypeID] = useState(0);
  const [BTRadioButtons, setBTRadioButtons] = useState([
    {
      id: '1', // acts as primary key, should be unique and non-empty string
      label: 'PREMIUM',
      selected: false,
      value: '1',
    },
    {
      id: '2',
      label: 'GOLD',
      selected: false,
      value: '2',
    },
    {
      id: '3',
      label: 'SILVER',
      selected: false,
      value: '3',
    },
  ]);

  function onPressBTRadioButton(radioButtonsArray) {
    setBTRadioButtons(radioButtonsArray);
    setIsBuyerCategoryError(false);
    radioButtonsArray.map(r => {
      if (r.selected === true) {
        setBuyerTypeID(r.value);
      }
    });
  }

  const [serviceTypeInvalid, setServiceTypeInvalid] = useState(false);

  const [checked, setChecked] = React.useState(
    route.params.type === 'edit' ? route.params.data.data.item.view_status===1 ? true : false : true,
  );

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState('');

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [isDealer, setIsDealer] = React.useState(false);
  const [isBT, setIsBT] = React.useState(false);
  const [isServiceProvideOnlyClient, setIsServiceProvideOnlyClient] =
    React.useState(false);
  const [isBuyerCategoryError, setIsBuyerCategoryError] = React.useState(false);

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      console.log('Session Data:', userData);
      userID = JSON.parse(userData).UserID;
      Sess_CompanyAdmin_UserRefno =
        JSON.parse(userData).Sess_CompanyAdmin_UserRefno;
      Sess_company_refno = JSON.parse(userData).Sess_company_refno;
      Sess_branch_refno = JSON.parse(userData).Sess_branch_refno;
      Sess_designation_refno = JSON.parse(userData).Sess_designation_refno;

      if (
        JSON.parse(userData).Sess_group_refno ==
        projectLoginTypes.DEF_DEALER_GROUP_REFNO
      ) {
        setIsDealer(true);
        FetchBuyerCategory();
        if (
          route.params != null &&
          (route.params.type == 'client' ||
            route.params.type == 'source_client')
        ) {
          setIsServiceProvideOnlyClient(true);
        }
        FetchReferences();
      } else {
        setIsDealer(false);
      }

      FetchStates();
      FetchBranch();
    }
  };

  const FetchBuyerCategory = () => {
    console.log(route?.params?.data);
    let params = {
      data: {
        Sess_UserRefno: userID,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.BuyerCategoryDiscountDealerBrandSetup,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let buyerCat = [];
            response.data.data.map(data => {
              if (
                route.params.type === 'edit' &&
                route.params.data.buyerCategoryName != '' &&
                route.params.data.buyerCategoryName == data.buyercategory_name
              ) {
                setBuyerTypeID(data.buyercategory_refno);
              }

              buyerCat.push({
                id: data.buyercategory_refno,
                label: data.buyercategory_name,
                selected:
                  route.params.type === 'edit' &&
                  route.params.data.buyerCategoryName != '' &&
                  route.params.data.buyerCategoryName == data.buyercategory_name
                    ? true
                    : false,
                value: data.buyercategory_refno,
              });
            });

            setBTRadioButtons(buyerCat);

            if (route.params.type === 'edit') {
              if (route.params.data.serviceType.includes('8')) {
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
      .catch(e => {});
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
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let refData = [];
            response.data.data.map(data => {
              refData.push({
                refer_user_refno: data.refer_user_refno,
                employee_user_refno: data.employee_user_refno,
                employee_name: data.employee_name,
                employee_designation: data.employee_designation,
                displayName:
                  data.employee_designation == ''
                    ? data.employee_name
                    : data.employee_name +
                      ' (' +
                      data.employee_designation +
                      ')',
              });
            });

            setRefFullData(refData);
            const ref = refData.map(data => data.displayName);
            setRefData(ref);
            if (route.params.type === 'edit') {
              let d = refData.find(el => {
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
      .catch(e => {});
  };

  const FetchStates = () => {
    Provider.createDFCommon(Provider.API_URLS.GetStateDetails)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            // response.data.data = APIConverter(response.data.data);
            setStatesFullData(response.data.data);
            const states = response.data.data.map(data => data.state_name);
            setStatesData(states);
            if (route.params.type === 'edit') {
              let s = response.data.data.filter(el => {
                return el.state_refno === route.params.data.data.item.state_refno;
              });
              setStateName(s[0].state_name);
              FetchCities(s[0].state_name, response.data.data);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchCities = (stateName, stateData) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        state_refno: stateData
          ? stateData.find(el => {
              return el.state_name === stateName;
            }).state_refno
          : statesFullData.find(el => {
              return el.state_name === stateName;
            }).state_refno,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.GetDistrictDetailsByStateRefno,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            // response.data.data = APIConverter(response.data.data);
            setCityFullData(response.data.data);
            const cities = response.data.data.map(data => data.district_name);
            setCityData(cities);
            if (route.params.type === 'edit') {
              let s = response.data.data.filter(el => {
                return el.district_refno === route.params.data.data.item.district_refno;
              });
              setCityName(s[0].district_name);
              FetchCities(s[0].district_name, response.data.data);
            }
          }
        }
      })
      .catch(e => {});
  };

  const FetchBranch = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: Sess_company_refno.toString(),
        Sess_branch_refno: Sess_branch_refno.toString(),
      },
    };
    Provider.createDFCommon( 
      Provider.API_URLS.get_branchname_transportationform,
      params,
    )
      .then(response => {
        console.log('branch data------->',response.data.data)
        if (response.data && response.data.code === 200) {

        console.log('Step 1------->');
          if (response.data) {
            setBranchFullData(response.data.data);

            if (route.params.type === 'edit') {
              let s = response.data.data.filter(el => {
                return el.Sess_branch_name === route.params.data.data.item.branch_name;
              });
              setBranchName(response.data.data.Sess_branch_name);
            }
            setBranchName(response.data.data.Sess_branch_name);
          }
        }
      })
      .catch(e => {});
  };
  useEffect(() => {
    if (route.params.type !== 'edit') {
      setTransporterName('');
      setContactName('');
      setContactNumber('');
      setAddress('');
      setStateName('');
      setCityName('');
      setPincode('');
      setGSTNumber('');
      setPANNumber('');
      setCompanyNameInvalid(false);
      setContactNameInvalid(false);
      setDriverNameInvalid(false);
      setDriverLicenseNoInvalid(false);
      setContactNumberInvalid(false);
      setVehicleRegistrationNoInvalid(false);
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

  const onCompanyNameChanged = tex => {
    const text = tex.replace(/[^a-zA-Z\s]/g, '');
    setTransporterName(text);
    setCompanyNameInvalid(false);
  };
  const onVehicleNumberChanged = tex => {
    // const text = tex.replace(/[^a-zA-Z\s]/g, '');
    setVehicleRegistrationNo(tex);
    setVehicleRegistrationNoInvalid(false);
  };
  const onDriverNameChanged = tex => {
    const text = tex.replace(/[^a-zA-Z\s]/g, '');
    setDrivername(text);
    setDriverNameInvalid(false);
  };
  const onDriverLicenseNumberChanged = tex => {
    // const text = tex.replace(/[^a-zA-Z\s]/g, '');
    setDriverLicenseNo(tex);
    setDriverLicenseNoInvalid(false);
  };
  const onContactNumberChanged = text => {
    setContactNumber(text);
    setContactNumberInvalid(false);
  };
  const onAddressChanged = text => {
    setAddress(text);
    setAddressInvalid(false);
  };

  const onStateNameSelected = selectedItem => {
    setStateName(selectedItem);
    setSNError(false);
    cityRef.current.reset();
    setCityName('');
    FetchCities(selectedItem);
  };
  const onCityNameSelected = selectedItem => {
    setCityName(selectedItem);
    setCNError(false);
  };
  const onPincodeChanged = text => {
    setPincode(text);
    setPincodeInvalid(false);
  };

 

  const InsertData = () => {
    console.log('start:');
    const params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: Sess_company_refno.toString(),
        Sess_branch_refno: Sess_branch_refno.toString(),
        transport_name: transporterName,
        vehicle_registration_no:vehicleRegistrationNo,
        driver_name:driverName,
        driver_licence_no:driverLicenseNo,
        mobile_no: contactNumber,
        address: address,
       state_refno:stateName === "" ? "0" :  statesFullData?.find(el => {
          return el.state_name && el.state_name === stateName;
        }).state_refno,
        district_refno:cityName === "" ? "0" :  cityFullData?.find(el => {
          return el.district_name && el.district_name === cityName;
        }).district_refno,
        pincode: pincode,
        view_status: checked ? '1' : '0',
      },
    };
    console.log('params:**********', params, '*======================*');
    Provider.createDFCommon(Provider.API_URLS.transportationcreate, params)
      .then(response => {
        console.log('resp:', response.data, '============================');
        if (response.data && response.data.code === 200) {
          console.log('step 1 is---------->')
            route.params.fetchData('add');
            navigation.goBack();
        } else {
          console.log('step 2')
          setSnackbarText(communication.InsertError);
          setSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch(e => {
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };

  const UpdateData = () => {
   console.warn(stateName,cityName)
   const params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: Sess_company_refno.toString(),
        Sess_branch_refno: Sess_branch_refno.toString(),
        transport_refno:route.params.data.data.item.transport_refno,
        transport_name: transporterName,
        vehicle_registration_no:vehicleRegistrationNo,
        driver_name:driverName,
        driver_licence_no:driverLicenseNo,
        mobile_no: contactNumber,
        address: address,
       state_refno:stateName === "" || "undefined" ? "0" :  statesFullData?.find(el => {
          return el.state_name && el.state_name === stateName;
        }).state_refno,
        district_refno:cityName === "" || "undefined" ? "0" :  cityFullData?.find(el => {
          return el.district_name && el.district_name === cityName;
        }).district_refno,
        pincode: pincode,
        view_status: checked ? '1' : '0',
      },
    };

    console.log('params--------->',params)
    Provider.createDFCommon(Provider.API_URLS.transportationupdate, params)
      .then(response => {
        console.log('params', params);
        console.log('response', response.data);
        if (
          response.data &&
          response.data.code === 200 &&
          response.data.data.Updated == 1
        ) {
          route.params.fetchData('update');
          navigation.goBack();
        }
        else if(response.data.data.Updated == 0
        ){
           setSnackbarText(response.data.data.message);
          setSnackbarVisible(true);
        }
        else {
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch(e => {
        console.log(e);
        setIsButtonLoading(false);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const ValidateData = () => {
    let isValid = true;
    if (vehicleRegistrationNo.length === 0) {
      setVehicleRegistrationNoInvalid(true);
      isValid = false;
    }
    if (contactNumber.length === 0) {
      setContactNumberInvalid(true);
      isValid = false;
    }
      if (driverName.length === 0) {
      setDriverNameInvalid(true);
      isValid = false;
    }
      if (driverLicenseNo.length === 0) {
      setDriverLicenseNoInvalid(true);
      isValid = false;
    }

    

    if (isValid) {
      setIsButtonLoading(true);
      if (route.params.type === 'edit') {
        UpdateData();
      } else {
        InsertData();
      }
    }
  };

  return (
    <View style={[Styles.flex1]}>
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor, {marginBottom: 64}]}
        keyboardShouldPersistTaps="handled">
        <View style={[Styles.paddingHorizontal16, Styles.paddingTop16]}>
          <>
            <TextInput
            ref={contactNameRef}
            disabled={true}
            mode="flat"
            dense
            label="Branch Name"
            value={branchName}
            returnKeyType="next"
            onSubmitEditing={() => contactNumberRef.current.focus()}
            // onChangeText={onVehicleNumberChanged}
            style={{backgroundColor: 'white'}}
          />
            <HelperText type="error" visible={errorRef}>
              Please select reference
            </HelperText>
          </>
          <TextInput
            ref={companyNameRef}
            disabled={addedBy}
            mode="flat"
            dense
            label="Transporter Name"
            value={transporterName}
            returnKeyType="next"
            onSubmitEditing={() => contactNameRef.current.focus()}
            onChangeText={onCompanyNameChanged}
            style={{backgroundColor: 'white'}}
            error={companyNameInvalid}
          />
          <HelperText type="error" visible={companyNameInvalid}>
            {communication.InvalidCompanyName}
          </HelperText>
          <TextInput
            ref={vehicleRegistrationNumberRef}
            disabled={addedBy}
            mode="flat"
            dense
            label="Vehicle Registration No"
            value={vehicleRegistrationNo}
            returnKeyType="next"
            onSubmitEditing={() => contactNumberRef.current.focus()}
            onChangeText={onVehicleNumberChanged}
            style={{backgroundColor: 'white'}}
            error={vehicleRegistrationNoInvalid}
          />
          <HelperText type="error" visible={vehicleRegistrationNoInvalid}>
            {communication.InvalidContactPerson}
          </HelperText>
          <TextInput
            ref={driverNameRef}
            disabled={addedBy}
            mode="flat"
            dense
            label="Driver Name"
            value={driverName}
            returnKeyType="next"
            onSubmitEditing={() => contactNumberRef.current.focus()}
            onChangeText={onDriverNameChanged}
            style={{backgroundColor: 'white'}}
            error={driverNameInvalid}
          />
          <HelperText type="error" visible={driverNameInvalid}>
            {communication.InvalidContactPerson}
          </HelperText>
          <TextInput
            ref={driverLicenseNumberRef}
            disabled={addedBy}
            mode="flat"
            dense
            label="Driver License No"
            value={driverLicenseNo}
            returnKeyType="next"
            onSubmitEditing={() => contactNumberRef.current.focus()}
            onChangeText={onDriverLicenseNumberChanged}
            style={{backgroundColor: 'white'}}
            error={driverLicenseNoInvalid}
          />
          <HelperText type="error" visible={driverLicenseNoInvalid}>
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
            style={{backgroundColor: 'white'}}
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
            style={{backgroundColor: 'white'}}
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
            style={{backgroundColor: 'white'}}
            error={pincodeInvalid}
          />
          <HelperText type="error" visible={pincodeInvalid}>
            {communication.InvalidPincode}
          </HelperText>

          <View style={{width: 160}}>
            <Checkbox.Item
              label="Display"
              position="leading"
              style={[Styles.paddingHorizontal0]}
              labelStyle={[Styles.textLeft, Styles.paddingStart4]}
              color={theme.colors.primary}
              status={checked ? 'checked' : 'unchecked'}
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
          {position: 'absolute', bottom: 0, elevation: 3},
        ]}>
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
        style={{backgroundColor: theme.colors.error}}>
        {snackbarText}
      </Snackbar>
    </View>
  );
};
export default AddTransportationScreen;
