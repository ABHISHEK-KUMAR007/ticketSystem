import React, { useState, useEffect, useContext } from "react";
import Web3Context from "../../context/Web3Context";
import { parseEther, formatEther } from "ethers";
import "./organiser.css";

const Organise = () => {
  const { contractProvider, Account } = useContext(Web3Context);
  const [resaleRequests, setResaleRequests] = useState([]);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    price: "",
    totalTickets: "",
    startingTime: "",
    endTime: "",
  });

  // Fetch resale tickets and created events
  useEffect(() => {
    const fetchResaleRequests = async () => {
      try {
        if (!contractProvider) return;

        // Fetch resale ticket IDs
        const resaleTicketIds = await contractProvider.getResaleTickets();

        // Fetch details for each ticket from ResaleTickets mapping
        const ticketDetails = await Promise.all(
          resaleTicketIds.map(async (tokenId) => {
            const details = await contractProvider.ResaleTickets(tokenId); // Fetch ticket details
            return {
              tokenId: tokenId.toString(),
              price: details.price,
              seller: details.seller,
            };
          })
        );

        setResaleRequests(ticketDetails);
      } catch (error) {
        console.error("Error fetching resale tickets:", error);
      }
    };

    const fetchCreatedEvents = async () => {
      try {
        if (!contractProvider || !Account) return;

        const events = await contractProvider.AllEvents();
        const userEvents = events.filter((event) => event.organiser === Account);
        setCreatedEvents(userEvents);
      } catch (error) {
        console.error("Error fetching created events:", error);
      }
    };

    fetchResaleRequests();
    fetchCreatedEvents();
  }, [contractProvider, Account]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
  };

  const submitNewEvent = async () => {
    try {
      const { name, description, price, totalTickets, startingTime, endTime } = newEvent;

      if (!name || !description || !price || !totalTickets || !startingTime || !endTime) {
        alert("Please fill in all fields.");
        return;
      }

      const tx = await contractProvider.AddEvent(
        name,
        description,
        parseEther(price), // Ensure price is in Wei
        parseInt(totalTickets),
        Math.floor(new Date(startingTime).getTime() / 1000), // Convert to timestamp
        Math.floor(new Date(endTime).getTime() / 1000) // Convert to timestamp
      );

      await tx.wait();
      alert("Event created successfully!");
      setShowEventForm(false);
      setNewEvent({
        name: "",
        description: "",
        price: "",
        totalTickets: "",
        startingTime: "",
        endTime: "",
      });
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event.");
    }
  };

  return (
    <div className="organiser-container">
      <div className="header">
        <button className="create-event-button" onClick={() => setShowEventForm(true)}>
          Create Event
        </button>
      </div>

      {showEventForm && (
        <div className="event-form">
          <div className="form-card">
            <h2>Create New Event</h2>
            <input
              type="text"
              name="name"
              placeholder="Event Name"
              value={newEvent.name}
              onChange={handleInputChange}
            />
            <textarea
              name="description"
              placeholder="Event Description"
              value={newEvent.description}
              onChange={handleInputChange}
            ></textarea>
            <input
              type="number"
              name="price"
              placeholder="Ticket Price (ETH)"
              value={newEvent.price}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="totalTickets"
              placeholder="Total Tickets"
              value={newEvent.totalTickets}
              onChange={handleInputChange}
            />
            <input
              type="datetime-local"
              name="startingTime"
              placeholder="Starting Time"
              value={newEvent.startingTime}
              onChange={handleInputChange}
            />
            <input
              type="datetime-local"
              name="endTime"
              placeholder="Ending Time"
              value={newEvent.endTime}
              onChange={handleInputChange}
            />
            <div className="form-buttons">
              <button onClick={submitNewEvent}>Submit</button>
              <button onClick={() => setShowEventForm(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="content">
        <h2>Your Events</h2>
        {createdEvents.length === 0 ? (
          <p>No events created yet.</p>
        ) : (
          <ul>
            {createdEvents.map((event, index) => (
              <li key={index}>
                <h3>{event.name}</h3>
                <p>{event.description}</p>
                <p>
                  Tickets Remaining: {event.remaining_ticket}/{event.TotalallotedTicket}
                </p>
              </li>
            ))}
          </ul>
        )}

        <h2>Resale Requests</h2>
        {resaleRequests.length === 0 ? (
          <p>No resale requests available.</p>
        ) : (
          <ul>
            {resaleRequests.map((ticket, index) => (
              <li key={index}>
                <p>Ticket ID: {ticket.tokenId}</p>
                <p>Seller: {ticket.seller}</p>
                <p>Price: {formatEther(ticket.price)} ETH</p>
                <button
                  onClick={async () => {
                    try {
                      await contractProvider.GivePermissionToResale(ticket.tokenId);
                      alert("Permission granted!");
                    } catch (error) {
                      console.error("Error granting permission:", error);
                      alert("Failed to grant permission.");
                    }
                  }}
                >
                  Approve Resale
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Organise;
