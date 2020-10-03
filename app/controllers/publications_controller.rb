class PublicationsController < ApplicationController
  def index
    @publications = Publication.all
  end

  def show
      @publication = Publication.find(params[:id])
  end
end
