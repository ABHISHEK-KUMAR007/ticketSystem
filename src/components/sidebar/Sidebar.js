import React, { useState } from 'react';
import './Sidebar.css'; 
import Wallet from '../../wallet/Wallet';
import Organise from '../Events/organiser.js';
import PrintEvent from "../Events/printEvent.js";
import UserTicket from "../userprofile/userTicket.js"
import ResaleTicket from '../userprofile/resaleTicket.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
  // State to track the active component
  const [activeComponent, setActiveComponent] = useState("Home");

  // Function to render the selected component
  const renderContent = () => {
    switch (activeComponent) {
      case "Home":
        return <PrintEvent />;
      case "YourTicket":
        return <UserTicket />;
      case "ResaleTicket":
        return <ResaleTicket />;
      case "Organise":
        return <Organise />;
      default:
        return <PrintEvent />;
    }
  };

  return (
    <div>
      <nav>
        <div className="logo">BookTicket</div>
        <input type="checkbox" id="click" />
        <label htmlFor="click" className="menu-btn">
          <FontAwesomeIcon icon={faBars} />
        </label>
        <ul>
          <li><a className={activeComponent === "Home" ? "active" : ""} onClick={() => setActiveComponent("Home")}>Home</a></li>
          <li><a onClick={() => setActiveComponent("UpcomingEvent")}>Upcoming Event</a></li>
          <li><a onClick={() => setActiveComponent("ResaleTicket")}>resale Ticket</a></li>
          <li><a onClick={() => setActiveComponent("YourTicket")}>Your Ticket</a></li>
          <li><a onClick={() => setActiveComponent("Organise")}>Organise</a></li>
          {/* <li><a onClick={() => setActiveComponent("Feedback")}>Feedback</a></li> */}
        </ul>
        <div className="wallet">
          <Wallet />
        </div>
      </nav>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}

export default Sidebar;
