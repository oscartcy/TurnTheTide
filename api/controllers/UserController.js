/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    login: function(req, res) {
        var fbid = req.param('fbid');

        if(!fbid)
            return res.json({ error: 'fbid not provided' });

        User.findOneByFbid(fbid)
            .done(function(err, user) {
                if(err)
                    return res.json({ error: err });

                if(user) {
                    req.session.user = user.id;
                    user.status = 'online';
                    user.save(function(err) {
                        console.log(err);
                    });

                    return res.json({ user: user });
                } else {
                    User.create({
                        fbid: fbid,
                        score: 0,
                        status: 'online'
                    }).done(function(err, user) {
                        if(err)
                            return res.json({ error: err });
                        req.session.user = user.id;
                        return res.json({ user: user });
                    });
                }
            });
    },

    status: function(req, res) {
        var fbid = req.param('fbid');

        if(!fbid)
            return res.json({ error: 'fbid not provided'});

        User.findOneByFbid(fbid)
            .done(function(err, user) {
                if(err)
                    return res.json({ error: err });

                if(user) {
                    return res.json({ status: user.status });
                } else {
                    return res.json({ error: 'user not found'});
                }
            })
    },


    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to UserController)
     */
    _config: {}


};
