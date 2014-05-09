var friendCache = {};

function login(callback) {
    FB.login(callback, {
        scope:'user_friends, publish_actions',
        return_scopes: true
    });
}

function loginCallback(response) {
    console.log('loginCallback',response);
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        //testAPI();
    } else {
        //Important: remember to change appID
        top.location.href = 'https://apps.facebook.com/709747785734162';
        console.log('User cancelled login or did not fully authorize.');
    }
}

function onStatusChange(response) {
    if( response.status != 'connected' ) {
        login(loginCallback);
    } else {
        //login success
        getMe(function(){
            getPermissions(function(){
                console.log("Trying to get friend list...");
                getFriends(function(){
                    renderWelcome();
                });
            });
        });
    }
}

function onAuthResponseChange(response) {
    console.log('onAuthResponseChange', response);
}

function getMe(callback) {
    FB.api('/me', {fields: 'id,name,first_name,picture.width(150).height(150)'}, function(response){
        if( !response.error ) {
            friendCache.me = response;
            callback();
        } else {
            console.error('/me', response);
        }
    });
}

function renderWelcome() {
    $(".pro_pic").attr("src", friendCache.me.picture.data.url);
    $("#user_name").html("Name: " + friendCache.me.name);
    console.log("my info = " + JSON.stringify(friendCache.me));

}

function getFriends(callback) {
    FB.api('/me/friends', {fields: 'id,name,first_name,picture.width(150).height(150)'}, function(response){
        if(response && !response.error) {
            friendCache.friends = response;
            callback();
            console.log("getFriends ok");
            console.log("number of friends = " + JSON.stringify(friendCache.friends));
        } else {
            console.error('/me/friends', response);
        }
    });
}

function getPermissions(callback) {
    FB.api('/me/permissions', function(response){
        if( !response.error ) {
            friendCache.permissions = response;
            console.log("getPermissions ok");
            callback();
        } else {
            console.error('/me/permissions', response);
        }
    });
}