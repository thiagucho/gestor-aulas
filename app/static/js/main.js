document.addEventListener("DOMContentLoaded", function () {
  const btnPing = document.getElementById("btn-ping");
  const pingResult = document.getElementById("ping-result");

  if (btnPing) {
    btnPing.addEventListener("click", async () => {
      pingResult.textContent = "probando...";
      try {
        const r = await fetch("/ping");
        const j = await r.json();
        pingResult.textContent = j.status + " · " + (j.who || "");
      } catch (e) {
        pingResult.textContent = "error: " + e.message;
      }
    });
  }
});

// reserva form handler (añadir a main.js)
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("reserva-form");
  const msg = document.getElementById("reserva-msg");
  if (!form) return;

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    msg.textContent = "Creando reserva...";

    const aula_id = document.getElementById("reserva-aula").value;
    const usuario_id = document.getElementById("reserva-user").value;
    const inicio = document.getElementById("reserva-inicio").value;
    const fin = document.getElementById("reserva-fin").value;

    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aula_id, usuario_id, inicio, fin }),
      });

      const data = await res.json();
      if (res.status === 201) {
        msg.style.color = "green";
        msg.textContent = `Reserva creada (id ${data.id}).`;
        form.reset();
        // opcional: actualizar lista UI llamando a /aulas o a /reservas
      } else if (res.status === 409) {
        msg.style.color = "#a00";
        msg.textContent = `Conflicto: ${data.message || data.error}`;
      } else {
        msg.style.color = "#a00";
        msg.textContent = data.error || JSON.stringify(data);
      }
    } catch (err) {
      msg.style.color = "#a00";
      msg.textContent = "Error de red: " + err.message;
    }
  });

  document.getElementById("reserva-clear").addEventListener("click", () => {
    form.reset();
    msg.textContent = "";
  });
});
async function cargarReservas() {
  const tbody = document.querySelector("#tabla-reservas tbody");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";

  try {
    const res = await fetch("/api/reservas");
    const data = await res.json();
    tbody.innerHTML = "";
    if (!data.length) {
      tbody.innerHTML = "<tr><td colspan='6'>Sin reservas aún</td></tr>";
      return;
    }

    for (const r of data) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.aula || "-"}</td>
        <td>${r.usuario || "-"}</td>
        <td>${r.inicio}</td>
        <td>${r.fin}</td>
        <td>${r.estado}</td>
      `;
      tbody.appendChild(tr);
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='6'>Error: ${err.message}</td></tr>`;
  }
}

// refrescar automáticamente después de crear reserva
document.addEventListener("DOMContentLoaded", () => {
  cargarReservas();
  const form = document.getElementById("reserva-form");
  if (form) {
    form.addEventListener("submit", () => {
      setTimeout(cargarReservas, 1000);
    });
  }
});
