Store = function(name, callback) {
	var self = this;
	self.name = name;

	var cb = _.bind(callback, self);
	cb();
};
Store.prototype = {
	_subsHandles: null,
	_subsReady: true,

	/**
	 * @summary Register actions this store handles
	 * @locus Anywhere
	 * @param {Object} actions - object of functions where the property
	 * corresponds to the action.
	 * @namespace Store
	 */
	actions: function (actions) {
		var self = this;

		self._actions = actions;

		self.tokenId = Dispatcher.register(function (payload) {
			var actionType = payload.actionType;
			if (_.has(self._actions, actionType)) {

				var params = _.omit(payload, 'actionType');


				var func = self._actions[actionType];
				func = _.bind(func, self);

				func(params);
			}
		});
	},

	/**
	 * @summary Specify this store's helpers available to templates.
	 * @locus Client
	 * @param {Object} helpers Dictionary of helper functions by name.
	 */
	helpers: function (helpers) {
		var self = this;

		Template.registerHelper(self.name, helpers);

		// Attach the helpers to the Store object
		_.extend(this, helpers);

	},

	subscribe: function (/* args */) {
		var self = this;
		var args = Array.prototype.slice.call(arguments);

		// initiate _subsHandles if it doesn't exist yet
		if(!self._subsHandles) {
			self._subsHandles = [];
		}

		var handle = Meteor.subscribe(args);

		self._subsHandles.push(handle);

		return handle;
	},

	subscriptionsReady: function() {
		var self = this;
		Tracker.autorun(function() {
			self._subsReady = _.every(this._subsHandles, function(sub) { return sub.ready() } );
		});

		return self._subsReady;
	}

};