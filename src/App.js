import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { AuthProvider, useAuth } from './hooks/AuthContext';
import MainStack from './navigations/MainStack';
import AuthStack from './navigations/AuthStack';
import Loading from './components/Loading';

const RootStack = createStackNavigator();

const RootComponent = () => {
  const { user, authLoading } = useAuth();

  if (authLoading) {return <Loading />;}

  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="Root"
        component={user ? MainStack : AuthStack}
        options={{headerShown: false}}
      />
    </RootStack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <RootComponent />
      </AuthProvider>
    </NavigationContainer>

  );
};

export default App;
