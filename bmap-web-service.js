const md5 = require('md5')
const request = require('request')
const promise = require('promise')

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
/**
 * 构造函数
 * @param {object} config 参数较多时使用对象作为参数
 */
function BMapWebService(config) {
  this.ak = config.ak
  this.sk = config.sk
  this.format = config.format || 'json'
  this.baseUrl = config.baseUrl || 'http://api.map.baidu.com'
}

BMapWebService.prototype.snCal = function(url) {
  return md5(fixedEncodeURIComponent(url))
}
/**
 * 转换单个坐标到地址
 */
BMapWebService.prototype.geoCodingReverse = function(location, coordtype, extensions_poi, extensions_road, extensions_town, pois, radius, latest_admin) {
  coordtype = coordtype || 'bd09ll'
  extensions_poi = extensions_poi || null
  extensions_road = extensions_road || false
  //extensions_town = extensions_town || true
  pois = pois || 0
  radius = radius || 1000
  latest_admin = latest_admin || 0
  //console.log(location + '|' + coordtype + '|' + extensions_poi + '|' + extensions_road + '|' + extensions_town + '|' + pois + '|' + radius + '|' + latest_admin)
  var url = ''
  var sn = ''
  if (this.sk) { // 当包含sk参数，即使用sn认证时
    if (extensions_town) {
      url = '/geocoder/v2/?location=' + location 
      + '&coortype=' + coordtype + '&extensions_poi=' + extensions_poi + '&extensions_road=' 
      + extensions_road + '&extensions_town=' + extensions_town + '&pois=' + pois + '&radius=' + radius + '&latest_admin=' + latest_admin +
      '&output=' + this.format + '&ak=' + this.ak + this.sk
      sn = this.snCal(url)
      url = this.baseUrl + url.replace(this.sk, '') + '&sn=' + sn
    } else {
      url = '/geocoder/v2/?location=' + location 
      + '&coortype=' + coordtype + '&extensions_poi=' + extensions_poi + '&extensions_road=' 
      + extensions_road + '&pois=' + pois + '&radius=' + radius + '&latest_admin=' + latest_admin + '&output=' + this.format + '&ak=' + this.ak + this.sk
      sn = this.snCal(url)
      url = this.baseUrl + url.replace(this.sk, '') + '&sn=' + sn
    }
  } else { // 当使用ip白名单时
    if (extensions_town) {
      url = this.baseUrl + '/geocoder/v2/?location=' + location 
      + '&coortype=' + coordtype + '&extensions_poi=' + extensions_poi + '&extensions_road=' 
      + extensions_road + '&extensions_town=' + extensions_town + '&pois=' + pois + '&radius=' + radius + '&latest_admin=' + latest_admin +
      '&output=' + this.format + '&ak=' + this.ak
    } else {
      url = this.baseUrl + '/geocoder/v2/?location=' + location 
      + '&coortype=' + coordtype + '&extensions_poi=' + extensions_poi + '&extensions_road=' 
      + extensions_road + '&pois=' + pois + '&radius=' + radius + '&latest_admin=' + latest_admin + '&output=' + this.format + '&ak=' + this.ak
    }
  }
  return new promise(function(resolve, reject){
    request.get(url, function (err, res, body) {
      if (err) {
        reject(err)
      }
      resolve(body)
    })
  })
  

}
/**
 * 批量转化坐标，仅能返回行政区信息
 */
BMapWebService.prototype.geoCodingReverseBatch = function(locations, coordtype) {
  coordtype = coordtype || 'bd09ll'
  if (this.sk) {
    var url = '/geocoder/v2/?location=' + encodeURIComponent(locations) + '&coortype=' + coordtype + '&batch=true' +
      '&output=' + this.format + '&ak=' + this.ak + this.sk
    sn = this.snCal(url)
    url = this.baseUrl + url.replace(this.sk, '') + '&sn=' + sn
  } else {
    var url = this.baseUrl + '/geocoder/v2/?location=' + encodeURIComponent(locations) + '&coortype=' + coordtype + '&batch=true' +
    '&output=' + this.format + '&ak=' + this.ak
  }
  return new promise(function(resolve, reject){
    request.get(url, function (err, res, body) {
      if (err) {
        reject(err)
      }
      resolve(body)
    })
  })
}

/**
 * 坐标转换api
 */
BMapWebService.prototype.coorConvert = function(coords, from, to) {
  from = from || 1 //默认为1，即GPS设备获取的坐标
  to = to || 5//默认为5，即bd09ll(百度坐标)
  var url = ""
  if (this.sk) {
    url = '/geoconv/v1/?coords=' + encodeURIComponent(coords) + '&from=' + from + '&to=' + to + '&output=' + this.format + '&ak=' + this.ak + this.sk
    sn = this.snCal(url)
    url = this.baseUrl + url.replace(this.sk, '') + '&sn=' + sn
  } else {
    url = this.baseUrl + '/geoconv/v1/?coords=' + encodeURIComponent(coords) + '&from=' + from + '&to=' + to + '&output=' + this.format + '&ak=' + this.ak
  }
  return new Promise(function(resolve, reject){
    request.get(url, function(err, res, body){
      if (err){
        reject(err)
      }
      resolve(body)
    })
  })
}

/**
 * ip定位
 */
BMapWebService.prototype.IPLocation = function(coor) {
  coor = coor || 'bd09ll' //返回坐标类型，支持bd09mc（百度墨卡托坐标）、bd09ll（百度经纬度坐标）和gcj02（国测局坐标）；
  var url = ""
  if (this.sk) {
    url = '/location/ip?coor=' + coor + '&ak=' + this.ak + this.sk
    sn = this.snCal(url)
    url = this.baseUrl + url.replace(this.sk, '') + '&sn=' + sn
  } else {
    url = this.baseUrl + '/location/ip?coor=' + coor + '&ak=' + this.ak
  }
  return new Promise(function(resolve, reject){
    request.get(url, function(err, res, body){
      if (err){
        reject(err)
      }
      resolve(body)
    })
  })
}

module.exports = BMapWebService