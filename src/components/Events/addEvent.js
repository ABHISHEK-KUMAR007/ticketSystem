import { useContext, useState } from "react";
import web3Context from "../../context/Web3Context.js";

const AddEvent = () => {
  
  const { contract, account, web3 } = useContext(web3Context);

  
  const [eventDetails, setEventDetails] = useState({
    name: "",
    description: "",
    price: 0,
    totalAllottedTickets: 0,
    startingTime: 0,
    endTime: 0,
  });

  
  const handleInputChange = (e) => {
    setEventDetails({
      ...eventDetails,
      [e.target.name]: e.target.value,
    });
  };

  
  const submitEvent = async () => {
    try {
      const { name, description, price, totalAllottedTickets, startingTime, endTime } = eventDetails;
      
      
      const priceInWei = web3.utils.toWei(price.toString(), "ether");

      
      await contract.methods
        .AddEvent(
          name,
          description,
          priceInWei,
          totalAllottedTickets,
          startingTime,
          endTime
        )
        .send({ from: account });

      alert("Event added successfully!");
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event. Check the console for details.");
    }
  };

  return (
    <div className="addEvent">
      <h2>Add Event</h2>
      <form>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={eventDetails.name}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={eventDetails.description}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Price (in ETH):</label>
          <input
            type="number"
            name="price"
            value={eventDetails.price}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Total Tickets:</label>
          <input
            type="number"
            name="totalAllottedTickets"
            value={eventDetails.totalAllottedTickets}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Starting Time (UNIX):</label>
          <input
            type="number"
            name="startingTime"
            value={eventDetails.startingTime}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>End Time (UNIX):</label>
          <input
            type="number"
            name="endTime"
            value={eventDetails.endTime}
            onChange={handleInputChange}
          />
        </div>
        <button type="button" onClick={submitEvent}>
          Add Event
        </button>
      </form>
    </div>
  );
};

export default AddEvent;
