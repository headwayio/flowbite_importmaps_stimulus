# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"

# ======================================================================================================================
# FLOWBITE
# ======================================================================================================================
# https://flowbite.com/docs/getting-started/changelog/#v252
# Flowbite v2.5.2 is the latest version before Tailwind v4. We're on Tailwind v3.4.17, so stay with Flowbite v2.5.2
#
# Pin all components included in Flowbite v2.5.2
flowbite_components = %w[
  accordion carousel clipboard collapse datepicker dial dismiss drawer dropdown input-counter modal popover tabs tooltip
]
flowbite_components.each do |component|
  pin "flowbite/components/#{component}", to: "https://esm.run/flowbite@2.5.2/lib/esm/components/#{component}/index.js"
end
