var assert = require('assert');
var configuration = require('./../settings.js').Settings;
var expect = require('./dep/expect.js');

var logger = {};
logger.warn = function(message){throw new Error(message)}

describe('Config Methods', function () {
  var config;
  beforeEach(function () {
    config = new configuration(logger);
  });

  it('Config.add', function () {
    config.add({
      name: "parameter_1",
      defaultValue: 0,
      validator: function (v) {
        if (typeof v !== "number") {
          throw "Parameter_1: " + v + " is not a number";
        } else {
          return true;
        }
      }
    });
    config.add({
      name: "parameter_2",
      defaultValue: "",
      validator: function (v) {
        if (typeof v !== "string") {
          throw "Parameter_2: " + v + " is not a string";
        } else {
          return true;
        }
      },
      validationMoment: configuration.validationMoment.ONDEMAND,
      locked: true,
      help: "parameter_2 help"
    });
    var p1 = config.getParameter("parameter_1");
    expect(p1.validValue).to.be(0);
    expect(p1.pendingValue).to.be.undefined;
    expect(p1.defaultValue).to.be(0);      
    expect(p1.validateFun).to.be.a("function");
    expect(p1.changeCallback).to.be.null;
    expect(p1.validationMoment).to.be(configuration.validationMoment.DEFERRED);
    expect(p1.locked).to.be(false);
    expect(p1.help).to.be("");

    var p2 = config.getParameter("parameter_2");
    expect(p2.validValue).to.be("");
    expect(p2.pendingValue).to.be.undefined;
    expect(p2.defaultValue).to.be("");       
    expect(p2.validateFun).to.be.a("function");
    expect(p2.changeCallback).to.be.null;
    expect(p2.validationMoment).to.be(configuration.validationMoment.ONDEMAND);
    expect(p2.locked).to.be(true);
    expect(p2.help).to.be("parameter_2 help");

  });


  it('Config.Get', function () {
    config.add({
      name: "parameter_1",
      defaultValue: 0,
      validator: function (v) {
        if (typeof v !== "number") {
          throw "Parameter_1: " + v + " is not a number";
        } else {
          return true;
        }
      },
      validationMoment: configuration.validationMoment.IMMEDIATE
    });
    config.add({
      name: "parameter_2",
      defaultValue: "",
      validator: function (v) {
        if (typeof v !== "string") {
          throw "Parameter_2: " + v + " is not a string";
        } else {
          return true;
        }
      },
      validationMoment: configuration.validationMoment.DEFERRED,
    });
    config.add({
      name: "parameter_3",
      defaultValue: 5,
      validator: function (v) {
        if (typeof v !== "string") {
          throw "Parameter_3: " + v + " is not a string";
        } else {
          return true;
        }
      },
      validationMoment: configuration.validationMoment.ONDEMAND,
    });
    expect(config.get("parameter_1")).to.be(0);
    expect(config.get("parameter_2")).to.be("");
    expect(config.get("parameter_3")).to.be(5);

  });


  it('Config.set', function () {
    config.add({
      name: "parameter_1",
      defaultValue: 0,
      validator: function (v) {
        if (typeof v !== "number") {
          throw "Parameter_1: " + v + " is not a number";
        } else {
          return true;
        }
      },
      validationMoment: configuration.validationMoment.IMMEDIATE      
    });
    config.add({
      name: "parameter_2",
      defaultValue: 0,
      validator: function (v) {
        if (typeof v !== "string") {
          throw "Parameter_2: " + v + " is not a string";
        } else {
          return true;
        }
      },
      validationMoment: configuration.validationMoment.ONDEMAND
    });
    config.add({
      name: "parameter_3",
      defaultValue: 0,
      validator: function (v) {
        if (typeof v !== "string") {
          throw "Parameter_2: " + v + " is not a string";
        } else {
          return true;
        }
      },
      validationMoment: configuration.validationMoment.DEFERRED
    });
    config.add({
      name: "parameter_4",
      defaultValue: 0,
      validator: function (v) {
        if (typeof v !== "string") {
          throw "Parameter_2: " + v + " is not a string";
        } else {
          return true;
        }
      },
      onChange : function() {}

    });

    config.set("parameter_1", 20);

    expect(config.get("parameter_1")).to.be(20);
    expect(function () {
      config.set("parameter_1", "error")
    }).to.throwError();

    expect(function () {
      config.set("parameter_2", -1)
    }).to.not.throwError();
    expect(function () {
      config.get("parameter_2")
    }).to.throwError();

    expect(function () {
      config.set("parameter_3", -1)
    }).to.not.throwError();
    expect(function () {
      config.get("parameter_3")
    }).to.throwError();

    expect(function () {
      config.set("parameter_4", -1)
    }).to.throwError();
  });


  it('Config.lock', function () {
    config.add({
      name: "parameter_1",
      defaultValue: 0,
      validator: function (v) {
        if (typeof v !== "number") {
          throw "Parameter_1: " + v + " is not a number";
        } else {
          return true;
        }
      },
      locked: false
    });
    config.add({
      name: "parameter_2",
      defaultValue: "0",
      validator: function (v) {
        if (typeof v !== "string") {
          throw "Parameter_2: " + v + " is not a string";
        } else {
          return true;
        }
      },
      locked: true
    });

    config.set("parameter_1", 20);
    config.lock("parameter_1");
    expect(function () {
      config.set("parameter_1", 21)
    }).to.throwError();
    expect(function () {
      config.set("parameter_1", 20)
    }).to.not.throwError();
    expect(function () {
      config.set("parameter_2", "aze")
    }).to.throwError();

  });

  it('Config.validate', function () {
    config.add({
      name: "parameter_2",
      defaultValue: 0,
      validator: function (v) {
        if (typeof v !== "string") {
          throw "Parameter_2: " + v + " is not a string";
        } else {
          return true;
        }
      },
      validationMoment: configuration.validationMoment.IMMEDIATE        
    });
    expect(function () {
      config.set("parameter_2",1)
    }).to.throwError();

    config.add({
      name: "parameter_1",
      defaultValue: 0,
      validator: "boolean",
      validationMoment: configuration.validationMoment.IMMEDIATE        
    });
    expect(function () {
      config.set("parameter_1",1)
    }).to.throwError();

    config.add({
      name: "parameter_3",
      defaultValue: false,
      validator: "boolean",
      validationMoment: configuration.validationMoment.IMMEDIATE        
    });

    config.add({
      name: "parameter_4",
      defaultValue: 0,
      validator: ["boolean","qsd"],
      validationMoment: configuration.validationMoment.IMMEDIATE        
    });
    expect(function () {
      config.set("parameter_4",2)
    }).to.throwError();

    config.add({
      name: "parameter_5",
      defaultValue: false,
      validator: ["inta","boolean"],
      validationMoment: configuration.validationMoment.IMMEDIATE  
    });
    expect(function () {
      config.set("parameter_5",true)
    }).to.not.throwError();

  });


});