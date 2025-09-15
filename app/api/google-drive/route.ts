import { type NextRequest, NextResponse } from "next/server"

// This would be your actual Google Drive API integration
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const key = searchParams.get("key")
  const artist = searchParams.get("artist")
  const accessToken = searchParams.get("access_token")

  console.log("[v0] Google Drive API called with params:", { query, key, artist, hasToken: !!accessToken })

  try {
    // Check if we have an access token (OAuth)
    if (!accessToken) {
      console.log("[v0] Error: No access token provided")
      return NextResponse.json(
        {
          error: "需要 Google 授權。請先完成 OAuth 驗證流程。",
          debug: "Missing access_token",
          requiresAuth: true,
        },
        { status: 401 },
      )
    }

    // Build search query for Google Drive API
    let searchQuery = "mimeType='application/pdf'"

    if (query) {
      searchQuery += ` and name contains '${query}'`
    }
    if (key) {
      searchQuery += ` and name contains '${key}'`
    }
    if (artist) {
      searchQuery += ` and name contains '${artist}'`
    }

    console.log("[v0] Searching Google Drive with query:", searchQuery)

    // Make API call using OAuth token
    const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,webContentLink,size,parents)`

    console.log("[v0] Making authenticated request to Google Drive API")

    const response = await fetch(driveApiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    console.log("[v0] Google Drive API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Google Drive API error response:", errorText)

      if (response.status === 401) {
        return NextResponse.json(
          {
            error: "Google 授權已過期，請重新登入。",
            debug: errorText,
            requiresAuth: true,
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          error: `Google Drive API 錯誤: ${response.status} - ${response.statusText}`,
          debug: errorText,
          status: response.status,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] Google Drive API success, found files:", data.files?.length || 0)

    // Transform the response to match our interface
    const transformedFiles =
      data.files?.map((file: any) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        size: file.size,
        parents: file.parents,
      })) || []

    return NextResponse.json({ files: transformedFiles })
  } catch (error) {
    console.error("[v0] Google Drive API error:", error)
    return NextResponse.json(
      {
        error: "連接 Google Drive 時發生錯誤",
        debug: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, fileId } = await request.json()

    if (action === "download") {
      // Handle file download
      // This would generate a download URL or stream the file
      return NextResponse.json({
        downloadUrl: `https://drive.google.com/uc?id=${fileId}&export=download`,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Google Drive API error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
