// Dependencies
var catalogStore, cartStore;
Dependency.autorun(function(){
  catalogStore = Dependency.get('CatalogStore');
  cartStore    = Dependency.get('CartStore');
});

// CartView helpers
Template.CartView.helpers({
  total_item_price: function(){
    var unit_price = this.price;
    return Template.parentData().quantity * unit_price;
  },
  total_cart_price: function(){
    var total = 0;
    cartStore.getItems().forEach(function(cart_item){
      var unit_price = catalogStore.getOneProduct(cart_item.product_id).price;
      total = total + unit_price * cart_item.quantity;
    });
    return total;
  }
});

// CartView events
Template.CartView.events({
  'click .increase': function(){
    Dispatcher.dispatch({ actionType: "INCREASE_CART_ITEM", item: this });
  },
  'click .decrease': function(){
    Dispatcher.dispatch({ actionType: "DECREASE_CART_ITEM", item: this });
  },
  'click .remove': function(){
    Dispatcher.dispatch({ actionType: "REMOVE_CART_ITEM", item: this });
  }
});

// CartView subscriptions
Template.CartView.onCreated(function () {
  var self = this;
  self.autorun(function(){
    self.subscribe("CatalogStore.productsInCart", cartStore.getProductsInCart());
    self.subscribe("CartStore.userCart", cartStore.getCartId());
  });
});
