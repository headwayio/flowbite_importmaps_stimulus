import { default as TriggerController } from 'controllers/flowbite/trigger_controller'
import Dropdown from 'flowbite/components/dropdown'

export default class extends TriggerController {

  static outlets = ['flowbite--dropdown-target']
  static values = {
    placement: { type: String, default: 'bottom' },
    triggerType: { type: String, default: 'click' },
    offsetSkidding: { type: Number, default: 0 },
    offsetDistance: { type: Number, default: 10 },
    delay: { type: Number, default: 300 },
    ignoreClickOutsideClass: { type: Boolean, default: false },
  }

  connect() {
    super.connect()
  }

  disconnect() {
    if (this.targetElement) {
      const menuItems = this.targetElement.querySelectorAll('a, button');
      menuItems.forEach(item => {
        if (item._dropdownHideHandler) {
          item.removeEventListener('click', item._dropdownHideHandler);
        }
      });
    }

    super.disconnect()
  }

  flowbiteDropdownTargetOutletConnected(outlet, element) {
    this.targetElement = element
  }

  flowbiteDropdownTargetOutletDisconnected(outlet, element) {
    this.targetElement = null
  }

  createInstance() {
    // Skip creation if the target element doesn't exist
    if (!this.targetElement) return null;

    // Use the registry to create or retrieve an instance
    this.instance = this.createInstanceBase(
      this.targetElement.id,
      'dropdown',
      () => {
        const options = {
          placement: this.placementValue,
          triggerType: this.triggerTypeValue,
          offsetSkidding: this.offsetSkiddingValue,
          offsetDistance: this.offsetDistanceValue,
          delay: this.delayValue,
          ignoreClickOutsideClass: this.ignoreClickOutsideClassValue,
          ...this.instanceEventHandlers(['hide', 'show', 'toggle']),
        }

        const instanceOptions = {
          id: this.targetElement.id,
          override: true
        };

        const dropdown = new Dropdown(this.targetElement, this.element, options, instanceOptions);

        // Set up click handlers for dropdown items
        this.setupDropdownItemListeners();

        return dropdown;
      }
    );

    return this.instance;
  }

  // Set up click handlers for dropdown items so that we can hide the dropdown
  // when an item contained within the dropdown is clicked
  setupDropdownItemListeners() {
    if (!this.targetElement) return;

    // Get all links and buttons within the dropdown
    const menuItems = this.targetElement.querySelectorAll('a, button');

    menuItems.forEach(item => {
      // Skip items that should be ignored
      if (item.hasAttribute('data-dropdown-ignore-click')) return;

      // Add click handler
      const handler = () => {
        if (this.instance && this.instance.isVisible()) {
          console.log('Menu item clicked, hiding dropdown');
          this.instance.hide();
        }
      };

      // Store the handler reference for cleanup
      item._dropdownHideHandler = handler;

      // Add the event listener
      item.addEventListener('click', handler);
    });
  }
}
