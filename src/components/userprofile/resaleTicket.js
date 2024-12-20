import React, { useContext, useState, useEffect } from "react";
import web3Context from "../../context/Web3Context";
import "./resaleTicket.css";

const ResaleTicket = () => {
  const { contractProvider, contractSigner, account } = useContext(web3Context);
  const [resaleTickets, setResaleTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchResaleTickets = async () => {
      if (contractProvider) {
        try {
          const tickets = await contractProvider.methods.getResaleTickets().call();
          const ticketsWithDetails = await Promise.all(
            tickets.map(async (ticket) => {
              // Fetch event details based on event ID or token ID if needed
              const eventId = await contractProvider.TokenEvent(ticket.tokenId); // Add .call()
              const eventDetails = await contractProvider.eventsList(eventId - 1); // Add .call()
              return {
                ...ticket,
                eventName: eventDetails.name,
                description: eventDetails.description,
                price: ticket.price,
                seller: ticket.seller,
                approved: ticket.approved,
                tokenId: ticket.tokenId, // Ensure tokenId is included
              };
            })
          );
          setResaleTickets(ticketsWithDetails);
        } catch (error) {
          console.error("Failed to fetch resale tickets", error);
        }
      }
    };
    fetchResaleTickets();
  }, [contractProvider]);

  const handleCardClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseDetail = () => {
    setSelectedTicket(null);
  };

  return (
    <div className="resale-ticket-container">
      {resaleTickets.length === 0 ? (
        <p>No resale tickets available</p>
      ) : (
        <div className="ticket-list">
          {resaleTickets.map((ticket, index) => (
            <div
              key={index}
              className="ticket-card"
              onClick={() => handleCardClick(ticket)}
            >
              <p><strong>Event Name:</strong> {ticket.eventName}</p>
              <p><strong>Price:</strong> {ticket.price} wei</p>
              <p><strong>Approved for Sale:</strong> {ticket.approved ? "Yes" : "No"}</p>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <div className="ticket-detail-overlay">
          <div className="ticket-detail-card">
            <button onClick={handleCloseDetail} className="close-button">X</button>
            <h3>Event Details</h3>
            <p><strong>Seller:</strong> {selectedTicket.seller}</p>
            <p><strong>Event Name:</strong> {selectedTicket.eventName}</p>
            <p><strong>Description:</strong> {selectedTicket.description}</p>
            <p><strong>Price:</strong> {selectedTicket.price} wei</p>
            <p><strong>Approval Status:</strong> {selectedTicket.approved ? "Approved" : "Not Approved"}</p>
            <button
              onClick={async () => {
                try {
                  await contractSigner.BuyResaleTiket(selectedTicket.tokenId).send({ from: account, value: selectedTicket.price });
                  alert("Ticket purchased successfully!");
                } catch (error) {
                  console.error("Failed to buy ticket", error);
                  alert("Purchase failed. Please try again.");
                }
              }}
              className="buy-button"
            >
              Buy Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResaleTicket;
