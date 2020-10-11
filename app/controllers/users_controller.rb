class UsersController < ApplicationController
  before_action :authenticate_user!
  def info
    @subscription = current_user.subscription
  end

  def charge
    # Create a new customer object
    customer = Stripe::Customer.create(email: current_user.email)
  
    # Recommendation: save the customer.id in your database.
    current_user.subscription.stripe_user_id = customer.id
    current_user.subscription.save

    # Create the subscription
    content_type 'application/json'
    data = JSON.parse request.body.read
  
    begin
      Stripe::PaymentMethod.attach(
        data['paymentMethodId'],
        { customer: current_user.subscription.stripe_user_id }
      )
    rescue Stripe::CardError => e
      halt 200,
           { 'Content-Type' => 'application/json' },
           { 'error': { message: e.error.message } }.to_json
    end
  
    # Set the default payment method on the customer
    Stripe::Customer.update(
      current_user.subscription.stripe_user_id,
      invoice_settings: { default_payment_method: data['paymentMethodId'] }
    )
  
    # Create the subscription
    subscription =
      Stripe::Subscription.create(
        customer: current_user.subscription.stripe_user_id,
        items: [{ price: 'price_HGd7M3DV3IMXkC' }],
        expand: %w[latest_invoice.payment_intent]
      )

    current_user.subscription.active = true
    current_user.subscription.save
  
    redirect_to users_info_path
  end
end
