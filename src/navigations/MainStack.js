import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '@/screens/home/HomeScreen';
import ScanScreen from '@/screens/scan/ScanScreen';
import ScheduleExamScreen from '@/screens/scheduleExam/ScheduleExamScreen';
import AnswerSheetScreen from '@/screens/answer/AnswerSheetScreen';
import GradesScreen from '@/screens/grades/GradesScreen';
import ReviewGradesScreen from '@/screens/reviewGrades/ReviewGradesScreen';
import EditExamScreen from '@/screens/editExam/EditExamScreen';

const Stack = createStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Scan"
        component={ScanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ScheduleExam"
        component={ScheduleExamScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AnswerSheet"
        component={AnswerSheetScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Grades"
        component={GradesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReviewGrades"
        component={ReviewGradesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditExam"
        component={EditExamScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
