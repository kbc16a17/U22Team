
var map;
var ID = Math.floor(Math.random () * 1000) + 1; //メンバーの管理関係が未完成なので暫定でメンバーIDつけます。
console.log(ID);
var pointList = new Array(0);
function initMap() {
    
    map = new google.maps.Map(document.getElementById('map'), {
        //デフォ値(地図の中心点)
        center: {lat: 33.8397463, lng: 132.7566273},
        zoom: 14
    });
    var infoWindow = new google.maps.InfoWindow({map: map});
}

var myplace;
var MLcnt = 0;
var mylocation = function (){
    if (navigator.geolocation) {    //現在地が取得できるか判定します
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            if(MLcnt === 0){  //初回のみ現在地マーカの削除を行わない
                ++MLcnt;
                console.log("初回");
            }else{
                myplace.setMap(null);
                console.log('更新');
            }

            //現在地にマーカを置きます
            myplace = new google.maps.Marker({
                //map: map,
                position: pos,
                icon: {
                    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 6
                }
            });

            //自分の現在地をPointテーブルに記録
            $.ajax({
                type: 'POST',
                url: "setPoint.php",
                data: {
                    mID: ID,
                    lat: lat,
                    lon: lon
                },
                success: function(){
                     console.log("やったぜ");
                },
                error: function(response){
                    console.log("ダメだったぜ");
                }
            });

            //地図の中心を現在地に書き換えます
            map.setCenter(pos);
            myplace.setMap(map);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });  
    } else {
        // 現在地が取得できなかったらエラーを表示する
        handleLocationError(false, infoWindow, map.getCenter());
    }
};
    
    
var GDPcnt = 0;
var getDestinationPoint  = function (){
    //目的地を地図に表示するための処理
    $.ajax({
        type: "get",
        url: "ConnectDummyDB.php",
        data: "",
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {

            $.each(data,function(index,val){
                var point = new google.maps.LatLng(
                    data[index].latitude,
                    data[index].longitude
                );
                destPoint = new google.maps.Marker({
                    map: map,
                    position: point
                });

            });

         }
    });
};
    
    
var getOtherPoint  = function (){
    var memberPoint;
    //他のメンバーの位置情報を取得   
    $.ajax({
        type: "get",
        url: "connectPointJson.php",
        data: {
            mID: ID
        },
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
           
            //古い位置情報をすべて地図から削除
            $.each(pointList,function(val,index){
               pointList[val].setMap(null); 
            });
            pointList.length = 0;
            
            //位置情報を配列に追加
            $.each(data,function(val,index){
                var point = new google.maps.LatLng(
                    data[val].latitude,
                    data[val].longitude
                );

                memberPoint = new google.maps.Marker({
                    //map: map,
                    position: point
                });
                pointList.push(memberPoint);
    
            });
            
            //配列に登録されている位置情報を地図に表示
            $.each(pointList,function(val,index){
               pointList[val].setMap(map); 
            });
                 
         },
         error: function () {
            console.log('だめだったよ');
        }
    });
};
    
    

//ブラウザがGeolocationっていう位置情報的なのに対応してなかったら出すエラーの中身
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

//ページを離れるときその人の位置情報をDBから削除
window.addEventListener('beforeunload',function(){
     $.ajax({
        type: 'POST',
        url: "deletePoint.php",
        data: {
            mID: ID
        }
    });
});



//上から「現在地の取得」「他の人の位置を取得」「目的地の取得」を一定間隔で行います。
setInterval(mylocation, 1000);
setInterval(getOtherPoint, 1000);
//setInterval(getDestinationPoint, 5000);