/**
 * Created by krinjadl on 2016-06-14.
 */
/**
 * Created by krinjadl on 2016-06-14.
 */
import React from 'react';
import Button from './Button';
import AppManager from '../lib/AppManager';
import styles from './css/Footer.css';


class Footer extends React.Component{
    constructor(props){
        super(props);
        this.state = { }
    }
    _onClickApps(){

    }
    _onClickSetting(){
        
    }
    render(){
        console.log("render header");
        let buttonData=[
            {label:"Apps", onClick:this._onClickApps.bind(this), subClassName:styles.appsButton,status:this.props.appsBtnStatus},
            {label:"Setting", onClick:this._onClickSetting.bind(this), subClassName:styles.settingButton, status:this.props.settingBtnStatus}
        ];

        return (
            <div>
                <Button label={buttonData[0].label} onClick={buttonData[0].onClick} subClassName={buttonData[0].subClassName}  />
                <Button label={buttonData[1].label} onClick={buttonData[1].onClick} subClassName={buttonData[1].subClassName} status={this.props.settingBtnStatus} />
            </div>
        );
    }
}

Footer.defaultProps={
}

export default Footer;
