/**
 * Created by abhinayarbabu on 15/01/17.
 */

app.controller('ContactsController', function($scope, toaster, ContactsService){

  $scope.customer = {
    name: "",
    email: "",
    phone: "",
    desc: ""
  };

  //console.log($scope.customer);

  $scope.onSubmit = onSubmit;


    function onSubmit(){
    var customer = $scope.customer;
    ContactsService.sendEmail(customer).then(function(data){
      toaster.pop('success', 'Request Successfully submitted')
    }, function(err){
      toaster.pop("danger", err);
    });
  }


});
