export const getTargetIdFromOutlet = controller => {
  let componentId;

  // Look for any data attribute containing 'outlet'
  const datasetKeys = Object.keys(controller.element.dataset);
  const outletKey = datasetKeys.find(key => key.toLowerCase().includes('outlet'));
  if (outletKey) {
    componentId = controller.element.dataset[outletKey];
  }

  // console.log("Modal ID found:", modalId);
  return componentId?.replace('#', '');
};