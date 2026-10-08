export async function downloadReportPdf(element, filename = "report.pdf") {
  if (!element) throw new Error("Report element not found");
  const html2PDF = (await import("jspdf-html2canvas")).default;
  await html2PDF(element, {
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: -window.scrollY,
      logging: false,
    },
    imageType: "image/jpeg",
    imageQuality: 0.98,
    autoResize: true,
    output: filename,
  });
}
