import { Controller } from "@hotwired/stimulus"
import getTargetElementOfOutlet from "controllers/mixins/get_target_element_of_outlet"

// Generic controller for handling any resource in modals
export default class extends Controller {
  static values = {
    path: String,
  }

  connect() {
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
      detail: { url: this.pathValue }
    });

    lazyFrame.dispatchEvent(lazyFrameEvent);
  }
}