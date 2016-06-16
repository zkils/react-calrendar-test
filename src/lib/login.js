/**
 * Created by krinjadl on 2016-06-16.
 */
import AppManager from './AppManager';
import obigo from './util';


module.exports = {
    LOGIN_FLAG_CUSTOM: 0x0001,
    LOGIN_FLAG_FACEBOOK: 0x0010,
    LOGIN_FLAG_GOOGLE: 0x0100,
    LOGIN_FLAG_TWITTER: 0x1000,
    g_loading: null,
    g_appName: null,
    timesync: false,
    self: null,
    loginObj: {
        LOGIN_FLAG_CUSTOM: {
            obj: null,
            jsPath: "",
            text: "custom"
        },
        LOGIN_FLAG_FACEBOOK: {
            obj: "OFacebookLogin",
            jsPath: "../launcher/common/js/oauth_facebook_v23.js",
            text: "facebook"
        },
        LOGIN_FLAG_GOOGLE: {
            obj: "OGoogleLogin",
            jsPath: "../launcher/common/js/oauth_google_v20.js",
            text: "google"
        },
        LOGIN_FLAG_TWITTER: {
            obj: "OTwitterLogin",
            jsPath: "../launcher/common/js/oauth_twitter_v10.js",
            text: "twitter"
        }
    },
    obigoLogin: function (options) {
        if (typeof obigo !== "undefined" && typeof obigo.loading === "function") {
            //g_loading = new obigo.loading();
        }
        g_appName = AppManager.getAppName()

        this.self = this;
        var appUrl = window.location.href.split('/');
        self.isCheckedRemember = false;
        self.options = options;
        self.login_flag = options.flag;
        self.login_obj = [];
        self.current_login_obj_index = -1;
        self.javascriptInjection();
        self.isShow = false;
        //self.init();

        return self;
    },
    isShowOAuth: function () {
        if (self.current_login_obj_index > -1) {
            return self.login_obj[self.current_login_obj_index].winId;
        } else {
            return null;
        }
    },
    showOAuth: function () {
        if (self.current_login_obj_index > -1) {
            self.login_obj[self.current_login_obj_index].showOAuth();
        }
    },
    hideOAuth: function () {
        if (self.current_login_obj_index > -1) {
            self.login_obj[self.current_login_obj_index].hideOAuth();
        }
    },
    init: function () {
        self.isClick = false;
        if (window.nativecall) {
            var infobarparam = new infobarcallInfo();
            infobarparam.infobar = 1;

            nativecall.set(nativecall.infobar, infobarparam, function () {
                console.log("show inforbar");
            }, function () {
                console.log("ouucr error :show inforbar");
            });
        }
        self.insertCSS(self.insertDom);
        if (window.history.clear) {
            window.history.clear();
        }
    },
    insertLogin: function () {
        //self.insertDom();
        self.bindEvent();

        self.isCheckedRemember = obigo.storage.get("obigoLogion");

        if (self.isCheckedRemember) {
            var id = obigo.storage.get("obigoLogion_id");

            self.chk_remember.checked = true;
            self.input_id.value = id;
        }

        self.current_login_obj_index = obigo.storage.get("login_obj_index");

        if (self.current_login_obj_index !== null && self.current_login_obj_index > -1 && self.login_obj.length != 0 && self.login_obj[self.current_login_obj_index].isLoggedIn()) {
            if (self.options.needNotLoginProgress) {
            } else {
                g_loading.show();
                self.login_obj[self.current_login_obj_index].requestToken();
            }
        } else {
            if (self.options.display !== 'none') {
                self.open()
            }
        }
        document.body.classList.remove("login");
    },
    javascriptInjection: function () {
        self.JsCnt = 0;
        self.loadedJsCnt = 0;
        for (var l in loginObj) {
            if ((self.login_flag & l) == l && loginObj[l].obj) {
                self.JsCnt++;

                var js = document.createElement('script');
                js.setAttribute("type", "text/javascript");
                js.setAttribute("src", loginObj[l].jsPath);

                js.addEventListener("load", self.createLoginObj);
                document.head.appendChild(js);
            }
        }
        if (!self.JsCnt) {
            self.init();
        }
    },
    createLoginObj: function () {
        self.loadedJsCnt++
        if (self.JsCnt == self.loadedJsCnt) {
            for (var l in loginObj) {
                if ((self.login_flag & l) == l && loginObj[l].obj) {
                    self.login_obj.push(new (eval(loginObj[l].obj))(self.options));
                }
            }

            self.init();
        }
    },
    insertCSS: function (callback) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '../launcher/common/css/login.css';
        document.head.appendChild(link);

        link.addEventListener("load", callback);
    },
    insertDom: function () {
        var button = "";
        var index = 0;

        for (var l in loginObj) {
            if ((self.login_flag & l) == l) {
                button = button + "<div class='obigo_login_button_" + loginObj[l].text + "' id='obigo_login_button_" + loginObj[l].text + "' data-id=" + ((l == LOGIN_FLAG_CUSTOM) ? -1 : index++) + "></div>"
            }
        }

        var placeholder = self.options.placeholder || {};
        var html = '<div id="obigo_login">' +
            '    <img src="../launcher/common/img/login_bg.png" class="obigo_login_bg" style="z-index: 1;"/>' +
            '    <div class="obigo_login_main">' +
            '        <div class="obigo_login_list">' +
            '            <div class="obigo_login_buttons">' + button +
            '                <p class="signup">To sign up use your mobile device or computer</p>' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '    <div class="obigo_login_custom">' +
            '        <div class="obigo_login_input">' +
            '            <input class="obigo_login_ip_id" type="text" placeholder="' + (placeholder.id || 'Sign in with E-MAIL') + '" />' +
            '            <input class="obigo_login_ip_pw" type="password" placeholder="' + (placeholder.pw || 'Password') + '" />' +
            '            <a class="obigo_login_btn_login">login</a>' +
            '        </div>' +
            '        <div class="obigo_login_check">' +
            '            <input type="checkbox" id="remember"/>' +
            '            <label for="remember">Remember ID</label>' +
            '       </div>' +
            '    </div>' +
            '    <div class="obigo_login_footer">' +
            '        <a class="obigo_login_menu dis"></a>' +
            '        <a class="obigo_login_split"></a>' +
            '    </div>' +
            '</div>';
        html = html.replace("{{:appName}}", g_appName.charAt(0).toUpperCase() + g_appName.slice(1));
        document.body.insertAdjacentHTML('beforeend', html);

        self.container = document.querySelector('#obigo_login');
        self.btn_login = self.container.querySelector('.obigo_login_btn_login');
        self.chk_remember = self.container.querySelector('#remember');
        self.btn_list = self.container.querySelector('.obigo_login_menu');
        self.btn_split = self.container.querySelector('.obigo_login_split');
        self.input_id = self.container.querySelector('.obigo_login_ip_id');
        self.input_pw = self.container.querySelector('.obigo_login_ip_pw');

        document.querySelector(".obigo_login_bg").addEventListener("load", self.insertLogin);

        // setTimeout(function(){
        //     if(Logo[g_appName.toLowerCase()]){
        //         var sheets = document.styleSheets;
        //         if(sheets.length === 0) {
        //             var styleTag = document.createElement("style");
        //             document.getElementsByTagName("head")[0].appendChild(styleTag);
        //             sheets = document.styleSheets[0];
        //             styleTag = null;
        //         } else {
        //             sheets = document.styleSheets[sheets.length-1];
        //         }
        //         var len = (sheets.cssRules) ? sheets.cssRules.length : 1;
        //         sheets.addRule(".obigo_login_header > h1", Logo[g_appName.toLowerCase()].css.replace("{{:logo}}", Logo[g_appName.toLowerCase()].img) , len);

        //         sheets = null;
        //         len = null;
        //         styleFlag = true;
        //     }
        // },500);
    },
    bindEvent: function () {
        new ButtonHelper({
            evtTarget: self.btn_split,
            cssTarget: self.btn_split,
            hotKey: USER_VK_LONG_APP,
            cssName: 'active',
            callback: function (evt, target) {
                if (!(self.current_login_obj_index != null && self.current_login_obj_index > -1 && self.login_obj[self.current_login_obj_index].winId)) {
                    if (window.AppManager) {
                        AppManager.activeApplications();
                    }
                }
            }
        });
        new ButtonHelper({
            evtTarget: self.btn_login,
            cssTarget: self.btn_login,
            cssName: 'active',
            callback: self.login
        });

        for (var l in loginObj) {
            if ((self.login_flag & l) == l) {
                new ButtonHelper({
                    evtTarget: document.querySelector("#obigo_login_button_" + loginObj[l].text),
                    cssName: 'active',
                    callback: function (evt) {
                        var retry = 0;

                        function loginTry() {
                            console.log("[OAuth] loginTry=========================================");
                            self.current_login_obj_index = evt.target.dataset.id;
                            obigo.storage.set("login_obj_index", self.current_login_obj_index);
                            if (self.options.btnCallback) {
                                self.options.btnCallback(evt.target.dataset.id);
                            }
                            if (self.current_login_obj_index > -1) {
                                if (navigator.onLine) {
                                    g_loading.show();
                                    self.isClick = true;
                                    console.log("[OAuth] login=========================================");
                                    self.login_obj[self.current_login_obj_index].login();
                                    self.isClick = false;
                                } else {
                                    g_loading.hide();
                                    obigo.message({
                                        title: "Wi-Fi network not connected. <br/> Please check and try again",
                                        button: ["OK"],
                                        callback: [function () {
                                            self.current_login_obj_index = -1;
                                            obigo.storage.set("login_obj_index", self.current_login_obj_index);
                                            if (self.options.networkFailCallback) {
                                                self.options.networkFailCallback();
                                            }
                                        }]
                                    });
                                }
                            } else {
                                g_loading.hide();
                                self.showCustomLogin();
                            }
                        }

                        if (!isLoginWindowShow() && !self.isClick) {
                            if (!timesync && navigator.userAgent.indexOf("Obigo") > 0) {
                                g_loading.show();
                                timexmlhttp = new XMLHttpRequest();

                                timexmlhttp.open("GET", "http://210.216.54.99:3000/", true);
                                timexmlhttp.timeout = 5000;

                                timexmlhttp.onload = function (evt) {
                                    var xmlObj, jsonObj;
                                    if (timexmlhttp.status === 200 || timexmlhttp.status === 0) {
                                        var timeData = null;

                                        if (timexmlhttp.responseText) {
                                            try {
                                                var curtimeDate = new Date(),
                                                    serverDate = null,
                                                    hour = 1000 * 60 * 15;

                                                serverDate = JSON.parse(timexmlhttp.responseText).time;
                                                serverDate = new Date(serverDate);

                                                if ((Math.abs(curtimeDate.getTime() - serverDate.getTime())) < hour) {
                                                    timesync = true;

                                                    console.log("[OAuth] date loginTry=========================================");
                                                    loginTry();
                                                } else {
                                                    g_loading.hide();
                                                    console.log("[OAuth] date error=========================================");
                                                    obigo.message({
                                                        title: "Incorrect date/time. <br/>Please check and try again",
                                                        button: ["OK"],
                                                        callback: [function () {
                                                            self.options.networkFailCallback(oauth_self.EventType.OAUTH_ERROR_TIMESYNC);
                                                        }]
                                                    });
                                                }
                                            } catch (err) {
                                                timexmlhttp.onerror();
                                            }
                                        }
                                    } else {
                                        timexmlhttp.onerror();
                                    }

                                };
                                timexmlhttp.ontimeout = function (evt) {
                                    loginTry();
                                };
                                timexmlhttp.onerror = function (evt) {
                                    loginTry();
                                };

                                timexmlhttp.send(null);
                            } else {
                                loginTry();
                            }
                        }
                    }
                });
            }
        }
    },
    open: function () {
        if (!self.login_obj.length) {
            self.showCustomLogin();
        } else {
            self.container.className = "main"
        }
        self.container.style.display = 'block';
        self.isShow = true;
        if (self.options.subTitle) {
            self.preSubTitle = self.options.subTitle.innerHTML;
            self.options.subTitle.innerHTML = " - Login";
        }
    },
    close: function () {
        self.container.style.display = 'none';
        self.isShow = false;
        if (self.options.subTitle && self.preSubTitle) {
            self.options.subTitle.innerHTML = self.preSubTitle;
        }
    },
    showCustomLogin: function () {
        self.input_pw.value = "";
        self.container.className = "custom";
    },
    nowPage: function () {
        if (self.container.className == "main" || self.login_obj.length == 0) {
            return 0;
        } else {
            return 1;
        }
    },
    login: function () {
        if (self.options.callback) {
            var v = new Object();
            v.id = self.input_id.value;
            v.pw = self.input_pw.value;
            self.input_pw.value = "";
            if (!self.chk_remember.checked) {
                self.input_id.value = "";
            }

            obigo.storage.set("login_obj_index", -1);
            obigo.storage.set("obigoLogion", self.chk_remember.checked);
            obigo.storage.set("obigoLogion_id", v.id);

            self.options.callback(LOGIN_FLAG_CUSTOM, v);
        }
    },
    logout: function () {
        self.login_obj[self.current_login_obj_index].logout();
        if (AppManager) {
            AppManager.EnableKeypad(true);
        }
    },
    getProperty: function (property) {
        return self.login_obj[self.current_login_obj_index].getProperty(property);
    },
    getAccessToken: function () {
        return self.login_obj[self.current_login_obj_index].getAccessToken();
    },
    isCustomLogin: function () {
        var rtn = false;
        if (self.current_login_obj_index < 0) {
            rtn = true;
        }

        return rtn;
    },
    isLoggedIn: function () {
        if (self.login_obj.length) {
            return self.login_obj[self.current_login_obj_index].isLoggedIn();
        }
        return false;
    },
    back: function () {
        var rtn = false;
        if (self.isShow) {
            if (self.container.className == "custom") {
                self.container.className = "main";
            } else if (self.current_login_obj_index != null && self.current_login_obj_index != -1) {
                if (self.login_obj.length) {
                    g_loading.hide();
                    if (!self.login_obj[self.current_login_obj_index].back()) {
                        if (self.login_obj.length > 1) {
                            self.close();
                        } else {
                            rtn = true;
                        }
                    }
                }
            } else if (self.container.className == "main") {
                if (self.login_obj.length > 1) {
                    self.close();
                } else {
                    rtn = true;
                }
            }
        } else {
            rtn = true;
        }

        return rtn;
    },
    destroyOAuthWindow: function () {
        if (self.login_obj.length && self.login_obj[self.current_login_obj_index].winId) {
            self.login_obj[self.current_login_obj_index].destroyOAuthWindow();
        }
    },
    getCurrentSocial: function () {
        if (self.current_login_obj_index > -1) {
            return self.login_obj[self.current_login_obj_index].social;
        }

        return "social account";
    }



    
}