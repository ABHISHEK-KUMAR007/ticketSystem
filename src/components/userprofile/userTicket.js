import { useEffect, useState, useContext } from "react";
import { parseEther } from "ethers"; // Import only parseEther
import Web3Context from "../../context/Web3Context";
import "./userTicket.css";

const UserTicket = () => {
  const { contractProvider,contractSigner, Account } = useContext(Web3Context);
  const [userEvents, setUserEvents] = useState([]);
  const [ticketIds, setTicketIds] = useState([]);

  useEffect(() => {
    const fetchUserTickets = async () => {
      try {
        if (!Account) {
          console.error("User address is null or undefined.");
          return;
        }

        const fetchedTicketIds = await contractProvider.getOwnedTickets(Account);
        if (!fetchedTicketIds || fetchedTicketIds.length === 0) {
          console.warn("No tickets found for user.");
          return;
        }

        // Convert ticket IDs to numbers if they are returned as BigInts
        const ticketIdsAsNumbers = fetchedTicketIds.map((id) => Number(id));
        setTicketIds(ticketIdsAsNumbers);

        const allEvents = await contractProvider.AllEvents();
        if (!allEvents || allEvents.length === 0) {
          console.warn("No events found in contract.");
          return;
        }

        const userEventDetails = await Promise.all(
          ticketIdsAsNumbers.map(async (ticketId) => {
            const eventIdBigInt = await contractProvider.TokenEvent(ticketId);
            const eventId = Number(eventIdBigInt); // Convert BigInt to number

            if (eventId >= 0 && eventId < allEvents.length) {
              return allEvents[eventId];
            } else {
              console.warn(`Invalid event ID: ${eventId}`);
              return null;
            }
          })
        );

        setUserEvents(userEventDetails.filter((event) => event !== null));
      } catch (error) {
        console.error("Error fetching user tickets:", error);
      }
    };

    fetchUserTickets();
  }, [contractProvider, Account]);

  const handleResale = async (ticketId) => {
    try {
      let price = prompt("Enter the resale price in ETH:");
      if (price) {
        price = price.trim();

        if (isNaN(price) || Number(price) <= 0) {
          alert("Please enter a valid positive number for the price.");
          return;
        }

        const priceInWei = parseEther(price); // Convert to Wei using parseEther
        await contractSigner.saleresaleTicket(ticketId, priceInWei);
        alert(`Ticket #${ticketId} has been put up for resale at ${price} ETH.`);
      }
    } catch (error) {
      console.error("Error during resale:", error);
      alert("Failed to put ticket for resale.");
    }
  };

  return (
    <div className="ticket-container">
      {userEvents.map((event, index) => (
        <div key={index} className="ticket">
          <div className="ticket-header">
            <h3 className="event-name">{event.name}</h3>
            <span className="event-date">
              Date: {new Date(Number(event.startingTime) * 1000).toLocaleDateString()}
            </span>
          </div>
          <div className="ticket-body">
            <p className="event-description">{event.description}</p>
            <p className="event-id">Event ID: {Number(event.Id) - 1}</p> {/* Zero-indexed display */}
          </div>
          <div className="ticket-footer">
            <span className="ticket-id">Ticket ID: {ticketIds[index]}</span>
            <button className="resale-button" onClick={() => handleResale(ticketIds[index])}>
              Resell Ticket
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserTicket;
