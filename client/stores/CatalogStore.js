// Creator
CatalogStore = new Store('CatalogStore', function() {
  var self = this;

  // Reactive Vars
  self._addingProduct = new ReactiveVar(false);
  self._searchQuery   = new ReactiveVar("");

  // Dependencies
  Dependency.autorun(function () {
    catalogRouter = Dependency.get('CatalogRouter');
    countersStore = Dependency.get('CountersStore');
  });
});


CatalogStore.helpers({
  getSearchedProducts: function() {
    var regexp = new RegExp(CatalogStore._searchQuery.get(), 'i');
    return Catalog.find(
        { name: regexp },
        { sort: { date: 1 },
          limit: catalogRouter.get.productsPerPage() });
  },
  getSearchQuery: function () {
    return this._searchQuery.get();
  },
  getOneProduct: function (id) {
    return Catalog.findOne(id);
  },
  getUserIsAddingProduct: function () {
    return this._addingProduct.get();
  },
  getNumberOfProducts: function () {
    return countersStore.getNumberOfProducts();
  },
  getProductsInPage: function () {
    var actualPage      = catalogRouter.get.actualPage();
    var productsPerPage = catalogRouter.get.productsPerPage();
    var regexp          = new RegExp(CatalogStore._searchQuery.get(), 'i');

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
    //return self.getProductsInPage().count() !== 0;
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
    CatalogStore._addingProduct.set(error);
  },
  REMOVE_PRODUCT: function(payload) {
    Meteor.call('CatalogStore.removeProduct', payload.product._id);
  },
  ADD_ANOTHER_PRODUCT: function() {
    var self = this;
    var number = CatalogStore.getNumberOfProducts() + 1;
    self._actions.ADD_PRODUCT({product: {name: "Product "+ number, price: number}});
  },
  ADD_ANOTHER_10_PRODUCTS: function() {
    var self = this;
    var number = CatalogStore.getNumberOfProducts() + 1;
    for (var i = number; i < (number + 10); i++) {
      self._actions.ADD_PRODUCT({product: {name: "Product "+ i, price: i}});
    }
  },
  USER_IS_ADDING_PRODUCT: function() {
    CatalogStore._addingProduct.set(true);
  },
  USER_CANCELED: function() {
    CatalogStore._addingProduct.set(false);
  },
  USER_HAS_SEARCHED_PRODUCTS: function(payload) {
    CatalogStore._searchQuery.set(payload.search);
  }
});

// Initialize
Dependency.add('CatalogStore', CatalogStore);