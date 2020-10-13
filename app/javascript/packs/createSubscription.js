let stripe, customer, price, card;

// ---------------------
// 1. Publishable key
// ---------------------
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
stripe = Stripe('pk_test_51HZ7c6LsjNADwB6O3XzS8dxmdtNi7aR5W2Z6GiVM6FJtSdQKbhakDzLB88JLs0bI0S4p7QThxj4Yyx9LvncTv3J100OQ05Bg4I');
let elements = stripe.elements();

// ---------------------
// 2. Stripe Elements
// ---------------------
// Set up Stripe.js and Elements to use in checkout form
let style = {
  base: {
    color: "#32325d",
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: "antialiased",
    fontSize: "16px",
    "::placeholder": {
      color: "#aab7c4"
    }
  },
  invalid: {
    color: "#fa755a",
    iconColor: "#fa755a"
  }
};

card = elements.create('card', { style: style });
card.mount('#card-element');

// ---------------------
// 3. Validation
// ---------------------
card.on('change', (event) => {
  showCardError(event);
});

function showCardError(event) {
  let displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
}

// ---------------------------------------------------
// 4. Save payment details and create the subscription
// ----------------------------------------------------
let subscriptionForm = document.getElementById('subscription-form');

subscriptionForm.addEventListener('submit', function (ev) {
  ev.preventDefault();

  // If a previous payment was attempted, get the latest invoice
  const latestInvoicePaymentIntentStatus = localStorage.getItem(
    'latestInvoicePaymentIntentStatus'
  );

  if (latestInvoicePaymentIntentStatus === 'requires_payment_method') {
    const invoiceId = localStorage.getItem('latestInvoiceId');
    const isPaymentRetry = true;
    // create new payment method & retry payment on invoice with new payment method
    createPaymentMethod({
      card,
      isPaymentRetry,
      invoiceId,
    });
  } else {
    // create new payment method & create subscription
    createPaymentMethod({ card });
  }
});

function createPaymentMethod({ card, isPaymentRetry, invoiceId }) {
  // Set up payment method for recurring usage
  let billingName = document.getElementById('name').value;

  stripe
    .createPaymentMethod({
      type: 'card',
      card: card,
      billing_details: {
        name: billingName,
      },
    })
    .then((result) => {
      if (result.error) {
        displayError(result);
      } else {
        if (isPaymentRetry) {
          // Update the payment method and retry invoice payment
          retryInvoiceWithNewPaymentMethod({
            paymentMethodId: result.paymentMethod.id,
            invoiceId: invoiceId
          });
        } else {
          // Create the subscription
          createSubscription({
            paymentMethodId: result.paymentMethod.id
          });
        }
      }
    });
}

// ----------------------------------------------
// 5. Define the CreateSubscription function
// ----------------------------------------------
function createSubscription({ paymentMethodId }) {
  return (
    fetch('charge', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId: paymentMethodId,
      }),
    })
      .then((response) => {
        return response.json();
      })
      // If the card is declined, display an error to the user.
      .then((result) => {
        if (result.error) {
          // The card had an error when trying to attach it to a customer.
          throw result;
        }
        return result;
      })
      // Normalize the result to contain the object returned by Stripe.
      // Add the additional details we need.
      .then((result) => {
        return {
          paymentMethodId: paymentMethodId,
          subscription: result,
        };
      })
      // Some payment methods require a customer to be on session
      // to complete the payment process. Check the status of the
      // payment intent to handle these actions.
      .then(handlePaymentThatRequiresCustomerAction)
      // If attaching this card to a Customer object succeeds,
      // but attempts to charge the customer fail, you
      // get a requires_payment_method error.
      .then(handleRequiresPaymentMethod)
      // No more actions required. Provision your service for the user.
      .then(onSubscriptionComplete)
      .catch((error) => {
        // An error has happened. Display the failure to the user here.
        // We utilize the HTML element we created.
        showCardError(error);
      })
  );
}

// ----------------------------------------------
// 6. Provision access to your service
// ----------------------------------------------
function onSubscriptionComplete(result) {
  // Payment was successful.
  if (result.subscription.status === 'active') {
    // Change your UI to show a success message to your customer.
    // Call your backend to grant access to your service based on
    // `result.subscription.items.data[0].price.product` the customer subscribed to.
    window.location.href = 'info';
  }
}

// ----------------------------------------------
// 7.
// ----------------------------------------------
function handlePaymentThatRequiresCustomerAction({
  subscription,
  invoice,
  priceId,
  paymentMethodId,
  isRetry,
}) {
  if (subscription && subscription.status === 'active') {
    // Subscription is active, no customer actions required.
    return { subscription, priceId, paymentMethodId };
  }

  // If it's a first payment attempt, the payment intent is on the subscription latest invoice.
  // If it's a retry, the payment intent will be on the invoice itself.
  let paymentIntent = invoice ? invoice.payment_intent : subscription.latest_invoice.payment_intent;

  if (
    paymentIntent.status === 'requires_action' ||
    (isRetry === true && paymentIntent.status === 'requires_payment_method')
  ) {
    return stripe
      .confirmCardPayment(paymentIntent.client_secret, {
        payment_method: paymentMethodId,
      })
      .then((result) => {
        if (result.error) {
          // Start code flow to handle updating the payment details.
          // Display error message in your UI.
          // The card was declined (i.e. insufficient funds, card has expired, etc).
          throw result;
        } else {
          if (result.paymentIntent.status === 'succeeded') {
            // Show a success message to your customer.
            // There's a risk of the customer closing the window before the callback.
            // We recommend setting up webhook endpoints later in this guide.
            return {
              priceId: priceId,
              subscription: subscription,
              invoice: invoice,
              paymentMethodId: paymentMethodId,
            };
          }
        }
      })
      .catch((error) => {
        displayError(error);
      });
  } else {
    // No customer action needed.
    return { subscription, priceId, paymentMethodId };
  }
}

// ------------------------------------------
// 8. 
// ------------------------------------------
function handleRequiresPaymentMethod({
  subscription,
  paymentMethodId,
  priceId,
}) {
  if (subscription.status === 'active') {
    // subscription is active, no customer actions required.
    return { subscription, priceId, paymentMethodId };
  } else if (
    subscription.latest_invoice.payment_intent.status ===
    'requires_payment_method'
  ) {
    // Using localStorage to manage the state of the retry here,
    // feel free to replace with what you prefer.
    // Store the latest invoice ID and status.
    localStorage.setItem('latestInvoiceId', subscription.latest_invoice.id);
    localStorage.setItem(
      'latestInvoicePaymentIntentStatus',
      subscription.latest_invoice.payment_intent.status
    );
    throw { error: { message: 'Your card was declined.' } };
  } else {
    return { subscription, priceId, paymentMethodId };
  }
}

