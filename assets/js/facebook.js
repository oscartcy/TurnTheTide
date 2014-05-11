var fbLogin = false;

(function($){
    var app_ID = '709747785734162';

    FB.init({
        appId: app_ID,
        frictionlessRequests: true,
        status: true,
        version: 'v2.0'
    });

    FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
    FB.Event.subscribe('auth.statusChange', onStatusChange);

    var fbUserInfo = {};

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
            fbLogin = true;
            //login success
            getMe(function(){
                serverLogin();
            });
            // getMe(function(){
            //     getPermissions(function(){
            //         console.log("Trying to get friend list...");
            //         getFriends(function(){
            //             renderWelcome();
            //             // FB.Canvas.setSize({ width: 800, height: 600 });
            //         });
            //     });
            // });

            getPermissions(function() {
                if(hasPermission('user_friends')) {
                    getFriends(renderFriendList);
                } else {
                    console.log('no user_friends permission, reRequest');

                    reRequest('user_friends', function() {
                        getPermissions(function() {
                            getFriends(renderFriendList);
                        })
                    })
                }
            })
        }
    }

    function onAuthResponseChange(response) {
        console.log('onAuthResponseChange', response);
    }

    function getMe(callback) {
        FB.api('/me', {fields: 'id,name,first_name,picture.width(150).height(150)'}, function(response){
            if( !response.error ) {
                fbUserInfo.me = response;
                callback();
            } else {
                console.error('/me', response);
            }
        });
    }

    function renderWelcome() {
        $(".pro_pic").attr("src", fbUserInfo.me.picture.data.url);
        $("#user_name").html("Name: " + fbUserInfo.me.name);
        console.log("my info = " + JSON.stringify(fbUserInfo.me));

    }

    function serverLogin() {
        if(socket.socket.connected)
            login();
        else 
            socket.on('connect', login);

        function login(){
            socket.post('/User/login', 
                { fbid: fbUserInfo.me.id }, 
                function(res) {
                    if(res.error)
                        console.log(res);
                    else {
                        console.log('server login success', res);

                        fbUserInfo.me.score = res.user.score;

                        playerId = fbUserInfo.me.id;

                        $(".pro_pic").attr("src", fbUserInfo.me.picture.data.url);
                        $("#userName").html("Name: " + fbUserInfo.me.name);
                        $("#userScore").html("Score: " + fbUserInfo.me.score);
                    }
                });
        }
    }

    function getFriends(callback) {
        FB.api('/me/friends', {fields: 'id,name,first_name,picture.width(100).height(100)'}, function(response){
            if(response && !response.error) {
                //lazy implementation
                //if friends are more than the default 5000 limit, should check paging parameter to get the whole list
                fbUserInfo.friends = response.data;
                callback();
                console.log("getFriends ok");
                console.log("number of friends = " + JSON.stringify(fbUserInfo.friends));
            } else {
                console.error('/me/friends', response);
            }
        });
    }

    function getPermissions(callback) {
        FB.api('/me/permissions', function(response){
            if( !response.error ) {
                fbUserInfo.permissions = response;
                console.log("getPermissions ok");
                callback();
            } else {
                console.error('/me/permissions', response);
            }
        });
    }

    function hasPermission(permission) {
        for( var i in fbUserInfo.permissions ) {
            if(fbUserInfo.permissions[i].permission == permission && fbUserInfo.permissions[i].status == 'granted' ) 
            return true;
        }

        return false;
    }

    function renderFriendList() {
        console.log('firend list: ', fbUserInfo.friends);

        var friends = fbUserInfo.friends;
        var rank_table = $("#rank_table");

        for(var i in friends) {
            var friend = friends[i];

            var div = $("<div />", {
                class: 'column_2'
            }).appendTo(rank_table);

            $('<h5 />', {
                text: friend.first_name, 
                class: 'text center bold color theme'
            }).appendTo(div);

            $('<img />', {
                src: friend.picture.data.url
            }).appendTo(div);

            $('<h6 />', {
                text: 100,
                class: 'text center'
            }).appendTo(div);
        }
    }

    function reRequest(scope, callback) {
        FB.login(callback, { scope: scope, auth_type:'rerequest'});
    }

})(jQuery);