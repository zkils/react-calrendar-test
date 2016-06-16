/**
 * Created by krinjadl on 2016-06-16.
 */
var nativecallErrorType = {};
nativecallErrorType.ParseError = -32700;
nativecallErrorType.InvalidRequest = -32600;
nativecallErrorType.MethodNotFound = -32601;
nativecallErrorType.InvalidParams = -32602;
nativecallErrorType.InternalError = -32603;
nativecallErrorType.AccessDeny = -32604;
nativecallErrorType.DuplicateListener = -32605;
nativecallErrorType.ServiceError = -32000;
nativecallErrorType.UnknownError = -32001;
nativecallErrorType.ServerError = -32099;

var btphonecallInfo = function() {
    this.number;
};

var navigatorcallInfo = function() {
    this.latitude;
    this.longitude;
    this.caption;
};

var popupcallInfo = function() {
    this.subject;
    this.date;
    this.time;
    this.place;
    this.displaytime;
};

var infobarcallInfo = function() {
    this.infobar;
};

var settingInfo = function() {
    this.settingtype;
};

var OBJECT = "nativecall";
var REQUEST_MSG = 1001;
var RESPONSE_MSG = 1002;
var NOTIFICATION_MSG = 1003;
var BC_NOTIFICATION_MSG = 1004;
var ERROR_MSG = 1005;

var request_json = {"jsonrpc" : 2.0,
    "app_id" : null,
    "id": null,
    "method":""};

var errorhandler = null;
var wSocket = null;
var callBack = {
    lst: {},
    // get, set
    push: function(etype, meth, suc, err) {
        var obj = {}
        obj.id = (window.performance.now()).toString();
        obj.type = etype;
        obj.method = meth;
        obj.handle1 = suc;
        obj.handle2 = err;
        this.lst[obj.id] = obj;

        return obj.id;
    },
    pop: function(etype) {
        var result =  this.lst[etype];
        if (result) delete this.lst[etype];
        return result;
    },
    clear: function() {
        this.lst = {}
    }
}

var listenerCallBack = {
    lst: {},
    push: function(etype, handle) {
        if (handle) {
            if (this.lst[etype])
                this.lst[etype].push(handle);
            else
                this.lst[etype] = [handle];
        }
    },
    pop: function(etype, handle) {
        if (handle) {
            var handle_lst = this.lst[etype];
            if (handle_lst) {
                for (var i=0; i<handle_lst.length; i++) {
                    if (handle_lst[i] == handle) {
                        handle_lst.splice(i, 1);
                        if (handle_lst.length == 0)
                            this.lst[etype] = undefined;
                        return
                    }
                }
            }
        }
    },
    get: function(etype) {
        return this.lst[etype];
    },
    clear: function() {
        this.lst = {}
    }
}

var error = function(err_callback, message) {
    if (err_callback != null) {
        err_callback (message)
    }
}

var msgObject = {
    msg_type : 0,
    method_type : "",
    event_type : null,
    json : "",
    init : function(data) {
        this.json = JSON.parse(data);
        var result_field = null, id_field = null, err_field = null, appid_field = null;
        try { result_field = this.json.result; } catch (err) {}
        try { id_field = this.json.id; } catch (err) {}
        try { err_field = this.json.error; } catch (err) {}
        try { appid_field = this.json.app_id; } catch (err) {}

        if (result_field) {
            if (id_field)
                this.msg_type = RESPONSE_MSG;
            else
            if (appid_field)
                this.msg_type = NOTIFICATION_MSG;
            else
                this.msg_type = BC_NOTIFICATION_MSG;
        } else if (err_field) {
            this.msg_type = ERROR_MSG;
        } else if (appid_field) {
            console.log("REQUEST MESSAGE");
            msg_type = REQUEST_MSG;
        }

        var lst_str = this.json.method.split(".");
        var lst_len = lst_str.length;
        if (lst_str.length == 3) {
            this.method_type = lst_str[1];
            this.event_type = lst_str[2];
        } else if (lst_str.length == 2) {
            this.method_type = "get";
            this.event_type = lst_str[1];
        }

        if ((this.msg_type != BC_NOTIFICATION_MSG) && ((this.method_type == "addListener") || (this.method_type == "removeListener")))
            this.msg_type = NOTIFICATION_MSG;
    }
}

var createSocket = function(){
    var soc = new WebSocket("ws://localhost:18892/webapp/" + OBJECT);
    soc.onmessage = function(evt) {
        var message = msgObject;
        message.init(evt.data);
        //self.message_handler(message);
        if (message.msg_type == RESPONSE_MSG) {
            var function_handle = callBack.pop(message.json.id);
            if (function_handle && function_handle.handle1)
                function_handle.handle1(message.json.result);
        } else if (message.msg_type == ERROR_MSG) {
            var function_handle = callBack.pop(message.json.id);
            if (function_handle && function_handle.handle2)
                function_handle.handle2(message.json.error);
        } else if (message.msg_type == NOTIFICATION_MSG) {
            if (message.method_type == "addListener") {
                var handler_lst = listenerCallBack.get(message.event_type);
                for (index in handler_lst) {
                    if (message.json.result)
                        handler_lst[index](message.json.result);
                    else if (message.json.error)
                        handler_lst[index](message.json.error);
                    else
                        console.log ("undefine result");
                }
            }
        } else if (message.msg_type == BC_NOTIFICATION_MSG) {
            if (errorhandler) errorhandler(message.json.result);
        } else { console.log ("unknown json message"); }
    }

    soc.send_data = function(func, param) {
        if (wSocket.readyState != 1 /*OPEN*/) return false;
        if (param) func["params"] = param;
        wSocket.send(JSON.stringify(func));
        return true;
    }

    return soc;
}

module.exports = {
    SETTING_WIFI : 1,

    // Evnet Type
    btphone : "btphone",
    navigator : "navigator",
    popup : "popup",
    infobar : "infobar",
    setting : "setting",

    // DeviceAPI Method
    get: function(type, suc, err) {
        var func = request_json;
        if (suc == null)
            func.id = (window.performance.now()).toString();
        else
            func.id = callBack.push(type, 'get', suc, err);
        func.method = OBJECT + ".get." + type;
        return wSocket.send_data(func, null);
    },
    set: function(type, data, suc, err) {
        // data validation
        if (type == this.btphone) {
            if ((data instanceof btphonecallInfo) == false) {
                error(err, {"code":nativecallErrorType.InvalidParams, "message":"Invalid params"});
                return false
            }
        } else if (type == this.navigator) {
            if ((data instanceof navigatorcallInfo) == false) {
                error(err, {"code":nativecallErrorType.InvalidParams, "message":"Invalid params"});
                return false
            }
        } else if (type == this.popup) {
            if ((data instanceof popupcallInfo) == false) {
                error(err, {"code":nativecallErrorType.InvalidParams, "message":"Invalid params"});
                return false
            }
        } else if (type == this.infobar) {
            if ((data instanceof infobarcallInfo) == false) {
                error(err, {"code":nativecallErrorType.InvalidParams, "message":"Invalid params"});
                return false
            }
        } else if (type == this.setting) {
            if ((data instanceof settingInfo) == false) {
                error(err, {"code":nativecallErrorType.InvalidParams, "message":"Invalid params"});
                return false
            }
        }

        var func = request_json;
        if (suc == null)
            func.id = (window.performance.now()).toString();
        else
            func.id = callBack.push(type, 'set', suc, err);
        func.method = OBJECT + ".set." + type;
        return wSocket.send_data(func, data);
    },
    query: function(type, data, suc, err){
        var func = request_json;
        if (suc == null)
            func.id = (window.performance.now()).toString();
        else
            func.id = callBack.push(type, 'query', suc, err);
        func.method = OBJECT + ".query." + type;
        return wSocket.send_data(func, data);
    },
    addListener: function(type, handler) {
        if (handler) {
            listenerCallBack.push(type, handler);
            listener_lst = listenerCallBack.get(type);
            if (listener_lst && listener_lst.length == 1) {
                var func = request_json;
                func.method = OBJECT + ".addListener." + type;
                return wSocket.send_data(func, null);
            }
        }
    },
    removeListener: function(type, handler) {
        if (handler) {
            listenerCallBack.pop(type, handler);
            if (!listenerCallBack.get(type)) {
                var func = request_json;
                func.method = OBJECT + ".removeListener." + type;
                return wSocket.send_data(func, null);
            }
        }
    },
    // Object Extension Method
    init: function(appId, openCallback, closeCallback, errorCallback){
        wSocket = createSocket();

        if (appId) request_json.app_id = appId;
        if (openCallback) wSocket.onopen = openCallback;
        if (closeCallback) wSocket.onclose = closeCallback;
        if (errorCallback) errorhandler = errorCallback;
    },
    reset: function (appId, openCallback, closeCallback, errorCallback) {
        wSocket.close();
        callBack.clear();
        listenerCallBack.clear();

        wSocket = createSocket();
        if (appId) request_json.app_id = appId;
        if (openCallback) wSocket.onopen = openCallback;
        if (closeCallback) wSocket.onclose = closeCallback;
        if (errorCallback) errorhandler = errorCallback;
    }
    // nativecallErrorType :  {
    //     ParseError :-32700 ,
    //     InvalidRequest : -32600,
    //     MethodNotFound : -32601,
    //     InvalidParams : -32602,
    //     InternalError : -32603,
    //     AccessDeny : -32604,
    //     DuplicateListener : -32605,
    //     ServiceError : -32000,
    //     UnknownError : -32001,
    //     ServerError : -32099,
    //  },
    // btphonecallInfo : function () {
    //     this.number;
    // },
    // navigatorcallInfo:function(){
    //     this.latitude;
    //     this.longitude;
    //     this.caption;
    // },
    // popupcallInfo : function () {
    //     this.subject;
    //     this.date;
    //     this.time;
    //     this.place;
    //     this.displaytime;
    // },
    // infobarcallInfo : function () {
    //     this.infobar;
    // },
    // settingInfo : function () {
    //     this.settingtype;
    // },


}