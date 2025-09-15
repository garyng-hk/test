// Google Drive API integration service using Service Account
// This will access worshipteamylgc@gmail.com's Google Drive

export interface ChordChart {
  id: string
  songName: string
  artist: string
  key: string
  fileName: string
  fileId: string
  lastModified: string
  downloadUrl?: string
}

export class GoogleDriveService {
  private accessToken: string | null = null
  private serviceAccountEmail: string | null = null

  constructor() {
    this.serviceAccountEmail = "chord-chart-reader@your-project.iam.gserviceaccount.com"
    console.log("[v0] GoogleDriveService initialized for service account access")
  }

  async authenticate(): Promise<boolean> {
    try {
      console.log("[v0] Authenticating with service account...")

      const response = await fetch("/api/google-drive/auth", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        console.log("[v0] Service account authentication failed:", data.error)
        throw new Error(data.error || "Service account authentication failed")
      }

      this.accessToken = data.access_token
      console.log("[v0] Service account authentication successful")
      return true
    } catch (error) {
      console.error("[v0] Service account authentication failed:", error)
      throw new Error(error instanceof Error ? error.message : "無法連接到 Google Drive 服務。請檢查服務帳戶設定。")
    }
  }

  handleRedirectCallback(): boolean {
    return false
  }

  async searchFiles(query?: string, key?: string, artist?: string): Promise<ChordChart[]> {
    try {
      console.log("[v0] Searching files with params:", { query, key, artist })

      if (!this.accessToken) {
        console.log("[v0] No access token, attempting authentication...")
        await this.authenticate()
      }

      const params = new URLSearchParams()
      if (query) params.append("q", query)
      if (key) params.append("key", key)
      if (artist) params.append("artist", artist)

      const response = await fetch(`/api/google-drive?${params.toString()}`)
      const result = await response.json()

      if (result.error) {
        console.log("[v0] Search failed:", result.error)
        throw new Error(result.error)
      }

      console.log("[v0] Search successful, found files:", result.files?.length || 0)

      // Transform Google Drive files to ChordChart format
      return (
        result.files?.map((file: any) => ({
          id: file.id,
          songName: this.extractSongName(file.name),
          artist: this.extractArtist(file.name),
          key: this.extractKey(file.name),
          fileName: file.name,
          fileId: file.id,
          lastModified: new Date(file.modifiedTime).toLocaleDateString("zh-TW"),
          downloadUrl: file.webContentLink,
        })) || []
      )
    } catch (error) {
      console.error("[v0] Search failed:", error)
      throw error
    }
  }

  async validateToken(): Promise<boolean> {
    if (!this.accessToken) {
      return false
    }

    try {
      console.log("[v0] Validating service account token...")

      const response = await fetch("/api/google-drive/validate")
      return response.ok
    } catch (error) {
      console.error("[v0] Token validation error:", error)
      this.accessToken = null
      return false
    }
  }

  async isAuthenticatedAndValid(): Promise<boolean> {
    if (!this.accessToken) {
      return await this.authenticate()
    }
    return await this.validateToken()
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  signOut(): void {
    this.accessToken = null
    console.log("[v0] Cleared service account token")
  }

  async getFileContent(fileId: string): Promise<string> {
    try {
      // Get file content from Google Drive
      console.log("Getting file content for:", fileId)

      // This would return the actual file URL or blob
      return `https://drive.google.com/file/d/${fileId}/view`
    } catch (error) {
      console.error("Failed to get file content:", error)
      throw error
    }
  }

  async downloadFile(fileId: string, fileName: string): Promise<void> {
    try {
      // Download file from Google Drive
      console.log("Downloading file:", fileName)

      // This would trigger the actual download
    } catch (error) {
      console.error("Download failed:", error)
      throw error
    }
  }

  private extractSongName(fileName: string): string {
    // Remove file extension and try to extract song name
    const nameWithoutExt = fileName.replace(/\.pdf$/i, "")
    // Simple heuristic: assume format like "song-name-artist-key.pdf"
    const parts = nameWithoutExt.split("-")
    return parts[0]?.replace(/_/g, " ") || nameWithoutExt
  }

  private extractArtist(fileName: string): string {
    const nameWithoutExt = fileName.replace(/\.pdf$/i, "")
    const parts = nameWithoutExt.split("-")
    return parts[1]?.replace(/_/g, " ") || "未知藝人"
  }

  private extractKey(fileName: string): string {
    // Look for key patterns like -C, -Dm, -F#, etc.
    const keyMatch = fileName.match(/-([A-G][#b]?m?)(?:-|\.)/i)
    return keyMatch ? keyMatch[1] : "C"
  }
}

export const googleDriveService = new GoogleDriveService()
