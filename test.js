const BMapService = require('./bmap-web-service')

const service = new BMapService({ak: 'yourak', sk: 'yoursk'})

service.geoCodingReverse('22.031099,113.954743').then(function(res){
  console.log(res)
}, function(err){
  console.log(err)
})
service.geoCodingReverseBatch('39.983424,116.322987|29.983424,117.322987').then(function(res){
  console.log(res)
}, function(err){
  console.log(err)
})

const service2 = new BMapService({ak: 'yourak', format: 'xml'})
service2.geoCodingReverse('22.031099,113.954743').then(function(res){
  console.log(res)
}, function(err){
  console.log(err)
})