var Store = function(callback) {

  callback();
};
Store.prototype.actions = function(actions) {
  var self = this;

  self._actions = actions;

  self.tokenId = Dispatcher.register(function(payload){
    if(self._actions[payload.actionType]) {

      var params = _.omit(payload, 'actionType');

      self._actions[payload.actionType](params);
    }
  });
};

Store.prototype.helpers = function(helpers) {
  var self = this;

  self._helpers = helpers;

  _.each(helpers, function(helper, key) {
    Template.registerHelper(key, helper);
  });
};


// Creator
CatalogStore = new Store(function() {
  var self = this;

  // Reactive Vars
  addingProduct = new ReactiveVar(false);
  searchQuery   = new ReactiveVar("");

  // Dependencies
  Dependency.autorun(function () {
    catalogRouter = Dependency.get('CatalogRouter');
    countersStore = Dependency.get('CountersStore');
  });

});


CatalogStore.helpers({
  getSearchedProducts: function() {
    var self = this;
    console.log('thethis');
    console.log(self);

    var regexp = new RegExp(searchQuery.get(), 'i');
    return Catalog.find(
        { name: regexp },
        { sort: { date: 1 },
          limit: catalogRouter.get.productsPerPage() });
  },
  getSearchQuery: function () {
    return searchQuery.get();
  },
  getOneProduct: function (id) {
    return Catalog.findOne(id);
  },
  getUserIsAddingProduct: function () {
    return addingProduct.get();
  },
  getNumberOfProducts: function () {
    return countersStore.get.numberOfProducts();
  },
  getProductsInPage: function () {
    var self = this;

    var actualPage      = catalogRouter.get.actualPage();
    var productsPerPage = catalogRouter.get.productsPerPage();
    var regexp          = new RegExp(searchQuery.get(), 'i');

    var skip = (actualPage - 1) * productsPerPage;
    if (catalogRouter.is.firstPage())
      skip = 0;

    return Catalog.find(
        { name: regexp },
        { limit: productsPerPage,
          skip: skip,
          sort: { date: 1 }
        });
  },
  getProductsInPageReady: function () {
    var self = this;
    return true;
    //return self.getProductsInPage().count() === 0 ? false : true;
  }
});

CatalogStore.actions({
  ADD_PRODUCT: function(payload) {
    var name = payload.product.name;
    var price = parseInt(payload.product.price);

    // some validation in the Store side
    var error = false;
    if (name === '') {
      error = new Meteor.Error("wrong-name","Please provide a valid name.");
    } else if ((price === '')||(!$.isNumeric(price))) {
      error = new Meteor.Error("wrong-price","Please provide a valid price.");
    } else {
      Meteor.call('CatalogStore.addProduct', {name:name, price:price});
    }
    addingProduct.set(error);
  },
  REMOVE_PRODUCT: function(payload) {
    Meteor.call('CatalogStore.removeProduct', payload.product._id);
  },
  ADD_ANOTHER_PRODUCT: function() {
    var self = this;
    var number = Blaze._globalHelpers.getNumberOfProducts() + 1;
    self.ADD_PRODUCT({product: {name: "Product "+ number, price: number}});
  },
  ADD_ANOTHER_10_PRODUCTS: function() {
    var self = this;
    var number = Blaze._globalHelpers.getNumberOfProducts() + 1;
    for (var i = number; i < (number + 10); i++) {
      self.ADD_PRODUCT({product: {name: "Product "+ i, price: i}});
    }
  },
  USER_IS_ADDING_PRODUCT: function() {
    addingProduct.set(true);
  },
  USER_CANCELED: function() {
    addingProduct.set(false);
  },
  USER_HAS_SEARCHED_PRODUCTS: function(search) {
    searchQuery.set(search);
  }
});

// Initialize
Dependency.add('CatalogStore', CatalogStore);