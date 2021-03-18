'use strict';

const axios = require('axios');

const nconf = require.main.require('nconf');
const winston = require.main.require('winston');
const controllers = require('./lib/controllers');
const user = require.main.require('./src/user');
const authentication = require.main.require('./src/controllers/authentication.js');

const plugin = {};

plugin.init = async (params) => {
  const { router, middleware } = params;
  const routeHelpers = require.main.require('./src/routes/helpers');

  /*****************************************************************************
   *  AUTOLOGIN ROUTE
   *  Converts a CODE to a EMAIL by calling a custom endpoint
   *************************************************************************** */
  routeHelpers.setupPageRoute(router, '/autologin/:code', middleware, [async (req, res, next) => {
    const { code } = req.params;

    const email = 'USE CUSTOM EMAIL';

    const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
    console.log(data);

    user.getUidByEmail(email, function (err, uid) {
      if (!uid) {
        return res.sendStatus(404);
      }

      winston.info('Secretly logging uid ' + uid + ' for session ' + req.sessionID);

      authentication.doLogin(req, uid, function (err) {
        if (err) {
          res.statusCode = 500;
          res.end('Error: ' + err);
          return winston.error('Could not log in: ' + err);
        }

        winston.info(`Successfully logged uid ${uid}, redirect to home`);
        res.setHeader('Location', '/');
        res.statusCode = 302;
        res.end();
      });
    });

    setImmediate(next);
  }], (req, res) => {
    // res.sendStatus(200);
  });

  /*****************************************************************************
   *  ADMIN PAGE FOR PLUGIN SETUP
   *************************************************************************** */
  routeHelpers.setupAdminPageRoute(router, '/admin/plugins/code-autologin', middleware, [], controllers.renderAdminPage);
};

/**
 * If you wish to add routes to NodeBB's RESTful API, listen to the `static:api.routes` hook.
 * Define your routes similarly to above, and allow core to handle the response via the
 * built-in helpers.formatApiResponse() method.
 *
 * In this example route, the `authenticate` middleware is added, which means a valid login
 * session or bearer token (which you can create via ACP > Settings > API Access) needs to be
 * passed in.
 *
 * To call this example route:
 *   curl -X GET \
 * 		http://example.org/api/v3/plugins/foobar/test \
 * 		-H "Authorization: Bearer some_valid_bearer_token"
 *
 * Will yield the following response JSON:
 * 	{
 *		"status": {
 *			"code": "ok",
 *			"message": "OK"
 *		},
 *		"response": {
 *			"foobar": "test"
 *		}
 *	}
 */
// plugin.addRoutes = async ({ router, middleware, helpers }) => {
// 	router.get('/quickstart/:param1', middleware.authenticate, (req, res) => {
// 		helpers.formatApiResponse(200, res, {
// 			foobar: req.params.param1,
// 		});
// 	});
// };

plugin.addAdminNavigation = function (header, callback) {
  header.plugins.push({
    route: '/plugins/code-autologin',
    icon: 'fa-unlock',
    name: 'Code Autologin',
  });

  callback(null, header);
};

module.exports = plugin;
