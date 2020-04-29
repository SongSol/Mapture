import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity, AsyncStorage, Dimensions} from 'react-native';
import Modal from 'react-native-modal';
import SQLite from 'react-native-sqlite-storage'
import Carousel, { Pagination } from 'react-native-snap-carousel';

export default class AlbumModal extends Component {
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
            album: this.props.album,
            location: this.props.location,
            pictures: [],
            imgSource: require('../image/photo_icon.png'),
            content: '',
            activeSlide: 0,
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
        const { db } = this.state;
        var sql = "SELECT * FROM Picture WHERE location = " + this.state.location + ";";
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
                    pictures: data,
                });
            });
        });
    }

    componentDidMount() {
        this.getImage();
    }

    _renderItem = ({ item, index }) => {
        return (
            <>
            <View style={styles.modal}>
                <View 
                    onLayout={(event) => {
                        this.find_dimesions(event.nativeEvent.layout)
                    }}
                    style={styles.picture}>
                    <Image
                        style={{width: this.state.pictureWidth, height: this.state.pictureHeight}}
                        source={{uri: `data:image/gif;base64,` + item.image}}>
                    </Image>
                </View>
                <Text>
                    {item.content}
                </Text> 
            </View>
            </>
        )
    }

    render() {
        if (this.props.album) { this.getImage() }
        return (
            <View>
                <Modal
                    isVisible={this.props.album}
                    animationIn="bounceInRight"
                    animationOut="bounceOutRight"
                >
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => this.props.openAlbum()}>
                            <Image source={require('../image/edit_icon.png')}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => this.props.openAlbum()}>
                            <Image source={require('../image/delete_icon.png')}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => this.props.openAlbum()}>
                            <Image source={require('../image/close_icon.png')}/>
                        </TouchableOpacity>
                    </View>
                    <Carousel 
                        data={this.state.pictures}
                        renderItem={this._renderItem}
                        itemWidth={Dimensions.get("window").width}
                        sliderWidth={Dimensions.get("window").width}
                        onSnapToItem={index => this.setState({ activeSlide: index })}
                    />
                    <Pagination
                        dotsLength={this.state.pictures.length}
                        activeDotIndex={this.state.activeSlide}
                        containerStyle={{paddingVertical:15}}
                    />
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    modal: {
        width: '90%',
        height: '100%',
        padding:'5%',
        backgroundColor: 'white',
    },
    header: {
        flexDirection:'row',
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
        marginBottom: '5%'
    }
})