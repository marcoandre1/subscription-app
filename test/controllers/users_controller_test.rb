require 'test_helper'

class UsersControllerTest < ActionDispatch::IntegrationTest
  test "should get info" do
    get users_info_url
    assert_response :success
  end

end
