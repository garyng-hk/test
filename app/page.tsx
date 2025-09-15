// app/page.tsx

// 這段程式碼會在伺服器端執行，所以是安全的
import { google } from "googleapis";

// 這是一個在伺服器端執行的測試函數
async function testGoogleDriveConnection() {
  console.log("[v0] Starting Google Drive connection test...");

  // 1. 從 .env.local 讀取我們的設定
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const fileIdToTest = process.env.GOOGLE_DRIVE_FILE_ID;

  if (!serviceAccountKey) {
    throw new Error("錯誤：找不到 GOOGLE_SERVICE_ACCOUNT_KEY 環境變數。");
  }
  if (!fileIdToTest) {
    throw new Error("錯誤：找不到 GOOGLE_DRIVE_FILE_ID 環境變數。請在 .env.local 中設定。");
  }

  try {
    const credentials = JSON.parse(serviceAccountKey);

    // 2. 設定我們要的權限 (scope) - 唯讀
    const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

    // 3. 建立一個包含憑證和權限的授權物件
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    // 4. 建立 Drive 服務，並把授權物件傳給它
    const drive = google.drive({ version: "v3", auth });

    // 5. 嘗試用這個服務去取得檔案資訊，來測試連線
    console.log(`[v0] 正在嘗試讀取檔案 ID: ${fileIdToTest}`);
    const response = await drive.files.get({
      fileId: fileIdToTest,
      fields: "id, name", // 我們只需要檔案的 id 和名字
    });

    // 如果成功，回傳檔案名稱
    console.log(`[v0] 成功！讀取到檔案名稱: ${response.data.name}`);
    return { success: true, message: `成功連接！讀取到檔案：${response.data.name}` };

  } catch (error) {
    console.error("--- GOOGLE DRIVE 連接失敗，詳細錯誤資訊在下方 ---");
    // 印出完整的錯誤物件，幫助我們 debug
    console.error(JSON.stringify(error, null, 2));
    console.error("--- 錯誤資訊結束 ---");
    
    // 拋出一個讓人看得懂的錯誤訊息
    throw new Error(`連接失敗: ${error.message}`);
  }
}


// 這是我們頁面的主要元件
export default async function HomePage() {
  // 在頁面載入時，直接呼叫上面的測試函數
  const connectionResult = await testGoogleDriveConnection().catch((error) => {
    // 如果測試函數拋出錯誤，我們在這裡捕捉它
    return { success: false, message: error.message };
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <h1 className="mb-4 text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
          Google Drive 連線測試
        </h1>
        <div className="mt-6">
          {connectionResult.success ? (
            // 成功時顯示的樣式
            <div className="rounded-md bg-green-100 p-4 text-green-800 dark:bg-green-900 dark:text-green-200">
              <h3 className="font-bold">✅ 連線成功！</h3>
              <p>{connectionResult.message}</p>
            </div>
          ) : (
            // 失敗時顯示的樣式
            <div className="rounded-md bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
              <h3 className="font-bold">❌ 連線失敗</h3>
              <p className="break-words">{connectionResult.message}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
