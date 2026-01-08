import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <>
      <h1>Admin Dashboard</h1>

      <ul>
        <li><Link to="/admin/organizers">Organizers</Link></li>
        <li><Link to="/admin/events">Events</Link></li>
        <li><Link to="/admin/analytics">Analytics</Link></li>
      </ul>
    </>
  );
};

export default AdminDashboard;
