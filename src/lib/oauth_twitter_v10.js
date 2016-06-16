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
var OAUTH_ACESSTOKEN = "accessOauthToken",
    OAUTH_ACCESSTOKENSECRET = "accessOauthTokenSecret";

(function(){
    try{
        var self = null,
            g_timeout = 15000,
            g_loginCount = 0,
            g_timer = null;

        var RequestUrl = {
            request_token: {method: "POST", url: "https://api.twitter.com/oauth/request_token"},
            authorize: {method: "GET", url: "https://api.twitter.com/oauth/authorize"},
            access_token: {method: "POST", url: "https://api.twitter.com/oauth/access_token"},
        }

        var OAuthParam = {
            consumerKey: "HXG3ZIIokzKHwYBybMjuM3EMf",
            consumerSecret: "IoKshYWHvfb28LBOUAPrfFlR5QpyX2wQoUDEuSHoBBSyFgVEzY",
            oauthVerifier: null,
            oauthToken:  null,
            accessOauthToken: null,
            accessOauthTokenSecret: null,
            userId: null,
            screenName: null
        }

        var OTwitterLogin = function(options){
            self = this;
            self.isActive = true;
            self.winId = null;
            self.social = "Twitter";

            self.callback = options.callback;
            if(options.cumstomTiwtterId){
                OAuthParam.consumerKey = options.cumstomTiwtterId.consumerKey;
                OAuthParam.consumerSecret = options.cumstomTiwtterId.consumerSecret;
            }
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

        OTwitterLogin.prototype = new OAuthoLogin();

        OTwitterLogin.prototype.init = function(){
        }
        OTwitterLogin.prototype.getProperty = function(property){
            return OAuthParam[property];
        }
        OTwitterLogin.prototype.login = function(){
            g_isChangeHref = true;
            self.xmlhttprequest = null;

        	function authenticate(res){
	            OAuthParam.oauthToken = res.split("&")[0].split("=")[1];

	            if (navigator.userAgent.indexOf("Obigo") > 0) {
                    obigo.storage.set('obigo-twitter-access_oauth_token', null);
                    obigo.storage.set('obigo-twitter-access_oauth_token_secret', null);

                    if(document.deleteCookie){
                        document.deleteCookie(RequestUrl.request_token.url, "auth_token");
                    }

                    if(self.isActive){
                        AppManager.bindEvent("OAuthEvent", self.OAuthEventCallback);
                        console.log("[OAuth]createOAuthWindow start=========================");
                        self.winId = AppManager.createOAuthWindow((RequestUrl.authorize.url+"?oauth_token=" + OAuthParam.oauthToken), 0, 69, 800, 412, null, true);
                        console.log("[OAuth]createOAuthWindow winId = " + self.winId);
                        self.urlUpdated = false;
                        g_loading.show();
                    }
	            }else{
	                child_window = window.open(RequestUrl.authorize.url+"?oauth_token=" + OAuthParam.oauthToken, "login");

	                if(!g_timer){
	                    g_timer = setInterval(function(){
                            var param = self.parseQueryString(child_window.location.href);
                            if(param["oauth_verifier"] && param["oauth_token"]){
	                            clearInterval(g_timer);
                                    g_timer = null;
	                            child_window.close();

					            OAuthParam.oauthToken = param["oauth_token"];
					            OAuthParam.oauthVerifier = param["oauth_verifier"];

	                            self.requestToken();
	                            self.close();
	                        }else if(param["denied"]){
                                clearInterval(g_timer);
                                child_window.close();
                                g_loading.hide();
                                g_timer = null;
                            }
	                    }, 1000);
	                }
	            }
	        }
            g_loading.show();
            self.xmlhttprequest = self.httpRequest({
                url: RequestUrl.request_token.url,
                type: RequestUrl.request_token.method,
                async: true,
                timeout: g_timeout,
                requestHeader : {"Authorization": authStr.getAuthStr(RequestUrl.request_token.url, RequestUrl.request_token.method, {})},
                success: function(data, textStatus) {
                    g_loading.hide();
                    g_loginCount = 0;
                    authenticate(data);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(window.nativecall){
                        var infobarparam = new infobarcallInfo();
                        infobarparam.infobar = 1;
                        
                        nativecall.set(nativecall.infobar, infobarparam, function(){
                            console.log("show inforbar");
                        }, function(){
                            console.log("ouucr error :show inforbar");
                        });
                    }

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
                        
                        if (g_loginCount < 4) {
                            if(obigo.message){
                                var errorResponse = null

                                if(jqXHR.response){
                                    errorResponse = JSON.parse(jqXHR.response);
                                }
                                if((errorResponse  && errorResponse.errors[0].code == 135) || textStatus == "timeerror" ){
                                    obigo.message({
					    title : "Incorrect date/time. <br/>Please check and try again",
                                        button: ["OK"],
                                        callback: [function(){
                                            self.networkFailCallback(self.EventType.OAUTH_ERROR_TIMESYNC);
                                        }]
                                    });
                                }else{
                                    obigo.message({
                                        title: "Internet connection not available!",
                                        button: ["Cancel","Retry"],
                                        callback: [function(){
                                            if(self.networkFailCallback){
                                                self.networkFailCallback(jqXHR);
                                            }
                                        }, self.login]
                                    });
                                }
                            }else{
                                alert("Network is unavailable");
                            }
                        } else {
                            if(obigo.message){
                                obigo.message({
                                    title: "You have exceeded <br/> 3 attempts. <br/> Please restart the application",
                                    button: ["OK"],
                                    callback : [function(){
                                    AppManager.stopApplication();
                                    }]
                                });
                            }else{
                                alert("Please restart this application");
                            }
                        }
                    }
                    console.log("ERROR : "+textStatus+", "+errorThrown);
                }
            });
        }
        OTwitterLogin.prototype.logout = function(){
            g_loading.show();
            obigo.storage.set('obigo-twitter-access_oauth_token', null);
            obigo.storage.set('obigo-twitter-access_oauth_token_secret', null);

            if(document.deleteCookie){
            	document.deleteCookie(RequestUrl.request_token.url, "auth_token");
            }
            g_loading.hide();
            self.init();
        }
        OTwitterLogin.prototype.isLoggedIn = function(){
            var rtn = false;

            var param = self.parseQueryString(window.location.href);

            OAuthParam.oauthToken = param["oauth_token"];
            OAuthParam.oauthVerifier = param["oauth_verifier"];

            if(OAuthParam.oauthToken && OAuthParam.oauthVerifier){
                var OToken = obigo.storage.get("obigo-twitter-oauth_token");

                if(OAuthParam.oauthToken != OToken){
                    obigo.storage.set("obigo-twitter-oauth_token", OAuthParam.oauthToken);
                    rtn = true;
                }
            }

            OAuthParam.accessOauthToken = obigo.storage.get('obigo-twitter-access_oauth_token');
            OAuthParam.accessOauthTokenSecret = obigo.storage.get('obigo-twitter-access_oauth_token_secret');

            if(OAuthParam.accessOauthToken && OAuthParam.accessOauthTokenSecret){
            	rtn = true;
            }

            return rtn;
        }
        OTwitterLogin.prototype.requestToken = function(){
            function request(){
                self.httpRequest({
                    url: RequestUrl.access_token.url,
                    type: RequestUrl.access_token.method,
                    async: true,
                    timeout: g_timeout,
                    requestHeader : {"Authorization": authStr.getAuthStr(RequestUrl.access_token.url, RequestUrl.access_token.method, {})},
                    data:{
                        oauth_verifier : OAuthParam.oauthVerifier,
                        oauth_token : OAuthParam.oauthToken
                    },
                    success:function(data, textStatus, xhr){
                        g_loading.hide();
                        g_loginCount = 0;

                        var param = self.parseQueryString(data)
                        OAuthParam.accessOauthToken = param["oauth_token"]
                        OAuthParam.accessOauthTokenSecret = param["oauth_token_secret"]

                        obigo.storage.set("obigo-twitter-access_oauth_token", OAuthParam.accessOauthToken);
                        obigo.storage.set("obigo-twitter-access_oauth_token_secret", OAuthParam.accessOauthTokenSecret);

                        if(self.callback){
                            self.callback(LOGIN_FLAG_TWITTER, undefined);
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
            if(OAuthParam.oauthToken && OAuthParam.oauthVerifier){
	            var apiUrl = "https://api.twitter.com/oauth/access_token",
	                reqMethod = "POST";

                g_loading.show();
	            request();
			}else{
				if(self.callback){
					self.callback();
				}
			}
        }
        OTwitterLogin.prototype.getAccessToken = function(){
            return OAuthParam[OAUTH_ACESSTOKEN];
        }
        OTwitterLogin.prototype.back = function(){
            var rtn = false;

            if(self.winId){
                AppManager.historyBackOAuthWIndow(self.winId);
                rtn = true;
            }else{
                if(self.xmlhttprequest){
                    self.xmlhttprequest.abort();
                    self.xmlhttprequest = null;
                }
            }

            return rtn;
        }
        OTwitterLogin.prototype.destroyOAuthWindow = function(alreadyClose){
            g_loading.hide();
            if(!self.vk){
                self.vk = new VirtualKeypad();
            }
            
            
            console.log("[OAuth]destroyOAuthWindow start=========================");
            console.log("[OAuth]destroyOAuthWindow winId = " + self.winId);
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
        OTwitterLogin.prototype.OAuthEventCallback = function(state, url){
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

                    if(param["oauth_verifier"] && param["oauth_token"]){
                        g_loginCount = 0;
                        self.close();
                        self.destroyOAuthWindow();

                        OAuthParam.oauthToken = param["oauth_token"];
                        OAuthParam.oauthVerifier = param["oauth_verifier"];

                        self.requestToken();
                    }else if(param["denied"]){
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
        OTwitterLogin.prototype.showOAuth  = function(){
            if(self.winId){
                AppManager.showOAuthWindow(self.winId);
            }
        }
        OTwitterLogin.prototype.hideOAuth  = function(){
            if(self.winId){
                AppManager.hideOAuthWindow(self.winId);
            }
        }

        window.OTwitterLogin = OTwitterLogin;

        var authStr={};

        authStr.getAuthStr = function(url, method, args, accessOauthTokenSecret){
            var nowTimestamp = Math.floor(Date.now() / 1000);
            var signatureMessage={};
            var accessor = {
                consumerSecret : OAuthParam.consumerSecret,
                tokenSecret : ""
            };
            var paramItem=[];

            if(accessOauthTokenSecret != undefined ){
                accessor.tokenSecret = accessOauthTokenSecret;
            }

            signatureMessage.method = method;
            signatureMessage.action = url;
            signatureMessage.parameters = [];

            signatureMessage.parameters[0]=[];
            signatureMessage.parameters[0].push("oauth_version");
            signatureMessage.parameters[0].push("1.0");

            signatureMessage.parameters[1]=[];
            signatureMessage.parameters[1].push("oauth_consumer_key");
            signatureMessage.parameters[1].push(OAuthParam.consumerKey);

            signatureMessage.parameters[2]=[];
            signatureMessage.parameters[2].push("oauth_timestamp");
            signatureMessage.parameters[2].push(nowTimestamp);

            signatureMessage.parameters[3]=[];
            signatureMessage.parameters[3].push("oauth_nonce");
            signatureMessage.parameters[3].push((nowTimestamp+125)+"");

            signatureMessage.parameters[4]=[];
            signatureMessage.parameters[4].push("oauth_signature_method");
            signatureMessage.parameters[4].push("HMAC-SHA1");

            for( var key in args){
                paramItem = [];
                if(typeof(args[key]) == "object"){
                    for( var paramKey  in args[key]){
                        paramItem.push(paramKey);
                        paramItem.push(args[key][paramKey]);
                    }
                }else{
                    paramItem.push(key);
                    paramItem.push(args[key]);
                }
                signatureMessage.parameters.push(paramItem);
            }

            OAuth.SignatureMethod.sign(signatureMessage, accessor);
            OAuth.SignatureMethod.normalizeParameters(signatureMessage.parameters);
            OAuth.SignatureMethod.getBaseString(signatureMessage);
            return OAuth.getAuthorizationHeader("", signatureMessage.parameters);

        };

        window.authStr = authStr;

        var js_oauth=document.createElement('script');
        js_oauth.setAttribute("type","text/javascript");
        js_oauth.setAttribute("src", "../launcher/common/js/oauth_twitter_comOauth.js");
        document.head.appendChild(js_oauth);

        var js_sha1crypt=document.createElement('script');
        js_sha1crypt.setAttribute("type","text/javascript");
        js_sha1crypt.setAttribute("src", "../launcher/common/js/oauth_twitter_comSha1crypt.js");
        document.head.appendChild(js_sha1crypt);
    } catch(err) {
        console.log(err.message);
    }
})();


