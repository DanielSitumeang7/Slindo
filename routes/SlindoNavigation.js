import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignCaptureScreen from "../screen/SignCaptureScreen";
import SignRecordingScreen from "../screen/SignRecordingScreen";
import Icon from "react-native-vector-icons/Ionicons";
import { Text } from "react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SlindoNavigation = () => {

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({route})=>{
                    return {
                        tabBarIcon: ({focused, color, size})=>{
                            let iconName;
                            // if (route.name === "Deteksi Gambar") {
                            //     iconName = focused ? "camera" : "camera-outline";
                            // }
                            switch (route.name) {
                                case "Deteksi Gambar":
                                    iconName = focused ? "camera" : "camera-outline";
                                    iconSize = focused ? 30 : size;
                                    break;
                                case "Deteksi Video":
                                    iconName = focused ? "videocam" : "videocam-outline";
                                    iconSize = focused ? 30 : size;
                                    break;
                                default:
                                    iconName = "alert-circle-outline";
                                    break;
                            }
                            return <Icon name={iconName} size={iconSize} color={color} />;
                        },
                        tabBarActiveTintColor: "tomato",
                        tabBarInactiveTintColor: "gray",
                        tabBarLabel: ({focused, color, size})=>{
                            let labelName;
                            switch (route.name) {
                                case "Deteksi Gambar":
                                    labelName = "Deteksi Gambar";
                                    labelSize = focused ? 15 : size;
                                    break;
                                case "Deteksi Video":
                                    labelName = "Deteksi Video";
                                    labelSize = focused ? 15 : size;
                                    break;
                                default:
                                    labelName = "Unknown";
                                    labelSize = focused ? 15 : size;
                                    break;
                            }
                            return <Text style={{color: color, fontSize: labelSize}}>{labelName}</Text>;
                        }
                    }
                }}
            >
                <Tab.Screen name="Deteksi Gambar" component={SignCaptureScreen} />
                <Tab.Screen name="Deteksi Video" component={SignRecordingScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );

}

export default SlindoNavigation;