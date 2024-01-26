
import * as React from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator,TransitionPresets} from '@react-navigation/native-stack';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import Forgetpassword from './src/screens/ForgetPassword';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonComponent from './src/components/Button';

const Stack = createNativeStackNavigator();



function HomeScreen({navigation,loginUser}) {

   const LogoutUser = async () => {
     try {
       await AsyncStorage.removeItem('user');
       loginUser();
     } catch (error) {
       console.log(error);
     }
   };

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Home Screen</Text>
      <ButtonComponent text={'Logout'} onPress={LogoutUser} />
    </View>
  );
}

function App({navigation}) {
  const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);

  React.useEffect(() => {
    // Check if the user is logged in during app startup
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        // User is logged in, navigate to home screen
        setIsUserLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking user login status:', error);
    }
  };

  const loginUser = () => {
    setIsUserLoggedIn(!isUserLoggedIn);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}>
        {isUserLoggedIn ? (
          // If user is logged in, show the HomeScreen
          <Stack.Screen
            name="Home"
            component={() => <HomeScreen loginUser={loginUser} />}
            options={{headerShown: false}}
          />
        ) : (
          // If user is not logged in, show the authentication screens
          <>
            <Stack.Screen
              name="Login"
              component={props => <Login {...props} loginUser={loginUser} />}
            />
            <Stack.Screen
              name="Signup"
              component={Signup}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ForgetPassword"
              component={Forgetpassword}
              options={{headerShown: false}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
