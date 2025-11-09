// app/static/js/main.js
// Consolidated script: ping, reserva form, cargar reservas, botones Reservar/Detalles, borrar reserva.

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, json: JSON.parse(text) };
  } catch (e) {
    return { ok: res.ok, status: res.status, text };
  }
}

async function cargarReservas() {
  const tbody = document.querySelector("#tabla-reservas tbody");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='7'>Cargando...</td></tr>";

  try {
    const r = await fetch("/api/reservas");
    if (!r.ok) throw new Error("HTTP " + r.status);
    const data = await r.json();
    tbody.innerHTML = "";
    if (!data.length) {
      tbody.innerHTML = "<tr><td colspan='7'>Sin reservas aún</td></tr>";
      return;
    }

    for (const item of data) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.aula || "-"}</td>
        <td>${item.usuario || "-"}</td>
        <td>${item.inicio}</td>
        <td>${item.fin}</td>
        <td>${item.estado}</td>
        <td>
          <button class="btn-ghost borrar" data-id="${
            item.id
          }" title="Eliminar reserva ${item.id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // attach delete handlers (after rows exist)
    tbody.querySelectorAll(".borrar").forEach((btn) => {
      btn.addEventListener("click", async (ev) => {
        const id = ev.currentTarget.dataset.id;
        if (!confirm(`¿Eliminar reserva ${id}?`)) return;
        try {
          const res = await fetch(`/api/reservas/${id}`, { method: "DELETE" });
          if (res.ok) {
            cargarReservas();
          } else {
            const txt = await res.text();
            alert("Error al eliminar: " + (txt || res.status));
          }
        } catch (err) {
          alert("Error de red al eliminar: " + err.message);
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='7'>Error cargando reservas: ${err.message}</td></tr>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // --- Ping backend ---
  const btnPing = document.getElementById("btn-ping");
  const pingResult = document.getElementById("ping-result");
  if (btnPing) {
    btnPing.addEventListener("click", async () => {
      if (pingResult) pingResult.textContent = "probando...";
      try {
        const r = await fetch("/ping");
        const j = await r.json();
        if (pingResult)
          pingResult.textContent = (j.status || "ok") + " · " + (j.who || "");
      } catch (e) {
        if (pingResult) pingResult.textContent = "error: " + e.message;
      }
    });
  }

  // --- Form handler ---
  const form = document.getElementById("reserva-form");
  const msg = document.getElementById("reserva-msg");
  if (form) {
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (msg) {
        msg.style.color = "";
        msg.textContent = "Creando reserva...";
      }

      const aula_id = document.getElementById("reserva-aula").value;
      const usuario_id = document.getElementById("reserva-user").value;
      const inicio = document.getElementById("reserva-inicio").value;
      const fin = document.getElementById("reserva-fin").value;

      // Validación sencilla de fechas
      if (!inicio || !fin) {
        if (msg) {
          msg.style.color = "#a00";
          msg.textContent = "Inicio y fin son obligatorios.";
        }
        return;
      }

      const startHour = new Date(inicio).getHours();
      const endHour = new Date(fin).getHours();
      if (startHour < 6 || endHour < 6) {
        if (msg) {
          msg.style.color = "#a00";
          msg.textContent =
            "No se pueden reservar aulas entre las 00:00 y las 06:00.";
        }
        return;
      }

      try {
        const res = await fetch("/api/reservas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aula_id, usuario_id, inicio, fin }),
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { raw: text };
        }

        if (res.status === 201) {
          if (msg) {
            msg.style.color = "green";
            msg.textContent = `Reserva creada (id ${data.id}).`;
          }
          form.reset();
          setTimeout(cargarReservas, 700);
        } else if (res.status === 409) {
          if (msg) {
            msg.style.color = "#a00";
            msg.textContent = `Conflicto: ${
              data.message || data.error || text
            }`;
          }
        } else {
          if (msg) {
            msg.style.color = "#a00";
            msg.textContent = data.error || JSON.stringify(data) || text;
          }
        }
      } catch (err) {
        if (msg) {
          msg.style.color = "#a00";
          msg.textContent = "Error de red: " + err.message;
        }
      }
    });

    const clearBtn = document.getElementById("reserva-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        form.reset();
        if (msg) msg.textContent = "";
      });
    }
  }

  // --- Botones Reservar / Detalles en las cards ---
  // reservar-btn: any button with attribute data-aula
  document.querySelectorAll("button[data-aula]").forEach((btn) => {
    // reservar behavior on btn-primary, detalles on btn-ghost
    btn.addEventListener("click", (e) => {
      const aulaId = btn.getAttribute("data-aula");
      const isReservar = btn.classList.contains("btn-primary");
      const isDetalles = btn.classList.contains("btn-ghost");

      if (isReservar) {
        const select = document.getElementById("reserva-aula");
        if (select) select.value = aulaId;
        const formEl = document.getElementById("reserva-form");
        if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
        const inicioInput = document.getElementById("reserva-inicio");
        if (inicioInput) inicioInput.focus();
        return;
      }

      if (isDetalles) {
        // fetch /aulas could be used, but for now show a simple modal/alert
        const card = btn.closest(".card");
        const aulaName = card
          ? card.querySelector("h3")
            ? card.querySelector("h3").innerText
            : "Aula " + aulaId
          : "Aula " + aulaId;
        // try to display simple details by calling backend /aulas and matching id
        (async () => {
          try {
            const r = await fetch("/aulas");
            if (!r.ok) throw new Error("HTTP " + r.status);
            const text = await r.text();
            // if /aulas returns JSON replace the alert with better UI; fallback to simple alert
            try {
              const json = JSON.parse(text);
              const found = json.find((a) => String(a.id) === String(aulaId));
              if (found) {
                alert(
                  `${found.nombre}\nCapacidad: ${found.capacidad}\nUbicación: ${
                    found.ubicacion || "-"
                  }`
                );
                return;
              }
            } catch (e) {
              /* ignore JSON parse error */
            }
            alert("Detalles de " + aulaName + "\n(Información no disponible)");
          } catch (err) {
            alert("No se pudieron cargar detalles: " + err.message);
          }
        })();
        return;
      }
    });
  });

  // Inicializar la tabla de reservas al cargar la página
  cargarReservas();
});
