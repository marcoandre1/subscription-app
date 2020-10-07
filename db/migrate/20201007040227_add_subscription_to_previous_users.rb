class AddSubscriptionToPreviousUsers < ActiveRecord::Migration[6.0]
  def up
    User.all.each do |user|
      user.create_subscription
    end
  end
end
