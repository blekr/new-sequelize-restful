var _ = require('underscore');

function route(sequelize, options) {
	_.defaults(options, {endPoint: '/api'});
	return function (req, res, next) {
		if (req.path.indexOf(options.endPoint) != 0) {
			next();
			return;
		}
		var paths = req.path.replace(options.endPoint, '').replace(/^\//, '').split('/');
		var model = paths[0];
		switch (paths.length) {
			case 1:
				break;
			case 2:
				break;
			default:
				next();
			  return;
		}
	};
};
module.exports = route;
