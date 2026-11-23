/* ------------------------------------------------------------
   Dentla landing page
   To receive form submissions, paste a form-backend URL below
   (Formspree, Getform, a Google Apps Script web app, your own API...).
   While it is empty, requests are only saved in this browser
   (localStorage key: "dentla_requests") so you can test the flow.
------------------------------------------------------------ */
const ENDPOINT = "https://formspree.io/f/xzerkryn";

const GOVERNORATES = [
  "Cairo","Giza","Alexandria","Qalyubia","Port Said","Suez","Dakahlia","Sharqia","Gharbia",
  "Monufia","Beheira","Kafr El Sheikh","Damietta","Ismailia","North Sinai","South Sinai",
  "Fayoum","Beni Suef","Minya","Assiut","Sohag","Qena","Luxor","Aswan","Red Sea","New Valley",
  "Matrouh","Outside Egypt"
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Mobile nav ---------- */
const nav = $(".nav");
const toggle = $(".menu-toggle");
toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("menu-open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
$$(".nav-links a, .nav-actions a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("menu-open");
  toggle?.setAttribute("aria-expanded", "false");
}));

/* ---------- Hero: seam leans toward the side you point at ---------- */
const hero = $(".hero");
$$(".side", hero).forEach(side => {
  const set = () => hero.dataset.focus = side.dataset.side;
  const clear = () => delete hero.dataset.focus;
  side.addEventListener("mouseenter", set);
  side.addEventListener("mouseleave", clear);
  side.addEventListener("focusin", set);
  side.addEventListener("focusout", clear);
});

/* ---------- Hero: a case travelling between clinic and lab ---------- */
const chip = $("#routeChip");
const chipText = $("#routeText");
const stops = [
  { left: "12%", text: "Case #2048 · Sent from clinic" },
  { left: "88%", text: "Case #2048 · Received by lab" },
  { left: "88%", text: "Case #2048 · In production" },
  { left: "12%", text: "Case #2048 · Delivered to clinic" }
];
let stop = 0;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (chip && !reduceMotion) {
  setInterval(() => {
    stop = (stop + 1) % stops.length;
    chip.style.left = stops[stop].left;
    chipText.textContent = stops[stop].text;
  }, 2600);
}

/* ---------- Governorate selects ---------- */
$$("select[data-governorates]").forEach(sel => {
  sel.innerHTML = '<option value="">Choose one</option>' +
    GOVERNORATES.map(g => `<option>${g}</option>`).join("");
});

/* ---------- Join: dentist / lab switch ---------- */
const join = $("#join");
const forms = { dentist: $("#form-dentist"), lab: $("#form-lab") };
const tabs = $$(".switch-btn");
const success = $("#success");

function setRole(role, { focus = false } = {}) {
  join.dataset.role = role;
  tabs.forEach(t => {
    const on = t.dataset.role === role;
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
  });
  Object.entries(forms).forEach(([r, f]) => (f.hidden = r !== role));
  $$(".intro-copy").forEach(c => (c.hidden = c.dataset.for !== role));
  success.hidden = true;
  if (focus) $(`#tab-${role}`).focus();
}
tabs.forEach(t => t.addEventListener("click", () => setRole(t.dataset.role)));
tabs.forEach(t => t.addEventListener("keydown", e => {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    setRole(t.dataset.role === "dentist" ? "lab" : "dentist", { focus: true });
  }
}));

// Any "Join as ..." button picks the matching form
$$("[data-join]").forEach(a => a.addEventListener("click", () => setRole(a.dataset.join)));
function roleFromHash() {
  if (location.hash === "#join-lab") setRole("lab");
  if (location.hash === "#join-dentist") setRole("dentist");
}
addEventListener("hashchange", roleFromHash);
roleFromHash();

/* ---------- Validation ---------- */
const MESSAGES = {
  fullName: "Enter your full name.",
  clinicName: "Enter your clinic name.",
  labName: "Enter your lab name.",
  contactPerson: "Enter the name of a contact person.",
  email: "Enter a valid email, like name@example.com.",
  phone: "Enter a phone number with at least 10 digits.",
  governorate: "Choose your governorate.",
  specialty: "Choose your specialty.",
  license: "Enter your license number.",
  casesPerMonth: "Choose how many cases you send.",
  teamSize: "Choose your team size.",
  capacity: "Choose your monthly capacity."
};

function fieldError(el, msg) {
  const field = el.closest(".field");
  field?.classList.toggle("has-error", !!msg);
  const err = field?.querySelector(".err");
  if (err) err.textContent = msg || "";
  el.setAttribute("aria-invalid", msg ? "true" : "false");
}

function validateField(el) {
  const v = el.value.trim();
  let msg = "";
  if (el.required && !v) msg = MESSAGES[el.name] || "This field is required.";
  else if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = MESSAGES.email;
  else if (el.type === "tel" && v.replace(/\D/g, "").length < 10) msg = MESSAGES.phone;
  fieldError(el, msg);
  return !msg;
}

function validateForm(form) {
  let ok = true, firstBad = null;
  $$("input:not([type=checkbox]):not([type=radio]), select", form).forEach(el => {
    if (!validateField(el)) { ok = false; firstBad ||= el; }
  });
  // lab: at least one service
  const services = $$("input[name=services]", form);
  if (services.length) {
    const any = services.some(c => c.checked);
    const err = $(".chips[data-min] .err", form);
    err.textContent = any ? "" : "Choose at least one service.";
    if (!any) { ok = false; firstBad ||= services[0]; }
  }
  const consent = $("input[name=consent]", form);
  const cErr = $(".consent-err", form);
  cErr.textContent = consent.checked ? "" : "Tick this box so we can contact you.";
  if (!consent.checked) { ok = false; firstBad ||= consent; }
  firstBad?.focus();
  return ok;
}

Object.values(forms).forEach(form => {
  $$("input, select", form).forEach(el => {
    el.addEventListener("blur", () => {
      if (el.type !== "checkbox" && el.type !== "radio" && el.closest(".field") && (el.value || el.closest(".has-error"))) validateField(el);
    });
    el.addEventListener("input", () => {
      if (el.closest(".has-error")) validateField(el);
    });
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const fd = new FormData(form);
    const data = { type: form.dataset.role, submittedAt: new Date().toISOString() };
    for (const key of new Set(fd.keys())) {
      const all = fd.getAll(key);
      data[key] = all.length > 1 ? all : all[0];
    }
    delete data.consent;

    const btn = $(".button-submit", form);
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending…";

    try {
      // Formspree AJAX submission: send the actual form fields as FormData.
      // Do not set Content-Type manually; the browser adds the multipart boundary.
      const payload = new FormData(form);
      payload.delete("consent"); // The checkbox is permission, not a contact detail.
      payload.set("type", data.type);
      payload.set("submittedAt", data.submittedAt);
      payload.set(
        "_subject",
        data.type === "dentist"
          ? `New Dentla dentist request — ${data.clinicName}`
          : `New Dentla lab request — ${data.labName}`
      );

      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" }
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.error || "Formspree submission failed");
      }
      showSuccess(form.dataset.role, data);
      form.reset();
    } catch (err) {
      const cErr = $(".consent-err", form);
      cErr.textContent = "We couldn’t send your request. Check your connection and try again.";
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
});

function showSuccess(role, data) {
  Object.values(forms).forEach(f => (f.hidden = true));
  const who = role === "dentist" ? data.clinicName : data.labName;
  $("#successText").textContent =
    `Thanks. We received the request for ${who}. We’ll contact you at ${data.email} to set up your account.`;
  success.hidden = false;
  success.focus();
}

$("#againBtn").addEventListener("click", () => setRole(join.dataset.role));
