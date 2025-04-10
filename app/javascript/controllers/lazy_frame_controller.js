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
    loadOn: { type: String, default: "connect" }, // connect, visible, click, custom
    loaded: { type: Boolean, default: false },
    frameId: String
  };

  static targets = ["frame", "loadingIndicator"];

  connect() {
    // console.log("LazyFrameController connected");

    // Set the frameId value if we have a frame target
    if (this.hasFrameTarget) {
      this.frameIdValue = this.frameTarget.id;
    }

    // Find the nearest modal container
    // FIXME: may be too greedy in terms of finding the modal container
    this.modalContainer = this.element.closest('[data-controller~="flowbite--modal-target"]');

    if (this.modalContainer) {
      // Listen for the modal show event
      this.modalShowHandler = this.handleModalShow.bind(this);
      this.modalContainer.addEventListener('show', this.modalShowHandler);
      // console.log("Added show event listener to modal", this.modalContainer.id);
    }

    // if (this.loadOnValue === "connect") {
    //   this.setupLoad(() => {
    //     this.load();
    //   });
    // } else if (this.loadOnValue === "visible") {
    //   this.setupIntersectionObserver();
    // }
    // "click" and "custom" are handled by the action attribute
  }

  disconnect() {
    // Remove the show event listener if it exists
    if (this.modalContainer && this.modalShowHandler) {
      this.modalContainer.removeEventListener('show', this.modalShowHandler);
    }

    if (this.observer) {
      // console.log(`LazyFrameController disconnected ${this.observer}`);
      this.observer.disconnect();
      this.observer = null;
    }
  }

  handleModalShow(_event) {
    console.log("Modal show event detected for", this.modalContainer.id);

    // clear frame content to avoid seeing stale data when loading the modal
    this.frameTarget.innerHTML = "";

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
        if (entry.isIntersecting && !this.loadedValue) {
          // console.log("LazyFrameController: Element is visible, loading content");
          this.setupLoad(() => {
            this.load();
            this.observer.disconnect();
          });
        }
      });
    }, options);

    this.observer.observe(this.element);
  }

  // Ensure that the URL value is set before loading
  setupLoad(callback) {
    if (!this.urlValue) {
      console.log("current url VALUE", this.element.dataset.lazyFrameUrlValue)
      // NOTE: attempt to pull the URL value from the data attribute that can be
      // set by a separate controller when the modal is shown by listening for
      // the modal show event
      setTimeout(() => {
        this.urlValue = this.element.dataset.lazyFrameUrlValue;
        console.log("LazyFrameController: URL value retrieved via fallback:", this.urlValue);
        callback();
      }, 2000);
    } else {
      // callback();
      console.log("url value is not available")
    }
  }

  load() {
    // console.log("LazyFrameController: load() called");
    if (this.loadedValue) {
      // console.log("LazyFrameController: Already loaded, skipping load");
      return;
    } else {
      // console.log("LazyFrameController: Loading content");
    }

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
        this.element.dataset.lazyFrameUrlValue = null;
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
    this.loadedValue = false;
    this.load();
  }

  showLoadingIndicator() {
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