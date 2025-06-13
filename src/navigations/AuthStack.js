import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@/screens/login/LoginScreen';

const Stack = createStackNavigator();
const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName={'Login'}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
