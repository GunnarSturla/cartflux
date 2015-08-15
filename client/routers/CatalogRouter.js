// Creator
CatalogRouter = function(){
  var self = this;

  // Dependencies
  var mainRouter   = null,
      catalogStore = null;
  Dependency.autorun(function(){
    mainRouter   = Dependency.get('MainRouter');
    catalogStore = Dependency.get('CatalogStore');
  });

  // Reactive Vars
  var productsPerPage = new ReactiveVar(5);
  var actualPage      = new ReactiveVar(1);

  // Callbacks
  self.on = {
    goToPage: function(page){
      actualPage.set(page || 1);
    }
  };

  // Goers
  self.go = {
    firstPage: function(){
      FlowRouter.go( mainRouter.getRoute('catalog') + 1 );
    },
    lastPage: function(){
      var last_page = self.get.numberOfPages();
      FlowRouter.go( mainRouter.getRoute('catalog') + last_page );
    }
  };

  // Issers
  self.is = {
    firstPage: function(){
      return actualPage.get() === 1 ? true : false;
    },
    lastPage: function(){
      return actualPage.get() === self.get.numberOfPages() ? true : false;
    }
  };

  // Getters
  self.get = {
    actualPage: function(){
      return actualPage.get();
    },
    numberOfPages: function(){
      var total_products = Blaze._globalHelpers.getNumberOfProducts();
      var pages          = Math.ceil(total_products/productsPerPage.get());
      return pages;
    },
    productPageUrl: function(page) {
      return mainRouter.getRoute('catalog') + (page || "");
    },
    nextPageUrl: function() {
      if (!self.is.lastPage())
        return mainRouter.getRoute('catalog') + (actualPage.get() + 1);
      return "";
    },
    previousPageUrl: function(){
      if (!self.is.firstPage())
        return mainRouter.getRoute('catalog') + (actualPage.get() - 1);
      return "";
    },
    productsPerPage: function(){
      return productsPerPage.get();
    }
  };

  // Register
  CatalogRouter.tokenId = Dispatcher.register(function(payload){
    switch(payload.actionType){
      case "GO_TO_CATALOG_PAGE":
        var page = parseInt(payload.page);
        self.on.goToPage(page);
        break;
    }
  });


  Meteor.startup(function(){

    // Coherence
    Tracker.autorun(function(){
      var totalPages = self.get.numberOfPages();
      var actualPage = self.get.actualPage();
      if ((totalPages !== 0)&&(actualPage > totalPages)) {
        self.go.lastPage();
      }
    });

    // Subscriptions
    Tracker.autorun(function(){
      var searchQuery     = Blaze._globalHelpers.getSearchQuery();
      var actualPage      = self.get.actualPage();
      var productsPerPage = self.get.productsPerPage();

      Meteor.subscribe('CatalogStore.searchedProducts',
        searchQuery,
        (actualPage + 1) * productsPerPage
      );
    });
  });

  return self;

};

// Initialize
Dependency.add('CatalogRouter', new CatalogRouter());
