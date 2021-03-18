'use strict';

/* globals $, app, socket, define, config */

define('admin/plugins/code-autologin', ['settings', 'uploader', 'admin/modules/colorpicker'], function (settings, uploader, colorpicker) {
	var ACP = {};

	ACP.init = function () {
		settings.load('code-autologin', $('.code-autologin-settings'));
		$('#save').on('click', saveSettings);
	};

	function saveSettings() {
		settings.save('code-autologin', $('.code-autologin-settings'), function () {
			app.alert({
				type: 'success',
				alert_id: 'code-autologin-saved',
				title: 'Settings Saved',
				message: 'Please reload your NodeBB to apply these settings',
				clickfn: function () {
					socket.emit('admin.reload');
				},
			});
		});
	}

	return ACP;
});
