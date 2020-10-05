class Admin::PublicationsController < AdminController
  before_action :find_publication, only: [:show, :edit, :update, :destroy]

  def index
    @publications = Publication.all
  end

  def show; end

  def new
    @publication = Publication.new
  end

  def create
    @publication = Publication.new(publication_params)

    if @publication.save
      redirect_to admin_publication_path(@publication)
    else
      render :new, alert: "Something went wrong."
    end
  end

  def edit; end

  def update
    if @publication.update(publication_params)
      redirect_to admin_publication_path(@publication)
    else
      render :edit, alert: "Something went wrong."
    end
  end

  def destroy
    @publication.destroy
    redirect_to admin_publications_path, alert: "Succesfully deleted publication."
  end

  private
  def find_publication
    @publication = Publication.find(params[:id])
  end

  def publication_params
    params.require(:publication).permit(:title, :description, :file_url)
  end
end
  