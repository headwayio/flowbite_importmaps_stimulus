/**
 * Gets the target element of an outlet from a controller
 *
 * @param {Controller} controller - The Stimulus controller with an outlet
 * @returns {HTMLElement|null} - The target element or null if not found
 */
export default function getTargetElementOfOutlet(controller) {
  try {
    // Get all data attributes from the controller element
    const datasetKeys = Object.keys(controller.element.dataset);

    // Find any data attribute containing 'outlet'
    const outletKey = datasetKeys.find(key => key.toLowerCase().includes('outlet'));

    if (!outletKey) {
      console.warn("No outlet data attribute found on element");
      return null;
    }

    // Get the outlet selector value
    const outletSelector = controller.element.dataset[outletKey];

    if (!outletSelector) {
      console.warn(`Outlet selector value is empty for key: ${outletKey}`);
      return null;
    }

    // Remove the '#' character if present
    const targetId = outletSelector.replace(/^#/, '');

    // Find the target element
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
      console.warn(`Target element not found with ID: ${targetId}`);
      return null;
    }

    console.log(`Found target element #${targetId} via outlet key: ${outletKey}`);
    return targetElement;
  } catch (error) {
    console.error('Error getting target element of outlet:', error);
    return null;
  }
}