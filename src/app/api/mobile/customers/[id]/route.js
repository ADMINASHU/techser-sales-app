import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";

export async function PUT(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await req.json();

    await dbConnect();

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // Authorization:
    // Admin can update anyone.
    // Standard user can update customers in their own region/branch
    // OR customers they created?
    // For simplicity: If user is admin OR user.region matches customer.region
    if (
      user.role !== "admin" &&
      (user.region !== customer.region || user.branch !== customer.branch)
    ) {
      return NextResponse.json(
        { error: "Unauthorized to update this customer" },
        { status: 403 },
      );
    }

    // Update fields
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { ...body },
      { new: true },
    );

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error("Mobile Update Customer Error:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    await dbConnect();

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // Authorization:
    // Admin can delete anyone.
    // Standard user can delete ONLY if they created it? Or same region?
    // Let's restrict DELETE to Admin or Creator for safety.
    // Assuming customer schema has userId (creator).
    const isCreator = customer.userId && customer.userId.toString() === user.id;

    if (user.role !== "admin" && !isCreator) {
      return NextResponse.json(
        { error: "Unauthorized to delete this customer" },
        { status: 403 },
      );
    }

    await Customer.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    console.error("Mobile Delete Customer Error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
