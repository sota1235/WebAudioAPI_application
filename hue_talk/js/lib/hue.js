/*
 * Hue Controller
 *
 * Description:
 *   Hueをclient jsから制御する
 *
 * Methods:
 *   getLights():
 *     lightの数を取得
 *   lightTrriger(light, trigger):
 *     指定のlightをon/off
 *   changeBri(light, bri):
 *     指定のlightのbrightnessを変更
 *   effectTrriger(light, trigger):
 *     指定のlightのeffectをon/off
 *   changeColor(light, [r, g, b]):
 *     指定のlightの色をrgbにしたがって変更
 * Author:
 *   sota1235
 */

var HueController = function(ip, user) {
  this.ip = ip;
  this.user = user;
  this.url = "http://" + ip + "/api/";
  this.clcv = new colorConvert;

  this.request = function(uri, method, data) {
    var dfd, param;
    dfd = $.Deferred();
    param = {
      url: this.url + uri,
      type: method,
      success: function(msg) {
        dfd.resolve(msg);
        return dfd.promise();
      },
      error: function(err) {
        dfd.reject(err);
        return dfd.promise();
      }
    };
    if (method !== 'GET') {
      param['data'] = data;
    }
    return $.ajax(param);
  };

  HueController.prototype.getLights = function() {
    var dfd, method, uri;
    dfd = $.Deferred();
    uri = this.user + '/lights';
    method = 'GET';
    return this.request.call(this, uri, method, null).then(function(result) {
      if (result.length === 1) {
        dfd.resolve(false);
      } else {
        dfd.resolve(Object.keys(result).length);
      }
      return dfd.promise();
    }).fail(function(err) {
      dfd.reject(err);
      return dfd.promise();
    });
  };

  HueController.prototype.lightTrriger = function(light, trigger) {
    var dfd, data, method, uri;
    dfd = $.Deferred();
    uri = this.user + '/lights/' + light.toString() + '/state';
    method = 'PUT';
    data = {
      'on': trigger
    };
    data = JSON.stringify(data);
    return this.request.call(this, uri, method, data).then(function(result) {
      console.log(result);
      var res = result[0]["error"] === undefined;
      dfd.resolve(res);
      return dfd.promise();
    }).fail(function(err) {
      dfd.reject(err);
      return dfd.promise();
    });
  };

  HueController.prototype.changeBri = function(light, bri) {
    var dfd, data, method, uri;
    dfd = $.Deferred();
    uri = this.user + '/lights/' + light.toString() + '/state';
    method = 'PUT';
    data = {
      'bri': bri
    };
    data = JSON.stringify(data);
    return this.request.call(this, uri, method, data).then(function(result) {
      var res;
      res = result[0]["error"] === void 0;
      dfd.resolve(res);
      return dfd.promise();
    }).fail(function(err) {
      dfd.reject(err);
      return dfd.promise();
    });
  };

  HueController.prototype.effectTrriger = function(light, trigger) {
    var dfd, data, method, uri;
    dfd = $.Deferred();
    uri = this.user + '/lights/' + light.toString() + '/state';
    method = 'PUT';
    data = {
      'effect': trigger ? 'colorloop' : 'none'
    };
    data = JSON.stringify(data);
    return this.request.call(this, uri, method, data).then(function(result) {
      var res;
      res = result[0]["error"] === void 0;
      dfd.resolve(res);
      return dfd.promise();
    }).fail(function(err) {
      dfd.reject(err);
      return dfd.promise();
    });
  };

  HueController.prototype.changeColor = function(light, color) {
    var dfd, data, method, uri;
    dfd = $.Deferred();
    uri = this.user + '/lights/' + light.toString() + '/state';
    method = 'PUT';
    h = color;
    data = {
        "hue"      : h
    };
    data = JSON.stringify(data);
    return this.request.call(this, uri, method, data).then(function(result) {
      var res = result[0]["error"] === void 0;
      dfd.resolve(res);
      return dfd.promise();
    }).fail(function(err) {
      dfd.reject(err);
      return dfd.promise();
    });
  };
};
