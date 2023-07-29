import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import axios from 'axios';
import Icon from "react-native-vector-icons/Ionicons";

export default function SignRecordingScreen() {
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [recording, setRecording] = useState(false);
    const [videoResult, setVideoResult] = useState(null);
    const [detectionResult, setDetectionResult] = useState(null);
    const cameraRef = useRef(null);
    const loadingValue = useRef(new Animated.Value(0)).current;

    const retakeButtonStyle = [styles.button, { alignSelf: 'flex-end' }]

    useEffect(() => {
        (async () => {
            if (hasPermission === null) {
                const { status } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(status === 'granted');
            }
        })();
    }, [hasPermission]);

    const startRecording = async () => {
        if (cameraRef) {
            try {

                setRecording(true);

                const video = await cameraRef.current.recordAsync(
                    {
                        quality: Camera.Constants.VideoQuality['1080p'],
                        mute: true
                    }
                );

                console.log(video);
                setVideoResult(video);
                detectionRecord(video.uri);
            }
            catch (err) {
                console.log(err);
            }
        }
    }

    const detectionRecord = async (uriViedo) => {
        const formData = new FormData();
        formData.append('sign', {
            uri: uriViedo,
            type: 'video/mp4',
            name: 'sign.mp4'
        });

        formData.append('username', 'Daniel');

        const res = await axios.post('http://192.168.100.46:8000/predict', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        setDetectionResult(res.data.hasil);

        console.log(res.data);
    }

    const flipCamera = async () => {
        await cameraRef.current.resumePreview();

        setType(
            type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
        );
    }

    const refreshCamera = async () => {
        setHasPermission(null);
    }


    const stopRecording = () => {
        cameraRef.current.stopRecording();
        setRecording(false);
    }

    const retakeVideo = () => {
        setVideoResult(null);
        setDetectionResult(null);
    }

    function LoadingScreen(){
        return (
            <View style={styles.loadingContainer}>
                <Animated.Image
                    source={require('../assets/loader.gif')}
                    style={{
                        margin: 10,
                        // transform: [
                        //     {
                        //         rotate: loadingValue.interpolate({
                        //             inputRange: [0, 1],
                        //             outputRange: ['0deg', '360deg']
                        //         })
                        //     }
                        // ]
                    }}
                />
            </View>
        );
    }

    useEffect(() => {
        Animated.loop(
            Animated.timing(loadingValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true
            })
        ).start();
    }, [loadingValue]);

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    if (videoResult == null) {
        const flipCameraStyle = [styles.button, { alignSelf: 'flex-start' }]
        const recordButtonStyle = [styles.button, { alignSelf: 'flex-end' }]
        const refreshButtonStyle = [styles.button, { alignSelf: 'flex-end' }]
        return (
            <View style={styles.container}>
                <Camera
                    style={styles.camera}
                    type={type} ref={cameraRef}
                    onCameraReady={() => console.log("Camera ready")}
                    autoFocus={Camera.Constants.AutoFocus.on}
                >
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={flipCameraStyle}
                            onPress={flipCamera}>
                            <Icon name="camera-reverse-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={recordButtonStyle}
                            onPress={recording ? stopRecording : startRecording}>
                            <Icon name={recording ? "stop-outline" : "videocam-outline"} size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={refreshButtonStyle}
                            onPress={refreshCamera}>
                            <Icon name="refresh-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </Camera>
            </View>
        );
    }
    else {
        return (
            <View style={styles.container}>
                {
                    detectionResult !== null ?
                        <>
                            <Video
                                source={{ uri: detectionResult.video_deteksi }}
                                rate={1.0}
                                volume={1.0}
                                isMuted={true}
                                resizeMode="cover"
                                shouldPlay
                                isLooping
                                style={styles.video}
                            />
                            <View style={styles.textRow}>
                                <Text style={styles.titleText}>{"Sebelum Normalisai"}
                                </Text>
                                <Text style={styles.resultText}>{detectionResult.sebelum_normalisasi}
                                </Text>
                            </View>
                            <View style={styles.textRow}>
                                <Text style={styles.titleText}>{"Setelah Normalisai"}
                                </Text>
                                <Text style={styles.resultText}>{detectionResult.sesudah_normalisasi}
                                </Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={retakeButtonStyle}
                                    onPress={retakeVideo}>
                                    <Text style={styles.text}> Retake </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                        : <LoadingScreen/>
                }
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    camera: {
        flex: 1
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 20
    },
    button: {
        flex: 0.3,
        alignItems: 'center',
        backgroundColor: 'black',
        borderRadius: 100,
        marginHorizontal: 10,
        padding: 10,
        borderColor: 'white',
        borderWidth: 1
    },
    text: {
        fontSize: 18,
        color: 'white'
    },
    video: {
        alignSelf: 'center',
        width: "100%",
        height: "50%"
    },
    videoDetecttionResult: {
        height: "100%",
        width: "100%"
    },
    textRow: {
        flex: 1,
        marginHorizontal: 10,
        marginVertical: 20,
    },
    resultText: {
        fontSize: 16,
        color: "black",
        textAlign: "justify",
        textAlignVertical: "center",
        marginHorizontal: 18
    },
    titleText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
        textAlign: "center",
        textAlignVertical: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        textAlignVertical: "center",
    },
    imageScrollView: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    imageContainer: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    image: {
        width: 100,
        height: 100,
        margin: 5,
    }
});