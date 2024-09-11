// @ts-nocheck
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// WordPress custom API base URL
const isDev = process.env.NODE_ENV === "development";
const baseUrl = isDev ? "http://mytest.local" : "";

const WP_API_URL = `${baseUrl}/wp-json/doc/v1/users`;

function StaffDetails() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const response = await fetch(`${WP_API_URL}/${id}`);
        if (!response.ok) {
          throw new Error("Error fetching staff details");
        }
        const data = await response.json();
        setStaff(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, [id]);

  if (loading) {
    return <p>Loading staff details...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* back link */}
      <Button asChild className="mb-5">
        <a href="#" onClick={() => window.history.back()}>
          <ArrowLeft size={16} />
        </a>
      </Button>
      <h2 className="text-foreground text-2xl my-4">Staff Details</h2>
      {staff && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <p>
            <strong>Username:</strong> {staff.username}
          </p>
          <p>
            <strong>Email:</strong> {staff.email}
          </p>
          <p>
            <strong>Role:</strong> {staff.role}
          </p>
          <p>
            <strong>Date Registered:</strong> {staff.registered}
          </p>
        </div>
      )}
    </div>
  );
}

export default StaffDetails;
