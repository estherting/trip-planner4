var api = 'AIzaSyAzgRKlW8A7Bgf5ywmvgtKtooX8YhKbm9U'
var data
var test
var lat
var lng


var CSRFToken = $('meta[name="csrf-token"]').attr('content')
function initAutocomplete() {
    var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0},
    zoom: 13,
    mapTypeId: 'roadmap'
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
        return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
        marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
        if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
        }
        var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
        };
        var location = place.geometry.location;
        lat = location.lat();
        lng = location.lng();
        //$(document).on('change', '#pac-input', function(){alert("pressed a button")}
        // Create a marker for each place.
        markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
        }));
        if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
        } else {
        bounds.extend(place.geometry.location);
        }
    });
    map.fitBounds(bounds);
    });
}

$(document).ready(function(){
    $(document).on('click','#searchbutton',function(){

        $.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+lng+"&radius=1500&type=attraction&photo_reference&key=" + api, function(res) {
            $('.loc').html('')
            data = res
            var tripID
            $.get('/gettripid',function(id){
                tripID = id
                for(var e in res.results){
                    var imgref = "12"
                    if(res.results[e].photos){
                        imgref = res.results[e].photos[0].photo_reference
                    }
                    var resultid = res.results[e].place_id

                    $('.loc').append("<div class = 'places' style = 'background-image: url(https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=400&photoreference="+ imgref +"&key="+ api +")' thisid = " + resultid + " ><h2>" + res.results[e].name + "</h2></div><form><input type = 'hidden' name = 'csrfmiddlewaretoken' value = '" + CSRFToken +"'><input type = 'hidden' name = 'name' value = '" + res.results[e].name +"'><input type = 'hidden' name = 'lat' value ='"+lat+"'><input type = 'hidden' name = 'lng' value = '"+lng+"'><input type = 'hidden' name = 'resultid' value = '" + resultid +"'><input type = 'hidden' name = 'tripID' value = '"+tripID+"'><input type = 'hidden' name = 'imgref' value = '" + imgref + "'><button class = 'addbutton'>add</button></form>")
                }
            })
        }, "json");
    })
    $(document).on('click','.places', function(){
        var id = $(this).attr('thisid')
        $('.displayinfo').html('')
        $.get("https://maps.googleapis.com/maps/api/place/details/json?placeid="+ id +"&key=" + api, function(res){
            test = res
            address = res.result.formatted_address
            imgref = res.result.photos

            $('.displayinfo').html('')
            $('.displayinfo').append('<h1>'+res.result.name+'</h1>')
            for(var i = 0; i<imgref.length; i++){
                $('.displayinfo').append("<img class = 'myslides' src = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=400&photoreference="+ imgref[i].photo_reference +"&key="+ api +"'>")
            }
            /*  $('#photo-container').append("<button onclick = 'plusDivs(-1)'>&#10094;</button>")
            $('#photo-container').append("<button onclick = 'plusDivs(-1)'>&#10095;</button>") */
            $('.displayinfo').append('<p>' + res.result.formatted_address + '</p>')
        })
        $('.displayinfo').css("display","block")
    })
    $(document).on('click','.addbutton', function(e){
        e.preventDefault()
        $.ajax({
            url:'/trips/activity/add',
            method: 'post',
            data: $(this).parent().serialize(),
            success: function(response){

                $('.proposed').html(response)
            }
        })
    })
    $(document).on('click','.agendaadd', function(e){
        e.preventDefault()
        $.ajax({
          url: '/returnDay',
          method: 'GET',
          success: function(response){
            $('#day' + response).click()
          }
        })
        $.ajax({
            url:'/trips/activity/addtoagenda',
            method: 'post',
            data: $(this).parent().serialize(),
            success: function(response){
                //console.log("Received this from server:", response)
                $('.tabcontents').html(response)
                $(document).on("click", "#day6" , function() {
                    console.log("i was clicked!")
                });
            }
        })
    })
    $('body').click(function(event){
        $(".displayinfo").css('display','none')
    })

    $('.displayinfo').click(function(event){
        event.stopPropagation();
    })
    $(document).on('click','#mapbutton',function(e){
        e.preventDefault()
        $.ajax({
            url: '/showmap',
            success: function(serverResponse){
                console.log('success. serverResponse', serverResponse)
                $('.displayinfo').html(serverResponse)
            }
        })
        $(".displayinfo").css('display','block')
    })
    $(document).on('click','#routebutton',function(e){
        e.preventDefault()
        var start = $(this).prev().attr('placeid')
        var end = $(this).next().attr('placeid')
        $.ajax({
            url: '/showroute/'+start+'/'+end,
            success:function(serverResponse){
                console.log('success. serverResponse', serverResponse)
                $('.displayinfo').html(serverResponse)
            }
        })
        $(".displayinfo").css('display','block')
    })
})
