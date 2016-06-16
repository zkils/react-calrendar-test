/**
 * Created by krinjadl on 2016-06-16.
 */
import AppManager from './AppManager';

module.exports = {
    appName:AppManager.getAppName(),
    getScript : function(files, callback){
        files = (files.constructor == Array) ? files : [files];
        for (var i=0, len=files.length; i<len; i++) {
            var fileref = document.createElement("script");
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", files[i]);
            document.getElementsByTagName("head")[0].appendChild(fileref);
            if(callback){
                fileref.addEventListener("load", callback);
            }
            //document.writeln('<scri' + 'pt src="' + files[i] + '" type="text/javascript"></sc' + 'ript>');
        }
    },
    beep : {
        run : function(){
            /*try{
             if (typeof AppManager != 'undefined' && "appmgr" in AppManager) {
             AppManager.beep();
             } else {
             if (!is_pc_beep_audio_initial) {getScript(files, callback) {
             files = (files.constructor == Array) ? files : [files];
             for (var i=0, len=files.length; i<len; i++) {
             var fileref = document.createElement("script");
             fileref.setAttribute("type", "text/javascript");
             fileref.setAttribute("src", files[i]);
             document.getElementsByTagName("head")[0].appendChild(fileref);
             if(callback){
             fileref.addEventListener("load", callback);
             }
             //document.writeln('<scri' + 'pt src="' + files[i] + '" type="text/javascript"></sc' + 'ript>');
             }
             }

             is_pc_beep_audio_initial = true;
             pc_beep_audio = new Audio();
             pc_beep_audio.setAttribute("src", 'data:audio/ogg;base64,'+BEEP_RESOURCE);
             }
             pc_beep_audio.play();
             }
             } catch (err) {}*/
        }
    },

    storage : {
        get: function (key) {
            var appName  = AppManager.getAppName();
            var strJson = window.localStorage.getItem(appName);
            if (typeof strJson !== 'undefined' && !!strJson && strJson !== null) {
                try {
                    var obj = JSON.parse(strJson);

                    if (typeof obj[key] !== 'undefined' && obj[key] !== null && obj[key] !== null) {
                        return JSON.parse(obj[key]);
                    }else{
                        return null;
                    }
                } catch (err) {
                    return obj[key];
                }
            } else {
                return null;
            }
        },
        set: function(key, val) {
            var appName  = AppManager.getAppName();
            var strJson = window.localStorage.getItem(appName);

            if (typeof strJson !== 'undefined' && !!strJson && strJson !== null) {
                try {
                    var obj = JSON.parse(strJson);
                } catch (err) {

                }
            } else {
                obj = {};
            }

            if (typeof val === 'object') {
                val = JSON.stringify(val);
            }
            obj[key] = val;

            try{
                window.localStorage.setItem(appName,  JSON.stringify(obj));
            }catch(e){
                if(e.code == 22){
                    console.log("error occurred while saving in local storage");
                }
            }
            //if fail throw QUOTA_EXCEEDED_ERR
            //code : 22
            //name : "QuotaExceededError"
        },
        remove: function(key) {
            var strJson = window.localStorage.getItem(appName);
            if (typeof strJson !== 'undefined' && !!strJson && strJson !== null) {
                try {
                    var obj = JSON.parse(strJson);
                    delete obj[key];

                    window.localStorage.setItem(appName, JSON.stringify(obj));
                } catch (err) {
                    return strJson;
                }
            } else {
                return null;
            }
        },
        commonGet: function (key) {
            var strJson = window.localStorage.getItem(key);
            if (typeof strJson !== 'undefined' && !!strJson && strJson !== null) {
                try {
                    var obj = JSON.parse(strJson);
                    return obj;
                } catch (err) {
                    return strJson;
                }
            } else {
                return null;
            }
        },
        commonSet: function(key, val) {
            if (typeof val === 'object') {
                val = JSON.stringify(val);
            }
            window.localStorage.setItem(key, val);
        },
        commonRemove: function(key) {
            if(window.localStorage[key]) {
                window.localStorage.removeItem(key);
            }
        },
        clear: function() {
            if(window.localStorage.length !== 0) {
                window.localStorage.clear();
            }
        }
    },

    encodeFormData : function(data) {
        var pairs = [];
        var regexp = /%20/g;
        for(var name in data) {
            if(data.hasOwnProperty(name)) {
                var val = data[name].toString();
                var pair = encodeURIComponent(name).replace(regexp, "+")+"="+
                    encodeURIComponent(val).replace(regexp, "+");
                pairs.push(pair);
            }
        }
        return pairs.join("&");
    },

    parseXML : function(data){
        var xml, tmp;
        if ( !data || typeof data !== "string" ) {
            return null;
        }

        try {
            tmp = new DOMParser();
            xml = tmp.parseFromString( data , "text/xml" );
        } catch ( e ) {
            xml = undefined;
        }

        if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
            throw new Error( "Invalid XML: " + data );
        }
        return xml;
    },
    timesync : false,
    ajax : function(options) {
        var timestamp = 0;
        var opts = {
            url: null,
            type: "GET",
            data: null,
            async: true,
            timeout: 5000,
            dataType: "text",
            success: null,
            error: null,
            complete: null,
            requestHeader: null,
            minimumtime: 1000,
        };

        for (var p in options) opts[p] = options[p];
        if(!opts.url) return;
        var xmlhttp = null;

        xmlhttp = new XMLHttpRequest();
        opts.type = opts.type.toUpperCase();
        if(opts.async) {
            xmlhttp.timeout = opts.timeout;
        }

        function getDelay(){
            var delay = 0;

            if(timestamp){
                var curTime = new Date();

                curTime = curTime.getTime();
                delay = opts.minimumtime - (curTime - timestamp);
            }

            if(delay < 0){
                delay = 0;
            }

            return delay;
        }

        xmlhttp.onload = function(evt) {
            setTimeout(function(){
                var xmlObj, jsonObj;
                if (xmlhttp.status === 200 || xmlhttp.status === 0) {
                    if(typeof opts.success === "function") {
                        if(opts.dataType === "json") {
                            if(xmlhttp.responseText) {
                                try {
                                    jsonObj = JSON.parse(xmlhttp.responseText);
                                } catch (err) {
                                    //xmlhttp.onerror = null;
                                    opts.error(xmlhttp, 'json parsererror', err);
                                    return;
                                }
                                opts.success(jsonObj, xmlhttp.statusText, xmlhttp);
                            } else {
                                opts.error(xmlhttp, 'empty json', xmlhttp.statusText);
                            }
                        } else if(opts.dataType === "xml") {
                            if(xmlhttp.responseXML) {
                                opts.success(xmlhttp.responseXML, xmlhttp.statusText, xmlhttp);
                            } else if (xmlhttp.responseText) {
                                try {
                                    xmlObj = obigo.parseXML(xmlhttp.responseText);
                                } catch (err) {
                                    //xmlhttp.onerror = null;
                                    opts.error(xmlhttp, 'xml parsererror', err);
                                    return;
                                }
                                opts.success(xmlObj, xmlhttp.statusText, xmlhttp);
                            } else {
                                opts.error(xmlhttp, 'empty xml', xmlhttp.statusText);
                            }
                        } else {
                            opts.success(xmlhttp.responseText, xmlhttp.statusText, xmlhttp);
                        }
                    }
                    //500 internal error , Not found(server)
                } else if (xmlhttp.status !== 0) {
                    opts.error(xmlhttp, "error", xmlhttp.statusText);
                }
            }, getDelay());
        };
        xmlhttp.ontimeout = function(evt) {
            if(typeof opts.error == "function") {
                opts.error(xmlhttp, "timeout", "timeout");
            }
        };
        //Not found (local), cross-domain (local, server)
        xmlhttp.onerror = function(evt) {
            setTimeout(function(){
                if(typeof opts.error == "function") {
                    if(typeof evt == "string" && (evt == "timeerror" || evt == "nonetwork")){
                        opts.error(xmlhttp, evt, xmlhttp.statusText);
                    }else{
                        opts.error(xmlhttp, "error", xmlhttp.statusText);
                    }
                }
            }, getDelay());
        };
        xmlhttp.onloadend = function(evt) {
            if(typeof opts.complete == "function") {
                opts.complete(xmlhttp, xmlhttp.statusText);
            }
        };

        if(!navigator.onLine){
            timestamp = new Date();
            timestamp = timestamp.getTime();

            xmlhttp.onerror("nonetwork");
            return;
        }

        function request(){
            if(opts.type === "GET" && opts.data) {
                opts.data = encodeFormData(opts.data);
                opts.url = opts.url +"?"+ opts.data;
                opts.data = null;
            }
            xmlhttp.open(opts.type, opts.url, opts.async);

            if(opts.type === "POST" && !JSON.stringify(opts.requestHeader).match(/content-type/ig)) {
                xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            }
            if(opts.requestHeader) {
                var headers = opts.requestHeader;
                for(var key in headers) {
                    if(headers.hasOwnProperty(key)) {
                        xmlhttp.setRequestHeader(key, headers[key]);
                    }
                }
            }
            if(typeof opts.data === "object") opts.data = encodeFormData(opts.data);

            timestamp = new Date();
            timestamp = timestamp.getTime();

            xmlhttp.send(opts.data);
        }

        if (navigator.userAgent.indexOf("Obigo") > 0) {
            if(opts.url.indexOf("https://") > -1 && !timesync){
                timexmlhttp = new XMLHttpRequest();

                timexmlhttp.open("GET", "http://210.216.54.99:3000/", true);

                timexmlhttp.timeout = 5000;

                timexmlhttp.onload = function(evt) {
                    var xmlObj, jsonObj;
                    if (timexmlhttp.status === 200 || timexmlhttp.status === 0) {
                        var timeData = null;

                        if(timexmlhttp.responseText) {
                            try {
                                var curtimeDate = new Date(),
                                    serverDate = null,
                                    hour = 1000 * 60 * 15;

                                serverDate = JSON.parse(timexmlhttp.responseText).time;
                                serverDate = new Date(serverDate);

                                if((Math.abs(curtimeDate.getTime() - serverDate.getTime())) < hour){
                                    timesync = true;

                                    request();
                                }else{
                                    xmlhttp.onerror("timeerror");
                                }
                            } catch (err) {
                                timexmlhttp.onerror();
                            }
                        }
                    }else{
                        timexmlhttp.onerror();
                    }

                };
                timexmlhttp.ontimeout = function(evt) {
                    request();
                };
                timexmlhttp.onerror = function(evt) {
                    request();
                };

                timexmlhttp.send(opts.data);
            }else{
                request();
            }
        }else{
            request();
        }
    },
    extend : function(dist,source){
        for (var p in source) {
            dist[p] = source[p];
        }
        return dist;
    },
    each : function(arr, func){
        for (var i=0, len=arr.length; i<len; i++) {
            func(i, arr[i]);
        }
    },
    jsVar : function(s){
        return String(s || '').replace(/-/g, "_");
    },
    myArr : function(o) {
        if (Object.prototype.toString.call(o) !== "[object Array]") o = [o];
        o.length = o.length;
        return o;
    },
    xmltoJson : function(xml) {
        function xml2json (xml, extended) {
            if (!xml) return;

            function parseXML(node, simple) {
                if (!node) return null;
                var txt = '',
                    obj = null,
                    att = null;
                var nt = node.nodeType,
                    nn = jsVar(node.localName || node.nodeName);
                var nv = node.text || node.nodeValue || '';
                if (node.childNodes) {
                    if (node.childNodes.length > 0) {
                        each(node.childNodes, function(n, cn) {
                            var cnt = cn.nodeType,
                                cnn = jsVar(cn.localName || cn.nodeName);
                            var cnv = cn.text || cn.nodeValue || '';
                            if (cnt === 8) {
                                return;
                            } else if (cnt === 3 || cnt === 4 || !cnn) {
                                if (cnv.match(/^\s+$/)) {
                                    return;
                                }
                                txt += cnv.replace(/^\s+/, '').replace(/\s+$/, '');
                            } else {
                                obj = obj || {};
                                if (obj[cnn]) {
                                    if (!obj[cnn].length) obj[cnn] = myArr(obj[cnn]);
                                    obj[cnn] = myArr(obj[cnn]);

                                    obj[cnn][obj[cnn].length] = parseXML(cn, true);
                                    obj[cnn].length = obj[cnn].length;
                                } else {
                                    obj[cnn] = parseXML(cn);
                                }
                            }
                        });
                    }
                }
                if (node.attributes) {
                    if (node.attributes.length > 0) {
                        att = {};
                        obj = obj || {};
                        each(node.attributes, function(a, at) {
                            var atn = jsVar(at.name),
                                atv = at.value;
                            att[atn] = atv;
                            if (obj[atn]) {
                                obj[cnn] = myArr(obj[cnn]);

                                obj[atn][obj[atn].length] = atv;
                                obj[atn].length = obj[atn].length;
                            } else {
                                obj[atn] = atv;
                            }
                        });
                    }
                }
                if (obj) {
                    obj = extend((txt !== '' ? txt.toString() : {}), obj || {});
                    txt = (obj.text) ? (typeof(obj.text) == 'object' ? obj.text : [obj.text || '']).concat([txt]) : txt;
                    if (txt) obj.text = txt;
                    txt = '';
                }
                var out = obj || txt;
                if (extended) {
                    if (txt) out = {};
                    txt = out.text || txt || '';
                    if (txt) out.text = txt;
                    if (!simple) out = myArr(out);
                }
                return out;
            }


            if (typeof xml === 'string') xml = text2xml(xml);

            if (!xml.nodeType) return;
            if (xml.nodeType === 3 || xml.nodeType === 4) return xml.nodeValue;

            var root = (xml.nodeType === 9) ? xml.documentElement : xml;

            var out = parseXML(root, true);

            xml = null;
            root = null;

            return out;
        }

        function text2xml (str) {
            var out,
                xml = new DOMParser();

            try {
                xml.async = false;
            } catch (e) {
                throw new Error("XML Parser could not be instantiated");
            }
            try {
                out = xml.parseFromString(str, "text/xml");
            } catch (e) {
                throw new Error("Error parsing XML string");
            }
            return out;
        }

        return xml2json(xml);
    },
    getScrollY : function(sc) {
        var matrix = getComputedStyle(sc, null).webkitTransform.replace(/[^0-9\-.,]/g, '').split(',');
        var x = matrix[4] * 1;
        var y = matrix[5] * 1;

        return y;
    },
    isArray : function(arr) {
        if(Object.prototype.toString.call(arr) == "[object Array]") {
            return true;
        } else {
            console.log("isArray end");
            return false;
        }
    },
    styleFlag : false,
    MESSAGE_BOX_STORE : [],
    IMAGE_RADIO : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAACWCAYAAACcsttJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAABaaSURBVHja7F1tUFTnvf89+84uuwgLCyzLYUVAQI3xBQxcERFIm0jVmFohncSZTNIvdu6dyZ25M21najrTTjKZtHO/+KU306Q2JhqT4LUYDcYQTEoUgookICwQ9pV1lwVh39jX537gIbFmWc4i0LSX/8yZYeCc55zf+f+f/9vzOw+EUop/BRHgX0RWgXzfRHT/LwghCQ9SX1+PS5cuCQAkA1ADWANACUB+zz3CAHwAPAAmAbgAeOrr66OXLl1K+J73z23ynV8kBkQAQAEgC4BOqVSWZmRkFCsUColcLodSqfxmPEop3G43/H4/PB5PyOl09rvd7n4AZgB2AF4A0ZUGQtjb5pKSknZotdodmZmZAp1OF9i4caNNq9U6srOznbW1tWNSqTQEAIFAQHz58uVsu92utlgsmV999VWOxWKROhwOarVar/r9/msATExrdCWASABoJRJJeW5ubm1eXh5qa2uHd+7c2bdr165R9iABACFmTtF7tCcCIAYgBSDv6OjgPvnkk42XL19eZzQaYTabLweDwU4ANgDB5QQiB1CanZ394/Xr16dWV1eP/vSnP/1bYWGhlZlGMAHzEDBQyQaDIefkyZP/1t7erh8YGJgcGxt7F0AfeylLCoSwybu9sLDwcENDw+T27duvP/XUU9cBuNnbjz6A5xQDUL711ltbv/jii60tLS2pBoPhHQBdbHy6VEBUYrG4urS0tKGhocH2s5/97EOO4yzsjUWXMBTITSaT7o9//OMPzp8/r/3qq69aQqFQO4DphYCIeNxADqBsw4YNDfv37ze++OKL5wCMs3mwlPlNFICX47jR3/72t++JRKJ9ABpu3rzpA/B5PDPjA0QKoLSwsPAne/futTEQTjYXliNJo+wFOV988cVz4XD4Sa/X+xODwTAFoJf9LeHITgBotVrtof379088//zzF5kmlgvEvWCCAMaff/75i/v375/QarWHAGjZMyUMJFkqlVYUFRWtKS8v/yIvL8+6DOYUVzN5eXnW8vLyL4qKitZIpdIKljkkBEQAII/juOqampqRQ4cO3eQbqJYYjO/Q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",

    message : function(options) {
        var btn_back = document.querySelector('[obigo-back-key]'),
            btn = null;

        var opts = {
            title: null,
            content: null,
            button: "OK",
            callback: null,
            defaultIndex: 0,
            toast: false,
            radio: false,
            radioContent: null,
            radioDefaultIndex: 0
        };

        var cbCnt = 0;
        var radio_index = -1;

        if(btn_back && btn_back.cb){
            cbCnt = btn_back.cb.length-1;
        }

        var START_EV = hasTouch ? 'touchstart' : 'mousedown';
        /*
         * Example : obigo.message("message text");
         */
        if(typeof options == "string") {
            var content = options;
            options = {};
            options.title = content;
        }
        for (var p in options) opts[p] = options[p];

        if(!styleFlag) addCssRules();
        if(!options.title || options.title === "") {
            throw new Error("No message content");
        }

        showMessage();

        function addCssRules() {
            var sheets = document.styleSheets;
            if(sheets.length === 0) {
                var styleTag = document.createElement("style");
                document.getElementsByTagName("head")[0].appendChild(styleTag);
                sheets = document.styleSheets[0];
                styleTag = null;
            } else {
                sheets = document.styleSheets[sheets.length-1];
            }
            var len = (sheets.cssRules) ? sheets.cssRules.length : 1;
            sheets.addRule("div.obigo_msg_pop", "position: absolute;top: 68px;left: 0;background-color: rgba(7,7,7,.85);width: 610px;height: 412px;padding-left: 190px;text-align: center;z-index: 100;", len);
            sheets.addRule("div.obigo_msg_pop .obigo_msg_wrap_con", "display: table;width: 418px;height: 344px;", len+1);
            sheets.addRule("div.obigo_msg_pop .obigo_msg_con", "position:absolute;display: table-cell;vertical-align: middle;width: 418px;background-color: rgba(7,7,7,.85);", len+2);
            sheets.addRule("div.obigo_msg_pop .obigo_msg_text", "width: 418px;border: 1px solid #00c8d2;box-shadow: inset 0 0 15px #00c8d2;", len+3);
            sheets.addRule("div.obigo_msg_pop .obigo_msg_text > h2", "padding: 29px 30px 0 30px;font-size: 30px;line-height: 110%", len+4);
            sheets.addRule("div.obigo_msg_pop .obigo_msg_text > p", "padding: 10px 30px 29px 30px;font-size: 25px;line-height: 118%;color: #999999;", len+5);
            sheets.addRule("div.obigo_msg_pop .obigo_msg_btn_area", "width: 418px;height: 60px;font-size: 30px;font-weight: bold;overflow: hidden;", len+6);
            sheets.addRule("div.obigo_msg_pop .btn1", "    display: block; width: 418px;height: 100%;border-top: 1px solid #00c8d2;line-height: 58px;color: #f5f5f5;", len+7);
            sheets.addRule("div.obigo_msg_pop .btn1.active", "background-color:#00c8d2;font-weight:bold; color:#050505;", len+8);
            sheets.addRule("div.obigo_msg_pop .btn2", "float: left;display: block;width: 209px;height: 100%;line-height: 58px;border-top: 1px solid #00c8d2;color: #f5f5f5;", len+9);
            sheets.addRule("div.obigo_msg_pop .btn2.active", "background-color:#00c8d2;font-weight:bold; color:#050505;", len+10);
            sheets.addRule("div.obigo_msg_pop .btn2_0", "border-top: 1px solid #00c8d2;border-right: 1px solid #00c8d2;", len+11);
            sheets.addRule("div.obigo_msg_pop .btn2.btn2_0", "width: 208px;border-top: 1px solid #00c8d2;border-right: 1px solid #00c8d2;", len+12);
            sheets.addRule("div.obigo_msg_pop_click", "position: absolute;top:0; left:0;	width:800px; height:412px;", len+13);
            sheets.addRule("div.obigo_msg_radio_sel", "width: 100%;height: 50px;margin: 17px auto 24px;", len+14);
            sheets.addRule("div.obigo_msg_radio_sel a", "display: block;float: left;width: 119px;height: 50px;font-size: 37px;line-height: 49px;background: url('"+IMAGE_RADIO+"') no-repeat 0 0;padding-left: 63px;text-align: left;color: #f5f5f5;", len+15);
            sheets.addRule("div.obigo_msg_radio_sel a.active, div.obigo_msg_radio_sel a.sel", "background-position: 0 -50px; color: #00c8d2;", len+16);
            sheets.addRule("div.obigo_msg_radio_sel .radio0", "margin-left: 53px;", len+17);

            sheets = null;
            len = null;
            styleFlag = true;
        }

        function showMessage() {
            hideMessage();
            var arr = [opts.title, opts.content, opts.button, opts.callback];

            var POP = document.createElement("div");
            POP.className = "obigo_msg_pop";
            POP.id = new Date().getTime();

            var POPCLI = document.createElement("div");
            POPCLI.className = "obigo_msg_pop_click";
            POP.appendChild(POPCLI);

            var WRAP = document.createElement("div");
            WRAP.className = "obigo_msg_wrap_con";
            POP.appendChild(WRAP);

            var CON = document.createElement("div");
            CON.className = "obigo_msg_con";
            WRAP.appendChild(CON);

            var TEXT = document.createElement("div");
            TEXT.className = "obigo_msg_text";
            CON.appendChild(TEXT);

            var clickObj = POPCLI;

            if(opts.title) {
                var TITLE = document.createElement("h2");
                TITLE.innerHTML = opts.title;
                TEXT.appendChild(TITLE);
            }

            if(opts.radio){
                var SELECT = document.createElement("div");
                SELECT.className = "obigo_msg_radio_sel";
                TEXT.appendChild(SELECT);

                var r_index = 0;
                while(opts.radioContent.length > r_index){
                    var RADIO = document.createElement("a");
                    RADIO.className = "radio" + r_index;
                    RADIO.innerHTML = opts.radioContent[r_index];
                    RADIO.dataset.index = r_index;

                    if(r_index == opts.radioDefaultIndex){
                        RADIO.classList.add("sel");
                        radio_index = r_index;
                    }
                    new ButtonHelper({
                        evtTarget: RADIO,
                        cssName: 'active',
                        callback: function(e) {
                            var f = SELECT.querySelector(".sel")

                            if(f && f != e.target){
                                f.classList.remove("sel")
                            }
                            e.target.classList.add("sel");
                            radio_index = e.target.dataset.index;
                        }
                    });

                    SELECT.appendChild(RADIO);
                    r_index++;
                }
            }else{
                var CONTENT = document.createElement("p");
                CONTENT.innerHTML = opts.content;
                TEXT.appendChild(CONTENT);
            }

            if(opts.button && opts.toast == false) {
                var className = "btn2";
                BUTTONS = document.createElement("div");

                BUTTONS.className = "obigo_msg_btn_area";
                TEXT.appendChild(BUTTONS);

                if(!isArray(opts.button) || opts.button.length == 1) {
                    opts.button = [opts.button];
                    className = "btn1"
                }
                var s_index=0;
                while(opts.button.length > s_index){
                    var BUTTON = document.createElement("a");

                    BUTTON.textContent = opts.button[s_index];
                    BUTTON.className = className + " btn2_"+s_index;
                    BUTTON.dataset.index = s_index;

                    new ButtonHelper({
                        evtTarget: BUTTON,
                        cssName: 'active',
                        cssTarget: BUTTON,
                        callback: function(e) {
                            var target = e.target.textContent, num = e.target.dataset.index;
                            hideMessage();
                            var index = null;

                            if(opts.radio && radio_index > -1){
                                index = radio_index;
                            }
                            if(opts.callback && typeof opts.callback[num] === "function") opts.callback[num](index);
                        }
                    });
                    BUTTONS.appendChild(BUTTON);
                    s_index++;
                }
            }else{
                clickObj = POP;
            }
            document.getElementsByTagName("body")[0].appendChild(POP);
            var c=getComputedStyle(CON);
            CON.style.top = ((480/2) - (parseInt(c.height, 10)/ 2) - 68)+"px";
            //480 c.height

            if(btn_back && btn_back.cb){
                POP.back_cb = btn_back.cb[cbCnt];
                replaceListener(POP.back_cb)
            }
            if(opts.callback && opts.callback[opts.defaultIndex]){
                POP.default_cb = opts.callback[opts.defaultIndex];
            }

            function replaceListener(cb){
                var time = 3000;

                function CBback(msg){
                    hideMessage(msg);
                    var index = null;

                    if(opts.radio && radio_index > -1){
                        index = radio_index;
                    }
                    if(opts.callback && typeof opts.callback[opts.defaultIndex] === "function" && opts.toast == false) opts.callback[opts.defaultIndex](index);
                }
                function hideToast(){
                    hideMessage(POP);
                }
                if(btn_back && btn_back.cb){
                    btn_back.removeEventListener(START_EV, cb, false);

                    btn = new ButtonHelper({
                        evtTarget: btn_back,
                        cssName: 'active',
                        callback: function(){
                            CBback();
                        }
                    });
                    if(opts.toast == true){
                        POPCLI.addEventListener(START_EV, hideToast, false);
                    }

                    if(!opts.toast && (!isArray(opts.button) || opts.button.length == 1)){
                        time = 5000;
                    }else if(opts.toast ){
                        time = 3000;

                    } else{
                        time = 10000;
                    }

                    if(window.AppManager && AppManager.isVisible()){
                        POP.timer = setTimeout(function(){
                            CBback(POP);
                        }, time);
                    }else if(window.launcher && launcher.isVisible()){
                        POP.timer = setTimeout(function(){
                            CBback(POP);
                        }, time);
                    }else{
                        var shownCB = function(){
                            POP.timer = setTimeout(function(){
                                CBback(POP)
                            }, time);
                        };

                        if(window.AppManager){
                            AppManager.unbindEvent("ApplicationShown", shownCB);
                            AppManager.bindEvent("ApplicationShown", shownCB);
                        }else if(window.launcher){
                            launcher.unbindEvent("ApplicationShown", shownCB);
                            launcher.bindEvent("ApplicationShown", shownCB);
                        }
                    }

                    new ButtonHelper({
                        evtTarget: clickObj,
                        cssName: 'active',
                        callback: function(e) {
                            CBback(POP);
                        }
                    });
                }

            }

            MESSAGE_BOX_STORE.push(POP);
        }
        function hideMessage(msg) {
            var body = document.getElementsByTagName("body")[0];
            var messageBox = null
            if(msg){
                var i = 0;
                messageBox = msg;
                for(i=0; i<MESSAGE_BOX_STORE.length; i++){
                    if(MESSAGE_BOX_STORE[i].id == msg.id){
                        break;
                    }
                }
                MESSAGE_BOX_STORE.splice(i, 1);
            }else{
                messageBox = MESSAGE_BOX_STORE.pop();
            }
            if(btn_back && btn){
                btn.unbind();
                btn_back.addEventListener(START_EV, messageBox.back_cb);
            }

            if(messageBox != undefined && messageBox.timer != undefined){
                clearTimeout(messageBox.timer);
            }

            try {
                body.removeChild(messageBox);
            } catch(e) {
                console.log(e.message);
            }
        }
        this.message.close = hideMessage;

        var rtn = MESSAGE_BOX_STORE[MESSAGE_BOX_STORE.length-1];
        rtn.close = function(){
            hideMessage(rtn);
            if(rtn.default_cb){
                rtn.default_cb();
            }
        }

        return rtn;
    },
    guidGenerator : function() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };

        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },
    uri : null,
    language : {
        callback: null,
        loadedObject: [false, false],
        getLanguage: function(){
            var lan = obigo.storage.commonGet("obigo-language");
            return lan?lan:"en";
        },
        checkAllLoad: function(){
            var i = 0
            for(i=0; i<obigo.language.loadedObject.length; i++){
                if(!obigo.language.loadedObject[i]){
                    obigo.language.loadedObject[i] = true;
                    i++
                    break;
                }
            }
            if(i == obigo.language.loadedObject.length){
                if(obigo.language.callback){
                    obigo.language.callback();
                }
                //location.reload();
            }
        },
        changeLanguage: function(country, callback){
            this.callback = callback;
            objectLoad = [false, false];
            obigo.storage.commonSet("obigo-language", country);
            obigo.getScript("../launcher/common/lan/common_text_"+country+".js", this.checkAllLoad);
            obigo.getScript(uri+"lan/app_text_"+country+".js", this.checkAllLoad);
        },
        getText: function(id){
            if(commonStirngTable[id]){
                return commonStirngTable[id];
            }else if(StirngTable[id]){
                return StirngTable[id];
            }else{
                return " ";
            }
        },
        getStringTablelength: function(){
            return commonStirngTable.length;
        }
    }




}