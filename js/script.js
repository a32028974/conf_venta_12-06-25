const URL = 'https://script.google.com/macros/s/AKfycbxT6imc7LuSZUFIyPNXOrgnXoyLQzytzr-thNI4cylyg1s8Ms19dT2xv-okCCbdsZLWoA/exec';
let filaSeleccionada = null;

document.addEventListener('DOMContentLoaded', () => {
  const hoy = new Date();
  document.getElementById("fechaActual").innerText = hoy.toLocaleDateString("es-AR") + " " + hoy.toLocaleTimeString("es-AR");

  document.getElementById("codigo").addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscarArticulo();
  });

  document.getElementById("vendedor").addEventListener("keydown", (e) => {
    if (e.key === "Enter") registrarVenta();
  });

  // Recuperar último vendedor guardado
  const vendedorGuardado = localStorage.getItem("ultimoVendedor");
  if (vendedorGuardado) {
    document.getElementById("vendedor").value = vendedorGuardado;
  }
});

async function buscarArticulo() {
  const codigo = document.getElementById('codigo').value.trim();
  if (!codigo) return mostrarAviso("⚠️ Ingresá un código.");

  const response = await fetch(`${URL}?codigo=${codigo}`);
  const data = await response.json();
  mostrarResultados(data, codigo);
}

function mostrarResultados(data, codigoBuscado) {
  const contenedor = document.getElementById('resultados');
  if (data.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron resultados.</p>";
    filaSeleccionada = null;
    return;
  }

  const headers = ["✔", "N° ANT", "MARCA", "MODELO", "COLOR", "ARMAZON", "CALIBRE", "FECHA DE", "VENDEDOR"];
  let html = "<table><thead><tr>";
  headers.forEach(header => html += `<th>${header}</th>`);
  html += "</tr></thead><tbody>";

  data.forEach(fila => {
    const filaIndex = fila[8];
    const codigoFila = fila[0]?.toString().toLowerCase();
    const codigoBuscadoLower = codigoBuscado.toLowerCase();
    const checked = (codigoFila === codigoBuscadoLower) ? "checked" : "";

    if (checked) filaSeleccionada = filaIndex;

    html += "<tr>";
    html += `<td><input type="radio" name="seleccion" value="${filaIndex}" ${checked} onchange="filaSeleccionada=${filaIndex}"></td>`;
    html += `<td>${fila[0]}</td><td>${fila[1]}</td><td>${fila[3]}</td><td>${fila[4]}</td><td>${fila[6]}</td><td>${fila[7]}</td><td>${fila[10]}</td><td>${fila[11]}</td>`;
    html += "</tr>";
  });

  html += "</tbody></table>";
  contenedor.innerHTML = html;
}

async function registrarVenta() {
  const vendedor = document.getElementById('vendedor').value.trim();
  if (!vendedor) return mostrarAviso("⚠️ Ingresá el nombre del vendedor.");
  if (filaSeleccionada === null) return mostrarAviso("⚠️ Seleccioná un artículo.");

  localStorage.setItem("ultimoVendedor", vendedor);

  const response = await fetch(`${URL}?fila=${filaSeleccionada}&vendedor=${encodeURIComponent(vendedor)}`);
  const result = await response.json();

  if (result.success) {
    mostrarAviso("✅ Venta registrada correctamente.");
    buscarArticulo();
    // NO borra el vendedor para que quede recordado
  } else {
    mostrarAviso("❌ Error al registrar la venta.");
  }
}

async function eliminarVenta() {
  if (filaSeleccionada === null) return mostrarAviso("⚠️ Seleccioná un artículo para eliminar la venta.");

  const confirmar = confirm("¿Estás seguro de que querés eliminar esta venta?");
  if (!confirmar) return;

  const response = await fetch(`${URL}?fila=${filaSeleccionada}&borrar=true`);
  const result = await response.json();

  if (result.success) {
    mostrarAviso("🗑️ Venta eliminada correctamente.");
    buscarArticulo();
  } else {
    mostrarAviso("❌ Error al eliminar la venta.");
  }
}

function mostrarAviso(mensaje) {
  let aviso = document.getElementById("avisoFlotante");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "avisoFlotante";
    aviso.style.position = "fixed";
    aviso.style.bottom = "20px";
    aviso.style.left = "50%";
    aviso.style.transform = "translateX(-50%)";
    aviso.style.color = "#fff";
    aviso.style.padding = "12px 20px";
    aviso.style.borderRadius = "8px";
    aviso.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
    aviso.style.zIndex = "9999";
    aviso.style.fontWeight = "bold";
    document.body.appendChild(aviso);
  }

  aviso.textContent = mensaje;

  if (mensaje.includes("✅")) {
    aviso.style.background = "#28a745";
  } else if (mensaje.includes("❌")) {
    aviso.style.background = "#dc3545";
  } else if (mensaje.includes("🗑️")) {
    aviso.style.background = "#6c757d";
  } else {
    aviso.style.background = "#333";
  }

  aviso.style.display = "block";

  setTimeout(() => {
    aviso.style.display = "none";
  }, 2000);
}
