import { useContext, useState, useEffect } from "react";
import Web3Context from "../../context/Web3Context.js";
import BuyTicket from "./BuyTicket.js";
import "./printEvent.css";
import * as ethers from "ethers";
import { formatEther, parseEther } from "ethers";
const PrintEvent = () => {
  const { Account,contractProvider,contractSigner, web3 } = useContext(Web3Context);
  console.log("Fetched ccc:", contractProvider);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [buyingTicket, setBuyingTicket] = useState(false);

  
  const FetchEvents = async () => {
    try {
      const eventsList = await contractProvider.AllEvents();
      console.log(eventsList);
      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  useEffect(() => {
    console.log("Checking contractProvider in PrintEvent:", contractProvider);
    if (contractProvider && typeof contractProvider.AllEvents === "function") {
      console.log("web3: ",web3);
      FetchEvents();
    } else {
      console.log("Contract could not fetch: contractProvider not ready or missing methods.");
    }
  }, [contractProvider]);
  

  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setBuyingTicket(false);
  };

  const handleBuyTicket = (event) => {

    setSelectedEvent(event);
    setBuyingTicket(true);
  };

  return (
    <div>
      <h2>Events</h2>
      <div className="event-list">
        {events.length > 0 ? (
          events.map((event, index) => {
            console.log("Event Object:", event); // Add this to inspect the structure
            return (
              <div 
                key={index} 
                className="event-card" 
                onClick={() => handleCardClick(event)}
              >
                <h3>{event.name}</h3>
                <h3>{event.description}</h3>
                <p>Price: {formatEther(event.price)} WEI</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyTicket(event);
                  }}
                >
                  Buy Ticket
                </button>
              </div>
            )
          })
          
        ) : (
          <p>No events found</p>
        )}
      </div>

      {selectedEvent && !buyingTicket && (
  <div className="event-overlay">
    <div className="event-details-modal">
      <button className="close-button" onClick={() => setSelectedEvent(null)}>×</button>
      <h3>Event Details</h3>
      <p><strong>Name:</strong> {selectedEvent.name}</p>
      <p><strong>Description:</strong> {selectedEvent.description}</p>
      <p><strong>Price:</strong> {formatEther(selectedEvent.price)} ETH</p>
      <p><strong>Total Tickets:</strong> {selectedEvent[4] ||"N/A"}</p>
      <p><strong>remaining  Tickets:</strong> {selectedEvent[5]||"N/A"}</p>
      <p><strong>Start Time:</strong> {new Date(Number(selectedEvent.startingTime) * 1000).toLocaleString()}</p>
      <p><strong>End Time:</strong> {new Date(Number(selectedEvent.endTime) * 1000).toLocaleString()}</p>
    </div>
  </div>
)}


{buyingTicket && selectedEvent && (
        <BuyTicket 
          eventId={selectedEvent.Id} 
          account={Account} 
          contractSigner={contractSigner} 
          contractProvider={contractProvider} 
        />
      )}
    </div>
  );
};

export default PrintEvent;
