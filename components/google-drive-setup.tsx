"use client"

import { useState } from "react"
import { ExternalLink, CheckCircle, AlertCircle, Copy, RefreshCw, Bug, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { googleDriveService } from "./google-drive-service"

interface GoogleDriveSetupProps {
  isOpen: boolean
  onClose: () => void
  onConnected: () => void
}

export function GoogleDriveSetup({ isOpen, onClose, onConnected }: GoogleDriveSetupProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [errorDetails, setErrorDetails] = useState<string>("")

  const testConnection = async () => {
    setIsConnecting(true)
    setConnectionStatus("testing")
    setDebugInfo("")
    setErrorDetails("")

    try {
      console.log("[v0] Testing Google Drive connection...")

      let debugLog = `測試時間: ${new Date().toLocaleString("zh-TW")}\n`
      debugLog += `開始 OAuth 驗證流程...\n`

      const success = await googleDriveService.authenticate()

      if (success) {
        setConnectionStatus("success")
        debugLog += `✓ OAuth 驗證成功\n`
        debugLog += `✓ 已獲得存取權杖\n`
        debugLog += `✓ 可以存取 Google Drive 檔案\n`

        setTimeout(() => {
          onConnected()
        }, 1500)
      } else {
        throw new Error("OAuth 驗證失敗")
      }

      setDebugInfo(debugLog)
    } catch (error) {
      console.error("[v0] Connection test failed:", error)
      setConnectionStatus("error")
      const errorMessage = error instanceof Error ? error.message : "未知錯誤"
      setErrorDetails(errorMessage)

      let debugLog = `測試時間: ${new Date().toLocaleString("zh-TW")}\n`
      debugLog += `❌ 驗證失敗: ${errorMessage}\n`

      if (errorMessage.includes("Client ID")) {
        debugLog += `\n解決方案:\n1. 請確認已在環境變數中設定 NEXT_PUBLIC_GOOGLE_CLIENT_ID\n2. Client ID 格式應為: xxxxxx.apps.googleusercontent.com\n3. 確認已在 Google Cloud Console 中設定正確的授權來源`
      } else if (errorMessage.includes("彈出視窗") || errorMessage.includes("popup")) {
        debugLog += `\n彈出視窗問題解決方案:\n1. 檢查瀏覽器是否封鎖彈出視窗\n2. 系統會自動切換到重新導向驗證模式\n3. 請允許瀏覽器開啟新視窗或分頁`
      }

      setDebugInfo(debugLog)
    } finally {
      setIsConnecting(false)
    }
  }

  const testConnectionWithRedirect = async () => {
    setIsConnecting(true)
    setConnectionStatus("testing")
    setDebugInfo("")
    setErrorDetails("")

    try {
      console.log("[v0] Testing Google Drive connection with redirect...")

      let debugLog = `測試時間: ${new Date().toLocaleString("zh-TW")}\n`
      debugLog += `使用重新導向模式進行 OAuth 驗證...\n`

      const success = await googleDriveService.authenticate(true) // Force redirect

      if (success) {
        setConnectionStatus("success")
        debugLog += `✓ 重新導向驗證成功\n`
        setDebugInfo(debugLog)
      }
    } catch (error) {
      console.error("[v0] Redirect connection test failed:", error)
      setConnectionStatus("error")
      const errorMessage = error instanceof Error ? error.message : "未知錯誤"
      setErrorDetails(errorMessage)

      let debugLog = `測試時間: ${new Date().toLocaleString("zh-TW")}\n`
      debugLog += `❌ 重新導向驗證失敗: ${errorMessage}\n`
      setDebugInfo(debugLog)
    } finally {
      setIsConnecting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyDebugInfo = () => {
    navigator.clipboard.writeText(debugInfo)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>連接 Google Drive</DialogTitle>
          <DialogDescription>設定 Google Drive 整合以存取您的和弦譜 PDF 檔案</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">設定指南</TabsTrigger>
            <TabsTrigger value="popup">彈出視窗問題</TabsTrigger>
            <TabsTrigger value="connect">OAuth 驗證</TabsTrigger>
            <TabsTrigger value="debug">除錯資訊</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">步驟 1：建立 Google Cloud 專案</CardTitle>
                <CardDescription>您需要建立一個 Google Cloud 專案並設定 OAuth 2.0</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    前往{" "}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Google Cloud Console <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>建立新專案或選擇現有專案</li>
                  <li>
                    前往「API 和服務」→「程式庫」，搜尋並啟用 <strong>Google Drive API</strong>
                  </li>
                  <li>前往「憑證」→「建立憑證」→「OAuth 2.0 用戶端 ID」</li>
                  <li>選擇「網路應用程式」類型</li>
                  <li>
                    <strong>重要：</strong>在「已授權的 JavaScript 來源」中新增：
                    <div className="mt-2 space-y-1">
                      <div className="bg-muted p-2 rounded text-xs font-mono">https://your-domain.vercel.app</div>
                      <div className="bg-muted p-2 rounded text-xs font-mono">http://localhost:3000 (開發用)</div>
                    </div>
                  </li>
                  <li>
                    在「已授權的重新導向 URI」中新增：
                    <div className="mt-2 space-y-1">
                      <div className="bg-muted p-2 rounded text-xs font-mono">https://your-domain.vercel.app</div>
                      <div className="bg-muted p-2 rounded text-xs font-mono">http://localhost:3000 (開發用)</div>
                    </div>
                  </li>
                  <li>複製 Client ID 並設定環境變數</li>
                </ol>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>重要：</strong>請確保在 OAuth
                    同意畫面中設定正確的範圍，並將應用程式狀態設為「正式版」或將您的 Google 帳戶加入測試使用者清單。
                    <br />
                    <br />
                    <strong>如果出現 401 invalid_client 錯誤：</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>確認 Client ID 格式正確（應以 .apps.googleusercontent.com 結尾）</li>
                      <li>檢查已授權的 JavaScript 來源是否包含您的網域</li>
                      <li>確認 OAuth 同意畫面已正確設定</li>
                      <li>如果是測試模式，請將您的 Google 帳戶加入測試使用者清單</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">步驟 2：設定環境變數</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">在 Vercel 專案設定中新增以下環境變數：</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                      NEXT_PUBLIC_GOOGLE_CLIENT_ID=您的Client ID
                    </code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard("NEXT_PUBLIC_GOOGLE_CLIENT_ID")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>設定完成後，請重新部署您的應用程式以套用環境變數。</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="popup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  彈出視窗被封鎖問題
                </CardTitle>
                <CardDescription>解決瀏覽器彈出視窗封鎖導致的驗證失敗</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>常見問題：</strong>瀏覽器可能會封鎖 OAuth
                    驗證彈出視窗，導致驗證失敗並顯示「彈出視窗被關閉」錯誤。
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-medium">解決方案：</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>
                      <strong>檢查彈出視窗封鎖器：</strong>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>查看瀏覽器網址列是否有彈出視窗封鎖圖示</li>
                        <li>點擊圖示並選擇「允許彈出視窗」</li>
                        <li>重新整理頁面並再次嘗試驗證</li>
                      </ul>
                    </li>
                    <li>
                      <strong>使用重新導向模式：</strong>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>系統會自動偵測彈出視窗問題並切換到重新導向模式</li>
                        <li>或者您可以直接使用下方的「使用重新導向驗證」按鈕</li>
                        <li>這會將您導向 Google 驗證頁面，完成後自動返回</li>
                      </ul>
                    </li>
                    <li>
                      <strong>瀏覽器設定：</strong>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>Chrome：設定 → 隱私權和安全性 → 網站設定 → 彈出式視窗和重新導向</li>
                        <li>Firefox：設定 → 隱私權與安全性 → 權限 → 封鎖彈出式視窗</li>
                        <li>Safari：偏好設定 → 網站 → 彈出式視窗</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>建議：</strong>
                    如果經常遇到彈出視窗問題，建議將此網站加入瀏覽器的信任清單，或直接使用重新導向驗證模式。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connect" className="space-y-4">
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  此步驟將開啟 Google 授權視窗，請允許應用程式存取您的 Google Drive 檔案。
                  如果彈出視窗被封鎖，系統會自動切換到重新導向模式。
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">OAuth 驗證狀態</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        connectionStatus === "success"
                          ? "bg-green-500"
                          : connectionStatus === "error"
                            ? "bg-red-500"
                            : connectionStatus === "testing"
                              ? "bg-yellow-500 animate-pulse"
                              : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm">
                      {connectionStatus === "success" && "✓ 驗證成功"}
                      {connectionStatus === "error" && "✗ 驗證失敗"}
                      {connectionStatus === "testing" && "⏳ 驗證中..."}
                      {connectionStatus === "idle" && "待驗證"}
                    </span>
                  </div>

                  {errorDetails && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>錯誤：</strong>
                        {errorDetails}
                        {errorDetails.includes("401") && (
                          <div className="mt-2 text-sm">
                            <strong>解決方案：</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>檢查 Google Cloud Console 中的「已授權的 JavaScript 來源」</li>
                              <li>
                                確認已新增您的網域：
                                {typeof window !== "undefined"
                                  ? window.location.origin
                                  : "https://your-domain.vercel.app"}
                              </li>
                              <li>確認 Client ID 格式正確</li>
                              <li>檢查 OAuth 同意畫面設定</li>
                            </ul>
                          </div>
                        )}
                        {(errorDetails.includes("彈出視窗") || errorDetails.includes("popup")) && (
                          <div className="mt-2 text-sm">
                            <strong>彈出視窗問題解決方案：</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>檢查瀏覽器是否封鎖彈出視窗</li>
                              <li>使用下方的「重新導向驗證」按鈕</li>
                              <li>將此網站加入瀏覽器信任清單</li>
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={testConnection} disabled={isConnecting} className="flex-1">
                      {isConnecting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          驗證中...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          彈出視窗驗證
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={testConnectionWithRedirect}
                      disabled={isConnecting}
                      variant="outline"
                      className="flex-1 bg-transparent"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      重新導向驗證
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                      關閉
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="debug" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  除錯資訊
                </CardTitle>
                <CardDescription>詳細的連接測試記錄，可協助診斷問題</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {debugInfo ? (
                  <>
                    <Textarea
                      value={debugInfo}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                      placeholder="執行連接測試後將顯示除錯資訊..."
                    />
                    <Button size="sm" variant="outline" onClick={copyDebugInfo}>
                      <Copy className="h-4 w-4 mr-2" />
                      複製除錯資訊
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>尚無除錯資訊</p>
                    <p className="text-sm">請先執行連接測試</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
