(() => {
  "use strict";

  // Personalize this number before publishing. Use country code and digits only, e.g. 62812xxxxxxx.
  // Leave empty to let the birthday girl choose a WhatsApp recipient manually.
  const WHATSAPP_NUMBER = "";
  const STORAGE_KEY = "birthdayLittleWorldDatePlan";
  const byId = (id) => document.getElementById(id);
  const gate = byId("opening_gate");
  const envelopeWrap = document.querySelector(".envelope_wrap");
  const confettiLayer = byId("confetti_layer");
  const musicToggle = byId("music_toggle");
  const musicPanel = byId("music_panel");
  const musicIframe = byId("youtube_iframe");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function localISODate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function setDateMinimums() {
    const today = localISODate();
    const input = byId("date_plan");
    if (input) input.min = today;
  }

  function launchConfetti(amount = 24) {
    if (!confettiLayer || reduceMotion) return;
    const symbols = ["✿", "✦", "♡", "·", "✧"];
    const colors = ["#d2b65d", "#8fa37a", "#d9aaa3", "#c8a6c8", "#b59a56"];
    for (let i = 0; i < amount; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti_piece";
      piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty("--drift", `${Math.round(Math.random() * 180 - 90)}px`);
      piece.style.animationDelay = `${Math.random() * 0.65}s`;
      piece.style.fontSize = `${12 + Math.random() * 14}px`;
      piece.style.color = colors[Math.floor(Math.random() * colors.length)];
      confettiLayer.appendChild(piece);
      window.setTimeout(() => piece.remove(), 3400);
    }
  }

  function enableRevealAnimations() {
    const revealItems = document.querySelectorAll(".reveal_left, .reveal_right");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is_revealed"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is_revealed");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  // Start the hidden YouTube player without opening the visual music panel.
  // The iframe is loaded during the envelope click, which is the user's gesture.
  function startBackgroundMusic() {
    if (!musicIframe || !musicIframe.dataset.src) return false;

    const currentSrc = musicIframe.getAttribute("src");
    if (!currentSrc || currentSrc === "about:blank") {
      musicIframe.src = musicIframe.dataset.src;
    }

    // Keep the music icon animated while the music player remains loaded.
    musicToggle?.classList.add("is_active");
    musicToggle?.setAttribute("aria-label", "Buka pemutar musik Kereta Kencan dari HiVi!");
    return true;
  }

  function openSurprise() {
    const openButton = byId("open_surprise");
    if (openButton) openButton.disabled = true;
    envelopeWrap?.classList.add("is_open");
    launchConfetti(12);
    startBackgroundMusic();
    window.setTimeout(
      () => {
        gate?.classList.add("is_open");
        document.body.classList.remove("gate_open");
        enableRevealAnimations();
        window.setTimeout(() => gate?.remove(), reduceMotion ? 0 : 720);
      },
      reduceMotion ? 0 : 1350,
    );
  }

  byId("open_surprise")?.addEventListener("click", openSurprise);
  document.body.classList.add("gate_open");

  // Love-note cards reveal their Indonesian message when tapped.
  document.querySelectorAll(".love_note").forEach((card) => {
    const reveal = card.querySelector(".note_reveal");
    card.addEventListener("click", () => {
      const expanded = card.getAttribute("aria-expanded") === "true";
      card.setAttribute("aria-expanded", String(!expanded));
      card.classList.toggle("is_expanded", !expanded);
      if (reveal) {
        reveal.textContent = expanded ? "" : card.dataset.note || "Sedikit cinta ekstra buat kamu. ♡";
        reveal.setAttribute("aria-hidden", String(expanded));
      }
      if (!expanded) launchConfetti(7);
    });
  });

  // The floating music icon opens the visual player; closing it never stops the song.
  function openMusicPanel() {
    if (!musicPanel || !musicToggle || !musicIframe) return;
    startBackgroundMusic();
    musicPanel.classList.add("is_open");
    musicPanel.setAttribute("aria-hidden", "false");
    musicToggle.classList.add("is_active");
    musicToggle.setAttribute("aria-expanded", "true");
  }

  function closeMusicPanel() {
    if (!musicPanel || !musicToggle) return;
    musicPanel.classList.remove("is_open");
    musicPanel.setAttribute("aria-hidden", "true");
    // Keep the audio iframe loaded in the background. Hiding this panel is visual only.
    musicToggle.setAttribute("aria-expanded", "false");
  }

  musicToggle?.addEventListener("click", () => {
    if (musicPanel?.classList.contains("is_open")) closeMusicPanel();
    else openMusicPanel();
  });
  byId("music_close")?.addEventListener("click", closeMusicPanel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMusicPanel();
  });

  function readSaved(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function writeSaved(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function clearSaved(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  function formatDate(isoDate) {
    if (!isoDate) return "Belum pilih tanggal nih";
    const parsed = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(parsed);
  }

  function restoreVouchers() {
    const saved = readSaved(STORAGE_KEY);
    const dateInput = byId("date_plan");
    const giftInput = byId("gift_choice");
    if (saved?.date && dateInput) dateInput.value = saved.date;
    if (saved?.gift && giftInput && [...giftInput.options].some((option) => option.value === saved.gift)) {
      giftInput.value = saved.gift;
    }
    renderSummary();
  }

  function handleVoucherSubmit(event) {
    event.preventDefault();
    const date = byId("date_plan")?.value || "";
    const gift = byId("gift_choice")?.value || "Skincare";
    const feedback = byId("voucher_feedback");
    if (!date) {
      if (feedback) feedback.textContent = "Pilih satu tanggal dulu yaa, birthday girl. Marugame lanjut es krim, semuanya di hari yang sama! ♡";
      byId("date_plan")?.focus();
      return;
    }
    if (date < localISODate()) {
      if (feedback) feedback.textContent = "Eits, tanggalnya jangan yang udah lewat dong 😭 pilih hari ini atau setelahnya yaa.";
      byId("date_plan")?.focus();
      return;
    }

    const savedSuccessfully = writeSaved(STORAGE_KEY, {
      type: "full_date",
      title: "Marugame + Ice Cream Date 🍜🍦",
      date,
      gift,
    });
    renderSummary();
    if (feedback) {
      feedback.textContent = savedSuccessfully
        ? "Yeayyy! Date kita udah kesimpan 💛 Satu hari, udon dulu terus es krim. Tinggal cocok-cocokin lagi yaa. ♡"
        : "Tanggalnya udah dipilih, tapi browser ini nggak bisa nyimpen. Jangan refresh dulu yaa.";
    }
    launchConfetti(18);
  }

  byId("voucher_form")?.addEventListener("submit", handleVoucherSubmit);

  function renderSummary() {
    const container = byId("summary_lines");
    if (!container) return;
    const saved = readSaved(STORAGE_KEY);
    container.replaceChildren();
    if (!saved?.date) {
      const empty = document.createElement("p");
      empty.className = "summary_empty";
      empty.textContent = "Tanggal date kita belum dipilih nih, cutie ✿";
      container.appendChild(empty);
      return;
    }

    const line = document.createElement("div");
    line.className = "summary_line";
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = "Marugame + Ice Cream Date 🍜🍦";
    const detail = document.createElement("span");
    detail.textContent = `${formatDate(saved.date)} · Marugame lanjut es krim di hari yang sama · pilihan hadiah: ${saved.gift || "Skincare"} · jangan mahal-mahal yaa 😭💛`;
    const icon = document.createElement("span");
    icon.className = "summary_icon";
    icon.textContent = "🍜🍦🎁";
    icon.setAttribute("aria-hidden", "true");
    copy.append(title, detail);
    line.append(copy, icon);
    container.appendChild(line);
  }

  byId("send_choices")?.addEventListener("click", () => {
    const saved = readSaved(STORAGE_KEY);
    const feedback = byId("summary_feedback");
    if (!saved?.date) {
      if (feedback) feedback.textContent = "Pilih dan simpan tanggalnya dulu yaa, biar aku nggak ngajak date ke dimensi lain. ♡";
      byId("date_plan")?.focus();
      return;
    }

    const lines = [
      "HAAAIII! Aku udah pilih date kita nih 🎀",
      "",
      "🍜🍦 Marugame + Ice Cream Date",
      `Tanggal: ${formatDate(saved.date)}`,
      "🍦 Agenda: Marugame dulu, terus lanjut es krim di hari yang sama.",
      `🎁 Pilihan hadiah: ${saved.gift || "Skincare"}`,
      "Note dari pacar: jangan mahal-mahal yaaa 😭💛 Dompet aku juga pengin tetap bahagia hehe. ♡",
      "",
      "Siapin perut dan waktu buat quality time sama aku! Makasih, birthday girl. ♡",
    ];
    const url = WHATSAPP_NUMBER.trim() ? `https://wa.me/${WHATSAPP_NUMBER.trim()}?text=${encodeURIComponent(lines.join("\n"))}` : `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
    if (feedback) {
      feedback.textContent = WHATSAPP_NUMBER.trim() ? "WhatsApp kebuka dengan pesannya. Cek dulu, terus pencet Send yaa! ♡" : "WhatsApp kebuka nih. Pilih chat aku, terus kirim pesannya yaa. ♡";
    }
    window.open(url, "_blank", "noopener,noreferrer");
  });

  byId("replay_story")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    launchConfetti(12);
  });

  const backToTop = byId("back_to_top");
  window.addEventListener(
    "scroll",
    () => {
      backToTop?.classList.toggle("is_visible", window.scrollY > 650);
    },
    { passive: true },
  );
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  setDateMinimums();
  restoreVouchers();
  renderSummary();
})();
