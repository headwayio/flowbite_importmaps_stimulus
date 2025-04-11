class ProductsController < ApplicationController
  include LazyFrames

  before_action :set_product, only: %i[ show update delete_confirm destroy ]

  # GET /products or /products.json
  def index
    @products = Product.all
  end

  def show
    render_lazy_frames({
      "product_show" => {
        partial: "products/show",
        locals: { product: @product }
      }
    })
  end

  def delete_confirm
    render_lazy_frames({
      "product_delete" => {
        partial: "products/delete_confirm",
        locals: { product: @product }
      }
    })
  end

  # GET /products/1 or /products/1.json
  def form
    if params[:id].present?
      @product = Product.find(params[:id])
      product_form = "edit_product_form"
    else
      @product = Product.new
      product_form = "new_product_form"
    end

    render_lazy_frames({
      product_form => {
        partial: "products/form",
        locals: { product: @product }
      }
    })
  end

  # POST /products or /products.json
  def create
    @product = Product.new(product_params)

    respond_to do |format|
      if @product.save
        format.turbo_stream {
          render turbo_stream: [
            turbo_stream.append("products", partial: "product_row", locals: { product: @product }),
            turbo_stream.hide_modal("createProductModal", clear_form: true),
          ]
        }
      else
        format.turbo_stream {
          render turbo_stream: turbo_stream.update("new_product_form_container", partial: "form", locals: { product: @product })
        }
      end
    end
  end

  # PATCH/PUT /products/1 or /products/1.json
  def update
    respond_to do |format|
      if @product.update(product_params)
        format.turbo_stream {
          turbo_streams = [
            turbo_stream.replace("product-row-#{@product.id}", partial: "product_row", locals: { product: @product }, method: :morph),
            turbo_stream.hide_modal("updateProductModal")
          ]

          render turbo_stream: turbo_streams
        }
      else
        format.turbo_stream {
          render turbo_stream: turbo_stream.update("edit_product_form_container", partial: "form", locals: { product: @product })
        }
      end
    end
  end

  # DELETE /products/1 or /products/1.json
  def destroy
    @product.destroy!

    respond_to do |format|
      format.turbo_stream {
        render turbo_stream: [
          turbo_stream.hide_modal("deleteModal"),
          turbo_stream.remove("product-row-#{@product.id}")
        ]
      }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_product
      @product = Product.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def product_params
      params.expect(product: [ :name, :category, :brand, :description, :price, :release_date ])
    end
end
