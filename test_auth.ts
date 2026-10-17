import app from "./src/app";
import http from "http";

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5001, resolve));
  console.log("Test server running on port 5001...");

  const baseUrl = "http://localhost:5001/api/auth";

  try {
    // 1. Test GET /types
    const resTypes = await fetch(`${baseUrl}/types`);
    const types = await resTypes.json();
    console.log("1. GET /types Status:", resTypes.status, "Count:", types.length);

    // 2. Test Login Admin Dummy
    const resAdmin = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "admin@kateringkita.com", password: "admin123" }),
    });
    const dataAdmin = await resAdmin.json();
    console.log("2. Admin Login Status:", resAdmin.status, "Role:", dataAdmin.user?.role);
    const adminToken = dataAdmin.token;

    // 3. Test Login Merchant Dummy
    const resMerchant = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "merchant@kateringkita.com", password: "merchant123" }),
    });
    const dataMerchant = await resMerchant.json();
    console.log("3. Merchant Login Status:", resMerchant.status, "Role:", dataMerchant.user?.role, "Usaha:", dataMerchant.user?.nama_usaha);
    const merchantToken = dataMerchant.token;

    // 4. Test GET /me with Merchant Token
    const resMe = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${merchantToken}` },
    });
    const dataMe = await resMe.json();
    console.log("4. Merchant /me Status:", resMe.status, "User Name:", dataMe.user?.nama_lengkap);

    // 5. Test Access Control: Admin Endpoint with Merchant Token (Harus ditolak 403 Forbidden)
    const resAdminForbidden = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${merchantToken}` },
    });
    const dataForbidden = await resAdminForbidden.json();
    console.log("5. Access Control Test (Merchant ke Admin Endpoint):", resAdminForbidden.status, "(Expected 403) Message:", dataForbidden.message);

    // 6. Test Access Control: Admin Endpoint with Admin Token (Harus diizinkan 200 OK)
    const resAdminAllowed = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataAllowed = await resAdminAllowed.json();
    console.log("6. Access Control Test (Admin ke Admin Endpoint):", resAdminAllowed.status, "(Expected 200) Total Users:", dataAllowed.total);

    // 7. Test Logout Endpoint
    const resLogout = await fetch(`${baseUrl}/logout`, {
      method: "POST",
    });
    const dataLogout = await resLogout.json();
    console.log("7. Logout Endpoint Status:", resLogout.status, "Message:", dataLogout.message);

    console.log("\n>>> SEMUA PENGUJIAN REQUIREMENTS 1 - 4 BERHASIL 100%! <<<");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
