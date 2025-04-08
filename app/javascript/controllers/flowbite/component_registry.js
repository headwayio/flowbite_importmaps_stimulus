// Simple registry to track Flowbite component instances across controllers
const ComponentRegistry = {
  instances: {},

  // Get or create instance
  getInstance(elementId, createCallback) {
    const key = elementId;

    if (!this.instances[key]) {
      // Create new instance if one doesn't exist
      this.instances[key] = createCallback();
      console.log(`Created new component instance for #${elementId}`);
    } else {
      console.log(`Reusing existing component instance of #${elementId}`);
    }

    return this.instances[key];
  },

  // Remove instance on destroy
  removeInstance(elementId) {
    const key = elementId;
    if (this.instances[key]) {
      delete this.instances[key];
      console.log(`Removed component instance of #${elementId}`);
    }
  }
};

// attach to window for global access as well
window.ComponentRegistry = ComponentRegistry;

export default ComponentRegistry;