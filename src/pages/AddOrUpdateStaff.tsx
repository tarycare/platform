import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";

const isDev = process.env.NODE_ENV === "development";
const baseUrl = isDev ? "http://mytest.local" : "";

// Validation schema
const FormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Please enter a valid email address"),
  role: z.string(),
});

function AddOrUpdateStaff({ onSuccess }: any) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      email: "",
      role: "",
    },
  });

  const navigate = useNavigate();
  const { id } = useParams(); // Get user ID from the URL params
  const isUpdating = Boolean(id); // Check if this is an update operation

  useEffect(() => {
    if (isUpdating) {
      // Fetch the user data to prefill the form
      const fetchUserData = async () => {
        try {
          const response = await fetch(`${baseUrl}/wp-json/doc/v1/users/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();
          form.setValue("username", data.username);
          form.setValue("email", data.email);
          form.setValue("role", data.role); // Set the existing role data
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };

      fetchUserData();
    }
  }, [isUpdating, id, form]);

  const onSubmit = async (values: any) => {
    try {
      const apiUrl = isUpdating
        ? `${baseUrl}/wp-json/doc/v1/update-staff/${id}`
        : `${baseUrl}/wp-json/doc/v1/add-staff`;
      const method = isUpdating ? "POST" : "POST";

      const response = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (response.ok) {
        // onSuccess();
        toast({
          title: "Success",
          description: isUpdating
            ? "Staff updated successfully"
            : "Staff added successfully",
          variant: "default",
        });
        navigate("/"); // Redirect to the user list page
      } else {
        // Handle API error message
        const errorMessage = responseData.message || "Failed to process user";
        console.error("Failed to process user:", errorMessage);

        // Set form error for a specific field (optional)
        form.setError("username", {
          type: "manual",
          message: errorMessage, // Set the API message as form error
        });

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form", error);
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive",
      });
    }
  };

  return (
    <div className=" mx-auto mt-8">
      <div className="max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter username"
                      {...field}
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="default" className="w-full mt-6">
              {isUpdating ? "Update Staff" : "Add Staff"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default AddOrUpdateStaff;
