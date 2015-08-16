Store = function(name, callback) {
	var self = this;
	self.name = name;

	var cb = _.bind(callback, self);
	cb();
};
Store.prototype.actions = function(actions) {
	var self = this;

	self._actions = actions;

	self.tokenId = Dispatcher.register(function(payload){
		if(_.has(self._actions, payload.actionType)) {

			var params = _.omit(payload, 'actionType');

			// Maybe bind self to the action functions?
			self._actions[payload.actionType](params);
		}
	});
};

Store.prototype.helpers = function(helpers) {
	var self = this;

	_.each(helpers, function(helper, key) {
		// If the app state is stored in the Stores
		// then there's no need to access the template instance
		// OR IS THERE??
		helper = _.bind(helper, self);

		Template.registerHelper(key, helper);
	});
	// Add the helpers to the Store object
	_.extend(this, helpers);

};
