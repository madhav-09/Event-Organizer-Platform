import { useEffect, useState } from "react";
import api from "../../services/api";

type Organizer = {
  _id: string;
  brand_name: string;
  kyc_status: string;
};

const Organizers = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);

  useEffect(() => {
    api.get("/admin/organizers").then(res => setOrganizers(res.data));
  }, []);

  const approve = async (id: string) => {
    await api.put(`/admin/organizers/${id}/approve`);
    setOrganizers(o => o.filter(org => org._id !== id));
  };

  return (
    <>
      <h2>Organizer Requests</h2>

      {organizers.map(o => (
        <div key={o._id}>
          <p>{o.brand_name}</p>
          <p>Status: {o.kyc_status}</p>
          <button onClick={() => approve(o._id)}>Approve</button>
        </div>
      ))}
    </>
  );
};

export default Organizers;
