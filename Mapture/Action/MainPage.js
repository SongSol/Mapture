import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import Dialog, { DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';

import Header from './Components/Header/Header';
import AddPictureModal from './Components/Modal/AddPictureModal';
import AlbumModal from './Components/Modal/AlbumModal';

let Korea = require("./image/전국.png");
let Seoul = "./image/Gyenggido.png";

export default class MainPage extends Component {
    constructor(props) {
        super(props);
        
        //DB Setting
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
            list_picture_bg: [],
            location:1,
            location_name: "대한민국",
            img: Korea,
            add_picture: false,
            album: false,
            menu_open: false,
        }
    }

    openMenu = () => {
        if (this.state.menu_open) {
            this.setState({
                menu_open: false
            });
        } else {
            this.setState({
                menu_open: true
            });
        }
    }

    openAddPicture = () => {
        if (this.state.add_picture) {
            this.setState({
                add_picture: false
            });
        } else {
            this.setState({
                add_picture: true,
                menu_open: false
            });
        }
    }

    openAlbum = () => {
        if (this.state.album) {
            this.setState({
                album: false
            });
        } else {
            this.setState({
                album: true,
                menu_open: false
            });
        }
    }

    resetState = () => {
        this.setState({
            album: false,
            add_picture: false,
            menu_open: false,
        });
    }

    onClickLocation = (location, location_name, img) => {
        this.setState({
            location: location,
            location_name: location_name,
            img: img
        });
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
    }

    selectAllData = () => {
        const { db } = this.state;
        var sql = "SELECT * FROM Picture WHERE picture_bg = 1;";
        db.transaction(tx => {
            tx.executeSql(sql, [], (tx, results) => {
                const rows = results.rows;
                let data = [];

                for (let i = 0; i < rows.length; i++) {
                    data.push({
                        ...rows.item(i),
                    });
                }

                this.setState({
                    list_picture_bg: data,
                });
            });
        });
    }

    componentDidMount() {
        const { db } = this.state;
        var sql = "CREATE TABLE IF NOT EXISTS Picture (location integer not null, image blob, content TEXT, picture_order integer not null, picture_bg integer, created_at TEXT not null default (DATETIME('now', 'localtime')), updated_at TEXT not null default (DATETIME('now', 'localtime')));";
        db.transaction(tx => {
            tx.executeSql(sql, null, 
                (result) => {
                    sql = "CREATE TRIGGER trigger_Picture_updated_at AFTER UPDATE ON Picture BEGIN " + 
                    "UPDATE Picture SET updated_at = DATETIME('now', 'localtime') WHERE rowid == NEW.rowid;" + 
                    "END;";

                    db.transaction(tx => {
                        tx.executeSql(sql, null,
                            (result) => {console.log("Success")});
                    },
                    (error) => {})
                },
                (error) => {console.log(error)}
                );
        });

        this.selectAllData();
    }

    componentWillUnmount() {
        console.log("끝");
    }

    render() {
        switch(this.state.location_name) {
            case "대한민국" : 
                return (
                    <>
                    <View style={styles.header}>
                        <Header
                            location={this.state.location_name}/>
                    </View>
                    <View style={styles.map}>
                        <TouchableOpacity
                            style={styles.gyenggido}
                            onPress={() => this.onClickLocation(3, "경기도", require("./image/Gyenggido.png"))}>
                            <Image
                                source={require("./image/Gyenggido.png")}>
                            </Image>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.gangwondo}
                            onPress={() => this.onClickLocation(4, "강원도", require("./image/Gangwondo.png"))}>
                            <Image
                                source={require("./image/Gangwondo.png")}>
                            </Image>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.advertisement}>
                        <Text>광고</Text>
                    </View>
                    </>
                )
            default :
                return (
                    <>
                    <View style={styles.header}>
                        <Header
                            location={this.state.location_name}/>
                    </View>
                    <View style={styles.map}>
                        <TouchableOpacity
                            onPress={() => this.onClickLocation(1, "대한민국")}>
                            <Image
                                style={{height: '90%', width: '100%', resizeMode:'cover'}}
                                source={this.state.img}>
                            </Image>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.footer}>
                        <Dialog
                            visible={this.state.menu_open}
                            onTouchOutside={() => this.openMenu()}>
                            <DialogContent>
                                <View style={styles.close}>
                                <TouchableOpacity
                                    style={styles.closeBtn}
                                    onPress={() => this.openAddPicture()}>
                                    <Image source={require('./Components/image/picture_plus_icon.png')}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => this.openAlbum()}>
                                    <Image source={require('./Components/image/album_icon.png')}/>
                                </TouchableOpacity>
                                </View>
                            </DialogContent>
                        </Dialog>
                        <TouchableOpacity
                            style={styles.menu} 
                            onPress={() => this.openMenu()}>
                            {this.state.menu_open ? 
                            <Image source={require('./Components/image/menu_icon_clicked.png')}/>:
                            <Image source={require('./Components/image/menu_icon.png')}/>}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.advertisement}>
                        <Text>광고</Text>
                    </View>
                    <AddPictureModal
                        location={this.state.location}
                        add_picture={this.state.add_picture}
                        openAddPicture={this.openAddPicture}
                    />
                    <AlbumModal
                        location={this.state.location}
                        album={this.state.album}
                        openAlbum={this.openAlbum}
                    />
                    </>
                )
        }
    }
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        flex: 10,
    },
    footer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    advertisement: {
        flex: 0.5,
        marginTop:'10%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'yellow'
    },
    close: {
        padding: 10,
        flexDirection:'row',
        marginRight:10,
        width: '80%'
    },
    closeBtn: {
        marginRight:10
    },
    menu: {
        margin: '10%'
    },
    gyenggido: {
        height: '60%',
        position: 'absolute',
        top: '16%',
        left: 0,
        right: 0,
        bottom: 0
    },
    gangwondo: {
        height: '10%',
        width: '10%',
        position: 'absolute',
        top: 0,
        left: '24%',
        right: 0,
        bottom: 0
    }
})