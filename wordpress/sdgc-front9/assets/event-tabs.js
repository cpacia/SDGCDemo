/**
 * Event page tabs.
 *
 * Each panel carries its widget's config as data-* attributes and starts empty
 * except the first. The embed script for a panel is injected the first time its
 * tab is opened, then left in place — five iframes loading at once would be five
 * times the work for a page where four of them are unseen, and re-injecting on
 * every switch would reload the one you just looked at.
 */
(function () {
	"use strict";

	var container = document.querySelector("[data-sdgc-tabs]");
	if (!container) {
		return;
	}

	var panels = Array.prototype.slice.call(container.querySelectorAll("[data-sdgc-panel]"));
	var links = Array.prototype.slice.call(document.querySelectorAll("[data-sdgc-tab]"));
	if (!panels.length) {
		return;
	}

	var fallback = panels[0].getAttribute("data-sdgc-panel");

	/** Builds the Front9 embed tag a panel describes. */
	function mount(panel) {
		if (panel.getAttribute("data-mounted") === "1") {
			return;
		}
		panel.setAttribute("data-mounted", "1");

		var host = document.createElement("div");
		host.className = "sdgc-embed";

		var script = document.createElement("script");
		script.async = true;
		script.src = panel.getAttribute("data-embed");
		script.setAttribute("data-org", panel.getAttribute("data-org"));
		script.setAttribute("data-widget", panel.getAttribute("data-widget"));
		script.setAttribute("data-event", panel.getAttribute("data-event"));
		script.setAttribute("data-accent", panel.getAttribute("data-accent"));

		// embed.js resolves document.currentScript when it runs and inserts the
		// iframe as the tag's next sibling, so the tag has to be in the document
		// before it loads.
		host.appendChild(script);
		panel.appendChild(host);
	}

	function show(id) {
		var match = panels.some(function (panel) {
			return panel.getAttribute("data-sdgc-panel") === id;
		});
		if (!match) {
			id = fallback;
		}

		panels.forEach(function (panel) {
			var active = panel.getAttribute("data-sdgc-panel") === id;
			panel.classList.toggle("is-active", active);
			if (active) {
				mount(panel);
			}
		});

		links.forEach(function (link) {
			var active = link.getAttribute("data-sdgc-tab") === id;
			link.classList.toggle("is-active", active);
			if (active) {
				link.setAttribute("aria-current", "page");
			} else {
				link.removeAttribute("aria-current");
			}
		});
	}

	function fromHash() {
		return window.location.hash.replace(/^#/, "") || fallback;
	}

	show(fromHash());
	window.addEventListener("hashchange", function () {
		show(fromHash());
	});
})();
