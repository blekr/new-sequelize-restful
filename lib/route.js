var _ = require('underscore');

function Router(sequelize, options) {
	options = options || {};
	_.defaults(options, {endPoint: '/api'});
	this.sequelize = sequelize;
	this.options = options;
};
Router.prototype = {};
Router.prototype.route = function () {
	var _this = this;
	return function (req, res, next) {
		if (req.path.indexOf(_this.options.endPoint) != 0) {
			next();
			return;
		}
		var paths = req.path.replace(_this.options.endPoint, '').replace(/^\//, '').split('/');
		var modelName = paths[0];
		var Model = _this.findDAOFactory(modelName);
		if (!Model) {
			res.status(500).json({msg: 'Unknown DAOFactory: ' + modelName});
			return;
		}
		switch (paths.length) {
			case 1: /* request path: /api/modelName */
				_this.handle_1(req, res, Model);
				break;
			case 2: /* request path: /api/modelName/1 */
				break;
			default:
				next();
			return;
		}
	};
};
Router.prototype.handle_1 = function (req, res, Model) {
	switch (req.method) {
		case 'GET':
			this.handleResourceIndex(req, res, Model);
			break;
		case 'POST':
			this.handleResourceCreate(req, res, Model);
			break;
		case 'HEAD':
			this.handleResourceDescribe(req, res, Model);
			break;
		default:
			res.status(500).json({msg: 'Method ' + req.method + ' not available for this pattern'});
			break;
	}
};
Router.prototype.handle_2 = function (req, res, Model, id) {
	switch (req.method) {
		case 'GET':
			this.handleResourceShow(req, res, Model, id);
			break;
		case 'DELETE':
		case 'DEL':
			break;
	}
};

Router.prototype.handleResourceDelete = function (req, res, Model, id) {
};
Router.prototype.handleResourceShow = function (req, res, Model, id) {
	Model.find(id).then(function (entry) {
		if (!entry)
			res.status(404).json({msg: id + ' not found'});
		else 
			res.json(entry);
	}, function (err) {
		res.status(500).json(err);
	});
};
Router.prototype.handleResourceDescribe = function (req, res, Model) {
	res.json({
		name: Model.name,
		tableName: Model.tableName,
		attributes: Model.rawAttributes,
	});
};
Router.prototype.handleResourceCreate = function (req, res, Model) {
	Model.create(req.body).then(function (entry) {
		res.json(entry.toJSON());
	}, function (err) {
		res.status(500).json(err);
	});
};
Router.prototype.handleResourceIndex = function (req, res, Model) {
	var query = stripUnderscore(_.extendOwn({}, req.query));
	var range = this.getRange(req);
	var sort = this.getSort(query.$sort);
	delete query.$sort;

	/* 
	 * if a value can be parseJSONed successfully, it will be done so. 
	 * Otherwise, it stays unchanged.
	 */
	for (var key in query) {
		query[key] = parseJsonSafe(query[key]);
	}

	/* call Model's findAndCountAll function with proper parameters */
	Model.findAndCountAll({
		where: query,
		order: sort,
		range: range.offset,
		limit: range.limit,
	}).then(function (entries) {
		res.header('Accept-Ranges',  'items');
		res.header('Range-Unit', 'items');
		if (entries.rows.length == 0) {
			res.sendStatus(204);
			return;
		}
		if (_.isUndefined(range.offset)) {
			res.header('Content-Range', '0-' + (entries.rows.length -1) + '/' + entries.count);
		} else {
			res.header('Content-Range', range.offset + '-' + (range.offset + entries.rows.length -1) + '/' + entries.count);
		}
		res.json(entries.rows);
	}, function (err) {
		res.status(500).json(err);
	});
};
Router.prototype.findDAOFactory = function(modelName) {
  return this.sequelize.daoFactoryManager.getDAO(modelName, { attribute: 'tableName' })
}

/* leading "-" means desc sorting, eg, "-name" means sort by name in desc */
function getSort(value) {
	if (value && value[0] == '-')
		return value.slice(1) + ' DESC';
	else 
		return value;
}

/* get Range from HTTP request headers */
function getRange(req) {
	var range = req.get('Range');
	if (!range) {
		return {};
	}
	var start = parseInt(range.split('-')[0]);
	var end = parseInt(range.split('-')[1]);
	return {
		offset: start,
		limit: end - start + 1
	};
}
function parseJsonSafe(code)
{
	try {
		return JSON.parse(code);
	} catch (e) {
		return code;
	}
}

/* strip leading "_" in keys */
function stripUnderscore(query) {
	var keys = [];
	_.each(query, function (v, k) {
		if (k[0] == '_')
			keys.push(k);
	});
	keys.map(function (key) {
		query[key.slice(1)] = query[key];
		delete query[key];
	});
	return query;
}
module.exports = Router;
