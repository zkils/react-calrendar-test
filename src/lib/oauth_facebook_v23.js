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
            code: {method: "GET", url: "https://m.facebook.com/dialog/oauth?display=touch&redirect_uri=http://apps.obigo.com/facebook/callback.html&auth_type=rerequest&scope=publish_actions,user_posts,email"},
            access_token: {method: "GET", url: "https://graph.facebook.com/oauth/access_token?redirect_uri=http://apps.obigo.com/facebook/callback.html&"},
            exchange_access_token : {method: "GET", url: "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&"}
        }

        var OAuthParam = {
            clientId: 403399413134250,
            secret: "13d387eac4043ae1300ab2c0ae8ad97c",
            code: null,
            accessOauthToken: null
        }

        var OFacebookLogin = function(options){
            self = this;
            self.isActive = true;
            self.winId = null;
            self.vk = null;
            self.social = "Facebook";

            self.callback = options.callback;
            if(options.networkFailCallback){
                self.networkFailCallback = options.networkFailCallback;
            }
            if(options.cumstomFacebookId){
                OAuthParam.clientId = options.cumstomFacebookId.clientId;
                OAuthParam.secret = options.cumstomFacebookId.secret;
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

        OFacebookLogin.prototype = new OAuthoLogin();

        OFacebookLogin.prototype.init = function(){
        }
        OFacebookLogin.prototype.getProperty = function(property){
            return OAuthParam[property];
        }
        OFacebookLogin.prototype.login = function(){
            if (navigator.userAgent.indexOf("Obigo") > 0) {
                if(document.deleteCookie){
                    document.deleteCookie(RequestUrl.access_token.url, "c_user");
                }
                obigo.storage.set("obigo-facebook-access-token", OAuthParam.accessOauthToken);

                if(self.isActive){
                    AppManager.bindEvent("OAuthEvent", self.OAuthEventCallback);

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

                            OAuthParam.code = param["code"];
                            self.requestToken();
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
        OFacebookLogin.prototype.logout = function(){
            g_loading.show();
            OAuthParam.accessOauthToken = null;
            if(document.deleteCookie){
                document.deleteCookie(RequestUrl.access_token.url, "c_user");
            }

            g_loading.hide();
            self.init();
            obigo.storage.set("obigo-facebook-access-token", OAuthParam.accessOauthToken);
        }
        OFacebookLogin.prototype.isLoggedIn = function(){
            var rtn = false;
            var param = self.parseQueryString(window.location.href);

            if(param["code"]){
                OAuthParam.code = param["code"];
                rtn = true;
            }

            OAuthParam.accessOauthToken = obigo.storage.get('obigo-facebook-access-token');
            if(OAuthParam.accessOauthToken){
                rtn = true;
            }

            return rtn;
        }
        OFacebookLogin.prototype.requestToken = function(){
            function request(){
                self.httpRequest({
                    url: RequestUrl.access_token.url + "client_id=" + OAuthParam.clientId + "&client_secret=" + OAuthParam.secret + "&code=" + OAuthParam.code,
                    type: "GET",
                    async: true,
                    timeout: g_timeout,
                    success:function(data, textStatus, xhr){
                        self.close();
                        g_loading.hide();
                        g_loginCount = 0;

                        var param = self.parseQueryString(data)
                        OAuthParam.accessOauthToken = param["access_token"];

                        self.requestLongLiveToken();
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
            if(OAuthParam.accessOauthToken){
                self.requestLongLiveToken();
            }else{
                request();
            }
        }

        OFacebookLogin.prototype.requestLongLiveToken = function(){
            function requestLongLive(){
                self.httpRequest({
                    url: RequestUrl.exchange_access_token.url + "client_id=" + OAuthParam.clientId + "&client_secret=" + OAuthParam.secret + "&fb_exchange_token=" + OAuthParam.accessOauthToken,
                    type: "GET",
                    async: true,
                    timeout: g_timeout,
                    success:function(data, textStatus, xhr){
                        self.close();
                        g_loading.hide();

                        var param = self.parseQueryString(data)
                        OAuthParam.accessOauthToken = param["access_token"];
                        obigo.storage.set("obigo-facebook-access-token", OAuthParam.accessOauthToken);

                        if(self.callback){
                            self.callback(LOGIN_FLAG_FACEBOOK, undefined);
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
                                    }, requestLongLive]
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
            requestLongLive();
        }
        OFacebookLogin.prototype.getAccessToken = function(){
            return OAuthParam[OAUTH_ACESSTOKEN];
        }
        OFacebookLogin.prototype.back  = function(){
            var rtn = false;

            if(self.winId){
                AppManager.historyBackOAuthWIndow(self.winId);
                rtn = true;
            }

            return rtn;
        }
        OFacebookLogin.prototype.destroyOAuthWindow = function(alreadyClose){
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
        OFacebookLogin.prototype.OAuthEventCallback = function(state, url){
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
                        OAuthParam.code = param["code"];
                        self.requestToken();
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
        OFacebookLogin.prototype.showOAuth  = function(){
            if(self.winId){
                AppManager.showOAuthWindow(self.winId);
            }
        }
        OFacebookLogin.prototype.hideOAuth  = function(){
            if(self.winId){
                AppManager.hideOAuthWindow(self.winId);
            }
        }

        window.OFacebookLogin = OFacebookLogin;


    } catch(err) {
        console.log(err.message);
    }

})();


