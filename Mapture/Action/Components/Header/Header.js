import React, {Component} from 'react';
import {StyleSheet, View, Text, Button} from 'react-native';

export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state={
            location: "대한민국"
        }
    }

    render() {
        return (
            <View>
                <Text style={styles.title}>{this.props.location}</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 60,
        fontWeight: "700"
    }
})