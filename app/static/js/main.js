document.addEventListener("DOMContentLoaded", function(){
  const btnPing = document.getElementById("btn-ping");
  const pingResult = document.getElementById("ping-result");

  if(btnPing){
    btnPing.addEventListener("click", async () => {
      pingResult.textContent = "probando...";
      try {
        const r = await fetch("/ping");
        const j = await r.json();
        pingResult.textContent = j.status + " · " + (j.who || "");
      } catch(e){
        pingResult.textContent = "error: " + e.message;
      }
    });
  }
});
