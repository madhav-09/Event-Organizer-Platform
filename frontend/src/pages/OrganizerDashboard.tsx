import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrganizerLayout from "../layout/OrganizerLayout";

import Overview from "./organizer/Overview";
import Attendees from "./organizer/attendees/AttendeesPage";
import MyEvents from "./MyEvents";
import OrganizerProfile from "./organizer/OrganizerProfile";
import Tickets from "./organizer/Tickets";
import Discounts from "./organizer/Discounts";
import Waitlist from "./organizer/Waitlist";
import EmailBlast from "./organizer/EmailBlast";
import Agenda from "./organizer/Agenda";
import Speakers from "./organizer/Speakers";
import Survey from "./organizer/Survey";
import Certificates from "./organizer/Certificates";

const VALID_SECTIONS = [
  "overview", "events", "attendees", "profile",
  "tickets", "discounts", "waitlist",
  "email-blast", "agenda", "speakers", "survey", "certificates",
];

const OrganizerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathSection = location.pathname.split("/").pop();
  const initialSection = VALID_SECTIONS.includes(pathSection || "") ? pathSection : "overview";

  const [activeSection, setActiveSection] = useState(initialSection as string);

  useEffect(() => {
    if (VALID_SECTIONS.includes(pathSection || "") && pathSection !== activeSection) {
      setActiveSection(pathSection as string);
    }
  }, [pathSection]);

  const handleSelectSection = (section: string) => {
    setActiveSection(section);
    navigate(`/organizer/dashboard/${section}`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview": return <Overview />;
      case "events": return <MyEvents />;
      case "attendees": return <Attendees />;
      case "profile": return <OrganizerProfile />;
      case "tickets": return <Tickets />;
      case "discounts": return <Discounts />;
      case "waitlist": return <Waitlist />;
      case "email-blast": return <EmailBlast />;
      case "agenda": return <Agenda />;
      case "speakers": return <Speakers />;
      case "survey": return <Survey />;
      case "certificates": return <Certificates />;
      default: return <Overview />;
    }
  };

  return (
    <OrganizerLayout
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
    >
      {renderContent()}
    </OrganizerLayout>
  );
};

export default OrganizerDashboard;
