// Creates a new Vue instance for global communication called eventBus
var eventBus = new Vue()

// Creates a new component for the product
Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
      <div class="product">
        <div class="product-image">
          <img v-bind:src="image" v-bind:alt="altText"/>
        </div>
  
        <div class="product-info">
          <h2>{{ printTitle }}</h2>
          <p>{{ printVariantPrice }} Gold</P>
          <p>{{ sale }}</p>
          <a v-if="inStock === 0" :href="link" target="_blank" >Out of Stock! Click For More!</a>
          <p v-else-if="inventory > 10">In Stock</p>
          <p v-else-if="inventory <= 10 && inventory > 0">Almost Out!</p>
          <p>Premium Status: {{ premium }}</p>
          <p>Shipping: {{ shipping }}</p>

          <p>{{ rarity }}</p>
          <p>{{ effect }}</p>
          <p>{{ description }}</p>
  
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
  
          <div v-for="(variant, index) in variants" 
            :key="variant.variantId"
            class="color-box"
            :style="{ backgroundColor: variant.variantColour }"
            @mouseover="updateProduct(index)"
          ></div>

          <div class="button-container">
          <!-- Disable the button if the product is out of stock or the cart is full -->
          <button v-on:click="addToCart" :disabled="!inStock || isCartFull" :class="{ disabledButton: !inStock || isCartFull }">Add to Cart</button>
          <button @click="removeFromCart">Remove from Cart</button>
          </div>

          <product-tabs :reviews="reviews" ></product-tabs>



        </div>
      </div>
    `,
    data() {
        return {
            product: 'Potion of Healing',
            brand: 'Extra Life®',
            onSale: true,
            selectedVariant: 0,
            rarity: 'Rarity: Common',
            effect: 'Effect: Gain 2d4 + 2 Hitpoints',
            description: 'The potion’s viscous liquid glimmers when agitated.',
            details: ["Goodberry Infused", "30% Troll Blood", "Cleric Approved"],
            link: 'https://www.dndbeyond.com/magic-items/4708-potion-of-healing',
          
            // List of all Product Variants which can be cycled through
            variants: [
              {
                variantId: 2234,
                variantPrice: 40, 
                variantColour: 'Red',
                variantImage: './assets/potstrawberry.png',
                variantQuantity: 5
              },
              {
                variantId: 2235,
                variantPrice: 35, 
                variantColour: 'Yellow',
                variantImage: './assets/potlemon.png',
                variantQuantity: 5 
              },
              {
                variantId: 2236,
                variantPrice: 30, 
                variantColour: 'Orange',
                variantImage: './assets/potorange.png',
                variantQuantity: 5 
              },
              {
                variantId: 2237,
                variantPrice: 100, 
                variantColour: 'Purple',
                variantImage: './assets/potgrape.png',
                variantQuantity: 0 
              }
            ],
            reviews: []
        }
      },
        // Stores the Methods used in this JS
        methods: {
            // Adds product to Cart
            addToCart: function () {
                const selectedVariant = this.variants[this.selectedVariant];
                this.$emit('add-to-cart', {
                    variantId: selectedVariant.variantId,
                    product: this.product,
                    color: selectedVariant.variantColour,
                    price: selectedVariant.variantPrice
                });
            },
            // Removes product from Cart
            removeFromCart: function () {
                const selectedVariant = this.variants[this.selectedVariant];
                this.$emit('remove-from-cart', {
                    variantId: selectedVariant.variantId,
                    product: this.product,
                    color: selectedVariant.variantColour,
                    price: selectedVariant.variantPrice
                });
            },
            // Updates Variant Image
            updateProduct: function (index) {
                this.selectedVariant = index;
            },
            // Method to count all variant quantities as inventory
            calculateTotalInventory() {
                this.inventory = this.variants.reduce((total, variant) => total + variant.variantQuantity, 0);
            },
            // Method to make items go on sale if too much inventory
            checkOnSale() {
                if (this.inventory > 50) {
                    this.onSale = true;
                } else {
                    this.onSale = false;
                }
            },
        },
      computed: {
        // Computed property to check if the product is in stock  
        inStock() {
          return this.inventory > 0,
          this.variants[this.selectedVariant].variantQuantity
        },
        // Computed property to check if the cart is greater than or equal to the inventory
        isCartFull() {
          return this.cart >= this.inventory;
        },
        // Computed property to display brand + product
        printTitle() {
          return this.brand + ' ' + this.product;
        },
        // Computed property to display colour + price
        printVariantPrice() {
            const selectedVariant = this.variants[this.selectedVariant];
            return `${selectedVariant.variantColour} - ${selectedVariant.variantPrice}`;
          },
        // Computed property to get the image of the selected variant
        image() {
          return this.variants[this.selectedVariant].variantImage;
        },
        // Computed property to print on sale status
        sale() {
          if (this.onSale) {
            return this.brand + ' ' + this.product + ' are on sale!';
          }
          return this.brand + ' ' + this.product + ' are not on sale';
        },
        //Computed propertry to hadle shipping
        shipping() {
            if (this.premium) {
                return "Free Shipping for Premium Potion Seller Members!"
            }
            return "2gp Shipping"
        },
      },
      // Lifecycle hook to calculate total inventory when the component is created
      created() {
        this.calculateTotalInventory();
        this.checkOnSale();
      },
      // Lifecycle hook for eventBus
      mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
      }
  });

// Vue component for product-details
Vue.component('product-details', {
    props: {
      details: {
        type: Array,
        required: true
      }
    },
    template: `
      <ul>
        <li v-for="detail in details">{{ detail }}</li>
      </ul>
    `
  });

// Vue component for product-review
Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

    <p v-if="errors.length">
         <b>Please correct the following error(s):</b>
        <ul>
            <li v-for="error in errors">{{ error }}</li>
        </ul>
    </p>
            
      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>
      
      <p>
        <label for="review">Review:</label>      
        <textarea id="review" v-model="review"></textarea>
      </p>
      
      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>
          
      <p>
        <input type="submit" value="Submit">  
      </p>    
    
    </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if(this.name && this.review && this.rating) {
              let productReview = {
                name: this.name,
                review: this.review,
                rating: this.rating
              }
              eventBus.$emit('review-submitted', productReview); // Corrected reference to eventBus
              this.name = null
              this.review = null
              this.rating = null
            } else {
              if(!this.name) this.errors.push("Name required.")
              if(!this.review) this.errors.push("Review required.")
              if(!this.rating) this.errors.push("Rating required.")
            }
          }
    }
});


// Creates the Tabs component
Vue.component('product-tabs', {
    props: {
      reviews: {
        type: Array,
        required: true
      }
    },
    template: `
      <div>
        <div>
          <span
            class="tab"
            :class="{ activeTab: selectedTab === tab }"
            v-for="(tab, index) in tabs"
            :key="index"
            @click="selectedTab = tab"
          >{{ tab }}</span>
        </div>
  
        <div v-show="selectedTab === 'Reviews'">
          <h2>Reviews</h2>
          <p v-if="!reviews.length">There are no reviews yet.</p>
          <ul>
            <li v-for="review in reviews">
              <p>{{ review.name }}</p>
              <p>Rating: {{ review.rating }}</p>
              <p>{{ review.review }}</p>
            </li>
          </ul>
        </div>
  
        <product-review v-show="selectedTab === 'Make a Review'"></product-review>
      </div>
    `,
    data() {
      return {
        tabs: ['Reviews', 'Make a Review'],
        selectedTab: 'Reviews'
      };
    },
    methods: {
      addReview(productReview) {
        this.$emit('review-submitted', productReview);
      }
    }
  });

  Vue.component('cart-content', {
    props: {
      items: {
        type: Array,
        required: true
      }
    },
    template: `
  <div class="cart-content">

    <table v-if="items.length">
        <thead >
          <tr>
            <th>Num.</th>
            <th>Item</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items">
            <td>{{index + 1}}.</td>
            <td>{{item.product}} – {{item.color}}</td>
            <td>$ {{item.price}}</td>
          </tr>
        </tbody>
      </table>
  </div>
  
  </div>
`
})

// Creates a the Main Vue Instance called app
var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
        showCart: false
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        removeFromCart() {
            if (this.cart.length > 0) {
                this.cart.pop();
            }
        },
        toggleCart() {
            this.showCart = !this.showCart;
        }
    }
});

