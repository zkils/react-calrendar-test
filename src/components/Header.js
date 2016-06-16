/**
 * Created by krinjadl on 2016-06-14.
 */
import React from 'react';
import Button from './Button';
import AppManager from '../lib/AppManager';
import TextBox from './TextBox';
import styles from './css/Header.css';

class Header extends React.Component{
    constructor(props){
        super(props);
    }
    shouldComponentUpdate(nextProps, nextState){
        return (JSON.stringify(nextProps) != JSON.stringify(this.props));
    }
    _onClickBack(){
        this.props.onClickBack();

    }
    _onClickHome(){
        AppManager.home();
    }
    render(){
        console.log("render header");
        const buttonData=[
            {label:"Back", onClick:this._onClickBack.bind(this)},
            {label:"Home", onClick:this._onClickHome.bind(this)}
        ];

        return (
            <div>
                <Button label={buttonData[0].label} onClick={buttonData[0].onClick} subClassName={styles.floatElement}/>
                <TextBox className={styles.title} tbText={this.props.title} ></TextBox>
                <Button label={buttonData[1].label} onClick={buttonData[1].onClick} subClassName={styles.floatElement}/>
            </div>
        );
    }
}
Header.defaultProps ={
    onClickBack: function(){}
}

export default Header;
