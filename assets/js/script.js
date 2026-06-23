/* =====================================================================
   PARLAY ON MAIN — interactions
   ===================================================================== */
(function () {
  "use strict";

  /* ---- Loader ---- */
  window.addEventListener("load", function () {
    var l = document.querySelector(".loader");
    if (l) setTimeout(function () { l.classList.add("done"); }, 550);
  });

  /* ---- Header solidify on scroll + back-to-top ---- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".totop");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
      toggle.setAttribute("aria-expanded", open);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Animated stat counters ---- */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.dataset.count),
            suffix = el.dataset.suffix || "", dur = 1400, start = null;
        function step(t) {
          if (!start) start = t;
          var p = Math.min((t - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (Math.round(target * eased)).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---- Menu tabs ---- */
  var tabs = document.querySelectorAll(".menu-tabs button");
  var panels = document.querySelectorAll(".menu-panel");
  if (tabs.length) {
    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.dataset.target;
        tabs.forEach(function (t) { t.classList.toggle("active", t === btn); });
        panels.forEach(function (p) { p.classList.toggle("active", p.id === id); });
        var top = document.getElementById("menu-anchor");
        if (top) top.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---- Contact form -> mailto fallback ---- */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = encodeURIComponent(form.name.value || "");
      var email = encodeURIComponent(form.email.value || "");
      var phone = encodeURIComponent(form.phone ? form.phone.value : "");
      var msg = encodeURIComponent(form.message.value || "");
      var body = "Name: " + name + "%0D%0AEmail: " + email +
                 "%0D%0APhone: " + phone + "%0D%0A%0D%0A" + msg;
      window.location.href = "mailto:parlaysonmain@gmail.com?subject=" +
        encodeURIComponent("Inquiry from " + form.name.value) + "&body=" + body;
      var note = document.querySelector("#form-note");
      if (note) { note.textContent = "Opening your email app… if nothing happens, email us at parlaysonmain@gmail.com"; note.style.display = "block"; }
    });
  }

  /* ---- Footer year ---- */
  var yr = document.querySelector("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
