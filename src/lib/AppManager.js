import NativeCall from './NativeCall';

module.exports = {
    usingNpPlugin : function() {
        // true  : using np plugin app manager
        // false : using built-in app manager
        return false;
    },
    init: function () {
        try {
            if (this.usingNpPlugin()) {
                console.log("===== using np plug-in app manager (app_manager.js)");
                this.appmgr = window.oipfObjectFactory.createApplicationManagerObject();
            } else {
                console.log("===== using bulit-in app manager (app_manager.js)");
                this.appmgr = window.applicationManager;
            }
            this.application = this.getOwnerApplication();
        } catch (err) {
            console.log(err.message);
        }
    },
    getOwnerApplication: function () {
        try {
            return this.appmgr.getOwnerApplication(window.document);
        } catch (err) {
            console.log(err.message);
        }
    },
    bindDriveModeChanged: function (listener) {
        try {
            this.application.addListener("DriveModeChanged", function(state) {
                consol.log("DriveModeChanged == " + state);
                if (typeof listener === 'function') {
                    listener(app);
                }
            }, false);
        } catch (err) {
            console.log(err.message);
        }
    },
    bindLVIMode: function (listener) {
        try {
            this.application.addEventListener("LVI", function() {
                console.log("addEventListener LVI start");
                consol.log("LVI Mode");
                if (typeof listener === 'function') {
                    listener();
                }
                console.log("addEventListener LVI end");
            }, false);
        } catch (err) {
            console.log(err.message);
        }
    },
    bindVKState: function (listener) {
        try {
            this.application.addEventListener("VirtualKeyboardState", function(state) {
                console.log("addEventListener VirtualKeyboardState start");
                console.log("=================== launcher VirtualKeyboardState " + state);
                if (typeof listener === 'function') {
                    listener(state);
                }
                console.log("addEventListener VirtualKeyboardState end");
            }, false);
        } catch (err) {
            console.log(err.message);
        }
    },
    bindEvent : function (type, listener) {
        try {
            if (navigator.userAgent.indexOf("Obigo") < 0){
                document.addEventListener(type, listener, false);
            } else {
                console.log('bindEvent :' + type);
                this.application.addEventListener(type, listener, false);
            }
        } catch (err) {
            console.log(err.message);
        }
    },
    unbindEvent: function (type, listener) {
        try {
            if (navigator.userAgent.indexOf("Obigo") < 0){
                document.removeEventListener(type, listener, false);
            } else {
                this.application.removeEventListener(type, listener, false);
            }
        } catch (err) {
            console.log(err.message);
        }
    },
    bindCcpText: function (listener) {
        try {
            this.application.addEventListener("CcpText", function(txt) {
                console.log("addEventListener CcpText start");
                console.log("=================== manager CcpText " + txt);
                if (typeof listener === 'function') {
                    listener(txt);
                }
                console.log("addEventListener CcpText end");
            }, false);
        } catch (err) {
            console.log(err.message);
        }
    },
    bindCcpButtonPress: function(listener) {
        try {
            this.application.addEventListener("CcpButtonPress", function(btnType) {
                console.log("addEventListener CcpButtonPress start");
                console.log("=================== manager CcpButtonPress " + btnType);
                if (typeof listener === 'function') {
                    listener(btnType);
                }
                console.log("addEventListener CcpButtonPress end");
            }, false);
        } catch (err) {
            console.log(err.message);
        }
    },
    bindCcpButtonRelease: function(listener) {
        try {
            this.application.addEventListener("CcpButtonRelease", function(btnType) {
                console.log("addEventListener CcpButtonRelease start");
                console.log("=================== manager CcpButtonRelease " + btnType);
                if (typeof listener === 'function') {
                    listener(btnType);
                }
                console.log("addEventListener CcpButtonRelease end");
            }, false);
        } catch (err) {
            console.log(err.message);
        }
    },
    bindApplicationShown: function(listener) {
        try {
            this.application.addEventListener("ApplicationShown", function() {
                console.log("addEventListener ApplicationShown start");
                console.log("==================== AppManager.bindApplicationShown");
                if(typeof listener === 'function') {
                    listener();
                }
                console.log("addEventListener ApplicationShown end");
            }, false);
        } catch(err) {
            console.log(err.message);
        }
    },
    bindApplicationHidden: function(listener) {
        try {
            this.application.addEventListener("ApplicationHidden", function() {
                console.log("addEventListener ApplicationHidden start");
                console.log("==================== AppManager.bindApplicationHidden");
                if(typeof listener === 'function') {
                    listener();
                }
                console.log("addEventListener ApplicationHidden end");
            }, false);
        } catch(err) {
            console.log(err.message);
        }
    },
    home: function () {
        try {
            if(NativeCall){ //TBD
                var infobarparam = new infobarcallInfo();
                infobarparam.infobar = 1;

                NativeCall.set(NativeCall.infobar, infobarparam, function(){
                    console.log("show inforbar");
                }, function(){
                    console.log("ouucr error :show inforbar");
                });
            }
            this.application.home();
        } catch (err) {
            console.log(err.message);
        }
    },
    back: function () {
        try {
            this.application.back();
        } catch (err) {
            console.log(err.message);
        }
    },
    main: function () {
        try {
            this.application.main();
        } catch (err) {
            console.log(err.message);
        }
    },
    stopApplication: function(){
        try {
            this.application.destroyApplication();
        } catch (err) {
            console.log(err.message);
        }
    },
    activeApplications: function () {
        try {
            if(window.obigoTTS){
                obigoTTS.stop();
            }
            this.application.activeApplications();
        } catch (err) {
            console.log(err.message);
        }
    },
    showReminder: function(subject, date, time, descriptor, display_time){
        try{
            this.application.showReminder(subject, date, time, descriptor, display_time);
        }catch(err){
            console.log(err.message);
        }
    },
    show: function () {
        try {
            this.application.show();
        } catch (err) {
            console.log(err.message);
        }
    },
    hide: function () {
        try {
            this.application.hide();
        } catch (err) {
            console.log(err.message);
        }
    },
    loginSNS: function (url, loginSuccess, loadedLoginWindow) {
        try {
            this.loginWindow = this.application.createApplicationParams(url, "section:popup;location:top,left;size:760,415;mobile-user-agent:true;js:tiny_AppManager.js;");

            this.appmgr.addEventListener('ApplicationLoaded', function (loginApp) {
                console.log("addEventListener ApplicationLoaded start");
                console.log('AppManager.application.id ' + AppManager.application.id);
                console.log('loginApp.id ' + loginApp.id);
                loginApp.setSnSLoginWindow(AppManager.application.id);
                AppManager.loginWindow.show();
                loadedLoginWindow();
                console.log("addEventListener ApplicationLoaded end");
            }, false);
            this.appmgr.addEventListener('SNSLoggedIn', function (app_ptr, url) {
                console.log("addEventListener SNSLoggedIn start");
                console.log('SNSLoggedIn app_ptr ' + app_ptr);
                console.log('SNSLoggedIn url ' + url);
                app_ptr.destroyApplication();
                loginSuccess(url);
                console.log("addEventListener SNSLoggedIn end");
            }, false);
        } catch (err) {
            console.log(err.message);
        }
    },
    closeLoginSNS: function () {
        try {
            this.loginWindow.destroyApplication();
        } catch (err) {
            console.log(err.message);
        }
    },
    getOSVersion: function () {
        try {
            return this.application.getOSVersion();
        } catch (err) {
            console.log(err.message);
        }
    },
    getOAFVersion: function () {
        try {
            return this.application.getOAFVersion();
        } catch (err) {
            console.log(err.message);
        }
    },
    getAppVersion: function () {
        try {
            if(this.application){
                return this.application.getDescriptor().widgetVersion;
            }else{
                return "";
            }
        } catch (err) {
            console.log(err.message);
        }
    },
    getAppsVersion: function () {
        try {
            return this.application.getAppVersion();
        } catch (err) {
            console.log(err.message);
        }
    },
    getAppName: function() {
        try {
            console.log(this + "\m"+ this.application);
            if(this.application){
                return this.application.getDescriptor().widgetName;
            }else{
                appUrl = window.location.href.split('/');
                return appUrl[appUrl.length - 2];
            }
        } catch (err) {
            console.log(err.message);
        }
    },
    getWidgetId: function(){
        try {
            if(this.application){
                return this.application.getDescriptor().widgetID;
            }else{
                return "";
            }
        } catch (err) {
            console.log(err.message);
        }
    },
    getLocalURI: function(){
        try {
            if(this.application){
                return this.application.getDescriptor().localURI;
            }else{
                return window.location.href.split('index.')[0];
            }
        } catch (err) {
            console.log(err.message);
        }
    },
    getFeatureList: function(){
        try {
            if(this.application){
                return this.application.getDescriptor().featureList;
            }else{
                return "";
            }
        } catch (err) {
            console.log(err.message);
        }
    },
    testEvent: function() {
        try {
            this.appmgr.testEvent();
        } catch (err) {
            console.log(err.message);
        }
    },
    initSystem: function () {
        try {
            this.application.OAFSystemInit();
        } catch (err) {
            console.log(err.message);
        }
    },
    startTTS: function(data) {
        try {
            console.log("============== AppManager startTTS");
            console.log("===> "+data);
            //this.application.startSpeaking(data);
        } catch (err) {
            console.log(err.message);
        }
    },
    stopTTS: function() {
        try {
            this.application.stopSpeaking();
        } catch (err) {
            console.log(err.message);
        }
    },
    bindTTS: function(listener) {
        try {
            this.application.addEventListener("Speaking", function(type, err) {
                console.log("=============== AppManager.bindTTS");
                if(typeof listener === "function") {
                    listener(type, err);
                }
            }, false);
        } catch (err) {
            console.log(err.message);
        }
    },
    setRuntimeJSContent: function(filename) {
        try {
            this.application.setRuntimeJSContent(filename);
        } catch (err) {
            console.log(err.message);
        }
    },
    setUserAgent: function(userAgent) {
        try {
            this.application.setUserAgent(userAgent);
        } catch (err) {
            console.log(err.message);
        }
    },
    bindVirtualKeyboard: function(callback){
        try {
            this.application.addEventListener("ApplicationKeypad", function(type, str, source) {
                callback(type, str, source)
            }, false);
        }catch(err){
            console.log(err.message);
        }
    },
    InputTextAborted: function(source){
        this.application.InputTextAborted(source);
    },
    InputText: function(txt, source){
        this.application.InputText(txt, source);
    },
    EnableKeypad: function(flag){
        try {
            this.application.EnableKeypad(flag);
        } catch (err) {
            console.log(err.message);
        }
    },
    createOAuthWindow: function(url, left, top, width, height, injectfile, mobileUA){
        try {
            return this.application.createOAuthWindow(url, left, top, width, height, injectfile, mobileUA);
        }catch(err){
            console.log(err.message);
            return null;
        }
    },
    destroyOAuthWindow: function(id){
        try {
            this.application.destroyOAuthWindow(id);
        }catch(err){
            console.log(err.message);
        }
    },
    historyFowardOAuthWIndow: function(id){
        try {
            this.application.historyFowardOAuthWIndow(id);
        }catch(err){
            console.log(err.message);
        }
    },
    historyBackOAuthWIndow: function(id){
        try {
            this.application.historyBackOAuthWIndow(id);
        }catch(err){
            console.log(err.message);
        }
    },
    showOAuthWindow: function(id){
        try {
            this.application.showOAuthWindow(id);
        }catch(err){
            console.log(err.message);
        }
    },
    hideOAuthWindow: function(id){
        try {
            this.application.hideOAuthWindow(id);
        }catch(err){
            console.log(err.message);
        }
    },
    registerHardKey: function(key){
        try {
            this.application.registerHardKey(key);
        }catch(err){
            console.log(err.message);
        }
    },
    bindApplicationLoaded: function(callback){
        this.appmgr.addEventListener('ApplicationLoaded', function(){
            console.log("============== ApplicationLoaded : App init");
            callback();
        }, false);
    },
    isVisible: function(){
        try {
            return this.application.visible;
        }catch(err){
            console.log(err.message);

            return true;
        }
    },
    isShowPopup: function(){
        try {
            return this.application.isShowPopup();
        }catch(err){
            console.log(err.message);

            return -1;
        }
    },
    hidePopup: function(){
        try {
            return this.application.hidePopup();
        }catch(err){
            console.log(err.message);
        }
    },
    audioPause: function(){
        try {
            return this.application.audioPause();
        }catch(err){
            console.log(err.message);
        }
    },
    getProcessID: function(){
        try {
            return this.application.getPID();
        }catch(err){
            console.log(err.message);
        }
    },
    getLoggingLevel: function(){
        try {
            return this.appmgr.getLoggingLevel();
        }catch(err){
            console.log(err.message);
        }
    }
}