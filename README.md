settings.js
==========

setting.js is a tracker of application configuration parameters (intended for Togetherjs, https://github.com/mozilla/togetherjs), it offers the following features:
- Validation of Config Variables
- set onChange Callbacks
- Locking variables
- Deferred Validation



example of usage:
...


 notes:
- Default value is always considered valid.
- onChange callback is not executed on intitalization (via Settings.add)
- 3 types of validation can be sepecified using ValidationMoment property:
  - IMMEDIATE : validation function is executed immediately when a new value is set (via Setting.set)
  - ONDEMAND : validation is done when parameter gets requested (via Setting.get)
  - DEFERRED :  default one, equal to (callback exist ? IMMEDIATE : ONDEMAND)

- when variable is requested, a clone of the variable value is returned, this allow the tracker to control config parameter modification
- types that can be cloned for the moment are primitive types, Arrays , and tree-structured objects (without circular references)

API:
- add
- get
- set
- lock
- reset
- getHelp
- pushToArray 
- addToObject 
