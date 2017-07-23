import React, { Component } from 'react';
import helper from '../utils/directionsHelper';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Animated,
  Text,
  TouchableOpacity,
  FlatList
} from 'react-native';

// use Animated.event
// if not, use Animated.timing and state to activate it inside componentDidUpdate
const API_KEY = 'AIzaSyCdPnAPE-Kqy_VWKiFtX8Zm4b0T7wyyZ38',
  API_PLACES_ROOT = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?key=' + API_KEY,
  API_GEOCODE_ROOT = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + API_KEY,
  API_DIRECTIONS_ROOT = 'https://maps.googleapis.com/maps/api/directions/json?key=' + API_KEY + '&mode=transit&unit=imperial';



export default class DirectionsBar extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentPosition: {
        latitude: "",
        longitude: ""
      },
      originText: "",
      destinationText: "",
      suggestion1: "",
      suggestion2: "",
      originSuggestion1: "",
      originSuggestion2: "",
      destinationSuggestion1: "",
      destinationSuggestion2: "",
      originSelection: "",
      destinationSelection: "",
      showPredictions: false,
      showInput: true,
      showDirections: false,
      noHeight: new Animated.Value(0),
      noHeightBtn: new Animated.Value(0),
      componentHeight: new Animated.Value(100),
      directionsHeight: new Animated.Value(0),
      inputHeight: new Animated.Value(100),
      textBoxHeight: 40,
      directionsArr: [],
      inputFocus: ''
    }
    this.setOriginText = this.setOriginText.bind(this);
    this.setDestinationText = this.setDestinationText.bind(this);
    this.chooseAddress1 = this.chooseAddress1.bind(this);
    this.chooseAddress2 = this.chooseAddress2.bind(this);
    this.setA = this.setA.bind(this);
    this.setB = this.setB.bind(this);
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(position => {
      let endpt = API_GEOCODE_ROOT + '&latlng=' + position.coords.latitude + ',' + position.coords.longitude;
      fetch(endpt, {
        method: 'GET'
      }).then(response => {
        // console.log(response);
        // console.log(typeof response._bodyInit);

        this.setState({
          originText: JSON.parse(response._bodyInit).results[0].formatted_address,
          originSelection: JSON.parse(response._bodyInit).results[0].formatted_address,
          currentPosition: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });
      }).catch(err => {
        console.log(err);
      })
    })
  }

  componentDidUpdate(prevProps, prevState) {
    // need to fix below later
    if ((prevState.destinationSelection != this.state.destinationSelection || prevState.originSelection != this.state.originSelection) && (this.state.originText && this.state.destinationSelection)){
      console.log('INSIDE GET ADDRESS IF');
      var destinationStr = this.state.destinationSelection == 'suggestion1' ? this.state.destinationSuggestion1 : this.state.destinationSuggestion2;
      var originStr = this.state.originSelection == 'suggestion1' ? this.state.originSuggestion1 : this.state.originSelection == 'suggestion2' ? this.state.originSuggestion2 : this.state.originText

      helper.getDirections(destinationStr, originStr)
      .then(objArrs => {
        this.setState({
          directionsArr: objArrs.directionsArr,
          showDirections: true,
          showPredictions: false,
          showInput: false
        });
        this.props.updatePolylineCoord(objArrs.stepsArr);
      });
    }

    // make call for suggestions -- change data
    if (prevState.destinationText != this.state.destinationText){
      helper.getPredictions(this.state.destinationText).then(predictionsArr => {
        if (predictionsArr.length > 1){
          this.setState({
            destinationSuggestion1: predictionsArr[0].description,
            destinationSuggestion2: predictionsArr[1].description,
            suggestion1: predictionsArr[0].description,
            suggestion2: predictionsArr[1].description
          });
        }
      }).catch(err => {
        console.log(err);
      });
    }

    if (prevState.originText != this.state.originText){
      helper.getPredictions(this.state.originText).then(predictionsArr => {
        if (predictionsArr.length > 1){
          this.setState({
            originSuggestion1: predictionsArr[0].description,
            originSuggestion2: predictionsArr[1].description,
            suggestion1: predictionsArr[0].description,
            suggestion2: predictionsArr[1].description
          });
        }
      }).catch(err => {
        console.log(err);
      });
    }

    // expand bar -- change view
    if (prevState.showPredictions != this.state.showPredictions){
      if (this.state.showPredictions === true){
        this.setState({
          noHeightBtn: 40
        });
        Animated.timing(
          this.state.componentHeight,
          {
            toValue: 200,
            duration: 500,
          }
        ).start();
        Animated.timing(
          this.state.noHeight,
          {
            toValue: 100,
            duration: 500,
          }
        ).start();

      } else {
        this.setState({
          noHeightBtn: 0
        });
        Animated.timing(
          this.state.componentHeight,
          {
            toValue: 100,
            duration: 500,
          }
        ).start();
        Animated.timing(
          this.state.noHeight,
          {
            toValue: 0,
            duration: 500,
          }
        ).start();
      }
    }

    if (prevState.showDirections != this.state.showDirections){
      if (this.state.showDirections === true){
        this.setState({
          textBoxHeight: 0,
        });
        Animated.timing(
          this.state.inputHeight,
          {
            toValue: 0,
            duration: 500
          }
        ).start();
        Animated.timing(
          this.state.directionsHeight,
          {
            toValue: 100,
            duration: 500
          }
        ).start();
      } else {
          this.setState({
          textBoxHeight: 40,
        });
        Animated.timing(
          this.state.inputHeight,
          {
            toValue: 100,
            duration: 500
          }
        ).start();
        Animated.timing(
          this.state.directionsHeight,
          {
            toValue: 0,
            duration: 500
          }
        ).start();
      }
    }
  }

  setOriginText(text){
    console.log('INSIDE SET ORIGIN TEXT');
    this.setState({
      originText: text,
      showPredictions: true,
      showInput: true,
      showDirections: false
    });
  }

  setDestinationText(text){
    console.log('INSIDE SET DESTINATION TEXT');
    this.setState({
      destinationText: text,
      showPredictions: true,
      showInput: true,
      showDirections: false
    });
  }

  setA(){
    console.log('SET A');
    this.setState({
      inputFocus: 'origin'
    });
  }

  setB(){
    console.log('SET B');
    this.setState({
      inputFocus: 'destination'
    });
  }

  chooseAddress1(){
    console.log('CHOSE ADDRESS YAAAY');
    if (this.state.inputFocus == 'origin'){
      console.log('INSIDE ORIGIN CHOOSE ADDRESS 1');
      this.setState({
        originSelection: "suggestion1",
        originText: this.state.originSuggestion1,
        showPredictions: false,
        showInput: true
      });
      console.log(this.state.originText);
    } else if (this.state.inputFocus == 'destination'){
      this.setState({
        destinationSelection: "suggestion1",
        destinationText: this.state.destinationSuggestion1,
        showPredictions: false,
        showInput: true
      });
    }
  }

  chooseAddress2(){
    console.log('CHOSE ADDRESS MEE');
    if (this.state.inputFocus == 'origin'){
      this.setState({
        originSelection: "suggestion2",
        originText: this.state.originSuggestion2,
        showPredictions: false,
        showInput: true
      });
    } else if (this.state.inputFocus == 'destination'){
      this.setState({
        destinationSelection: "suggestion2",
        destinationText: this.state.destinationSuggestion2,
        showPredictions: false,
        showInput: true
      });
    }
  }

  render(){
    return(
      <Animated.View style={{
        flexDirection: 'column',
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        zIndex: 100,
        // paddingBottom: 15,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'red',
        height: this.state.componentHeight}}>
        <Animated.View style={{
          height: this.state.directionsHeight,
          flexDirection: 'row',
          borderRadius: 4,
          borderWidth: 0.5,
          borderColor: 'green',
          justifyContent: 'center',
          backgroundColor: '#fff'
        }}>
          <FlatList data={this.state.directionsArr} renderItem={({item}) =>
            <Text style={{height: 50,
              borderRadius: 4,
              borderWidth: 0.5,
              borderColor: 'orange',
              zIndex: 200
            }}>{item.key}</Text>
          }
          />
        </Animated.View>
        <Animated.View style={{
          height: this.state.inputHeight,
          flexDirection: 'row',
          borderRadius: 4,
          borderWidth: 0.5,
          borderColor: 'green',
          justifyContent: 'center',
        }}>
          <View style={styles.directionImage}>
            <Image style={styles.markerImage} source={require('../images/direction_image.png')} />
          </View>
          <View style={styles.directionInput}>
            <TextInput style={{
              height: this.state.textBoxHeight,
              borderRadius: 4,
              borderWidth: 0.5,
              borderColor: 'black',
              width: 250,
              paddingLeft: 10
            }} placeholder="Current Location"
            value={this.state.originText}
            onFocus={this.setA}
            onChangeText={this.setOriginText}
            />
            <TextInput style={{
              height: this.state.textBoxHeight,
              borderRadius: 4,
              borderWidth: 0.5,
              borderColor: 'black',
              width: 250,
              paddingLeft: 10
            }} placeholder="Destination"
            value={this.state.destinationText}
            onFocus={this.setB}
            onChangeText={this.setDestinationText}
            />
          </View>
        </Animated.View>
        <Animated.View style={{
          borderRadius: 4,
          borderWidth: 0.5,
          borderColor: 'blue',
          justifyContent: 'center',
          height: this.state.noHeight}}>
            <TouchableOpacity onPress={this.chooseAddress1} style={{borderWidth: 0.5,
                  borderColor: 'purple',
                  justifyContent: 'center',
                  height: this.state.noHeightBtn
              }}>
              <View>
                <Text>
                  {this.state.suggestion1}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.chooseAddress2} style={{borderWidth: 0.5,
                  borderColor: 'purple',
                  justifyContent: 'center',
                  height: this.state.noHeightBtn
              }}>
              <View>
                <Text>
                  {this.state.suggestion2}
                </Text>
              </View>
            </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  // predictionsBar: {
  //   borderWidth: 0.5,
  //   borderColor: 'green',
  //   justifyContent: 'center',
  //   flex: 0.5,
  // },
  prediction: {
    height: 0,
    borderWidth: 0.5,
    borderColor: 'black',
    justifyContent: 'center',
  },
  markerImage: {
    height: 90,
    width: 22,
    margin: 5
  },
  directionBar: {
    // flex: 0.5,
    height: 100,
    flexDirection: 'row',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'green',
    justifyContent: 'center',
  },
  directionImage: {
    marginTop: 5,
    // marginRight: 10,
    height: 100,
    width: 40,
    // borderRadius: 4,
    // borderWidth: 0.5,
    // borderColor: 'orange',
  },
  directionInput: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  inputText: {
    height: 40,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'black',
    width: 250,
    paddingLeft: 10,
  },
});
