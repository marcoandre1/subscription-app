class UsersController < ApplicationController
  protect_from_forgery except: [:charge]
  before_action :authenticate_user!
  def info
    @subscription = current_user.subscription
  end

  def charge
    paymentMethodId = params["paymentMethodId"]

    # Create a new customer object
    customer = Stripe::Customer.create(email: current_user.email)

    # Create the subscription
    begin
      Stripe::PaymentMethod.attach(
        paymentMethodId,
        { customer: customer.id }
      )
    rescue Stripe::CardError => e
      halt 200,
           { 'Content-Type' => 'application/json' },
           { 'error': { message: e.error.message } }.to_json
    end
  
    # Set the default payment method on the customer
    Stripe::Customer.update(
      customer.id,
      invoice_settings: { default_payment_method: paymentMethodId }
    )
  
    # Create the subscription
    subscription =
      Stripe::Subscription.create(
        customer: customer.id,
        items: [{ price: 'price_1HZ7mCLsjNADwB6O9M8bQoMT' }],
        expand: %w[latest_invoice.payment_intent]
      )

    # Recommendation: save the customer.id in your database.
    current_user.subscription.stripe_user_id = customer.id
    current_user.subscription.active = true
    current_user.subscription.save
    
    redirect_to users_info_path
  end
end
