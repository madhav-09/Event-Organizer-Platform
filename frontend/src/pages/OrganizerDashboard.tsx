import { useState } from "react";
import OrganizerLayout from "../layout/OrganizerLayout";

import Overview from "./organizer/Overview";
import Attendees from "./organizer/attendees/AttendeesPage";
import MyEvents from "./MyEvents";

const OrganizerDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <Overview />;

      case "events":
        return <MyEvents />;

      case "attendees":
        return <Attendees />;

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
