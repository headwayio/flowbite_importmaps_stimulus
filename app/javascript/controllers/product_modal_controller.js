import { Controller } from "@hotwired/stimulus"

// This controller handles passing product IDs to the update modal
export default class extends Controller {
  static values = {
    productPath: String,
    action: String,
  }

  connect() {
    // Listen for click events on each _product_row partial's buttons: show, edit, destroy
    this.element.addEventListener('click', this.handleModalWillOpen.bind(this))
  }

  disconnect() {
    this.element.removeEventListener('click', this.handleModalWillOpen.bind(this))
  }

  handleModalWillOpen(event) {
    console.log("actionValue", this.actionValue)

    let modalId;
    switch (this.actionValue) {
      case 'show':
        modalId = 'readProductModal'; break;
      case 'edit':
        modalId = 'updateProductModal'; break;
      case 'destroy':
        modalId = 'deleteModal'; break;
    }

    // based on the actionValue, find the correct modalId to act on
    this.updateLazyFrameUrl(document.getElementById(modalId))
  }

  updateLazyFrameUrl(modalElement) {
    if (!modalElement) return

    // Find the LazyFrameComponent within the modal
    const lazyFrame = modalElement.querySelector('[data-controller="lazy-frame"]')
    if (!lazyFrame) {
      // console.error('LazyFrame component not found in modal')
      return
    }

    console.log('LazyFrame component found:', lazyFrame)
    console.log('updating URL:', this.productPathValue)

    // Update the LazyFrameComponent's URL param before it fetches the content using load_on: "visible"
    lazyFrame.dataset.lazyFrameUrlValue = this.productPathValue
  }
}