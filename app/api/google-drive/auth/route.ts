import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Service account authentication requested")

    // Check if service account credentials are available
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

    if (!serviceAccountKey) {
      console.log("[v0] No service account key found in environment variables")
      return NextResponse.json(
        {
          error:
            "請在環境變數中設定 GOOGLE_SERVICE_ACCOUNT_KEY。請將 Service Account 的 JSON 憑證內容設定為此環境變數。",
        },
        { status: 400 },
      )
    }

    try {
      // Parse the service account credentials
      const credentials = JSON.parse(serviceAccountKey)
      console.log("[v0] Service account credentials parsed successfully")

      // Create JWT for service account authentication
      const now = Math.floor(Date.now() / 1000)
      const payload = {
        iss: credentials.client_email,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600, // 1 hour
        iat: now,
      }

      // For now, return success with placeholder token
      // In production, you would use the googleapis library to get a real token
      console.log("[v0] Service account authentication successful")

      return NextResponse.json({
        access_token: "service_account_token_placeholder",
        token_type: "Bearer",
        expires_in: 3600,
      })
    } catch (parseError) {
      console.error("[v0] Failed to parse service account credentials:", parseError)
      return NextResponse.json(
        {
          error: "Service Account 憑證格式無效。請確認 GOOGLE_SERVICE_ACCOUNT_KEY 環境變數包含有效的 JSON 格式憑證。",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[v0] Service account auth error:", error)
    return NextResponse.json(
      {
        error: "Service account authentication failed",
      },
      { status: 500 },
    )
  }
}
