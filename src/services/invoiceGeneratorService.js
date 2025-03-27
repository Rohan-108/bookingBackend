import PDFDocument from "pdfkit";

/**
 * @description Generate PDF invoice for a trip
 * @param {*} tripDetails
 * @returns {Buffer} PDF file
 */
const createTripInvoice = (tripDetails) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    // Generate PDF content
    generateHeader(doc);
    generateTripSummary(doc, tripDetails);
    generateTripDetailsTable(doc, tripDetails);
    generateFooter(doc);
    // Finalize PDF file
    // Collect PDF data in buffers
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
    // Close the document
    doc.end();
  });
};

const generateHeader = (doc) => {
  doc
    .text("RentIT", 110, 57)
    .fontSize(10)
    .text("RentIT", 200, 50, { align: "right" })
    .text("Janta Colony", 200, 65, { align: "right" })
    .text("Rajouri Garden, West Delhi", 200, 80, { align: "right" })
    .moveDown();
};

//to generate trip summary
const generateTripSummary = (doc, trip) => {
  // Header for trip summary section
  doc.fillColor("#444444").fontSize(18).text("Trip Invoice", 50, 120);

  generateHr(doc, 140);

  // Display car owner, renter (user) and vehicle details
  const summaryTop = 150;
  doc
    .fontSize(10)
    .fillColor("#000")
    // Car Owner Details
    .font("Helvetica-Bold")
    .text("Car Owner:", 50, summaryTop)
    .font("Helvetica")
    .text(trip.carOwner.username || "Owner Name", 130, summaryTop)
    .text(trip.carOwner.email || "Owner Email", 130, summaryTop + 12)
    .moveDown();

  // Renter Details
  doc
    .font("Helvetica-Bold")
    .text("Renter:", 300, summaryTop)
    .font("Helvetica")
    .text(trip.user.username || "User Name", 360, summaryTop)
    .text(trip.user.email || "User Email", 360, summaryTop + 12)
    .moveDown();

  // Vehicle Details
  doc
    .font("Helvetica-Bold")
    .text("Vehicle:", 50, summaryTop + 40)
    .font("Helvetica")
    .text(trip.vehicle.name || "Car Name", 110, summaryTop + 40)
    .text(trip.vehicle.plateNumber || "Car plateNumber", 110, summaryTop + 52)
    .moveDown();

  generateHr(doc, summaryTop + 70);
};

//to generate trip details table
const generateTripDetailsTable = (doc, trip) => {
  // Set starting position for the table
  const tableTop = 230;

  // Table Header
  doc.font("Helvetica-Bold");
  generateTableRow(doc, tableTop, "Field", "Value");
  generateHr(doc, tableTop + 15);
  doc.font("Helvetica");

  // Table rows with trip details. Adjust values based on your actual data.
  let row = tableTop + 25;
  generateTableRow(doc, row, "Booking ID", trip.id);
  generateTableRow(
    doc,
    (row += 20),
    "Start Date",
    formatDate(new Date(trip.startDate || Date.now()))
  );
  generateTableRow(
    doc,
    (row += 20),
    "End Date",
    formatDate(new Date(trip.endDate || Date.now()))
  );
  generateTableRow(doc, (row += 20), "Total Days", trip.noOfDays);
  generateTableRow(doc, (row += 20), "Start Odometer", trip.startOdometer);
  generateTableRow(doc, (row += 20), "Final Odometer", trip.finalOdometer);
  generateTableRow(doc, (row += 20), "Free Kilometer/Day", trip.fixedKilometer);
  generateTableRow(
    doc,
    (row += 20),
    "Distance Travelled",
    `${trip.finalOdometer} - ${trip.startOdometer}=${trip.totalDistance}`
  );
  generateTableRow(
    doc,
    (row += 20),
    "Extra Kilometers",
    `${trip.totalDistance}-${trip.fixedKilometer}*${trip.noOfDays}=${trip.extraKilometer}`
  );
  generateTableRow(
    doc,
    (row += 20),
    "Rate per KM",
    formatCurrency(trip.ratePerKm)
  );
  generateTableRow(
    doc,
    (row += 20),
    "Extra Amount",
    `${trip.extraKilometer} * ${trip.ratePerKm} = ${formatCurrency(
      trip.extraAmount
    )}`
  );
  generateTableRow(
    doc,
    (row += 20),
    "Base Amount",
    formatCurrency(trip.amount)
  );

  // Final Calculation
  generateHr(doc, row + 15);
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    row + 30,
    "Total Amount",
    formatCurrency(trip.totalAmount)
  );
  doc.font("Helvetica");
};

const generateTableRow = (doc, y, field, value) => {
  doc.fontSize(10).text(field, 50, y).text(value, 300, y, { align: "right" });
};

const generateHr = (doc, y) => {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
};

const generateFooter = (doc) => {
  doc.fontSize(10).text("Thank you for using RentIT!", 50, 780, {
    align: "center",
    width: 500,
  });
};

const formatCurrency = (money) => {
  // Assuming amounts are provided in cents; adjust if needed
  return `Rs.${money.toFixed(2)}`;
};

const formatDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}/${month}/${day}`;
};

export default createTripInvoice;
