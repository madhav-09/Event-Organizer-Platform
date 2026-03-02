import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrganizerLayout from "../layout/OrganizerLayout";

import Overview from "./organizer/Overview";
import Attendees from "./organizer/attendees/AttendeesPage";
import MyEvents from "./MyEvents";
import OrganizerProfile from "./organizer/OrganizerProfile";

const OrganizerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get section from URL (e.g. /organizer/dashboard/attendees -> "attendees")
  // Default to overview if undefined
  const pathSection = location.pathname.split("/").pop();
  const validSections = ["overview", "events", "attendees", "profile"];
  const initialSection = validSections.includes(pathSection || "") ? pathSection : "overview";

  const [activeSection, setActiveSection] = useState(initialSection as string);

  useEffect(() => {
    if (validSections.includes(pathSection || "") && pathSection !== activeSection) {
      setActiveSection(pathSection as string);
    }
  }, [pathSection]);

  const handleSelectSection = (section: string) => {
    setActiveSection(section);
    navigate(`/organizer/dashboard/${section}`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <Overview />;

      case "events":
        return <MyEvents />;

      case "attendees":
        return <Attendees />;

      case "profile":
        return <OrganizerProfile />;

      default:
        return <Overview />;
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
