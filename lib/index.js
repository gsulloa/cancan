'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isObject = require('is-plain-obj');
var arrify = require('arrify');

var get = function get(obj, key) {
	return typeof obj.get === 'function' ? obj.get(key) : obj[key];
};

var isPartiallyEqual = function isPartiallyEqual(target, obj) {
	return Object.keys(obj).every(function (key) {
		return get(target, key) === obj[key];
	});
};

var getConditionFn = function getConditionFn(condition) {
	return function (performer, target) {
		return isPartiallyEqual(target, condition);
	};
};

var defaultInstanceOf = function defaultInstanceOf(instance, model) {
	return instance instanceof model;
};
var defaultCreateError = function defaultCreateError() {
	return new Error('Authorization error');
};

var CanCan = function CanCan(options) {
	_classCallCheck(this, CanCan);

	_initialiseProps.call(this);

	options = options || {};

	this.abilities = [];
	this.instanceOf = options.instanceOf || defaultInstanceOf;
	this.createError = options.createError || defaultCreateError;
};

var _initialiseProps = function _initialiseProps() {
	var _this = this,
	    _arguments = arguments;

	this.allow = function (model, actions, targets, condition) {
		if (typeof condition !== 'undefined' && typeof condition !== 'function' && !isObject(condition)) {
			throw new TypeError('Expected condition to be object or function, got ' + (typeof condition === 'undefined' ? 'undefined' : _typeof(condition)));
		}

		if (isObject(condition)) {
			condition = getConditionFn(condition);
		}

		arrify(actions).forEach(function (action) {
			arrify(targets).forEach(function (target) {
				_this.abilities.push({ model: model, action: action, target: target, condition: condition });
			});
		});
	};

	this.can = function (performer, action, target, options) {
		return _this.abilities.filter(function (ability) {
			return _this.instanceOf(performer, ability.model);
		}).filter(function (ability) {
			return ability.target === 'all' || target === ability.target || _this.instanceOf(target, ability.target);
		}).filter(function (ability) {
			return ability.action === 'manage' || action === ability.action;
		}).filter(function (ability) {
			if (ability.condition) {
				return ability.condition(performer, target, options || {});
			}

			return true;
		}).length > 0;
	};

	this.cannot = function () {
		return !_this.can.apply(_this, _arguments);
	};

	this.authorize = function () {
		if (_this.cannot.apply(_this, _arguments)) {
			var err = _this.createError.apply(null, _arguments);
			throw err;
		}
	};
};

module.exports = CanCan;