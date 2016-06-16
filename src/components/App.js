import React from 'react';
import ReactDOM from 'react-dom';
import Header from './Header';
import Content from './Content';
import Footer from './Footer';
import styles from './css/App.css';
import AppManager from '../lib/AppManager';

class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isGoogleLogin : null,
            headerTitle:"Calendar",
            screen:"init",
            settingBtnStatus:false
        };
        this._updateTitle = this._updateTitle.bind(this);
        this._initAppManager();
    }
    _initAppManager(){
        AppManager.init();
        if(window.VirtualKeypad){
            var vk = new VirtualKeypad();
            AppManager.bindVirtualKeyboard(vk.open);
            AppManager.EnableKeypad(true);
        }
        var openCallback = null,
            closeCallback = null,
            errorCallback = null;

        if(window.nativecall){
            nativecall.init(AppManager.getWidgetId(), openCallback, closeCallback, errorCallback);
        }
        AppManager.bindApplicationShown(function(){
            console.log("Application shown");
        });
    }
    _updateTitle(newTitle){
        this.setState({
            headerTitle:newTitle
        });
    }
    _handleSettingBtn(status){
        this.setState({settingBtnStatus:status});
    }
    _onClickBack(){

    }


    render(){        
        return (
            <div className={styles.root}>
                <Header title={ this.state.headerTitle } onClickBack={this._onClickBack.bind(this)}/>
                <Content onUpdateTitle={this._updateTitle.bind(this)}
                          onUpdateSettingBtnStatus={this._handleSettingBtn.bind(this)}
                />
                <Footer settingBtnStatus={this.state.settingBtnStatus} />
            </div>
        );
    }
}

export default App;

