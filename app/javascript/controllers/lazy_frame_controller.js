import { Controller } from "@hotwired/stimulus";

/**
 * LazyFrameController - Base controller for lazy loading Turbo Frames
 *
 * Usage:
 * <div
 *   data-controller="lazy-frame"
 *   data-lazy-frame-url-value="/path/to/endpoint"
 *   data-lazy-frame-load-on-value="connect"
 * >
 *   <turbo-frame id="my_frame" src=""></turbo-frame>
 * </div>
 */
export default class LazyFrameController extends Controller {
  static values = {
    url: String,
    loadOn: { type: Object, default: { strategy: "connect" } },
    loaded: { type: Boolean, default: false },
    frameId: String,
    containingComponentId: String,
    eventType: { type: String, default: "show" }
  };

  static targets = ["frame", "loadingIndicator"];

  connect() {
    // console.log("LazyFrameController connected");

    // Set the frameId value if we have a frame target
    if (this.hasFrameTarget) {
      this.frameIdValue = this.frameTarget.id;
    }

    const loadStrategy = this.loadOnValue.strategy

    if (loadStrategy === "connect") {
      console.log("LazyFrameController: loadStrategy is connect");
      this.load();
    } else if (loadStrategy === "visible") {
      console.log("LazyFrameController: loadStrategy is visible");
      this.setupIntersectionObserver();
    } else if (loadStrategy === "event" && this.containingComponentIdValue) {
      console.log("LazyFrameController: loadStrategy is event, name:", this.eventTypeValue);
      console.log("LazyFrameController: containingComponentIdValue:", this.containingComponentIdValue);
      this.containerElement = document.querySelector(`#${this.containingComponentIdValue}`);

      if (!this.containerElement) {
        console.warn(`Container element with ID ${this.containingComponentIdValue} not found`);
        return;
      }

      // Get the event name from eventType value or use default
      const eventName = this.hasEventTypeValue ? this.eventTypeValue : "show";

      // Listen for the container's event
      this.containerEventHandler = this.handleContainerEvent.bind(this);
      this.containerElement.addEventListener(eventName, this.containerEventHandler);

      console.log(`Added ${eventName} event listener to target`, this.containerElement.id);
    } else {
      console.log("No valid load_on strategy found, not loading");
    }
  }

  disconnect() {
    // Remove the event listener if it exists
    if (this.containerElement && this.containerEventHandler && this.hasEventTypeValue) {
      this.containerElement.removeEventListener(this.eventTypeValue, this.containerEventHandler);
    }

    if (this.observer) {
      // console.log(`LazyFrameController disconnected ${this.observer}`);
      this.observer.disconnect();
      this.observer = null;
    }
  }

  handleContainerEvent(event) {
    console.log(`Container event ${event.type} detected for`, this.containerElement.id);

    // clear frame content to avoid seeing stale data when loading the container
    // component like a modal or drawer
    this.frameTarget.innerHTML = "";

    // FIXME: remove intentional slow down for testing
    this.setupLoad(() => {
      this.reload();
    });
  }

  setupIntersectionObserver() {
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1 // 10% of the element visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // if (entry.isIntersecting && !this.loadedValue) {
        if (entry.isIntersecting) {
          console.log("LazyFrameController: Element is visible, loading content");
          this.load();
          this.observer.disconnect();
        }
      });
    }, options);

    this.observer.observe(this.element);
  }

  // Temporary testing delay to ensure that the URL value is set before loading.
  // As long as the setTimeout here is longer than the time it takes to set the
  // URL value in the other controller, this should work. This is a workaround
  // for the fact that the URL value is not set immediately when the controller
  // connects, since we're updating it for every table row whose data we want
  // to load in the modal.
  setupLoad(callback) {
    if (!this.urlValue) {
      console.log("No internal URL value found, checking data attribute");
      console.log("Current data attribute URL value", this.element.dataset.lazyFrameUrlValue)

      this.showLoadingIndicator();

      // NOTE: attempt to pull the URL value from the data attr that can be set
      // by a separate controller by listening for the container event (often on
      // a modal, but could be drawer or dropdown)
      setTimeout(() => {
        this.urlValue = this.element.dataset.lazyFrameUrlValue;
        console.log("LazyFrameController: URL value retrieved via fallback:", this.urlValue);
        callback();
      }, 1500);
    } else {
      // callback();
      console.log("URL value is directly available, calling load() for:", this.urlValue);
    }
  }

  load() {
    // console.log("LazyFrameController: load() called");
    // if (this.loadedValue) {
    //   // console.log("LazyFrameController: Already loaded, skipping load");
    //   return;
    // } else {
    //   // console.log("LazyFrameController: Loading content");
    // }

    this.showLoadingIndicator();

    // Create a URL object to handle query parameters consistently
    const url = new URL(this.urlValue, window.location.origin);

    // Ensure we're requesting turbo_stream format explicitly in the URL
    if (!url.searchParams.has('format')) {
      url.searchParams.append('format', 'turbo_stream');
    }

    fetch(url.toString(), {
      headers: {
        "Accept": "text/vnd.turbo-stream.html, text/html, application/xhtml+xml",
        "X-Requested-With": "XMLHttpRequest"
      }
    })
      .then((response) => {
        if (!response.ok) {
          console.error(`Failed to load content from ${this.urlValue}`, response.status);
          return;
        }
        // console.log(`LazyFrameController: Content loaded from ${this.urlValue}`);
        return response.text();
      })
      .then((responseText) => {
        if (responseText) {
          this.processResponse(responseText);

          // this.loadedValue = true;

          this.hideLoadingIndicator();

          // Get the frame ID more reliably
          let frameId;
          if (this.hasFrameTarget) {
            frameId = this.frameTarget.id;
          } else if (this.hasFrameIdValue) {
            frameId = this.frameIdValue;
          }

          // console.log(`LazyFrameController: Content loaded for frame: ${frameId}`);

          // Dispatch a custom event when content is loaded
          // This will allow other components to react to the loaded content
          const detail = { frameId };
          const event = new CustomEvent('lazy-frame:loaded', {
            bubbles: true,
            detail
          });
          this.element.dispatchEvent(event);

          // Also dispatch a more general document event for components that
          // might not be in the direct parent-child hierarchy
          document.dispatchEvent(new CustomEvent('lazy-frame:any-loaded', {
            bubbles: true,
            detail
          }));
        }
      })
      .catch((error) => {
        console.error(`Error fetching content from ${this.urlValue}:`, error);
      })
      .finally(() => {
        this.hideLoadingIndicator();

        // Ensure that the URL value is cleared after loading so subsequent
        // loads don't use the same URL. We need to force a reload!
        delete this.element.dataset.lazyFrameUrlValue;
      });
  }

  processResponse(responseText) {
    // Check for turbo-stream tags
    if (responseText.includes("<turbo-stream")) {
      // console.log("Processing lazy_frame turbo-stream response");

      // Create a temporary div to hold the response HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = responseText;

      // Find all turbo-stream elements
      const turboStreams = tempDiv.querySelectorAll("turbo-stream");

      // Process each turbo-stream element
      turboStreams.forEach((stream) => {
        // Add to the DOM to let Turbo process it
        document.body.appendChild(stream);
      });
    } else {
      // console.log("Processing lazy_frame raw HTML response");

      // For raw HTML responses, directly update the frame using the target
      this.frameTarget.innerHTML = responseText;
    }
  }

  reload() {
    // console.log("Reloading LazyFrame content");
    // this.loadedValue = false;
    this.load();
  }

  showLoadingIndicator() {
    console.log("\nShowing loading indicator\n");
    if (this.hasLoadingIndicatorTarget) {
      this.loadingIndicatorTarget.classList.remove("hidden");
    }
  }

  hideLoadingIndicator() {
    if (this.hasLoadingIndicatorTarget) {
      this.loadingIndicatorTarget.classList.add("hidden");
    }
  }
}