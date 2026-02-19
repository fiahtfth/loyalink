import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Handle Supabase errors
  if (typeof error === "object" && error !== null && "code" in error) {
    const supaError = error as { code: string; message?: string; details?: string }
    if (supaError.code === "23505") {
      return NextResponse.json(
        { error: "A record with this unique field already exists" },
        { status: 409 }
      );
    }
    if (supaError.code === "PGRST116") {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }
  }

  const msg = error instanceof Error ? error.message : "Internal server error"
  return NextResponse.json(
    { error: msg },
    { status: 500 }
  );
}

export function validateRequestBody<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown
): T {
  return schema.parse(data);
}
