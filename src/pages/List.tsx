import { Button } from "@/components/ui/button";
import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

function List() {
  const navigate = useNavigate();

  return (
    <div>
      <Button asChild>
        <Link to="/add">Add Staff</Link>
      </Button>
    </div>
  );
}

export default List;
