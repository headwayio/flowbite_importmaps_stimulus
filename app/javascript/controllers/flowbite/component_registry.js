/**
 * Tracks Flowbite component instances across controllers and properly
 * manages their lifecycle with reference counting to prevent memory leaks.
 */
const ComponentRegistry = {
  instances: {},
  refCounts: {},

  /**
   * Gets or creates a component instance and increments its reference count
   *
   * @param {string} elementId - ID of the target element
   * @param {Function} createCallback - Factory function to create the instance if needed
   * @returns {Object} The component instance
   */
  getInstance(elementId, createCallback) {
    const key = elementId;

    // Initialize reference count if this is new
    if (!this.refCounts[key]) {
      this.refCounts[key] = 0;
    }

    // Create new instance if one doesn't exist
    if (!this.instances[key]) {
      this.instances[key] = createCallback();
      console.log(`Created new component instance for #${elementId}`);
    } else {
      console.log(`Reusing existing component instance of #${elementId}`);
    }

    // Increment reference count
    this.refCounts[key]++;
    console.log(`Reference count for #${elementId}: ${this.refCounts[key]}`);

    return this.instances[key];
  },

  /**
   * Decrements reference count and removes instance if no more references
   *
   * @param {string} elementId - ID of the component to remove
   * @returns {boolean} True if the instance was destroyed, false if just decremented
   */
  removeInstance(elementId) {
    const key = elementId;

    if (!this.instances[key]) {
      console.warn(`Attempted to remove non-existent instance #${elementId}`);
      return false;
    }

    // Decrement reference count
    this.refCounts[key]--;
    console.log(`Reference count for #${elementId} decremented to ${this.refCounts[key]}`);

    // Only destroy if no more references
    if (this.refCounts[key] <= 0) {
      // Proper cleanup - call destroy on the instance if it has a destroy method
      if (typeof this.instances[key].destroy === 'function') {
        console.log(`Destroying component instance #${elementId}`);
        this.instances[key].destroyAndRemoveInstance();
        // this.instance = null
      }

      // Remove from tracking
      delete this.instances[key];
      delete this.refCounts[key];
      console.log(`Removed component instance of #${elementId} (no more references)`);
      return true;
    } else {
      console.log(`Instance #${elementId} still has ${this.refCounts[key]} references`);
      return false;
    }
  },

  /**
   * Checks current reference count for an instance
   *
   * @param {string} elementId - ID of the component to check
   * @returns {number} The reference count, or 0 if no instance exists
   */
  getReferenceCount(elementId) {
    return this.refCounts[elementId] || 0;
  },

  /**
   * Gets all registered instances
   *
   * @returns {Object} Map of element IDs to instances
   */
  getAllInstances() {
    return this.instances;
  },

  /**
   * Debugging method to log all tracked instances and their reference counts
   */
  debugInstances() {
    console.group("Component Registry Status");

    const instanceIds = Object.keys(this.instances);
    console.log(`Tracking ${instanceIds.length} instances`);

    instanceIds.forEach(id => {
      const instance = this.instances[id];
      const refCount = this.refCounts[id] || 0;
      const type = instance.constructor ? instance.constructor.name : "Unknown";

      console.log(`#${id}: ${type} (${refCount} references)`);
    });

    console.groupEnd();
  }
};

// Attach to window for global access
window.ComponentRegistry = ComponentRegistry;

export default ComponentRegistry;