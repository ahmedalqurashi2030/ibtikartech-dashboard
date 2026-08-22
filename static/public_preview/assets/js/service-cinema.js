(function () {
  "use strict";

  var section = document.querySelector(".service-paths-section");
  if (!section || section.dataset.cinemaInitialized === "true") return;

  var stage = section.querySelector(":scope > .container");
  var header = section.querySelector(".service-paths-header");
  var help = section.querySelector(".service-paths-help");
  var cards = Array.prototype.slice.call(section.querySelectorAll(".service-path-card"));
  if (!stage || !header || !cards.length) return;

  var bodyClass = document.body.className;
  var variants = [
    { match: "category-ecommerce", label: "ECOMMERCE PATHS", accent: "#10c8e8", accent2: "#ec4899", scene: "commerce" },
    { match: "category-websites", label: "WEB PATHS", accent: "#10c8e8", accent2: "#4f7df3", scene: "browser" },
    { match: "category-brand", label: "BRAND & CONTENT", accent: "#9c6bff", accent2: "#ec4899", scene: "identity" },
    { match: "category-growth", label: "GROWTH PATHS", accent: "#11c7e7", accent2: "#20c98b", scene: "growth" },
    { match: "category-systems", label: "SYSTEMS PATHS", accent: "#4f7df3", accent2: "#a855f7", scene: "systems" }
  ];
  var variant = variants.filter(function (item) { return bodyClass.indexOf(item.match) !== -1; })[0] || variants[0];
  var count = cards.length;
  var media = window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)");

  section.dataset.cinemaInitialized = "true";
  section.dataset.count = String(count);
  section.style.setProperty("--service-path-count", String(count));

  var canvasLayer = document.createElement("div");
  canvasLayer.className = "service-cinema__canvas-layer";
  canvasLayer.setAttribute("aria-hidden", "true");
  canvasLayer.innerHTML = '<canvas class="service-cinema__canvas"></canvas><div class="service-cinema__wash"></div><div class="service-cinema__vignette"></div><div class="service-cinema__grain"></div>';

  var top = document.createElement("div");
  top.className = "service-cinema__top";
  top.setAttribute("aria-hidden", "true");
  top.innerHTML = '<span class="service-cinema__index">' + variant.label + ' / 01—' + String(count).padStart(2, "0") + "</span>";

  var rail = document.createElement("div");
  rail.className = "service-cinema__rail";
  rail.setAttribute("aria-hidden", "true");
  rail.innerHTML = '<div class="service-cinema__rail-line"><span></span></div><div class="service-cinema__rail-steps">' + cards.map(function (_, index) {
    return '<span class="service-cinema__rail-step">' + String(index + 1).padStart(2, "0") + "</span>";
  }).join("") + "</div>";

  var cue = document.createElement("div");
  cue.className = "service-cinema__cue";
  cue.setAttribute("aria-hidden", "true");
  cue.innerHTML = "<i></i><span>مرّر لاستكشاف المسارات</span><i></i>";

  stage.insertBefore(canvasLayer, stage.firstChild);
  if (help && help.parentElement === header) stage.insertBefore(help, header.nextSibling);
  stage.appendChild(top);
  stage.appendChild(rail);
  stage.appendChild(cue);
  section.classList.add("is-cinematic-ready");
  cards.forEach(function (card) { card.classList.remove("reveal"); });
  header.classList.remove("reveal");

  var canvas = canvasLayer.querySelector("canvas");
  var context = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var railFill = rail.querySelector(".service-cinema__rail-line span");
  var steps = Array.prototype.slice.call(rail.querySelectorAll(".service-cinema__rail-step"));
  var width = 0;
  var height = 0;
  var ratio = 1;
  var progress = 0;
  var frameRequested = false;
  var particles = [];

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function ease(value) { return value * value * (3 - 2 * value); }
  function hexToRgba(hex, alpha) {
    var raw = hex.replace("#", "");
    var number = parseInt(raw, 16);
    return "rgba(" + ((number >> 16) & 255) + "," + ((number >> 8) & 255) + "," + (number & 255) + "," + alpha + ")";
  }

  function seedParticles() {
    particles = [];
    var total = Math.max(36, Math.round(width / 24));
    for (var index = 0; index < total; index += 1) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        size: .45 + Math.random() * 1.45,
        depth: .25 + Math.random() * .75,
        drift: Math.random() * Math.PI * 2
      });
    }
  }

  function resizeCanvas() {
    if (!context) return;
    var rect = stage.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    ratio = Math.min(window.devicePixelRatio || 1, 1.7);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    seedParticles();
    draw();
  }

  function roundedRect(ctx, x, y, w, h, radius) {
    var r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawGrid(ctx, horizon) {
    ctx.save();
    ctx.strokeStyle = "rgba(104,148,255,.065)";
    ctx.lineWidth = 1;
    for (var row = 0; row < 12; row += 1) {
      var t = row / 11;
      var y = horizon + Math.pow(t, 1.65) * (height - horizon);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (var column = -9; column <= 9; column += 1) {
      ctx.beginPath();
      ctx.moveTo(width * .5, horizon);
      ctx.lineTo(width * .5 + column * width * .12, height);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles(ctx) {
    ctx.save();
    particles.forEach(function (particle) {
      var x = particle.x * width + Math.sin(progress * 6 + particle.drift) * 14 * particle.depth;
      var y = (particle.y * height + progress * 52 * particle.depth) % height;
      ctx.fillStyle = hexToRgba(particle.depth > .62 ? variant.accent : variant.accent2, .1 + particle.depth * .22);
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawBrowser(ctx, intensity) {
    var w = Math.min(width * .52, 520);
    var h = w * .56;
    var x = width * .23 - w * .5;
    var y = height * .46 - h * .5;
    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.shadowColor = hexToRgba(variant.accent, .28);
    ctx.shadowBlur = 34;
    roundedRect(ctx, x, y, w, h, 18);
    ctx.fillStyle = "rgba(9,15,35,.68)";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hexToRgba(variant.accent, .42);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + 38);
    ctx.lineTo(x + w, y + 38);
    ctx.strokeStyle = "rgba(255,255,255,.1)";
    ctx.stroke();
    [0, 1, 2].forEach(function (dot) {
      ctx.beginPath();
      ctx.arc(x + 21 + dot * 13, y + 19, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = dot === 0 ? variant.accent2 : "rgba(255,255,255,.28)";
      ctx.fill();
    });
    var innerY = y + 66;
    [0, 1, 2].forEach(function (row) {
      roundedRect(ctx, x + 28, innerY + row * 38, w * (.42 + row * .08), 8, 4);
      ctx.fillStyle = row === 0 ? hexToRgba(variant.accent, .34) : "rgba(255,255,255,.09)";
      ctx.fill();
    });
    roundedRect(ctx, x + w * .67, innerY, w * .24, h * .48, 12);
    ctx.fillStyle = hexToRgba(variant.accent2, .12);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(variant.accent2, .32);
    ctx.stroke();
    ctx.restore();
  }

  function drawIdentity(ctx, intensity) {
    var centerX = width * .25;
    var centerY = height * .45;
    ctx.save();
    ctx.globalAlpha = intensity;
    for (var ring = 4; ring >= 1; ring -= 1) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, ring * 42 + progress * 12, 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba(ring % 2 ? variant.accent : variant.accent2, .06 + (5 - ring) * .035);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    [-1, 0, 1].forEach(function (bar, index) {
      var gradient = ctx.createLinearGradient(centerX - 52, centerY - 86, centerX + 52, centerY + 86);
      gradient.addColorStop(0, variant.accent);
      gradient.addColorStop(1, variant.accent2);
      roundedRect(ctx, centerX - 46 + bar * 45, centerY - 92 + Math.abs(bar) * 18, 28, 164 - Math.abs(bar) * 36, 14);
      ctx.fillStyle = gradient;
      ctx.shadowColor = hexToRgba(index === 1 ? variant.accent2 : variant.accent, .45);
      ctx.shadowBlur = 22;
      ctx.fill();
    });
    ctx.restore();
  }

  function drawGrowth(ctx, intensity) {
    var x = width * .07;
    var y = height * .67;
    var w = width * .37;
    var h = height * .28;
    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.beginPath();
    for (var point = 0; point < 7; point += 1) {
      var px = x + (w / 6) * point;
      var py = y - (Math.pow(point / 6, 1.35) * h + Math.sin(point * 1.6) * h * .11);
      if (point === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = variant.accent;
    ctx.lineWidth = 3;
    ctx.shadowColor = hexToRgba(variant.accent, .5);
    ctx.shadowBlur = 16;
    ctx.stroke();
    ctx.shadowBlur = 0;
    for (var column = 0; column < 6; column += 1) {
      var barHeight = h * (.17 + column * .095);
      roundedRect(ctx, x + column * (w / 6), y + 28 - barHeight, 18, barHeight, 9);
      ctx.fillStyle = hexToRgba(column % 2 ? variant.accent2 : variant.accent, .15 + column * .035);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSystems(ctx, intensity) {
    var centerX = width * .24;
    var centerY = height * .48;
    var nodes = [[0, 0], [-150, -80], [142, -100], [-128, 104], [154, 95], [0, 154]];
    ctx.save();
    ctx.globalAlpha = intensity;
    nodes.slice(1).forEach(function (node, index) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + node[0], centerY + node[1]);
      ctx.strokeStyle = hexToRgba(index % 2 ? variant.accent2 : variant.accent, .25);
      ctx.stroke();
    });
    nodes.forEach(function (node, index) {
      ctx.beginPath();
      ctx.arc(centerX + node[0], centerY + node[1], index === 0 ? 13 : 7, 0, Math.PI * 2);
      ctx.fillStyle = index % 2 ? variant.accent2 : variant.accent;
      ctx.shadowColor = hexToRgba(index % 2 ? variant.accent2 : variant.accent, .38);
      ctx.shadowBlur = 18;
      ctx.fill();
    });
    ctx.restore();
  }

  function drawCommerce(ctx, intensity) {
    drawBrowser(ctx, intensity);
    ctx.save();
    ctx.globalAlpha = intensity;
    var cx = width * .34;
    var cy = height * .59;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, .12 * Math.PI, 1.88 * Math.PI);
    ctx.strokeStyle = variant.accent2;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 5);
    ctx.lineTo(cx + 1, cy + 5);
    ctx.lineTo(cx + 13, cy - 10);
    ctx.strokeStyle = "rgba(255,255,255,.78)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    if (!context || !width || !height || media.matches) return;
    context.clearRect(0, 0, width, height);
    var background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#030611");
    background.addColorStop(.55, "#071027");
    background.addColorStop(1, "#050818");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    var glow = context.createRadialGradient(width * .28, height * .44, 10, width * .28, height * .44, width * .42);
    glow.addColorStop(0, hexToRgba(variant.accent, .15));
    glow.addColorStop(.48, hexToRgba(variant.accent2, .07));
    glow.addColorStop(1, "rgba(3,6,17,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    drawGrid(context, height * .57);
    drawParticles(context);

    var intensity = .38 + Math.sin(clamp(progress, 0, 1) * Math.PI) * .48;
    if (variant.scene === "browser") drawBrowser(context, intensity);
    else if (variant.scene === "identity") drawIdentity(context, intensity);
    else if (variant.scene === "growth") drawGrowth(context, intensity);
    else if (variant.scene === "systems") drawSystems(context, intensity);
    else drawCommerce(context, intensity);
  }

  function update() {
    frameRequested = false;
    if (media.matches) {
      header.style.opacity = "";
      header.style.transform = "";
      if (help) {
        help.style.opacity = "";
        help.style.transform = "";
        help.style.pointerEvents = "";
      }
      cards.forEach(function (card) {
        card.style.opacity = "";
        card.style.transform = "";
        card.style.pointerEvents = "";
      });
      return;
    }

    var rect = section.getBoundingClientRect();
    var stageHeight = stage.getBoundingClientRect().height;
    var scrollable = Math.max(1, section.offsetHeight - stageHeight);
    var topOffset = parseFloat(getComputedStyle(section).getPropertyValue("--service-cinema-top")) || 0;
    progress = clamp((topOffset - rect.top) / scrollable, 0, 1);

    var introOpacity = 1 - ease(clamp((progress - .035) / .14, 0, 1));
    header.style.opacity = String(introOpacity);
    header.style.transform = "translateY(" + (-18 * (1 - introOpacity)) + "px)";

    var start = .13;
    var end = help ? .83 : .91;
    var step = count > 1 ? (end - start) / (count - 1) : 1;
    var half = Math.max(.095, Math.min(.18, step * .78));
    cards.forEach(function (card, index) {
      var center = start + index * step;
      var distance = Math.abs(progress - center);
      var opacity = ease(clamp(1 - distance / half, 0, 1));
      var direction = progress < center ? 1 : -1;
      card.style.opacity = String(opacity);
      card.style.transform = "translateY(" + (direction * (1 - opacity) * 30) + "px) scale(" + (.985 + opacity * .015) + ")";
      card.style.pointerEvents = opacity > .55 ? "auto" : "none";
    });

    if (help) {
      var helpOpacity = ease(clamp((progress - .86) / .09, 0, 1));
      help.style.opacity = String(helpOpacity);
      help.style.transform = "translateY(" + ((1 - helpOpacity) * 18) + "px)";
      help.style.pointerEvents = helpOpacity > .55 ? "auto" : "none";
    }

    railFill.style.height = (progress * 100) + "%";
    var activeIndex = clamp(Math.round((clamp(progress, start, end) - start) / Math.max(step, .001)), 0, count - 1);
    steps.forEach(function (item, index) { item.classList.toggle("is-active", index <= activeIndex && progress >= .07); });
    cue.style.opacity = String(1 - ease(clamp((progress - .82) / .12, 0, 1)));
    draw();
  }

  function requestUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", function () { resizeCanvas(); requestUpdate(); }, { passive: true });
  window.addEventListener("pageshow", requestUpdate);
  if (media.addEventListener) media.addEventListener("change", function () { resizeCanvas(); requestUpdate(); });
  if (window.ResizeObserver) new ResizeObserver(resizeCanvas).observe(stage);
  resizeCanvas();
  requestUpdate();
}());
