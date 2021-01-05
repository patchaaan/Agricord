import React, { Component, useState } from 'react';
import Style from './Style.js';
import { View, Image, Text, ScrollView, SafeAreaView,  TouchableOpacity, Dimensions } from 'react-native';
import { Spinner, Empty} from 'components';
import { connect } from 'react-redux';
import { Color, Routes ,BasicStyles} from 'common'
import Api from 'services/api/index.js'
import { Divider } from 'react-native-elements';
import _, { isError } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-regular-svg-icons';
import { faExclamationTriangle as faExclamationTriangleSolid} from '@fortawesome/free-solid-svg-icons';
import {data} from './data-test.js';
import ProductCard from 'components/Products/thumbnail/ProductCard.js';
import KeySvg from 'assets/settings/key.svg';
import SlidingButton from 'modules/generic/SlidingButton';
import ProductConfirmationModal from 'modules/modal/ProductConfirmation'; 
import TaskConfirmationModal from 'modules/modal/TaskConfirmation'; 


const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);


class paddockPage extends Component{
  
  constructor(props){
    super(props);
    this.state = { 
      pressed:false,
      applyTank: true,
      productConfirmation: false,
      taskConfirmation: false,
      data: []
    }
  }

  componentDidMount(){
    const { task } = this.props.state; 
    if (task == null && (task && task.spray_mix == null)) {
      return
    }
    const parameter = {
      condition: [{
        value: task.spray_mix.id,
        column: 'spray_mix_id',
        clause: '='
      }],
      sort: {
        created_at: 'desc'
      },
      offset: 0,
      limit: 10
    };
    this.setState({
      isLoading: true
    })
    console.log('parameter', parameter)
    Api.request(Routes.sprayMixProductsRetrieve, parameter, response => {
        console.log('response', response)
        this.setState({data: response.data, isLoading: false});
      },
      error => {
        this.setState({
          isLoading: false
        })
        console.log({error});
      },
    );
  }

  setApplyTank(){
    this.setState({
      productConfirmation: true
    })
  }

  manageProductConfirmation(){

  }

  manageTaskConfirmation(){

  }

  renderTopCard=()=>{
    return(
    <View style={Style.container}>
      <View 
        style={{
          width: '30%',
          borderTopLeftRadius: BasicStyles.standardBorderRadius,
          borderBottomLeftRadius: BasicStyles.standardBorderRadius,
          backgroundColor: '#ED1C24',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        >
        <FontAwesomeIcon icon={faExclamationTriangleSolid} size={60} color={Color.white}/>
      </View>
      <View style={{
          width: '70%',
          paddingTop: 20,
          paddingLeft: 10,
          paddingRight: 10,
          paddingBottom: 20
        }}>
        <Text style={{
            fontWeight: 'bold',
            color: '#ED1C24',
            fontSize: BasicStyles.standardHeaderFontSize,
          }}>Create Batch</Text>
        <Text style={Style.text}>1. Confirm mixing order on label</Text>
        <Text style={Style.text}>2. Scan the Agricord tag on each drum to record quantity added and details</Text>
        <Divider style={BasicStyles.standardDivider}></Divider>
      </View>
    </View>
    )
  }

  renderNotesCard(){
    return(
      <View style={{
          width: '100%',
          marginTop: 15,
          backgroundColor: Color.white,
          borderRadius: 22,
          borderColor: '#FFFFFF',
          ...BasicStyles.standardShadow,
          paddingTop: 15,
          paddingBottom: 15,
          paddingLeft: 15,
          paddingRight: 15,
          height: 80
      }}>
          
          <Text style={{
              fontSize: BasicStyles.standardTitleFontSize,
              fontWeight: 'bold'
            }}>Notes: </Text>

          <Text style={{
              fontSize: BasicStyles.standardFontSize,
              color: Color.gray
            }}>Notes: </Text>
       </View>

    )
  }

  render() {
    const { applyTank, productConfirmation, taskConfirmation, data } = this.state;
    const { isLoading } = this.state;
    const { task } = this.props.state;
    console.log('task', task)
    return (
      <SafeAreaView>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{
            alignItems: 'center',
            height: height + 20,
            flex: 1,
            backgroundColor: Color.containerBackground
          }}>
            <View style={{
                width: '90%',
                marginLeft: '5%',
                marginRight: '5%'
              }}>
                {
                  this.renderTopCard()
                }
                {
                  data.map( item => (
                    <ProductCard
                        item={{
                          ...item.product,
                          from: 'paddockPage'
                        }}
                        key={item.id}
                        navigation={this.props.navigation}
                        theme={'v2'}
                      />
                  ))
                }
                {
                  data.length == 0 && (
                    <Text style={{
                      marginTop: 10,
                      textAlign: 'center'
                    }}>{ isLoading ? '' : 'No products found'}</Text>
                  )
                }
               <TouchableOpacity style={[
                  BasicStyles.standardCardContainer,
                  {
                    backgroundColor: Color.blue,
                    paddingRight: 10
                  }
                  ]}
                  onPress={() => this.setState({
                    taskConfirmation: true
                  })}
                  >
                  <View style={{
                      width: '70%',
                      flexDirection: 'row'
                    }}>
                    <KeySvg />
                    <Text style={{
                      color: Color.white,
                      marginLeft:10,
                      fontSize: BasicStyles.standardTitleFontSize
                    }}>Water</Text>
                  </View>
                  
                  <Text style={{
                      color: Color.white,
                      fontSize: BasicStyles.standardTitleFontSize,
                      fontWeight: 'bold',
                      textAlign: 'right',
                      width: '30%'
                    }}>{task && task.params ? task.params.volume + task.params.units : ''}</Text>
               </TouchableOpacity>

              {
                this.renderNotesCard()
              }
            </View>
         </View>
        </ScrollView>
        {
          (applyTank) && (
            <SlidingButton
              title={'Apply Tank'}
              label={'Swipe Right to Complete'}
              onSuccess={() => this.setApplyTank()}
              />
          )
        }
        {
          (productConfirmation) && (
            <ProductConfirmationModal
              visible={productConfirmation}
              onClose={() => this.setState({
                productConfirmation: false
              })}
              data={{
                title: 'Product A',
                manufacturing_date: 'August 11, 2020',
                volume_remaining: '10L',
                batch_number: '12321'
              }}
              onSuccess={() => this.manageProductConfirmation()}
            />
          )
        }
        {
          (taskConfirmation) && (
            <TaskConfirmationModal
              visible={taskConfirmation}
              onClose={() => this.setState({
                taskConfirmation: false
              })}
              onSuccess={() => this.manageTaskConfirmation}
            />
          )
        }

        {isLoading ? <Spinner mode="overlay" /> : null}
      </SafeAreaView>
    );
  }
}
const mapStateToProps = state => ({ state: state });

const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux');
  return {

  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(paddockPage);
