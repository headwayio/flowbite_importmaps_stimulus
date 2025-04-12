import { default as TriggerController } from 'controllers/flowbite/trigger_controller'
import Modal from 'flowbite/components/modal'

export default class extends TriggerController {
  #previousFocus = null

  static outlets = ['flowbite--modal-target']
  static values = {
    backdrop: { type: String, default: 'dynamic' }, // 'dynamic' or 'static' - dynamic allows the modal to be closed by clicking the backdrop, while static does not
    backdropClasses: { type: String, default: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40' },
    closable: { type: Boolean, default: true },
    placement: { type: String, default: 'top-center' }, // {top|center|bottom}-{left|center|right} (eg. top-left or bottom-right).
    action: { type: String, default: 'toggle' }, // 'toggle', 'show', 'hide'
    // TODO: we may want to make this the default. When would you ever want to keep the parent modal open when opening another from within it?
    closeParent: { type: Boolean, default: false } // If true, the modal will be closed when the trigger is clicked. Only used when opening another modal from the current modal, essentially
  }

  connect() {
    console.log("flowbite-modal-trigger connected")
    this.onClick = this.click.bind(this)
    this.element.addEventListener('click', this.onClick)
    super.connect()
  }

  disconnect() {
    this.element.removeEventListener('click', this.onClick)
    super.disconnect()
  }

  flowbiteModalTargetOutletConnected(outlet, element) {
    this.targetElement = element
    // console.log("flowbite-modal-target outlet connected", this.targetElement)
  }

  flowbiteModalTargetOutletDisconnected(outlet, element) {
    this.targetElement = null
    // console.log("flowbite-modal-target outlet disconnected")
  }

  #handleToggle(event) {
    // console.log('Modal toggle event received', event)
    if (this.targetController.instance.isVisible()) {
      this.#handleHide(event)
    } else {
      this.#handleShow(event)
    }
  }

  #handleShow(event) {
    // Store the element that had focus before the modal opened
    this.#previousFocus = document.activeElement

    // Add a small delay to ensure the DOM is ready before attempting to focus
    setTimeout(() => {
      // Safety check to make sure targetElement exists before trying to focus
      if (!this.targetElement) {
        console.warn('Target element not available for focus management');
        return;
      }

      // First focus attempt with immediate content
      this.#attemptFocus();

      // Set up observer for dynamically loaded content
      const observer = new MutationObserver((mutations) => {
        // Check if our mutations include any added nodes that might have autofocus
        const shouldAttemptFocus = mutations.some(mutation =>
          mutation.addedNodes.length > 0 ||
          mutation.type === 'attributes' && mutation.attributeName === 'autofocus'
        );

        if (shouldAttemptFocus) {
          this.#attemptFocus();
        }
      });

      // Watch for DOM changes inside the modal
      observer.observe(this.targetElement, {
        childList: true,    // Watch for added/removed nodes
        subtree: true,      // Watch the entire subtree
        attributes: true,   // Watch for attribute changes
        attributeFilter: ['autofocus'] // Only care about autofocus attribute
      });

      // Disconnect after a reasonable time to avoid memory leaks
      setTimeout(() => observer.disconnect(), 5000);
    }, 50); // Small delay to ensure modal is fully rendered
  }

  #attemptFocus() {
    // Safety check to prevent errors if target element isn't available
    if (!this.targetElement) {
      console.warn('Cannot focus elements: modal target is null');
      return false;
    }

    // Focus the autofocus element or first focusable element
    const autofocusField = this.targetElement.querySelector('[autofocus]')
    if (autofocusField) {
      autofocusField.focus()
      return true;
    } else {
      const focusable = this.targetElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length > 0) {
        console.log('No autofocus field found, focusing first focusable element:', focusable[0])
        focusable[0].focus()
        return true;
      }
    }
    return false;
  }

  #handleHide(event) {
    // Return focus to the element that was focused before the modal opened
    if (this.#previousFocus && typeof this.#previousFocus.focus === 'function') {
      // Make sure the previously focused element is still in the DOM
      if (document.body.contains(this.#previousFocus)) {
        // Use a timeout to ensure DOM updates are complete
        setTimeout(() => {
          this.#previousFocus.focus();
        }, 10);
      }
    }
  }

  createInstance() {
    // Skip creation if the target element doesn't exist
    if (!this.targetElement) return null;

    // Use the registry to create or retrieve an instance
    this.instance = this.createInstanceBase(
      this.targetElement.id,
      () => {
        const options = {
          backdrop: this.backdropValue,
          backdropClasses: this.backdropClassesValue,
          closable: this.closableValue,
          placement: this.placementValue,
          onHide: () => {
            this.#handleHide();
            // Dispatch the hide event so other controllers can listen for it
            this.dispatchInstanceEvent('hide');
          },
          onShow: () => {
            this.#handleShow();
            // Dispatch the show event so other controllers can listen for it
            this.dispatchInstanceEvent('show');
          },
          onToggle: () => {
            this.#handleToggle();
            // Dispatch the toggle event so other controllers can listen for it
            this.dispatchInstanceEvent('toggle');
          }
        }

        const instanceOptions = {
          id: this.targetElement.id,
          override: true
        };

        return new Modal(this.targetElement, options, instanceOptions);
      }
    );

    return this.instance;
  }

  click(e) {
    // console.log("flowbite-modal-trigger click", e)
    // console.log("flowbite-modal-trigger actionValue", this.actionValue)

    if (this.closeParentValue) {
      const parentModal = this.element.closest('[data-controller~="flowbite--modal-target"]');
      if (parentModal) {
        const parentModalId = parentModal.id;
        const parentInstance = window.ComponentRegistry.getInstance(parentModalId);
        if (parentInstance) {
          // set focus to target element before hiding to prevent focus
          // retention in current modal (would cause aria violation)
          this.element.focus();
          parentInstance.hide();
        }
      }
    }

    switch (this.actionValue) {
      case 'toggle':
        this.instance.toggle()
        break
      case 'show':
        this.instance.show()
        break
      case 'hide':
        this.instance.hide()
        break
    }
  }
}
