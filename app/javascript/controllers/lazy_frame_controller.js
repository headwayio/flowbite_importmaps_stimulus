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
    frameId: String,
  };

  static targets = ["frame", "loadingIndicator"];

  connect() {
    // Always set up frameId if target exists
    if (this.hasFrameTarget) {
      this.frameIdValue = this.frameTarget.id;
    }

    // Handle explicit custom event configuration
    const loadStrategy = this.loadOnValue.strategy;
    const eventConfig = this.loadOnValue.event || {};

    console.log("LazyFrameController: loadOnValue.event", eventConfig);

    // Add event listener for custom reload event if configured or if load strategy isn't specified
    if (eventConfig.lazy_frame === 'request-reload' || !loadStrategy) {
      this.element.addEventListener('lazy-frame:request-reload', this.handleReloadRequest.bind(this));
      console.log("LazyFrameController: Listening for request-reload events");
    }

    // Handle initial load strategies
    if (loadStrategy === "connect") {
      console.log("LazyFrameController: loadStrategy is connect");
      this.load();
    } else if (loadStrategy === "visible") {
      console.log("LazyFrameController: loadStrategy is visible");
      this.setupIntersectionObserver();
    } else {
      console.log("No standard load strategy, waiting for 'request-reload' events");
    }
  }

  disconnect() {
    // Only remove event listener if it was added
    const eventConfig = this.loadOnValue.event || {};
    if (eventConfig.lazy_frame === 'request-reload' || !this.loadOnValue.strategy) {
      this.element.removeEventListener('lazy-frame:request-reload', this.handleReloadRequest.bind(this));
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  // New handler for the custom reload event
  handleReloadRequest(event) {
    console.log('RECEIVED lazy-frame:request-reload event with URL:', event.detail.url);

    // Update the URL value
    this.urlValue = event.detail.url;

    // Clear frame content to avoid showing stale data
    if (this.hasFrameTarget) {
      this.frameTarget.innerHTML = "";
    }

    // Load the new content immediately
    this.load();
  }

  setupIntersectionObserver() {
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1 // 10% of the element visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log("LazyFrameController: Element is visible, loading content");
          this.load();
          this.observer.disconnect();
        }
      });
    }, options);

    this.observer.observe(this.element);
  }

  load() {
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