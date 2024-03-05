import {View, Text, ScrollView} from 'react-native';
import React from 'react';
import {Styles} from '../../../../styles/styles';
import {useState} from 'react';
import {DateTimePicker} from '@hashiprobr/react-native-paper-datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Provider from '../../../../api/Provider';
import {useIsFocused} from '@react-navigation/core';
import {useEffect} from 'react';
import {
  Button,
  RadioButton,
  Subheading,
  Checkbox,
  HelperText,
  Snackbar,
} from 'react-native-paper';
import Dropdown from '../../../../components/Dropdown';
import FormInput from '../common/Input';
import {createIconSetFromFontello} from 'react-native-vector-icons';
import {theme} from '../../../../theme/apptheme';
import moment from 'moment';
import {communication} from '../../../../utils/communication';

let userID = 0,
  groupID = 0,
  companyID = 0,
  branchID = 0,
  companyAdminID = 0,
  designID = 0;
const DailyActivityForm = ({navigation, route}) => {
  const [snackbarText, setSnackbarText] = React.useState('');
  const [isSnackbarVisible, setIsSnackbarVisible] = React.useState('');
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const [entryType, setEntryType] = useState([]);
  const [companyName, setCompanyName] = useState([]);
  const [companyPerson, setCompanyPerson] = useState([]);
  const [activityType, setActivityType] = useState([]);
  const [activityStatus, setActivityStatus] = useState([]);
  const [nextVisitNo, setNextVisitNo] = useState([]);
  const [daysMonthsRefNo, setDaysMonthsRefNo] = useState([]);
  const [helpPerson, setHelpPerson] = useState([]);
  const [referenceRef, setReferenceRef] = useState([]);
  const [marketingExecName, setMarketingExecName] = useState([]);
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [showCustomerButton, setShowCustomerButton] = React.useState(false);

  const isFocused = useIsFocused();

  const [state, setState] = useState({
    activity_date: new Date(),
    activity_entry_type: 0,
    refer_user_refno: '0',
    company_name: '',
    mycustomer_refno: '',
    contact_person: '',
    mycustomer_detail_refno: '', // contact person
    contact_person: '',
    designation: '',
    mobile_no: '',
    phone_no: '',
    email_id: '',
    location_name: '',
    activity_refno: '',
    activity_status: '',
    next_visit_no: '',
    daysmonths_refno: '',
    reference_refno: '',
    from_location: '',
    to_location: '',
    total_kms: '',
    help_employee_user_refno: '',
    remarks: '',
    view_status: '1',
  });

  const [error, setError] = useState({
    activity_date: false,
    activity_entry_type: false,
    refer_user_refno: false,
    mycustomer_refno: false,
    mycustomer_detail_refno: false,
    location_name: false,
    activity_refno: false,
    activity_status: false,
  });

  const fetchEntryType = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_CompanyAdmin_UserRefno: companyAdminID,
      },
    };
    Provider.createDFEmployee(
      Provider.API_URLS.get_entrytype_employeeactivityform,
      params,
    ).then(res => {
      setEntryType(res.data?.data);
    });
  };

  const fetchActivityType = () => {
    Provider.createDFEmployee(
      Provider.API_URLS.get_activitytype_employeeactivityform,
      {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: companyID,
        },
      },
    ).then(res => setActivityType(res.data?.data));
  };

  const fetchActivityStatus = () => {
    Provider.createDFEmployee(
      Provider.API_URLS.get_activitystatus_employeeactivityform,
      {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: companyID,
        },
      },
    ).then(res => setActivityStatus(res.data?.data));
  };

  const fetchNextVisitNo = () => {
    Provider.createDFEmployee(
      Provider.API_URLS.get_nextvisitno_employeeactivityform,
      {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: companyID,
        },
      },
    ).then(res => setNextVisitNo(res.data?.data));
  };

  const fetchDaysMonthsRefNo = () => {
    Provider.createDFEmployee(
      Provider.API_URLS.get_daysmonthsrefno_employeeactivityform,
      {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: companyID,
        },
      },
    ).then(res => setDaysMonthsRefNo(res.data?.data));
  };

  const fetchReferenceRef = () => {
    Provider.createDFEmployee(
      Provider.API_URLS.get_referencerefno_employeeactivityform,
      {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: companyID,
        },
      },
    ).then(res => setReferenceRef(res.data?.data));
  };

  const fetchHelpPerson = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
      },
    };
    Provider.createDFEmployee(
      Provider.API_URLS.get_helpperson_employeeactivityform,
      params,
    ).then(res => {
      setHelpPerson(res.data?.data);
    });
  };

  const fetchMarketingExecName = () => {
    Provider.createDFEmployee(
      Provider.API_URLS.get_marketingexecutivename_employeeactivityform,
      {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: companyID,
          Sess_branch_refno: branchID,
          activity_entry_type: '2',
        },
      },
    ).then(res => setMarketingExecName(res.data?.data));
  };

  const fetchMyCompanyName = (activityType, referUserID) => {
    let url =
      activityType == 1
        ? Provider.API_URLS.get_mycustomer_companyname_employeeactivityform
        : Provider.API_URLS.get_othercustomer_companyname_employeeactivityform;
    let param = {};

    if (activityType == 1) {
      param = {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: companyID,
          activity_entry_type: activityType,
        },
      };
    } else {
      param = {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: companyID,
          refer_user_refno: referUserID,
        },
      };
    }
    Provider.createDFEmployee(url, param).then(res => {
      setCompanyName(res.data?.data);
    });
  };

  const fetchCompanyPerson = companyId => {
    if (companyId) {
      Provider.createDFEmployee(
        Provider.API_URLS.get_contactpersonname_employeeactivityform,
        {
          data: {
            Sess_UserRefno: userID,
            Sess_company_refno: companyID,
            mycustomer_refno: companyId,
          },
        },
      ).then(res => {
        let compPerson = [];
        res.data.data.map(data => {
          compPerson.push({
            mycustomer_detail_refno: data.mycustomer_detail_refno,
            displayName: `${data.contact_person} >> (${data.designation} - ${data.mobile_no})`,
          });
        });
        setCompanyPerson(compPerson);
      });
    }
  };

  const handleSubmit = (
    last_gprs_activitytrack_refno,
    locationData,
    kilometer,
  ) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        Sess_group_refno: groupID,
        Sess_designation_refno: designID,
        activity_entry_type: state.activity_entry_type,
        refer_user_refno: state.refer_user_refno,
        mycustomer_refno: state.mycustomer_refno,
        mycustomer_detail_refno: state.mycustomer_detail_refno,
        visit_location_name: state.location_name,
        activity_date_time: moment(new Date()).format('DD-MM-YYYY H:mm:ss'),
        activity_refno: state.activity_refno,
        activity_status: state.activity_status,
        next_visit_no: state.next_visit_no,
        daysmonths_refno: state.daysmonths_refno,
        reference_refno: state.reference_refno,
        help_employee_user_refno: state.help_employee_user_refno,
        activity_remarks: state.remarks,
        last_gprs_activitytrack_refno: last_gprs_activitytrack_refno,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        kilometer: kilometer,
        gprs_location_name: locationData.gprs_location_name,
      },
    };
    Provider.createDFEmployee(
      Provider.API_URLS.employee_gprs_daily_markactivity_create,
      params,
    )
      .then(response => {
        setIsButtonLoading(false);
        if (response.data && response.data.code === 200) {
          route.params.activityStatus('activity_success');
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setIsSnackbarVisible(true);
          setSnackbarColor(theme.colors.error);
        } else {
          setSnackbarText(communication.InsertError);
          setIsSnackbarVisible(true);
          setSnackbarColor(theme.colors.error);
        }
      })
      .catch(e => {
        console.log(e);
        setIsButtonLoading(false);
        setSnackbarText(communication.NetworkError);
        setIsSnackbarVisible(true);
        setSnackbarColor(theme.colors.error);
      });
  };

  const calcKm = (lat1, lon1, lat2, lon2) => {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    const km = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    return km.toFixed(4);
  };

  const validateGPS = async () => {
    setIsButtonLoading(true);

    await Provider.createDFEmployee(
      Provider.API_URLS.get_employee_last_markactivity_gprs_data,
      {
        data: {
          Sess_UserRefno: userID,
        },
      },
    )
      .then(res => {
        let kilometer = calcKm(
          res?.data?.data[0]?.latitude,
          res?.data?.data[0]?.longitude,
          route.params.data.location?.latitude,
          route.params.data.location?.longitude,
        );
        handleSubmit(
          res?.data?.data[0]?.last_gprs_activitytrack_refno,
          route.params.data.location,
          kilometer,
        );
      })
      .catch(error => {
        console.log(error);
      });
  };

  const validateSubmit = () => {
    let isValid = true;

    if (state.activity_entry_type == '') {
      isValid = false;
      setError(error => ({
        ...error,
        activity_entry_type: true,
      }));
    }

    if (state.activity_entry_type == 2 && state.refer_user_refno == '') {
      isValid = false;
      setError(error => ({
        ...error,
        refer_user_refno: true,
      }));
    }

    if (state.mycustomer_refno == '') {
      isValid = false;
      setError(error => ({
        ...error,
        mycustomer_refno: true,
      }));
    }

    if (state.mycustomer_detail_refno == '') {
      isValid = false;
      setError(error => ({
        ...error,
        mycustomer_detail_refno: true,
      }));
    }

    if (state.location_name.trim() == '') {
      isValid = false;
      setError(error => ({
        ...error,
        location_name: true,
      }));
    }

    if (state.activity_refno == '') {
      isValid = false;
      setError(error => ({
        ...error,
        activity_refno: true,
      }));
    }

    if (state.activity_status == '') {
      isValid = false;
      setError(error => ({
        ...error,
        activity_status: true,
      }));
    }

    if (isValid) {
      validateGPS();
    } else {
      setSnackbarText('Please fill all mandatory fields.');
      setIsSnackbarVisible(true);
      setSnackbarColor(theme.colors.error);
    }
  };

  const fetchUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      groupID = JSON.parse(userData).Sess_group_refno;
      designID = JSON.parse(userData).Sess_designation_refno;
      companyID = JSON.parse(userData).Sess_company_refno;
      branchID = JSON.parse(userData).Sess_branch_refno;
      companyAdminID = JSON.parse(userData).Sess_CompanyAdmin_UserRefno;

      fetchEntryType();
      fetchActivityType();
      fetchActivityStatus();
      fetchNextVisitNo();
      fetchDaysMonthsRefNo();
      fetchReferenceRef();
      fetchHelpPerson();
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchUser();
    }
  }, [isFocused]);

  return (
    <View style={[Styles.flex1, Styles.backgroundColor]}>
      <ScrollView>
        <View style={[Styles.flex1, Styles.padding16, {background: '#fff'}]}>
          {/* <DateTimePicker
            style={Styles.backgroundColorWhite}
            label="Activity Date"
            type="date"
            value={state?.activity_date}
            onChangeDate={(date) => setState({ ...state, activity_date: date })}
          /> */}

          <Subheading style={[Styles.marginBottom12]}>Entry Type</Subheading>
          <RadioButton.Group
            onValueChange={value => {
              setState({...state, activity_entry_type: value});
              if (value == 2) {
                fetchMarketingExecName();
                setShowCustomerButton(true);
              } else {
                setShowCustomerButton(false);
                fetchMyCompanyName(value);
                setMarketingExecName([]);
              }
            }}
            value={state.activity_entry_type}>
            {entryType?.map((item, idx) => (
              <RadioButton.Item
                key={idx}
                position="leading"
                style={[Styles.paddingVertical2]}
                labelStyle={[Styles.textLeft, Styles.paddingStart4]}
                label={item.activity_entry_type_name}
                value={item.activity_entry_type}
              />
            ))}
          </RadioButton.Group>
          <HelperText type="error" visible={error.activity_entry_type}>
            Please select Entry Type
          </HelperText>
          {state.activity_entry_type === 2 && (
            <>
              <FormInput
                label="Marketing Exec Name"
                type="dropdown"
                data={marketingExecName?.map(obj => obj.employee_name)}
                onChangeText={text => {
                  fetchMyCompanyName(
                    0,
                    marketingExecName.find(item => item.employee_name === text)
                      .refer_user_refno,
                  );
                  setState(state => ({
                    ...state,
                    refer_user_refno: marketingExecName.find(
                      item => item.employee_name === text,
                    ).refer_user_refno,
                  }));

                  setError(state => ({
                    ...state,
                    refer_user_refno: false,
                  }));
                }}
                value={state.refer_user_refno}
                error={error.refer_user_refno}
              />
            </>
          )}

          <View style={[Styles.flex1, Styles.marginTop16]}>
            <View
              style={[
                Styles.border1,
                Styles.borderRadius4,
                Styles.padding4,
                Styles.marginTop8,
              ]}>
              <FormInput
                label="Company Name"
                type="dropdown"
                data={companyName?.map(({company_name}) => company_name)}
                onChangeText={text => {
                  fetchCompanyPerson(
                    companyName.find(item => item.company_name === text)
                      .mycustomer_refno,
                  );
                  setState(state => ({
                    ...state,
                    mycustomer_refno: companyName.find(
                      item => item.company_name === text,
                    ).mycustomer_refno,
                  }));

                  setError(state => ({
                    ...state,
                    mycustomer_refno: false,
                  }));
                }}
                value={state.company_name}
                error={error.mycustomer_refno}
              />
              <Button
                icon={'plus'}
                mode="contained"
                style={[Styles.marginTop4]}
                disabled={showCustomerButton}
                onPress={() => {
                  navigation.navigate('EmployeeCustomerForm', {
                    type: 'newAccount',
                    fetchCompany: fetchMyCompanyName,
                  });
                }}>
                Add New Customer
              </Button>
            </View>

            <FormInput
              label="Contact Person"
              type="dropdown"
              data={companyPerson.map(({displayName}) => displayName)}
              onChangeText={text => {
                const currPerson = companyPerson.find(
                  item => item.displayName === text,
                );

                setState(state => ({
                  ...state,
                  mycustomer_detail_refno: currPerson?.mycustomer_detail_refno,
                }));

                setError(state => ({
                  ...state,
                  mycustomer_detail_refno: false,
                }));
              }}
              value={state.contact_person}
              error={error.mycustomer_detail_refno}
            />

            <FormInput
              label="Visit Location Name"
              onChangeText={text => {
                setState(state => ({
                  ...state,
                  location_name: text,
                }));

                setError(state => ({
                  ...state,
                  location_name: false,
                }));
              }}
              error={error.location_name}
              value={state.location_name}
            />

            <FormInput
              label="Activity Type"
              type="dropdown"
              data={activityType?.map(obj => obj.activity_name)}
              onChangeText={text => {
                setState(state => ({
                  ...state,
                  activity_refno: activityType.find(
                    item => item.activity_name === text,
                  ).activity_refno,
                }));

                setError(state => ({
                  ...state,
                  activity_refno: false,
                }));
              }}
              value={state.activity_refno}
              error={error.activity_refno}
            />

            <Subheading style={[Styles.marginBottom12]}>
              Activity Status
            </Subheading>
            <RadioButton.Group
              onValueChange={value => {
                setState({...state, activity_status: value});
              }}
              value={state.activity_status}>
              {activityStatus?.map((item, idx) => (
                <RadioButton.Item
                  key={idx}
                  position="leading"
                  style={[Styles.paddingVertical2]}
                  labelStyle={[Styles.textLeft, Styles.paddingStart4]}
                  label={item.activity_status_name}
                  value={item.activity_status}
                />
              ))}
            </RadioButton.Group>
            <HelperText type="error" visible={error.activity_status}>
              Please select Status
            </HelperText>
            <FormInput
              label="Next Visit No"
              type="dropdown"
              data={nextVisitNo?.map(obj => obj.next_visit_no_name)}
              onChangeText={text => {
                setState(state => ({
                  ...state,
                  next_visit_no: nextVisitNo.find(
                    item => item.next_visit_no_name === text,
                  ).next_visit_no,
                }));
              }}
              value={state.next_visit_no}
            />
            <FormInput
              label="Days/Month/Year (Next Visit No)"
              type="dropdown"
              data={daysMonthsRefNo?.map(obj => obj.daysmonths_name)}
              onChangeText={text => {
                setState(state => ({
                  ...state,
                  daysmonths_refno: daysMonthsRefNo.find(
                    item => item.daysmonths_name === text,
                  ).daysmonths_refno,
                }));
              }}
              value={state.daysmonths_refno}
            />
            <FormInput
              label="Reference Ref"
              type="dropdown"
              data={referenceRef?.map(obj => obj.reference_name)}
              onChangeText={text => {
                setState(state => ({
                  ...state,
                  reference_refno: referenceRef.find(
                    item => item.reference_name === text,
                  ).reference_refno,
                }));
              }}
              value={state.reference_refno}
            />
            {/* <FormInput
              label="Location From"
              onChangeText={(text) => {
                setState((state) => ({
                  ...state,
                  from_location: text,
                }));

              }}
              value={state.from_location}
            /> */}
            {/* <FormInput
              label="Location To"
              onChangeText={(text) => {
                setState((state) => ({
                  ...state,
                  to_location: text,
                }));


              }}
              value={state.to_location}
            /> */}
            {/* <FormInput
              label="Total KMs"
              onChangeText={(text) => {
                setState((state) => ({
                  ...state,
                  total_kms: text,
                }));

              }}
              value={state.total_kms}
              keyboardType={"number-pad"}
            /> */}
            <FormInput
              label="Help / Support Person"
              type="dropdown"
              data={helpPerson?.map(obj => obj.employee_user_name)}
              onChangeText={text => {
                setState(state => ({
                  ...state,
                  help_employee_user_refno: helpPerson.find(
                    item => item.employee_user_name === text,
                  ).employee_user_refno,
                }));
              }}
              value={state.help_employee_user_refno}
            />
            <FormInput
              label="Remarks"
              type="textarea"
              onChangeText={text => {
                setState(state => ({
                  ...state,
                  remarks: text,
                }));
              }}
              value={state.remarks}
            />
          </View>
          <Button
            onPress={validateSubmit}
            mode="contained"
            disabled={isButtonLoading}
            loading={isButtonLoading}
            style={[Styles.marginTop16, {width: '100%', alignSelf: 'center'}]}>
            Submit
          </Button>
        </View>
      </ScrollView>
      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setIsSnackbarVisible(false)}
        style={{backgroundColor: snackbarColor}}>
        {snackbarText}
      </Snackbar>
    </View>
  );
};

export default DailyActivityForm;
