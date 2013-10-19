settings.js
==========

setting.js is a tracker of application configuration parameters (intended for Togetherjs, https://github.com/mozilla/togetherjs), it offers the following features:
- Validation of Config Variables
- onChange Callbacks
- Locking variables
- Deferred Validation



##example of usage:
````javascript
config = new Settings();
config.add({name:"enableShortcut",
	defaultValue:false,
	validator: "boolean",
	onChange: function (v) {
		if (v) {
			TogetherJS.listenForShortcut();
		} else {
			TogetherJS.removeShortcut();
		}
	}
};
// a user enable Shortcut option
config.set("enableShortcut",true);
config.set("enableShortcut","123"); // value is not valid
config.get("enableShortcut"); // return true
````


##config Parameter properties:

- **name**
- **defaultValue**
- **validator** : can be a string, array of valid types, or function.
- **validationMoment** : validation type (IMMEDIATE, ONDEMAND, DEFERRED)
- **onChange** : function or null(default)
- **locked** : a boolean indicated wether the variable is locked(cannot be change) or not , default to false.
- **help** : a help message specifiying the utility of config parameter

##API:
- **add**
- **get**
- **set**
- **lock**
- **reset**
- **getHelp**
- **pushToArray** : faciliate pushing a item to a  config parameter value that is instanceOf array 
- **addToObject** : faciliate adding a property to a config parameter value that is instanceOf object
	

##notes:
- Default value is always considered valid.
- onChange callback is not executed on intitalization (via Settings.add)
- 3 types of validation can be sepecified using ValidationMoment property:
  - **IMMEDIATE** : validation function is executed immediately when a new value is set (via Setting.set)
  - **ONDEMAND** : validation is done when parameter gets requested (via Setting.get)
  - **DEFERRED** :  default one, equal to (callback exist ? IMMEDIATE : ONDEMAND)

- when variable is requested, a clone of the variable value is returned, this allow the tracker to control config parameter modification
- types that can be cloned for the moment are primitive types, Arrays , and tree-structured objects (without circular references)

