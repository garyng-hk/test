import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Token validation requested")

    // For service account, we check if credentials are available
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

    if (!serviceAccountKey) {
      console.log("[v0] No service account credentials found")
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    try {
      // Try to parse the service account credentials
      JSON.parse(serviceAccountKey)
      console.log("[v0] Service account credentials are valid")
      return NextResponse.json({ valid: true })
    } catch (parseError) {
      console.log("[v0] Service account credentials are invalid")
      return NextResponse.json({ valid: false }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Token validation error:", error)
    return NextResponse.json(
      {
        error: "Token validation failed",
      },
      { status: 500 },
    )
  }
}
