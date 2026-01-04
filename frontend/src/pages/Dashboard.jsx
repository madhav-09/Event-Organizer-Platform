import { useAuth } from "../auth/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <h1>{user.role} Dashboard</h1>
    </>
  );
};

export default Dashboard;
