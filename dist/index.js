'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApiCreator = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.parseResponse = parseResponse;
exports.default = apiCreator;

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _findKey = require('lodash/findKey');

var _findKey2 = _interopRequireDefault(_findKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultConfig = {
  fetch: _isomorphicFetch2.default,
  baseUrl: '/',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

var pathParamsPattern = new RegExp(':([a-z\-\d]+)', 'ig');

function parseResponse(response) {
  if (response.status < 400) {
    if (response.status > 200) {
      return null;
    }

    return response.json();
  }

  return response.json().then(function (err) {
    return Promise.reject(err);
  });
}

function toQueryString(obj) {
  var parts = [];
  var value = void 0;
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      value = typeof obj[i] !== 'string' ? JSON.stringify(obj[i]) : obj[i];
      parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(value));
    }
  }

  return parts.join("&");
}

function parseParams() {
  var inputParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var methodSpec = arguments[1];
  var baseUrl = arguments[2];
  var _methodSpec$path = methodSpec.path,
      path = _methodSpec$path === undefined ? '' : _methodSpec$path,
      _methodSpec$method = methodSpec.method,
      method = _methodSpec$method === undefined ? 'get' : _methodSpec$method;


  var url = baseUrl.lastIndexOf('/') === baseUrl.length - 1 ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
  url += '' + (path.indexOf('/') === 0 ? path : '/' + path);

  var execResult = void 0;
  var pathParams = [];
  while ((execResult = pathParamsPattern.exec(url)) !== null) {
    pathParams.push(execResult[1]);
  }

  pathParams.sort(function (a, b) {
    return b.length - a.length;
  }).forEach(function (param) {
    return url = url.replace(':' + param, inputParams[param]);
  });

  var isGet = method.toLowerCase() === 'get';
  var params = (0, _omit2.default)(inputParams, pathParams);
  var isParamsEmpty = Object.keys(params).length === 0;

  if (isGet && !isParamsEmpty) {
    url += (url.indexOf('?') !== -1 ? '&' : '?') + toQueryString(params);
  }

  return { url: url, method: method.toLowerCase(), body: !isGet && !isParamsEmpty ? params : undefined };
}

var ApiCreator = exports.ApiCreator = function () {
  function ApiCreator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultConfig,
        _ref$baseUrl = _ref.baseUrl,
        baseUrl = _ref$baseUrl === undefined ? defaultConfig.baseUrl : _ref$baseUrl,
        _ref$fetch = _ref.fetch,
        fetch = _ref$fetch === undefined ? defaultConfig.fetch : _ref$fetch,
        _ref$headers = _ref.headers,
        headers = _ref$headers === undefined ? defaultConfig.headers : _ref$headers;

    _classCallCheck(this, ApiCreator);

    this.baseUrl = baseUrl;
    this.fetch = fetch;
    this.headers = Object.assign({}, defaultConfig.headers, headers || {});

    this.addHeader = this.addHeader.bind(this);
    this.removeHeader = this.removeHeader.bind(this);
    this.getHeader = this.getHeader.bind(this);
    this.create = this.create.bind(this);
    this.clone = this.clone.bind(this);
  }

  _createClass(ApiCreator, [{
    key: 'clone',
    value: function clone() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$baseUrl = _ref2.baseUrl,
          baseUrl = _ref2$baseUrl === undefined ? this.baseUrl : _ref2$baseUrl,
          _ref2$fetch = _ref2.fetch,
          fetch = _ref2$fetch === undefined ? this.fetch : _ref2$fetch,
          _ref2$headers = _ref2.headers,
          headers = _ref2$headers === undefined ? this.headers : _ref2$headers;

      return new ApiCreator({ baseUrl: baseUrl, fetch: fetch, headers: headers });
    }
  }, {
    key: '_getHeader',
    value: function _getHeader(headers, rawName) {
      var name = Object.keys(headers).find(function (key) {
        return rawName.toLowerCase() === key.toLowerCase();
      });
      return { name: name, value: headers[name] };
    }
  }, {
    key: 'getHeader',
    value: function getHeader(name) {
      var header = this._getHeader(this.headers, name);
      return header.value;
    }
  }, {
    key: 'addHeader',
    value: function addHeader(rawName, value) {
      var _getHeader2 = this._getHeader(this.headers, rawName),
          name = _getHeader2.name;

      this.headers[name || rawName] = value;
    }
  }, {
    key: 'removeHeader',
    value: function removeHeader(rawName) {
      var _getHeader3 = this._getHeader(this.headers, rawName),
          name = _getHeader3.name;

      if (name) {
        delete this.headers[name];
      }
    }
  }, {
    key: 'create',
    value: function create(methods) {
      var _this = this;

      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref3$baseUrl = _ref3.baseUrl,
          baseUrl = _ref3$baseUrl === undefined ? this.baseUrl : _ref3$baseUrl,
          _ref3$fetch = _ref3.fetch,
          fetch = _ref3$fetch === undefined ? this.fetch : _ref3$fetch;

      return Object.keys(methods).reduce(function (api, methodName) {
        var methodSpec = methods[methodName];

        if (typeof methodSpec === 'string') {
          var _methodSpec$trim$spli = methodSpec.trim().split(' '),
              _methodSpec$trim$spli2 = _slicedToArray(_methodSpec$trim$spli, 2),
              method = _methodSpec$trim$spli2[0],
              path = _methodSpec$trim$spli2[1];

          methodSpec = {
            method: ['get', 'post', 'delete', 'put', 'patch', 'head'].indexOf(method.toLowerCase()) !== -1 ? method : 'get',
            path: path || method
          };
        }

        var untitledMethod = function untitledMethod(params) {
          var _parseParams = parseParams(params, methodSpec, baseUrl),
              url = _parseParams.url,
              method = _parseParams.method,
              body = _parseParams.body;

          var headers = Object.assign({}, _this.headers, methodSpec.headers || {});
          var contentType = _this._getHeader(headers, 'content-type').value || '';
          var toJson = contentType.indexOf('json') !== -1;
          var options = {
            method: method.toUpperCase(),
            headers: headers,
            body: toJson ? JSON.stringify(body) : body
          };

          return fetch(url, options).then(parseResponse);
        };

        api[methodName] = new Function('method', 'return function ' + methodName + '(params) { return method(params); };')(untitledMethod);

        return api;
      }, {});
    }
  }]);

  return ApiCreator;
}();

function apiCreator() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultConfig;

  return new ApiCreator(config);
}