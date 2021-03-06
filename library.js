'use strict';

const axios = require('axios');

const winston = require.main.require('winston');
const user = require.main.require('./src/user');
const meta = require.main.require('./src/meta');
const controllers = require('./lib/controllers');
const authentication = require.main.require('./src/controllers/authentication.js');

const plugin = {};
let settings;

plugin.init = async (params) => {
  const { router, middleware } = params;
  const routeHelpers = require.main.require('./src/routes/helpers');

  /** GET PLUGIN SETTINGS */
  settings = await meta.settings.get('code-autologin')

  /** IF ENABLED, INITIALIZE AUTOLOGIN ROUTE */
  if (settings['autologin-enabled'] === 'on') {
    routeHelpers.setupPageRoute(router, '/autologin/:code', middleware, [autologinRoute], (req, res) => {
      // res.sendStatus(200);
    });
  }

  /** ADMIN PAGE FOR PLUGIN SETUP */
  routeHelpers.setupAdminPageRoute(router, '/admin/plugins/code-autologin', middleware, [], controllers.renderAdminPage);
};

/*****************************************************************************
 *  AUTOLOGIN ROUTE
 *  Converts a CODE to a EMAIL by calling a custom endpoint
 *************************************************************************** */
const autologinRoute = async (req, res, next) => {
  const { code } = req.params;
  const endpoint = settings['endpoint'];

  let status;
  let email;

  /** CALL ENDPOINT WITH CODE AND EXPECT AN EXISTING EMAIL ADDRESS */
  try {
      const { data } = await axios.get(`${endpoint}?code=${code}`);
      ({ status, email } = data);
  } catch (error) {
    winston.info(`Autologin: request failed using code ${code}`);
    return res.sendStatus(404);
  }

  /** CHECK FOR A VALID RESPONSE */
  if (status !== 'ok' || email === '') {
    return res.sendStatus(404);
  }

  /** TRIES TO AUTHENTICATE RETURNED EMAIL */
  user.getUidByEmail(email, function (err, uid) {
    if (!uid) {
      return res.sendStatus(404);
    }

    authentication.doLogin(req, uid, function (err) {
      if (err) {
        res.statusCode = 500;
        res.end('Error: ' + err);
        return winston.error(`Autologin: Could not log in: ${err}`);
      }

      winston.info(`Autologin: successfully logged uid ${uid}, redirect to home`);
      res.setHeader('Location', '/');
      res.statusCode = 302;
      res.end();
    });
  });

  setImmediate(next);
}

/*****************************************************************************
 *  ADDS PLUGIN SETTINGS IN ADMIN DASHBOARD
 *************************************************************************** */
plugin.addAdminNavigation = function (header, callback) {
  header.plugins.push({
    route: '/plugins/code-autologin',
    icon: 'fa-unlock',
    name: 'Code Autologin',
  });

  callback(null, header);
};

module.exports = plugin;
