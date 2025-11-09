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
