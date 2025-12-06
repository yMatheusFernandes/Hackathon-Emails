import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportDashboardPDF() {
  const element = document.getElementById("dashboard-content");

  if (!element) {
    alert("Elemento do Dashboard não encontrado!");
    return;
  }

  // Aguarda fontes carregarem (ESSENCIAL)
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  // Pequeno delay para garantir layout estável
  await new Promise((resolve) => setTimeout(resolve, 150));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",

    // ESSENCIAL para não cortar texto
    removeContainer: false,
    scrollX: 0,
    scrollY: -window.scrollY,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  // Ajusta imagem dentro do PDF
  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);

  pdf.save("dashboard.pdf");
}
