document.addEventListener("DOMContentLoaded", function(event) { 
    
    function calculateCheckbox() {
      // get beauty products checkboxes contianer's reference
      var el = document.getElementById('availableLanguages');

      // get beauty product input element refrence in beautyProducts container
      var products = el.getElementsByTagName('input');

      // get products length
      var len = products.length;

      // call updateCost() function to onclick event on every checkbox
      for (var i = 0; i < len; i++) {
        if (products[i].type === 'checkbox') {
          products[i].onclick = updateCost;
        }
      }

    }

    // called onclick of  beauty products checkboxes
    function updateCost(e) {

      // 'this' reffered to checkbox clicked on
      var myForm = this.form;

      // include current value in total-cost block, use parseFloat method to convert string to number
      var val = parseFloat(myForm.elements['total-cost'].value);

      // Add the checkbox value to total value if checkbox is checked
      if (this.checked) {
        val += parseFloat(this.value);
      } 
      else {
        val -= parseFloat(this.value);
      }

      // update total-cost value with latest value
      myForm.elements['total-cost'].value = val
    }

    // call calculateCheckbox method
    calculateCheckbox();

    var stripe = Stripe('pk_test_UVlQdGGVZ4cEAokelDZAXFPh00cETZqxCS');
    var checkoutButton = document.getElementById('checkout-button');
    
    function getSelectedChbox() {

      var el = document.getElementById('availableLanguages');
      var selchbox = [];// array that will store the value of selected checkboxes
      // gets all the input tags in frm, and their number
      var inpfields = el.getElementsByTagName('input');
      var nr_inpfields = inpfields.length;
      // traverse the inpfields elements, and adds the value of selected (checked) checkbox in selchbox
      for(var i=0; i<nr_inpfields; i++) {
        if(inpfields[i].type == 'checkbox' && inpfields[i].checked == true) selchbox.push(inpfields[i].name);
      }
      return selchbox;
    }  
    function test(){

       return realurl;
    }
    checkoutButton.addEventListener('click', function() {

      var checkedBoxes = getSelectedChbox();

      var realurl = websiteis.replace(/ .*/,'');
      // Create a new Checkout Session using the server-side endpoint you
      // created in step 3.
      fetch('/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({bought: checkedBoxes, website: realurl}),
        headers: {
        'Content-Type': 'application/json'
      }
        
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(session) {
        return stripe.redirectToCheckout({ sessionId: session.id });
      })
      .then(function(result) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, you should display the localized error message to your
        // customer using `error.message`.
        if (result.error) {
          alert(result.error.message);
        }
      })
      .catch(function(error) {
        console.error('Error:', error);
      });
    });
  });