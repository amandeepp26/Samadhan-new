import React from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Checkbox,
  HelperText,
  Snackbar,
  TextInput,
} from 'react-native-paper';
import Provider from '../../../api/Provider';
import {communication} from '../../../utils/communication';
import {Styles} from '../../../styles/styles';
import {theme} from '../../../theme/apptheme';
import ButtonComponent from '../../../components/Button';
import {Icon} from 'react-native-elements';
import Header from '../../../components/Header';

const AddCategory = ({route, navigation}) => {
  //#region Variables

  const [screenChecked, setScreenChecked] = React.useState(
    route.params.type === 'edit'
      ? route.params.data.view_status === '1'
        ? true
        : false
      : true,
  );
  const [apiChecked, setApiChecked] = React.useState(
    route.params.type === 'edit'
      ? route.params.data.view_status === '1'
        ? true
        : false
      : true,
  );
  const [integrationChecked, setIntegrationChecked] = React.useState(
    route.params.type === 'edit'
      ? route.params.data.view_status === '1'
        ? true
        : false
      : true,
  );

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState('');
  //#endregion

  //#region Functions

  const InsertActivityName = () => {
    Provider.createDFCommon('apiappadmin/spawu7S4urax/tYjD/groupnamecreate/', {
      data: {
        Sess_UserRefno: '2',
        group_name: activityName,
        view_status: checked ? 1 : 0,
      },
    })
      .then(response => {
        if (response.data && response.data.code === 200) {
          route.params.fetchData('add');
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.InsertError);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const UpdateActivityName = () => {
    Provider.createDFCommon('apiappadmin/spawu7S4urax/tYjD/groupnameupdate/', {
      // ID: route.params.data.id,
      // ActivityRoleName: activityName,
      // Display: checked

      data: {
        Sess_UserRefno: '2',
        group_refno: route.params.data.group_refno,
        group_name: activityName,
        view_status: checked ? 1 : 0,
      },
    })
      .then(response => {
        if (response.data && response.data.code === 200) {
          route.params.fetchData('update');
          navigation.goBack();
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setSnackbarVisible(true);
        } else {
          setSnackbarText(communication.UpdateError);
          setSnackbarVisible(true);
        }
      })
      .catch(e => {
        console.log(e);
        setSnackbarText(communication.NetworkError);
        setSnackbarVisible(true);
      });
  };

  const ValidateActivityName = () => {
    let isValid = true;
    if (activityName.length === 0) {
      setActivityNameError(true);
      isValid = false;
    }
    if (isValid) {
      if (route.params.type === 'edit') {
        UpdateActivityName();
      } else {
        InsertActivityName();
      }
    }
  };
  //#endregion

  return (
    <View style={[Styles.flex1]}>
     <Header navigation={navigation} title={"Add Category"} />
      <ScrollView
        style={[Styles.flex1, Styles.backgroundColor]}
        keyboardShouldPersistTaps="handled">
        <View style={[Styles.padding16]}>
          <View>
            <Pressable
              onPress={() => {
                setScreenChecked(!screenChecked);
              }}
              style={[
                Styles.backgroundColor,
                Styles.paddingHorizontal16,
                Styles.bordergray,
                {
                  borderRadius: 10,
                  paddingVertical: 7,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#d3d3d3',
                  elevation: 2,
                  marginHorizontal: 15,
                  marginTop: 10,
                  shadowColor: theme.colors.textDark,
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.03,
                  shadowRadius: 1,
                },
              ]}>
              <Text style={[Styles.fontSize16, {}]}>Screen Completed</Text>
              <Checkbox
                status={screenChecked ? 'checked' : 'unchecked'}
                color={theme.colors.primary}
              />
            </Pressable>

            <Pressable
              onPress={() => {
                setScreenChecked(!screenChecked);
              }}
              style={[
                Styles.backgroundColor,
                Styles.paddingHorizontal16,
                Styles.bordergray,
                {
                  borderRadius: 10,
                  paddingVertical: 7,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#d3d3d3',
                  elevation: 2,
                  marginHorizontal: 15,
                  marginTop: 10,
                  shadowColor: theme.colors.textDark,
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.03,
                  shadowRadius: 1,
                },
              ]}>
              <Text style={[Styles.fontSize16, {}]}>Api Completed</Text>
              <Checkbox
                status={apiChecked ? 'checked' : 'unchecked'}
                color={theme.colors.primary}
              />
            </Pressable>

            <Pressable
              onPress={() => {
                setScreenChecked(!screenChecked);
              }}
              style={[
                Styles.backgroundColor,
                Styles.paddingHorizontal16,
                Styles.bordergray,
                {
                  borderRadius: 10,
                  paddingVertical: 7,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#d3d3d3',
                  elevation: 2,
                  marginHorizontal: 15,
                  marginTop: 10,
                  shadowColor: theme.colors.textDark,
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.03,
                  shadowRadius: 1,
                },
              ]}>
              <Text style={[Styles.fontSize16, {}]}>Integration Completed</Text>
              <Checkbox
                status={integrationChecked ? 'checked' : 'unchecked'}
                color={theme.colors.primary}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <View
        style={[
          Styles.backgroundColor,
          Styles.width100per,
          Styles.marginTop32,
          Styles.padding16,
          {position: 'absolute', bottom: 40},
        ]}>
        <Card.Content>
          <ButtonComponent text={'Submit'} light={true} />
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

export default AddCategory;
