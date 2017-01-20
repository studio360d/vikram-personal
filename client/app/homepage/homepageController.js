app.controller("HomePageCtrl",['$scope', '$http','$q',   function($scope, $http, $q){

  $scope.myInterval = 5000;
  $scope.noWrapSlides = false;
  var slides = $scope.slides = [];

  $scope.slides = [
    {image: "assets/img/slide-1.jpg"},
    {image: "assets/img/slide-2.jpg"},
    {image: "assets/img/slide-3.jpg"}
  ]
}])
