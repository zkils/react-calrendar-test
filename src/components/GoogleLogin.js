/**
 * Created by krinjadl on 2016-06-15.
 */
import React from 'react';
import obigo from '../lib/util'

class GoogleLogin extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { clientId, scope, cookiePolicy } = this.props;
        ((d, s, id, cb) => {
            const element = d.getElementsByTagName(s)[0];
            const fjs = element;
            let js = element;
            js = d.createElement(s);
            js.id = id;
            js.src = '//apis.google.com/js/platform.js';
            fjs.parentNode.insertBefore(js, fjs);
            js.onload = cb;
        })(document, 'script', 'google-login', () => {
            const params = {
                client_id: clientId,
                cookiepolicy: cookiePolicy,
                scope,
            };
            window.gapi.load('auth2', () => {
                window.gapi.auth2.init(params);
            });
        });
    }

    onBtnClick() {
        const { offline, redirectUri, callback } = this.props;
        var self ,
            g_timeout = 15000,
            g_loginCount = 0,
            g_timer = null;
        var RequestUrl = {
            code: {method: "GET", url: "https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email&state=/profile&redirect_uri=http://apps.obigo.com/google/callback.html&response_type=code&approval_prompt=force&access_type=offline"},
            access_token: {method: "POST", url: "https://www.googleapis.com/oauth2/v3/token"},
        }

        var OAuthParam = {
            clientId: "949034064011-7os3b956vkm8l6fit0frkhjc0ak523hn.apps.googleusercontent.com",
            clientSecret: "-Mk-swkPC5rHp0gJNQXSRB_i",
            accessOauthToken: null,
            refreshToken: null
        }
        function parseQueryString(str){
            var objURL = {};

            str.replace(
                new RegExp("([^?=&]+)(=([^&]*))?", "g"),
                function ($0, $1, $2, $3) {
                    objURL[$1] = $3;
                }
            );
            return objURL;
        }

        var GRANT_TYPE_AUTHORIZATION_CODE = "authorization_code",
            GRANT_TYPE_REFRESH_TOKEN = "refresh_token";

        var a = RequestUrl.code.url+"&client_id=" + OAuthParam.clientId;  // change to props
        var child_window = window.open(RequestUrl.code.url+"&client_id=" + OAuthParam.clientId, "login");

        if(!g_timer){
            g_timer = setInterval(function(){
                var param = parseQueryString(child_window.location.href);
                if(param["code"]){
                    clearInterval(g_timer);
                    g_timer = null;

                    child_window.close();

                    OAuthParam.refreshToken = param["code"];
                    obigo.storage.set('obigo-google-refresh-token', OAuthParam.refreshToken);
                    //self.refreshToken(GRANT_TYPE_AUTHORIZATION_CODE); //TBD
                    callback(param);
                }else if(param["error"] && param["error"] == "access_denied"){
                    clearInterval(g_timer);
                    child_window.close();
                    //g_loading.hide();
                    g_timer = null;
                }
            }, 1000);
        }

        // const auth2 = window.gapi.auth2.getAuthInstance();
        // const { offline, redirectUri, callback } = this.props;
        // if (offline) {
        //     const options = {
        //         'redirect_uri': redirectUri,
        //     };
        //     auth2.grantOfflineAccess(options)
        //         .then((data) => {
        //             callback(data);
        //         });
        // } else {
        //     auth2.signIn()
        //         .then((response) => {
        //             callback(response);
        //         });
        // }
    }

    render() {
        const style = {
            display: 'inline-block',
            background: '#d14836',
            color: '#fff',
            width: 190,
            paddingTop: 10,
            paddingBottom: 10,
            borderRadius: 2,
            border: '1px solid transparent',
            fontSize: 20,
        };
        const { cssClass, buttonText, children } = this.props;
        return (
            <button
                className={ cssClass }
                onClick={ this.onBtnClick.bind(this) }
                
            >
                { children ? children : buttonText }
            </button>
        );
    }
}

GoogleLogin.propTypes = {
    callback: React.PropTypes.func.isRequired,
    clientId: React.PropTypes.string.isRequired,
    buttonText: React.PropTypes.string,
    offline: React.PropTypes.bool,
    scope: React.PropTypes.string,
    cssClass: React.PropTypes.string,
    redirectUri: React.PropTypes.string,
    cookiePolicy: React.PropTypes.string,
    children: React.PropTypes.node,
}

GoogleLogin.defaultProps = {
    buttonText: 'Login with Google',
    scope: 'profile email',
    redirectUri: 'postmessage',
    cookiePolicy: 'single_host_origin',
};

export default GoogleLogin;


// var RequestUrl = {
//     code: {method: "GET", url: "https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email&state=/profile&redirect_uri=http://apps.obigo.com/google/callback.html&response_type=code&approval_prompt=force&access_type=offline"},
//     access_token: {method: "POST", url: "https://www.googleapis.com/oauth2/v3/token"},
// }
//
// var OAuthParam = {
//     clientId: "949034064011-7os3b956vkm8l6fit0frkhjc0ak523hn.apps.googleusercontent.com",
//     clientSecret: "-Mk-swkPC5rHp0gJNQXSRB_i",
//     accessOauthToken: null,
//     refreshToken: null
// }