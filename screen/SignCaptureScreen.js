import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

const SignCaptureScreen = () => {
    // State
    const cameraRef = useRef(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [image, setImage] = useState(null);
    const [detectionResult, setDetectionResult] = useState(null);

    useEffect(() => {
        (async () => {
            MediaLibrary.requestPermissionsAsync();
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === "granted");
        })
    }, []);

    const ambilFoto = async () => {
        if (cameraRef) {
            try {
                const data = await cameraRef.current.takePictureAsync();
                console.log(data);
                setImage(data.uri);
                uploadImage(data.uri);
            }
            catch (error) {
                console.log(error);
            }
        }
    }

    const flipCamera = () => {
        setType(
            type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
        );
    }

    const uploadImage = async (imageUri) => {
        try {
            const url = "http://192.168.100.46:8000/predict";
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
            console.log(response.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    const deteksiKembali = () => {
        setImage(null);
        setDetectionResult(null);
    }

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
                    <DetectionView />
                    :
                    <ResultView />
            }
        </>
    );
}

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
    }

});

export default SignCaptureScreen;
