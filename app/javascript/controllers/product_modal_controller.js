import { Controller } from "@hotwired/stimulus"
import getTargetElementOfOutlet from "controllers/mixins/get_target_element_of_outlet"

// This controller handles passing product IDs to the update modal
export default class extends Controller {
  static values = {
    productPath: String,
  }

  connect() {
    // Listen for click events on each _product_row partial's buttons: show, edit, destroy
    this.element.addEventListener('click', this.handleModalWillOpen.bind(this))
  }

  disconnect() {
    this.element.removeEventListener('click', this.handleModalWillOpen.bind(this))
  }

  handleModalWillOpen(_event) {
    const modalElement = getTargetElementOfOutlet(this);

    // Find the LazyFrameComponent within the modal
    const lazyFrame = modalElement.querySelector('[data-controller="lazy-frame"]');
    if (!lazyFrame) {
      console.error('LazyFrame component not found in modal');
      return;
    }

    // Dispatch a custom event to trigger a reload
    const lazyFrameEvent = new CustomEvent('lazy-frame:request-reload', {
      bubbles: true,
      detail: { url: this.productPathValue }
    });

    lazyFrame.dispatchEvent(lazyFrameEvent);
  }
}