(function(){
    const app = angular.module('picApp', ['ngRoute']);

    const DEFAULT_PICTURES_ON_PAGE = 5;
    
    app.config(['$routeProvider', function($routeProvider){
        $routeProvider
        .when('/main', {
            templateUrl: 'views/all_pictures.html',
            controller: 'picturesControler'
        })
        .when('/picture', {
            templateUrl: 'views/picture.html' 
        }).otherwise({
            redirectTo: '/main'
        });
    
    }]);
    
    app.controller('picturesControler', ['$scope', '$http', function($scope, $http){
        if(!$scope.hasOwnProperty('picsOnPage')){//primal item init
            $scope.picsOnPage = DEFAULT_PICTURES_ON_PAGE;
        }
        if(!$scope.hasOwnProperty('page')){
            $scope.page = 1;
        }
        if(!$scope.hasOwnProperty('favorites')){
            $scope.favorites = JSON.parse(localStorage.getItem('favorites'));
        }
        if(!$scope.hasOwnProperty('favoritesShowing')){
            $scope.favoritesShowing = false;
        }
        if($scope.err){
            $scope.err = {};
        }
        
        $scope.$watch(function(){//input validation
            if($scope.picsOnPage < 1 || $scope.picsOnPage === undefined){
                $scope.picsOnPage = 1;
            }
            $scope.picsOnPage = Math.round($scope.picsOnPage);
        });
        getImgs($scope, $http, $scope.page, $scope.picsOnPage);

        /*Functions declaration*/
        $scope.setNewAmountOfPics = function (){
            getImgs($scope, $http, $scope.page, $scope.picsOnPage);
        }
        $scope.onPageButtonClick = function(action){
            $scope.page+=action;
            getImgs($scope, $http, $scope.page, $scope.picsOnPage);
        }
        $scope.toggleFavorite = function(id){
            $scope.favorites = localStorage.getItem('favorites');
            if( $scope.favorites === null ){//if haven't setted before
                $scope.favorites = [];
            }else{
                $scope.favorites = JSON.parse($scope.favorites);
            }
            let idx = $scope.favorites.indexOf(id);
            if(idx !== -1){//toggle
                $scope.favorites.splice(idx, 1);
            } else {
                $scope.favorites.push(id);
            }
            console.log($scope.favorites);
            localStorage.setItem('favorites', JSON.stringify($scope.favorites));
        }
        $scope.showFavorites = function(){
            let btn = document.querySelector('#fav_btn');
            if(!$scope.favoritesShowing){
                $scope.pics.length = 0;
                for(let f of $scope.favorites){
                    $http.get('https://picsum.photos/id/' + f + '/info').then(data => {
                        $scope.pics.push(data.data);
                    }).catch(err => {
                        $scope.err = err;
                        console.log($scope.err);
                    });
                }
                btn.value = "Hide favorites";
            } else {
                getImgs($scope, $http, $scope.page, $scope.picsOnPage);
                btn.value = "Show favorites";
    
            }
            $scope.favoritesShowing = !$scope.favoritesShowing;
        }
    }]).controller('singlePictureController', ['$scope', '$http', '$route', '$location', '$window', function($scope, $http, $route, $location, $window){
        $route.pic = {}
        const params = $location.search();
        let id = -1;
        if(params.hasOwnProperty('id')){
           id = params.id;
        }else{
            $window.location.href = '/#!/main';
        }
        //https://i.picsum.photos/id/570/200/300.jpg?blur=10
        $http.get('https://picsum.photos/id/' + id + '/info').then(data => {//get picture
            $scope.pic = data.data;
        }).catch( err => {
            $scope.err = err;
            console.log(err);
        });
        $scope.preloaerImgSrc = 'https://i.picsum.photos/id/' + id + '/' + 200 + '/' + 200 +'.jpg?blur=10';//get preloader pic
      
        
        document.querySelector('#main-img').onload = () => {//If main picture loaded, replace
            console.log('loaded');
            document.querySelector('#img_preloader').classList.add("hidden");
            document.querySelector('#main-img').classList.remove("hidden");
        };
    }]);
})();

function getImgs($scope, $http, page, amount){
    $scope.pics = $scope.pics || []; 
    $http.get('https://picsum.photos/v2/list?page='+ page +'&limit=' + amount).then(data => {
        $scope.pics.length = 0;
        $scope.pics.push.apply($scope.pics, data.data);
    }).catch(err => {
        $scope.err = err;
        console.log(err);
    });
}