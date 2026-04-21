package com.sia.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject

data class AdminOrder(
    val id: Long,
    val clientName: String,
    val serviceType: String?,
    val status: String,
    val quotedPrice: Double?
)

data class MonthlySales(
    val month: String,
    val totalSales: Double,
    val completedOrders: Long
)

data class AuthResult(
    val token: String,
    val name: String,
    val email: String,
    val role: String
)

data class ServiceItem(val name: String, val price: String, val desc: String)
data class BranchItem(val name: String, val address: String, val phone: String)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                AdminScreen()
            }
        }
    }
}

@Composable
fun AdminScreen() {
    val scope = rememberCoroutineScope()
    var apiBaseUrl by remember { mutableStateOf("http://10.0.2.2:8080/api") }
    var email by remember { mutableStateOf("admin@revive.local") }
    var password by remember { mutableStateOf("Admin1234!") }
    var auth by remember { mutableStateOf<AuthResult?>(null) }

    var page by remember { mutableStateOf("home") }
    var token by remember { mutableStateOf("") }
    var month by remember { mutableStateOf("2026-04") }
    var adminTab by remember { mutableStateOf("orders") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    var orders by remember { mutableStateOf(emptyList<AdminOrder>()) }
    var sales by remember { mutableStateOf<MonthlySales?>(null) }

    val services = listOf(
        ServiceItem("Standard Cleaning", "₱25", "Basic cleaning and dirt removal"),
        ServiceItem("Deep Cleaning", "₱45", "Intensive cleaning and stain treatment"),
        ServiceItem("Reglue", "₱35", "Sole reattachment and repair"),
        ServiceItem("Repaint", "₱55", "Color restore and repaint")
    )
    val branches = listOf(
        BranchItem("Main Branch", "123 Sneaker St, City", "(555) 123-4567"),
        BranchItem("North Branch", "45 North Ave, City", "(555) 222-1000"),
        BranchItem("South Branch", "88 South Road, City", "(555) 888-9000")
    )

    fun login() {
        scope.launch {
            loading = true
            error = ""
            try {
                val result = withContext(Dispatchers.IO) { login(apiBaseUrl, email, password) }
                auth = result
                token = result.token
                page = if (result.role == "ADMIN") "admin" else "home"
            } catch (e: Exception) {
                error = e.message ?: "Login failed"
            } finally {
                loading = false
            }
        }
    }

    fun loadOrders() {
        scope.launch {
            loading = true
            error = ""
            try {
                orders = withContext(Dispatchers.IO) { fetchAdminOrders(apiBaseUrl, token) }
            } catch (e: Exception) {
                error = e.message ?: "Failed to load orders"
            } finally {
                loading = false
            }
        }
    }

    fun loadSales() {
        scope.launch {
            loading = true
            error = ""
            try {
                sales = withContext(Dispatchers.IO) { fetchMonthlySales(apiBaseUrl, token, month) }
            } catch (e: Exception) {
                error = e.message ?: "Failed to load sales"
            } finally {
                loading = false
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("SIA Mobile", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)

        OutlinedTextField(
            value = apiBaseUrl,
            onValueChange = { apiBaseUrl = it.trim() },
            label = { Text("API Base URL") },
            modifier = Modifier.fillMaxWidth()
        )

        if (auth == null) {
            OutlinedTextField(
                value = email,
                onValueChange = { email = it.trim() },
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                modifier = Modifier.fillMaxWidth()
            )
            Button(onClick = { login() }) { Text("Login") }
        } else {
            Text("Logged in as: ${auth!!.name} (${auth!!.role})")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { page = "home" }) { Text("Home") }
                Button(onClick = { page = "services" }) { Text("Services") }
                Button(onClick = { page = "branches" }) { Text("Branches") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { page = "about" }) { Text("About") }
                Button(onClick = { page = "contact" }) { Text("Contact") }
                if (auth!!.role == "ADMIN") {
                    Button(onClick = { page = "admin" }) { Text("Admin") }
                }
            }
            Button(onClick = {
                auth = null
                token = ""
                page = "home"
                orders = emptyList()
                sales = null
            }) { Text("Logout") }
        }

        if (loading) Text("Loading...")
        if (error.isNotBlank()) Text("Error: $error", color = MaterialTheme.colorScheme.error)

        Spacer(modifier = Modifier.height(4.dp))

        when (page) {
            "home" -> {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Revive Sneaker Care", fontWeight = FontWeight.Bold)
                        Text("Welcome to your mobile app.")
                        Text("Use the buttons above to navigate like the website.")
                    }
                }
            }
            "services" -> {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(services) { service ->
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(service.name, fontWeight = FontWeight.Bold)
                                Text(service.desc)
                                Text("From ${service.price}")
                            }
                        }
                    }
                }
            }
            "branches" -> {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(branches) { branch ->
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(branch.name, fontWeight = FontWeight.Bold)
                                Text(branch.address)
                                Text(branch.phone)
                            }
                        }
                    }
                }
            }
            "about" -> Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("About Us", fontWeight = FontWeight.Bold)
                    Text("Professional sneaker cleaning and restoration services.")
                }
            }
            "contact" -> Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("Contact Us", fontWeight = FontWeight.Bold)
                    Text("Phone: (555) 123-4567")
                    Text("Email: info@revivesneakercare.com")
                }
            }
            "admin" -> {
                if (auth?.role != "ADMIN") {
                    Text("Admin access only.")
                } else {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(onClick = { adminTab = "orders" }) { Text("Orders") }
                        Button(onClick = { adminTab = "sales" }) { Text("Monthly Sales") }
                    }
                    if (adminTab == "orders") {
                        Button(onClick = { loadOrders() }) { Text("Load Orders") }
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(orders) { order ->
                                Card(modifier = Modifier.fillMaxWidth()) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Text("Order #${order.id}", fontWeight = FontWeight.Bold)
                                        Text("Client: ${order.clientName}")
                                        Text("Service: ${order.serviceType ?: "N/A"}")
                                        Text("Status: ${order.status}")
                                        Text("Price: ${order.quotedPrice?.let { "₱$it" } ?: "N/A"}")
                                    }
                                }
                            }
                        }
                    } else {
                        OutlinedTextField(
                            value = month,
                            onValueChange = { month = it.trim() },
                            label = { Text("Month (YYYY-MM)") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Button(onClick = { loadSales() }) { Text("Load Monthly Sales") }
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("Month: ${sales?.month ?: "-"}")
                                Text("Total Sales: ₱${sales?.totalSales ?: 0.0}", fontWeight = FontWeight.Bold)
                                Text("Completed Services: ${sales?.completedOrders ?: 0}")
                            }
                        }
                    }
                }
            }
        }
    }
}

private fun login(baseUrl: String, email: String, password: String): AuthResult {
    val client = OkHttpClient()
    val bodyJson = JSONObject().apply {
        put("email", email)
        put("password", password)
    }
    val request = Request.Builder()
        .url("${baseUrl.trimEnd('/')}/auth/login")
        .post(bodyJson.toString().toRequestBody("application/json; charset=utf-8".toMediaType()))
        .build()

    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("Login failed: HTTP ${response.code}")
        val text = response.body?.string().orEmpty()
        val json = JSONObject(text)
        return AuthResult(
            token = json.optString("token"),
            name = json.optString("name", "User"),
            email = json.optString("email", email),
            role = json.optString("role", "CLIENT")
        )
    }
}

private fun fetchAdminOrders(baseUrl: String, token: String): List<AdminOrder> {
    val client = OkHttpClient()
    val request = Request.Builder()
        .url("${baseUrl.trimEnd('/')}/admin/orders")
        .addHeader("Authorization", "Bearer $token")
        .get()
        .build()

    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("HTTP ${response.code}")
        val body = response.body?.string().orEmpty()
        val arr = JSONArray(body)
        return (0 until arr.length()).map { idx ->
            val o = arr.getJSONObject(idx)
            AdminOrder(
                id = o.optLong("id"),
                clientName = o.optString("clientName", "Unknown"),
                serviceType = o.optString("serviceType", null),
                status = o.optString("status", "UNKNOWN"),
                quotedPrice = if (o.isNull("quotedPrice")) null else o.optDouble("quotedPrice")
            )
        }
    }
}

private fun fetchMonthlySales(baseUrl: String, token: String, month: String): MonthlySales {
    val client = OkHttpClient()
    val request = Request.Builder()
        .url("${baseUrl.trimEnd('/')}/admin/orders/sales/monthly?month=$month")
        .addHeader("Authorization", "Bearer $token")
        .get()
        .build()

    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("HTTP ${response.code}")
        val body = response.body?.string().orEmpty()
        val json = JSONObject(body)
        return MonthlySales(
            month = json.optString("month", month),
            totalSales = json.optDouble("totalSales", 0.0),
            completedOrders = json.optLong("completedOrders", 0L)
        )
    }
}
