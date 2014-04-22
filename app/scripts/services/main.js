/* global mobileMediaApp */
'use strict';

mobileMediaApp.service('API', ['$http', function ($http) {
  return {
    uploadVideo: function(uploadData) {
      //By setting ‘Content-Type’: undefined, the browser sets the Content-Type to multipart/form-data for us and fills in the correct boundary. Manually setting ‘Content-Type’: multipart/form-data will fail to fill in the boundary parameter of the request.
      var formData = new FormData();
      formData.append('file', uploadData.file || null);
      formData.append('url', uploadData.url || null);
      return $http.post('/api/upload/video', formData, {
        headers: {'Content-Type': undefined},
        transformRequest: angular.identity
      });
    }
  };
}]);