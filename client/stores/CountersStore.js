CountersStore = new Store('CountersStore', function() {
  var self = this;

  // Dependencies
  catalogStore = null;
  Dependency.autorun(function () {
    catalogStore = Dependency.get('CatalogStore');
  });
});

CountersStore.helpers({
  // Getters => Helpers
  getNumberOfProducts: function(){
    return Counters.findOne('Catalog') && Counters.findOne('Catalog').count || 0;
  }
});

  // Subscriptions
CountersStore.subscriptions = {
  catalogCounter: function(template){
    template.autorun(function(){
      template.subscribe('CountersStore.CatalogCounter',  catalogStore.getSearchQuery());
    });
  }
};


// Initialize
Dependency.add('CountersStore', CountersStore);
