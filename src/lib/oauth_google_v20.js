/****************************************************************
Copyright (C) OBIGO Ltd., 2014.
All rights reserved.

This software is covered by the license agreement between
the end user and OBIGO Ltd., and may be
used and copied only in accordance with the terms of the
said agreement.

OBIGO Ltd. assumes no responsibility or
liability for any errors or inaccuracies in this software,
or any consequential, incidental or indirect damage arising
out of the use of the software.
****************************************************************/
var OAUTH_ACESSTOKEN = "accessOauthToken";

(function(){
    try{
        var self = null,
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

        var GRANT_TYPE_AUTHORIZATION_CODE = "authorization_code",
            GRANT_TYPE_REFRESH_TOKEN = "refresh_token"

        var OGoogleLogin = function(options){
            self = this;
            self.isActive = true;
            self.winId = null;
            self.social = "Google+";

            self.callback = options.callback;
            self.isRefreshToken = true;
            if(options.networkFailCallback){
                self.networkFailCallback = options.networkFailCallback;
            }

            if(window.AppManager){
                AppManager.bindEvent("ApplicationHidden", function(){
                    self.isActive = false;
                    if(self.winId){
                        self.destroyOAuthWindow();
                    }
                });
                AppManager.bindEvent("ApplicationShown", function(){
                    self.isActive = true;
                });
            }

            return this;
        };

        OGoogleLogin.prototype = new OAuthoLogin();

        OGoogleLogin.prototype.init = function(){
        }
        OGoogleLogin.prototype.getProperty = function(property){
            return OAuthParam[property];
        }
        OGoogleLogin.prototype.login = function(){
            if (navigator.userAgent.indexOf("Obigo") > 0) {
                if(document.deleteCookie){
                    document.deleteCookie(RequestUrl.code.url, "ACCOUNT_CHOOSER");
                    document.deleteCookie(RequestUrl.code.url, "SSID");
                }
                obigo.storage.set('obigo-google-refresh-token', null);

                if(self.isActive){
                    AppManager.bindEvent("OAuthEvent", self.OAuthEventCallback);

                    console.log("[OAuth] createOAuthWindow=========================================");
                    self.winId = AppManager.createOAuthWindow((RequestUrl.code.url+"&client_id=" + OAuthParam.clientId), 0, 69, 800, 412, null, true);
                    self.urlUpdated = false;
                    g_loading.show();
                }
            }else{
                var a = RequestUrl.code.url+"&client_id=" + OAuthParam.clientId;
                child_window = window.open(RequestUrl.code.url+"&client_id=" + OAuthParam.clientId, "login");

                if(!g_timer){
                    g_timer = setInterval(function(){
                        var param = self.parseQueryString(child_window.location.href);
                        if(param["code"]){
                            clearInterval(g_timer);
                            g_timer = null;

                            child_window.close();

                            OAuthParam.refreshToken = param["code"];
                            obigo.storage.set('obigo-google-refresh-token', OAuthParam.refreshToken);
                            self.refreshToken(GRANT_TYPE_AUTHORIZATION_CODE);
                        }else if(param["error"] && param["error"] == "access_denied"){
                            clearInterval(g_timer);
                            child_window.close();
                            g_loading.hide();
                            g_timer = null;
                        }
                    }, 1000);
                }
            }
        }
        OGoogleLogin.prototype.logout = function(){
            g_loading.show();

            if(document.deleteCookie){
                document.deleteCookie(RequestUrl.code.url, "ACCOUNT_CHOOSER");
                document.deleteCookie(RequestUrl.code.url, "SSID");
            }
            obigo.storage.set('obigo-google-refresh-token', null);

            g_loading.hide();
            self.init();
        }
        OGoogleLogin.prototype.isLoggedIn = function(){
            var rtn = false;

            var param = self.parseQueryString(window.location.href);
            if(param["code"] && obigo.storage.get('obigo-google-code')!=param["code"]){
                OAuthParam.refreshToken = param["code"];
                obigo.storage.set('obigo-google-refresh-token', OAuthParam.refreshToken);
                obigo.storage.set('obigo-google-code', OAuthParam.refreshToken);
                self.isRefreshToken = false;
            }

            OAuthParam.refreshToken = obigo.storage.get('obigo-google-refresh-token');
            if(OAuthParam.refreshToken){
                rtn = true;
            }

            return rtn;
        }
        OGoogleLogin.prototype.requestToken = function(){
            if(OAuthParam.refreshToken){
                var grantType = GRANT_TYPE_AUTHORIZATION_CODE;

                if(self.isRefreshToken){
                    grantType = GRANT_TYPE_REFRESH_TOKEN;
                }
                self.refreshToken(grantType);
            }
        }
        OGoogleLogin.prototype.refreshToken = function(grantType){
            function request(){
                var d = {
                    client_id: OAuthParam.clientId,
                    client_secret: OAuthParam.clientSecret
                };
                //grantType = GRANT_TYPE_REFRESH_TOKEN;

                if(grantType == GRANT_TYPE_AUTHORIZATION_CODE){
                    d.code = OAuthParam.refreshToken;
                    d.redirect_uri = "http://apps.obigo.com/google/callback.html"
                    d.approval_prompt = "force";
                }else{
                    d.refresh_token = OAuthParam.refreshToken;
                }
                d.grant_type = grantType;
                self.httpRequest({
                    //url: RequestUrl.access_token.url+"&client_id=" + OAuthParam.clientId + "&client_secret=" + OAuthParam.clientSecret + ((grantType==GRANT_TYPE_AUTHORIZATION_CODE)?"&code=":"&refresh_token=") + OAuthParam.refreshToken + "&grant_type="+grantType,
                    url: RequestUrl.access_token.url,
                    type: "POST",
                    async: true,
                    data: d,
                    timeout: g_timeout,
                    dataType: "json",
                    success:function(data, textStatus, xhr){
                        self.close();
                        g_loading.hide();
                        g_loginCount = 0;

                        OAuthParam.accessOauthToken = data.access_token;
                        if(data.refresh_token){
                            OAuthParam.refreshToken = data.refresh_token;
                            obigo.storage.set('obigo-google-refresh-token', OAuthParam.refreshToken);
                        }
                        if(self.callback){
                            self.callback(LOGIN_FLAG_GOOGLE, undefined);
                        }
                    },
                    error : function(xhr, textStatus, errorThrown){
                        g_loading.hide();

                        if(textStatus == "nonetwork"){
                            obigo.message({
                                title: "Wi-Fi network not connected. <br/> Please check and try again",
                                button:["OK"],
                                callback:[function(){
                                    if(self.networkFailCallback){
                                        self.networkFailCallback(xhr);
                                    }
                                }]
                            });
                        }else if(textStatus == "timeerror"){
                            obigo.message({
                                title : "Incorrect date/time. <br/>Please check and try again",
                                button:["OK"],
                                callback:[function(){
                                    if(self.networkFailCallback){
                                        self.networkFailCallback(xhr);
                                    }
                                }]
                            });
                        }else{
                            g_loginCount++;
                            if(g_loginCount < 4){
                                obigo.message({
                                    title: "Internet connection not available!",
                                    button: ["Cancel","Retry"],
                                    callback: [function(){
                                        if(self.networkFailCallback){
                                            self.networkFailCallback(xhr);
                                        }
                                    }, request]
                                });
                            }else{
                                obigo.message({
                                    title: "You have exceeded <br/> 3 attempts. <br/> Please restart the application",
                                    button: ["OK"],
                                    callback : [function(){
                                        AppManager.stopApplication();
                                    }]
                                });
                            }
                        }
                    }
                });
            }
            
            request();
        }
        OGoogleLogin.prototype.getAccessToken = function(){
            return OAuthParam[OAUTH_ACESSTOKEN];
        }
        OGoogleLogin.prototype.back = function(){
            var rtn = false;

            if(self.winId){
                AppManager.historyBackOAuthWIndow(self.winId);
                rtn = true;
            }

            return rtn;
        }
        OGoogleLogin.prototype.destroyOAuthWindow = function(alreadyClose){
            g_loading.hide();
            if(!self.vk){
                self.vk = new VirtualKeypad();
            }
            
            if(alreadyClose){
            }else{
                AppManager.destroyOAuthWindow(self.winId);
                AppManager.show();
            }
            AppManager.unbindEvent("OAuthEvent", self.OAuthEventCallback);
            self.winId = null;
            self.vk.close();

            if(window.nativecall){
                var infobarparam = new infobarcallInfo();
                infobarparam.infobar = 1;
                
                nativecall.set(nativecall.infobar, infobarparam, function(){
                    console.log("show inforbar");
                }, function(){
                    console.log("ouucr error :show inforbar");
                });
            }
            if(window.gc){
                window.gc();
            }
        }
        OGoogleLogin.prototype.OAuthEventCallback = function(state, url){
            console.log("[OAuth] state=========================================" + state);
            if(state == self.EventType.OAUTH_RESULT){
                if (self.urlUpdated == false) {
                    if(self.isActive && self.winId){
                        if(window.nativecall){
                            var infobarparam = new infobarcallInfo();
                            infobarparam.infobar = 0;

                            nativecall.set(nativecall.infobar, infobarparam, function(){
                                console.log("hide inforbar");
                            }, function(){
                                console.log("ouucr error :hide inforbar");
                            });
                        }
                        AppManager.showOAuthWindow(self.winId);
                        
                        self.urlUpdated = true;
                    }else if(self.winId){
                        self.destroyOAuthWindow();
                    }
                    g_loading.hide();
                }else{
                    var param = self.parseQueryString(url);
                    if(param["code"]){
                        g_loginCount = 0;
                        self.close();
                        self.destroyOAuthWindow();

                        OAuthParam.refreshToken = param["code"];
                        obigo.storage.set('obigo-google-refresh-token', OAuthParam.refreshToken);
                        self.refreshToken(GRANT_TYPE_AUTHORIZATION_CODE);
                    }else if(param["error"] && param["error"] == "access_denied"){
                        self.destroyOAuthWindow();
                    }
                }
            }else if(state == self.EventType.OAUTH_ERROR_NOBACK) {
                self.destroyOAuthWindow();
            }else if(state == self.EventType.OAUTH_ERROR_CACHE_MISS) {
                self.destroyOAuthWindow();
            }else if(state == self.EventType.OAUTH_ERROR_TIMESYNC){
                self.destroyOAuthWindow();
                obigo.message({
                    title : "Incorrect date/time. <br/>Please check and try again",
                    button: ["OK"],
                    callback: [function(){
                        self.networkFailCallback(self.EventType.OAUTH_ERROR_TIMESYNC);
                    }]
                });
            }else if(state == self.EventType.OAUTH_ERROR_GENERIC || state == self.EventType.OAUTH_ERROR_TIMEOUT){
                self.destroyOAuthWindow();

                g_loginCount++;
                if(g_loginCount < 4){
                    obigo.message({
                        title: "Internet connection not available!",
                        button: ["Cancel","Retry"],
                        callback: [function(){
                            if(self.networkFailCallback){
                                self.networkFailCallback(self.EventType.OAUTH_ERROR_GENERIC);
                            }
                        }, self.login]
                    });
                }else{
                    obigo.message({
                        title: "You have exceeded <br/> 3 attempts. <br/> Please restart the application",
                        button: ["OK"],
                        callback : [function(){
                            AppManager.stopApplication();
                        }]
                    });
                }
            }else if(state == self.EventType.OAUTH_ERROR_OOM){
                self.destroyOAuthWindow(true);
            }else if(state == self.EventType.OAUTH_ERROR_CRASH){
                self.destroyOAuthWindow(true);
            }
        }
        OGoogleLogin.prototype.showOAuth  = function(){
            if(self.winId){
                AppManager.showOAuthWindow(self.winId);
            }
        }
        OGoogleLogin.prototype.hideOAuth  = function(){
            if(self.winId){
                AppManager.hideOAuthWindow(self.winId);
            }
        }

        window.OGoogleLogin = OGoogleLogin;


    } catch(err) {
        console.log(err.message);
    }

})();


