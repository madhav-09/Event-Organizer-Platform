import { useState } from "react";
import OrganizerLayout from "../layout/OrganizerLayout";
import Overview from "./organizer/Overview";
import Attendees from "./organizer/Attendees";
import Details from "./organizer/Details";
import Tickets from "./organizer/Tickets";
import Forms from "./organizer/Forms";
import Discounts from "./organizer/Discounts";
import Settings from "./organizer/Settings";
import Addons from "./organizer/Addons";

const OrganizerDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <Overview />;
      case "attendees":
        return <Attendees />;
      case "details":
        return <Details />;
      case "tickets":
        return <Tickets />;
      case "forms":
        return <Forms />;
      case "discounts":
        return <Discounts />;
      case "settings":
        return <Settings />;
      case "add-ons":
        return <Addons />;
      default:
        return <Overview />;
    }
  };

  return (
    <OrganizerLayout
      activeSection={activeSection}
      onSelectSection={setActiveSection}
    >
      {renderContent()}
    </OrganizerLayout>
  );
};

export default OrganizerDashboard;
