import React, {Component} from 'react';
import {StyleSheet, View, Text, Button, Image, TouchableOpacity, AsyncStorage} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Modal from 'react-native-modal';
import TextArea from 'react-native-textarea';
import ImageResizer from 'react-native-image-resizer';
import ImgToBase64 from 'react-native-image-base64';
import SQLite from 'react-native-sqlite-storage'

export default class AddPictureModal extends Component {
    constructor(props) {
        super(props);

        const db = SQLite.openDatabase({
            name: 'Mapture.db',
            location: 'default',
            createFromLocation: '~www/Mapture.db'
        },
        () => {},
        error => {
            console.log(error);
        })

        this.state={
            db,
            add_picture: this.props.add_picture,
            location: this.props.location,
            imgSource: require('../image/photo_icon.png'),
            content: '',
            pictureX: null,
            pictureY: null,
            pictureWidth: null,
            pictureHeight: null
        }
    }

    find_dimesions = (layout) => {
        const {x, y, width, height} = layout;
        this.setState({
            pictureWidth: width,
            pictureHeight: height
        })
    }

    getImage = () => {
        const options = {
            title: '사진 선택',
            takePhotoButtonTitle: '카메라',
            chooseFromLibraryButtonTitle: '이미지선택',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
    
        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                alert('User cancelled image Picker');
            } else if (response.error) {
                alert('error: ', response.error); 
            } else {
                ImageResizer.createResizedImage(response.uri, this.state.pictureWidth, this.state.pictureHeight, "JPEG", 100).then(response => {
                    ImgToBase64.getBase64String(response.uri)
                        .then(base64String => 
                            this.setState({
                            img: base64String,
                            imgSource: {uri: `data:image/gif;base64,` + base64String},
                        }));
                }).catch(err => {

                })
            };
        });
    }

    insertImage = () =>{
        const { db } = this.state;
        var sql = "INSERT INTO Picture(location, image, content, picture_order, picture_bg) VALUES(" + this.props.location + ", '" + this.state.img + "', '" + this.state.content + "', 1, 1);";
        db.transaction(tx => {
            console.log(sql);
            tx.executeSql(sql, null, 
                () => {
                    console.log("성공");
                    alert("저장했습니다.");
                    this.props.openAddPicture();
                },
                (error) => {console.log(error)})
        });
    }

    onChangeText = (e) => {
        this.setState({
            content: e
        });
    }
    
    render() {
        return (
            <View>
                <Modal
                    isVisible={this.props.add_picture}
                    animationIn="bounceInRight"
                    animationOut="bounceOutRight"
                >
                    <View style={styles.modal}>
                        <View 
                            onLayout={(event) => {
                                this.find_dimesions(event.nativeEvent.layout)
                            }}
                            style={styles.picture}
                            onPress={() => this.getImage()}>
                            <TouchableOpacity
                                onPress={() => this.getImage()}>
                                <Image
                                    style={{width: this.state.pictureWidth, height: this.state.pictureHeight}}
                                    source={this.state.imgSource}>
                                </Image>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.textarea}>
                            <TextArea
                                maxLength={120}
                                placeholder={'내용을 입력해주세요.'}
                                onChangeText={(e) => this.onChangeText(e)}
                            />
                        </View>
                        <View style={styles.close}>
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => this.props.openAddPicture()}>
                                <Text>닫기</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => this.insertImage()}>
                                <Text>저장</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        padding:'5%',
        backgroundColor: 'white',
    },
    picture: {
        width: '100%',
        height:'60%',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor: 'lightgray',
        marginBottom:'5%'
    },
    textarea: {
        height:'30%',
        backgroundColor:'#F5FCFF',
        marginBottom:'5%'
    },
    close: {
        flexDirection:'row',
        marginRight:10,
        height:'5%',
        width:50
    },
    closeBtn: {
        marginRight:'20%'
    }
})