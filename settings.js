
/*
config parameters manager
*/

function Settings(logger) {
  if (!(this instanceof Settings)) {
    return new Settings();
  }

  if (!logger) {
    if (console == undefined) {
      logger = {};
    } else {
      logger = console;
    }
  }
  if (!logger.log || typeof logger.log !== "function") {
    logger.log = function () {};
  }
  ["debug", "info", "warn"].forEach(function (method) {
    if (!logger[method] || typeof logger[method] !== "function") {
      logger[method] = logger.log;
    }
  });
  if (!logger.error || typeof logger.error !== "function") {
    logger.error = function (message) {
      throw message;
    };
  }


  // settings parameters
  var parameters = {};

  // add a new config parameter (or multiple at once)
  this.add = function (params) {

    if (!params) {
      logger.warn("invaid argument");
      return;
    }
    if(Array.isArray(params)) {
      var i;
      for(i=0; i< params.length; i++) {
        this.add(params[i]);
      }
      return;
    } else if (typeof params !== "object") {
       logger.warn("invaid argument");
       return;
    }

    var name = params.name,
      defaultValue = params.defaultValue,
      validator = params.validator,
      validationMoment = params.validationMoment,
      changeCallback = params.onChange,
      locked = params.locked,
      help = params.help;


    if (!name || typeof name !== "string") {
      logger.warn("a config parameter name is required and should be a string");
      return;
    }
    if (parameters.hasOwnProperty(name)) {
      logger.warn(name + " config parameter already exists, maybe you want to call Set function instead");
      return;
    }

    if (help === undefined || help === null) {
      help = "";
    } else if (typeof help !== "string") {
      logger.warn(name + " help property is set to empty string because invalid argument is specified");
      help = "";
    }

    var validateFun;
    if (validator == undefined) {
      validateFun = function () {
        return true;
      };
    } else if (typeof validator === "function") {
      validateFun = validator;
    } else if (typeof validator === "string" || Array.isArray(validator)) {
      var arr = [];
      if (typeof validator === "string") {
        arr.push(validator);
      } else {
        arr = validator;
      }
      validateFun = function (value) {
        var i;
        for (i = 0; i < arr.length; i++) {
          if (typeof value === arr[i]) {
            return true;
          }
        }
        return false;
      };
    } else if (typeof validator !== "function") {
      logger.warn(name + " validator property is set to null because invalid argument is specified");
      validator = function () {
        return true;
      };
    }


    if (changeCallback == undefined) {
      changeCallback = null;
    } else if (typeof changeCallback !== "function") {
      logger.warn(name + " changeCallback property is set to null because invalid argument is specified");
      changeCallback = null;
    }

    if (validationMoment === undefined) {
      validationMoment = Settings.validationMoment.DEFERRED;
    } else if (validationMoment !== Settings.validationMoment.DEFERRED && validationMoment !== Settings.validationMoment.IMMEDIATE && validationMoment !== Settings.validationMoment.ONDEMAND) {
      logger.warn(name + " validationMoment property is set to DEFERRED because invalid argument is specified");
      validationMoment = Settings.validationMoment.DEFERRED;
    }

    if (locked === undefined) {
      locked = false;
    } else if (typeof locked !== "boolean") {
      logger.warn(name + " locked property is set to false because invalid argument is specified");
      locked = false;
    }

    // undefined is not allowed as a config parameter value (gonna explain why in docs)
    if (defaultValue === undefined) {
      defaultValue = null;
    }

    parameters[name] = {
      "defaultValue": defaultValue,
      "pendingValue": undefined, // used in deferred validation to hold the value waiting for check.
      "validValue": defaultValue,
      "validateFun": validateFun,
      "changeCallback": changeCallback,
      "validationMoment": validationMoment,
      "locked": locked,
      "help": help
    };
    return this;
  };

  // set a value to a config parameter 
  this.set = function (name, value) {
    if (name === undefined || value === undefined) {
      logger.log("parameter name and value are required");
      return;
    }
    if (!parameters.hasOwnProperty(name)) {
      logger.warn(name + " config parameter is undefined");
      return;
    }
    var sett = parameters[name];


    // if the same value is pending validation or already set, this call will affect nothing
    if (sett.pendingValue === value || (sett.validValue === value && sett.pendingValue === undefined)) {
      return;
    } else if (value === sett.validValue && sett.pendingValue !== undefined && !sett.locked) { //cancel the pending operation
      sett.pendingValue = undefined;
      return;
    }

    if (sett.locked) {
      logger.warn(name + " config parameter is locked, you cannot modify it");
      return;
    }

    if (sett.validationMoment === Settings.validationMoment.IMMEDIATE || (sett.validationMoment === Settings.validationMoment.DEFERRED && sett.changeCallback != null)) {
      if (sett.validateFun(value) || value === sett.defaultValue) {
        sett.validValue = value;
        if (sett.changeCallback) {
          sett.changeCallback(value);
        }
      } else {
        logger.warn("invalid value for " + name + " config parameter specified");
        return;
      }
    } else {
      sett.pendingValue = value;
    }
  };
  // get value of a config parameter 
  this.get = function (name) {
    if (!parameters.hasOwnProperty(name)) {
      logger.warn(name + " config parameter is undefined");
      return;
    }
    var sett = parameters[name];

    if (sett.validationMoment === Settings.validationMoment.ONDEMAND || (sett.validationMoment === Settings.validationMoment.DEFERRED && sett.changeCallback == null)) {
      if (sett.pendingValue !== undefined) {
        if (sett.validateFun(sett.pendingValue) || sett.pendingValue === sett.defaultValue) {
          sett.validValue = sett.pendingValue;
          if (sett.changeCallback) {
            sett.changeCallback(sett.validValue);
          }
        }
        sett.pendingValue = undefined;
      }
    }
    // return a clone to the object so we can control object modification
    return __clone(sett.validValue);
  };
  // locking a config parameter 
  this.lock = function (name) {
    if (!parameters.hasOwnProperty(name)) {
      logger.warn(name + " config parameter is undefined");
      return;
    }
    var sett = parameters[name];
    if (!sett.locked) {
      sett.locked = true;
    } else {
      logger.warn(name + " config parameter is already locked");
      return;
    }
  };
  //reset a config parameter value to default one
  this.reset = function (name) {
    if (!parameters.hasOwnProperty(name)) {
      logger.warn(name + " config parameter is undefined");
      return;
    }
    this.set(name, parameters[name].defaultValue);
  };

  this.getHelp = function (name) {
    if (!parameters.hasOwnProperty(name)) {
      logger.warn(name + " config parameter is undefined");
      return;
    }
    return parameters[name].help;
  };

  // faciliate pushing a item to a  config parameter value that is instanceOf array
  this.pushToArray = function (name, item) {
    var currentValue = this.get(name);
    if (currentValue === undefined) {
      return;
    }
    if (Array.isArray(currentValue)) {
      currentValue.push(item);
      this.set(name, currentValue);
    } else {
      logger.warn(name + " config parameter value is not an array, you can't push items to");
    }
  };

  // faciliate adding a property to a config parameter value that is instanceOf object
  this.addToObject = function (name, key, value) {
    var currentValue = this.get(name);
    if (currentValue === undefined) {
      return;
    }
    if (key != undefined) {
      logger.warn("invalid property name : " + key);
      return;
    }
    if (!(currentValue instanceof object)) {
      logger.warn(name + " config parameter value is not an instance of object, you can't add properties to");
      return;
    }
    currentValue[key] = value;
    this.set(name, currentValue);

  };

  // support primitive types, object and array. User custom types are not sypported
  function __clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (obj == null || "object" != typeof obj) {
      return obj;
    }

    if (obj instanceof Array) {
      var copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = __clone(obj[i]);
      }
      return copy;
    }

    if (obj instanceof Object) {
      var copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = __clone(obj[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }

  function getParameter(name) {
    if (!parameters.hasOwnProperty(name)) {
      throw "Settings do not contain " + name;
    }
    return parameters[name];
  }

  //for testing and debugging purposes
  this.getParameter = getParameter;

  return this;

}
// when validation is done
Settings.validationMoment = {
  // value is validated immediately when set.
  IMMEDIATE: 0,
  // deafault one, if an onChange function is present: DEFERRED = IMMEDIATE , else DEFERRED = ONDEMAND
  DEFERRED: 1,
  // validation is done only when config variable requested (be careful, onChange call will be deferred also)
  ONDEMAND: 2
}

// for testing with node:
// module.exports.Settings = Settings;