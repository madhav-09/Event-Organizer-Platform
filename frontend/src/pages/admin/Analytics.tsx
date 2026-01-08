import { useEffect, useState } from "react";
import api from "../../services/api"

const Analytics = () => {
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    api.get("/admin/analytics/revenue").then(res => {
      setRevenue(res.data.total_revenue);
    });
  }, []);

  return (
    <>
      <h2>Analytics</h2>
      <h3>Total Revenue: ₹{revenue}</h3>
    </>
  );
};

export default Analytics;
