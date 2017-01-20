/**
 * Created by abhinayarbabu on 15/01/17.
 */

app.service('ContactsService', function($http, $q){
  var baseUrl = "api/contact";
  return{
    sendEmail: sendEmail
  };
  function sendEmail(data){
    var defered = $q.defer();
    $http.post(baseUrl+'/mail', data)
      .success(function(data){
        defered.resolve(data);
      }).error(function(data){
        defered.reject(data);
    })
  }
});
