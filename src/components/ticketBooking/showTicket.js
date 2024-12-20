import { useContext, useEffect, useState } from "react";
import web3Context from "../../context/Web3Context.js";

const ShowTicket = () => {
    const { account, contract } = useContext(web3Context);
    const [tickets, setTickets] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchTickets = async () => {
            if (contract) {
                const ownedTicketIds = await contract.methods.getOwnedTickets(account).call();
                const eventDetails = await Promise.all(ownedTicketIds.map(async (id) => {
                    const eventId = await contract.methods.TokenEvent(id).call();
                    const eventDetail = await contract.methods.eventsList(eventId - 1).call();
                    return {
                        id,
                        name: eventDetail[1], 
                        description: eventDetail[2], 
                        price: eventDetail[3], 
                    };
                }));

                setTickets(ownedTicketIds);
                setEvents(eventDetails);
            }
        };

        fetchTickets();
    }, [account, contract]);

    return (
        <div>
            <h2>Your Tickets</h2>
            <div className="ticket-cards">
                {events.map((event, index) => (
                    <div key={index} className="ticket-card">
                        <h3>{event.name}</h3>
                        <p>{event.description}</p>
                        
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShowTicket;
