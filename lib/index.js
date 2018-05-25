'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isObject = require('is-plain-obj');
var autoBind = require('auto-bind');
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

var CanCan = function () {
	function CanCan(options) {
		_classCallCheck(this, CanCan);

		autoBind(this);

		options = options || {};

		this.abilities = [];
		this.instanceOf = options.instanceOf || defaultInstanceOf;
		this.createError = options.createError || defaultCreateError;
	}

	_createClass(CanCan, [{
		key: 'allow',
		value: function allow(model, actions, targets, condition) {
			var _this = this;

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
		}
	}, {
		key: 'can',
		value: function can(performer, action, target, options) {
			var _this2 = this;

			return this.abilities.filter(function (ability) {
				return _this2.instanceOf(performer, ability.model);
			}).filter(function (ability) {
				return ability.target === 'all' || target === ability.target || _this2.instanceOf(target, ability.target);
			}).filter(function (ability) {
				return ability.action === 'manage' || action === ability.action;
			}).filter(function (ability) {
				if (ability.condition) {
					return ability.condition(performer, target, options || {});
				}

				return true;
			}).length > 0;
		}
	}, {
		key: 'cannot',
		value: function cannot() {
			return !this.can.apply(this, arguments);
		}
	}, {
		key: 'authorize',
		value: function authorize() {
			if (this.cannot.apply(this, arguments)) {
				var err = this.createError.apply(null, arguments);
				throw err;
			}
		}
	}]);

	return CanCan;
}();

module.exports = CanCan;