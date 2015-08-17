// UserStore Creator
var UserStore = new Store('', function () {
  var self = this;

  // UserStore Reactive Vars
  self._userIsSigning = new ReactiveVar(false);
  self._loginOrCreate = new ReactiveVar('login');
  self._createError = new ReactiveVar('');
  self._loginError = new ReactiveVar('');
});

UserStore.actions({
  // Callbacks
  USER_WANTS_TO_LOGIN: function(){
    this._userIsSigning.set(true);
    this._loginOrCreate.set('login');
  },
  USER_WANTS_TO_CREATE_ACCOUNT: function(){
    this._userIsSigning.set(true);
    this._loginOrCreate.set('create');
  },
  USER_CANCELED: function(){
    this._userIsSigning.set(false);
  },
  LOGIN_FAILED: function(payload){
    this._loginError.set(payload.error);
  },
  CREATE_ACCOUNT_FAILED: function(payload){
    this._createError.set(payload.error);
  },
  LOGIN_SUCCEED: function(){
    this._loginError.set('');
    this._createError.set('');
    this._userIsSigning.set(false);
  },
  CREATE_ACCOUNT_SUCCEED: function(){
    this.LOGIN_SUCCEED();
  }
});

UserStore.helpers({
  // Getters
  userIsSigning: function(){
    return this._userIsSigning.get();
  },
  loginOrCreate: function(){
    return this._loginOrCreate.get();
  },
  loginError: function(){
    return this._loginError.get();
  },
  createAccountError: function(){
    return this._createError.get();
  }
});
// Create the instance
Dependency.add('UserStore', UserStore);
