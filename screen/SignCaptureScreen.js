import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated } from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

const SignCaptureScreen = () => {
    
    const cameraRef = useRef(null); // Referensi ke komponen Camera
    const [hasCameraPermission, setHasCameraPermission] = useState(null); // State untuk menyimpan status permission kamera
    const [type, setType] = useState(Camera.Constants.Type.back); // State untuk menyimpan tipe kamera (depan/belakang)
    const [image, setImage] = useState(null); // State untuk menyimpan hasil foto
    const [detectionResult, setDetectionResult] = useState(null); // State untuk menyimpan hasil deteksi
    const [countdown, setCountdown] = useState(5); // State untuk menyimpan waktu countdown
    const [showCountdown, setShowCountdown] = useState(false); // State untuk menyimpan status countdown
    const [loading, setLoading] = useState(false); // State untuk menyimpan status loading
    const loadingValue = useRef(new Animated.Value(0)).current; // Referensi ke komponen Animated

    // Meminta permission untuk mengakses kamera dan media library
    useEffect(() => {
        (async () => {
            MediaLibrary.requestPermissionsAsync();
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === "granted");
        })
    }, []);

    // Mengambil foto
    const ambilFoto = async () => {
        setShowCountdown(true);
        if (cameraRef) {
            try {
                setTimeout(async () => {
                    const data = await cameraRef.current.takePictureAsync();
                    console.log(data);
                    setImage(data.uri);
                    uploadImage(data.uri);
                }, 5000);
            }
            catch (error) {
                console.log(error);
            }
        }
    }

    // Mengubah tipe kamera
    const flipCamera = () => {
        setType(
            type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
        );
    }

    // Tampilan loading
    function LoadingScreen() {
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

    // Animasi loading
    useEffect(() => {
        Animated.loop(
            Animated.timing(loadingValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true
            })
        ).start();
    }, [loadingValue]);

    // Upload gambar ke server
    const uploadImage = async (imageUri) => {
        try {
            setLoading(true);
            const url = "http://192.168.51.246:8000/predict";
            const data = new FormData();
            data.append("sign", {
                uri: imageUri,
                type: "image/jpeg",
                name: "sign.jpg",
            });

            data.append("username", "Daniel");



            const response = await axios.post(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setDetectionResult(response.data.hasil);
            setLoading(false);
            console.log(response.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    const startCountdown = () => {
        let timer = setInterval(() => {
            if (countdown > 1) {
                setCountdown(countdown - 1);
            } else {
                clearInterval(timer);
                setShowCountdown(false);
                setCountdown(5);
            }
        }, 1000);
    };

    // Menghapus hasil deteksi
    const deteksiKembali = () => {
        setImage(null);
        setDetectionResult(null);
    }

    // Tampilan kamera
    function DetectionView() {
        return (
            <>
                <View style={styles.container}>
                    <Camera
                        ref={cameraRef}
                        style={styles.camera}
                        type={type}
                        onCameraReady={() => console.log("Camera ready")}
                        autoFocus={Camera.Constants.AutoFocus.on}
                    >
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "transparent",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    flex: 0.1,
                                    alignSelf: "flex-start",
                                    alignItems: "center",
                                    borderRadius: 100,
                                    backgroundColor: "rgba(0,0,0,0.5)",
                                    margin: 10,
                                    padding: 10,
                                }}
                                onPress={flipCamera}
                            >
                                <Icon name="camera-reverse" size={30} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 0.1,
                                    alignSelf: "flex-start",
                                    alignItems: "center",
                                    borderRadius: 100,
                                    backgroundColor: "rgba(0,0,0,0.5)",
                                    margin: 10,
                                    padding: 10,
                                }}
                            >
                                <Text style={{ color: "white" }}>{showCountdown ? countdown : ""}</Text>
                            </TouchableOpacity>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "transparent",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "flex-end",
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    flex: 0.5,
                                    alignSelf: "flex-end",
                                    alignItems: "center",
                                    borderRadius: 100,
                                    backgroundColor: "rgba(0,0,0,0.5)",
                                    margin: 10,
                                    padding: 10,
                                }}
                                onPress={ambilFoto}
                            >
                                <Icon name="scan" size={30} color="white" />
                                <Text style={{ color: "white" }}>
                                    {"Deteksi Gambar"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Camera>
                </View>
            </>
        );
    }

    // Tampilan hasil deteksi
    function ResultView() {
        return (
            <>
                <View style={styles.container}>
                    <ScrollView style={styles.imageScrollView}>
                        <Image source={{ uri: image }} style={styles.image} />

                        {
                            detectionResult !== null ?
                                <>
                                    <View style={styles.textRow}>
                                        <Text style={styles.titleText}>{"Hasil Deteksi"}
                                        </Text>
                                        <Text style={styles.resultText}>{detectionResult.sebelum_normalisasi}
                                        </Text>
                                    </View>
                                </>
                                : null
                        }
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "transparent",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "flex-start",
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    flex: 0.5,
                                    alignSelf: "flex-start",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 100,
                                    backgroundColor: "black",
                                    margin: 10,
                                    padding: 10,
                                    flexDirection: "row",
                                }}
                                onPress={deteksiKembali}
                            >
                                <Text style={styles.buttonText}>{"Kembali"}</Text>
                                <Icon name="camera-reverse" size={30} color="white" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </>
        );
    }

    return (
        <>
            {
                detectionResult === null
                    ?
                    loading === true
                        ?
                        <LoadingScreen />
                        :
                        <DetectionView />
                    :
                    <ResultView />
            }
        </>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 0.2,
        backgroundColor: "transparent",
        flexDirection: "row",
        justifyContent: "center",
        margin: 20,
        height: 30,
    },
    button: {
        flex: 0.5,
        alignItems: "center",
    },
    text: {
        fontSize: 18,
        color: "black",
    },
    buttonTakePicture: {
        flex: 0.5,
        alignItems: "center",
        backgroundColor: "transparent",
    },
    buttonFlipCamera: {
        flex: 0.5,
        alignItems: "center",
        backgroundColor: "transparent",
    },
    imageScrollView: {
        flex: 1,
        backgroundColor: "#fff",
    },
    image: {
        flex: 1,
        aspectRatio: 1,
        resizeMode: "contain",
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
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

});

export default SignCaptureScreen;
