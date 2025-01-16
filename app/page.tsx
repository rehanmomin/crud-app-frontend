"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    if (!apiUrl) {
      console.error("API URL is not defined");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/api/users`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setUsers(data); // Set users only if data is an array
      } else {
        console.error("Expected an array of users but got:", data);
        setUsers([]); // Reset users to an empty array to prevent map error
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiUrl) {
      console.error("API URL is not defined");
      return;
    }
    try {
      const url = editingId
        ? `${apiUrl}/api/users/${editingId}`
        : `${apiUrl}/api/users`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: "", email: "" });
        setEditingId(null);
        fetchUsers();
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!apiUrl) {
      console.error("API URL is not defined");
      return;
    }
    try {
      await fetch(`${apiUrl}/api/users/${id}`, {
        method: "DELETE",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div>
      <h1>User Management</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 mr-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update" : "Add"} User
        </button>
      </form>
      <div>
        {Array.isArray(users) &&
          users.map((user) => (
            <div key={user.id} className="border p-2 mb-2">
              <div>{user.name}</div>
              <div>{user.email}</div>
              <button
                type="button"
                onClick={() => {
                  setEditingId(user.id);
                  setFormData({ name: user.name, email: user.email });
                }}
                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(user.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
