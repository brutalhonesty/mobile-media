/* global mobileMediaApp */
'use strict';

mobileMediaApp.controller('MainCtrl', ['$scope', 'API', function ($scope, api) {
  $scope.upload = function(uploadVideo, urlVideo) {
    var uploadObj = {
      file: uploadVideo,
      url: urlVideo
    };
    api.uploadVideo(uploadObj).success(function (uploadResp) {
      $scope.alert = uploadResp.message;
    }).error(function (error) {
      $scope.alert = error.message;
    });
  };
}]);
mobileMediaApp.controller('NavbarCtrl', ['$scope', '$location', function ($scope, $location) {
  $scope.menu = [{
    'title': 'Home',
    'link': '/'
  }];
  $scope.isActive = function(route) {
    return route === $location.path();
  };
}]);
