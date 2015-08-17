// REACTIVE SINGLETONS.
// They need to be outside because Meteor throws a duplicate error if you
// create a second CartStore object (for example, in testing).
var reactive = new ReactiveDict('CartStore');


CartStore = new Store('CartStore', function () {
  var self = this;

  // REACTIVE VARS
  reactive.setDefault('cartId', Meteor.userId() || Random.id());
});

CartStore.actions({
  // CALLBACKS
  // Take a product id and add that product to the cart. If the product is
  // already in the cart, it calls a method to increase the quantity.
  ADD_CART_ITEM: function (payload) {
    var self = this;
    var cart_id = reactive.get("cartId");
    var product_id = payload.item._id;
    var cart_item = Cart.findOne({product_id: product_id, cart_id: cart_id});
    if (!cart_item) {
      // The cart item doesn't exist, so we are going to add it
      Meteor.call('CartStore.addCartItem', product_id, reactive.get('cartId'));
    } else {
      // The cart item exists, so we are going to increase it
      self._actions.INCREASE_CART_ITEM(payload);
    }
  },

  // Take a cart item id and increase its quantity by one
  INCREASE_CART_ITEM: function (payload) {
    Meteor.call('CartStore.increaseCartItem', payload.item._id);
  },

  // Take a cart item id and decrease its quantity by one
  DECREASE_CART_ITEM: function (payload) {
    var self = this;
    var id = payload.item._id;
    var cart_item = Cart.findOne(id);

    if (cart_item.quantity === 1) {
      self._actions.REMOVE_CART_ITEM(payload);
    } else {
      Meteor.call('CartStore.decreaseCartItem', id);
    }
  },

  // Take a cart item id and remove it from the cart
  REMOVE_CART_ITEM: function (payload) {
    Meteor.call('CartStore.removeCartItem', payload.item._id);
  },

  // Take a product id which has been removed and remove that cart item
  // from the cart.
  REMOVE_PRODUCT: function (payload) {
    Meteor.call('CartStore.removeProduct', payload.product._id);
  },

  // When the user logs in, we change all the cartId values of the cart
  // items, from the initial random id generated for the anonymous user to
  // the id of the current user.
  LOGIN_SUCCEED: function () {
    Meteor.call('CartStore.updateAllCartIds', self.getCartId());
    // Then, update our cartId to the userId
    reactive.set("cartId", Meteor.userId());
  },
  CREATE_ACCOUNT_SUCCEED: function () {
    this._actions.LOGIN_SUCCEED();
  }
});

CartStore.helpers({
  // GETTERS => HELPERS
  // Return all the cart items with the cartId of the user.
  getItems: function () {
    var self = this;
    return Cart.find({cart_id: self.getCartId()});
  },

  // Return the items of cart. This is used to suscribe to those products
  // so their info is in the minimongo.
  getProductsInCart: function () {
    var self = this;
    return self.getItems().fetch();
  },

  // Return the cartId. This is a random Id if the user is not logged in
  // and the user id if the user is logged in.
  getCartId: function () {
    return reactive.get("cartId");
  }
});


// Initialize
Dependency.add('CartStore', CartStore);