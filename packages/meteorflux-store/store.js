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
		var actionType = payload.actionType;
		if(_.has(self._actions, actionType)) {

			var params = _.omit(payload, 'actionType');


			var func = self._actions[actionType];
			func = _.bind(func, self);

			func(params);
		}
	});
};

Store.prototype.helpers = function(helpers) {
	var self = this;

	//_.each(helpers, function(helper, key) {
	//	// If the app state is stored in the Stores
	//	// then there's no need to access the template instance
	//	// OR IS THERE??
	//	helper = _.bind(helper, self);
    //
	//	Template.registerHelper(key, helper);
	//});

	Template.registerHelper(self.name, helpers);

	// Attach the helpers to the Store object
	_.extend(this, helpers);

};
