import { useContext, useEffect } from "react";
import { PDFDocument, rgb ,StandardFonts} from "pdf-lib";
import QRCode from "qrcode";
import { formatEther, parseEther } from "ethers";
import Web3Context from "../../context/Web3Context.js";
import "./printEvent.css";

const BuyTicket = ({ eventId, account, contract }) => {
  const { contractSigner, contractProvider, web3 } = useContext(Web3Context);

  const ProcessbuyTicket = async () => {
    try {
      console.log("eventId:", eventId);
      const eventDetails = await contractProvider.eventsList(eventId);
      const dynamicPrice = await contractProvider.calculateDynamicPrice(eventDetails.price, eventDetails.TotalallotedTicket, eventDetails.remaining_ticket, 10);
      
      const receipt = await contractSigner.buyTicket(eventId, {
        from: account,
        value: dynamicPrice.toString(),
      });
  
      console.log("Transaction receipt:", receipt);
      generatePDF(eventDetails);
    } catch (error) {
      console.error("Error in booking ticket:", error);
      alert(`Error in booking ticket of ID: ${eventId}: ${error.message || error}`);
    }
  };
  

  useEffect(() => {
    if (eventId) {
      ProcessbuyTicket();
    }
  }, [eventId]);

  const generatePDF = async (eventDetails, account) => {
    const pageWidth = 600; // Width in points
    const pageHeight = 400;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
    // Title Styling
    // Title Styling
page.drawText(`Event Details`, {
  x: 50, 
  y: 420, 
  size: 24, 
  color: rgb(0, 0.3, 0.6), 
  font: boldFont
});

// Event Name
page.drawText(`Event Name:`, { 
  x: 50, 
  y: 380, 
  size: 18, 
  color: rgb(0.2, 0.2, 0.7),
  font: boldFont 
});
page.drawText(`${eventDetails[1]}`, { 
  x: 160, 
  y: 380, 
  size: 18, 
  color: rgb(0, 0, 0), 
  font: regularFont 
});

// Description
page.drawText(`Description:`, { 
  x: 50, 
  y: 340, 
  size: 16, 
  color: rgb(0.2, 0.2, 0.7),
  font: boldFont 
});
page.drawText(`${eventDetails[2]}`, { 
  x: 160, 
  y: 340, 
  size: 16, 
  color: rgb(0, 0, 0),
  font: regularFont 
});

// Price
page.drawText(`Price:`, { 
  x: 50, 
  y: 300, 
  size: 16, 
  color: rgb(0.2, 0.2, 0.7),
  font: boldFont 
});
page.drawText(`${formatEther(eventDetails[3])} ETH`, { 
  x: 160, 
  y: 300, 
  size: 16, 
  color: rgb(0, 0, 0),
  font: regularFont 
});

// Total Tickets
page.drawText(`Total Tickets:`, { 
  x: 50, 
  y: 260, 
  size: 16, 
  color: rgb(0.2, 0.2, 0.7),
  font: boldFont 
});
page.drawText(`${eventDetails[4]}`, { 
  x: 160, 
  y: 260, 
  size: 16, 
  color: rgb(0, 0, 0),
  font: regularFont 
});

// Line Separator
page.drawLine({
  start: { x: 50, y: 240 },
  end: { x: 500, y: 240 },
  thickness: 1,
  color: rgb(0.2, 0.2, 0.2)
});

  
    // QR Code Generation
    const qrValue = `Event ID: ${eventDetails[0]}\nTicket Holder: ${account}`;
    const qrCodeCanvas = document.createElement("canvas");
  
    await QRCode.toCanvas(qrCodeCanvas, qrValue); // Await QR code generation
    const qrImageData = qrCodeCanvas.toDataURL("image/png");
    const qrImage = await pdfDoc.embedPng(qrImageData);
    page.drawImage(qrImage, { x: 400, y: 200, width: 150, height: 150 });
  
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket_${eventDetails[0]}.pdf`;
    document.body.appendChild(a); // Append the link to the document for it to work in all browsers
    a.click();
    URL.revokeObjectURL(url);
    a.remove(); // Remove the link after downloading
  };

  return <></>;
};

export default BuyTicket;
