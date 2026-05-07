package com.sia.mobile

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

private const val DEFAULT_API = "http://10.0.2.2:8080/api"
private const val DEFAULT_MAPS_URL = "https://www.google.com/maps?q=559+V+Rama+Ave,+Cebu+City,+6000+Cebu"

data class AuthResult(
    val token: String,
    val name: String,
    val email: String,
    val role: String
)

data class ServiceItem(val name: String, val price: String, val desc: String)
data class BranchItem(val name: String, val address: String, val phone: String, val mapsUrl: String)
data class BookingResult(val message: String)
data class AdminOrder(
    val id: Long,
    val clientName: String,
    val serviceType: String?,
    val status: String,
    val quotedPrice: Double?
)
data class MonthlySales(val month: String, val totalSales: Double, val completedOrders: Long)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                SiaApp()
            }
        }
    }
}

@Composable
fun SiaApp() {
    var apiBaseUrl by remember { mutableStateOf(DEFAULT_API) }
    var token by remember { mutableStateOf("") }
    var auth by remember { mutableStateOf<AuthResult?>(null) }
    var page by remember { mutableStateOf("home") }
    var error by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    val services = remember {
        listOf(
            ServiceItem("Standard Cleaning", "From ₱25", "Basic cleaning and dirt removal"),
            ServiceItem("Deep Cleaning", "From ₱45", "Intensive cleaning and stain treatment"),
            ServiceItem("Reglue", "From ₱35", "Sole reattachment and repair"),
            ServiceItem("Repaint", "From ₱60", "Color restore and repaint")
        )
    }
    val branches = remember {
        listOf(
            BranchItem(
                name = "Revive Sneaker Care",
                address = "559 V Rama Ave, Cebu City, 6000 Cebu",
                phone = "0954 159 1817",
                mapsUrl = DEFAULT_MAPS_URL
            )
        )
    }

    fun login(email: String, password: String) {
        scope.launch {
            loading = true
            error = ""
            try {
                val result = withContext(Dispatchers.IO) { apiLogin(apiBaseUrl, email, password) }
                auth = result
                token = result.token
                page = if (result.role == "ADMIN") "admin" else "book"
            } catch (t: Throwable) {
                error = t.message ?: "Login failed"
            } finally {
                loading = false
            }
        }
    }

    Scaffold { padding ->
        Surface(modifier = Modifier.padding(padding)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                TopBar(
                    apiBaseUrl = apiBaseUrl,
                    onApiBaseChange = { apiBaseUrl = it },
                    auth = auth,
                    onLogout = {
                        auth = null
                        token = ""
                        page = "home"
                    },
                    onNavigate = { page = it }
                )

                if (loading) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        CircularProgressIndicator(modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Loading...")
                    }
                }
                if (error.isNotBlank()) {
                    Text(error, color = MaterialTheme.colorScheme.error)
                }

                when (page) {
                "home" -> HomeScreen(
                    onBookNow = { page = "book" },
                    onLogin = { page = "login" }
                )

                "login" -> LoginScreen(
                    onLogin = ::login,
                    onRegister = { name, email, password ->
                        scope.launch {
                            loading = true
                            error = ""
                            try {
                                val result = withContext(Dispatchers.IO) { apiRegister(apiBaseUrl, name, email, password) }
                                auth = result
                                token = result.token
                                page = "book"
                            } catch (t: Throwable) {
                                error = t.message ?: "Registration failed"
                            } finally {
                                loading = false
                            }
                        }
                    }
                )

                "services" -> ServicesScreen(services)
                "branches" -> BranchesScreen(branches)
                "book" -> BookingScreen(
                    apiBaseUrl = apiBaseUrl,
                    token = token,
                    auth = auth,
                    services = services,
                    branch = branches.first(),
                    onSubmitSuccess = { page = "success" }
                )
                "success" -> SuccessScreen(onBookAnother = { page = "book" })
                "admin" -> AdminScreen(apiBaseUrl = apiBaseUrl, token = token, auth = auth)
            }
        }
        }
    }
}

@Composable
private fun TopBar(
    apiBaseUrl: String,
    onApiBaseChange: (String) -> Unit,
    auth: AuthResult?,
    onLogout: () -> Unit,
    onNavigate: (String) -> Unit
) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.padding(16.dp)) {
            Text("Revive Sneaker Care", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text("Cebu sneaker care booking and tracking", style = MaterialTheme.typography.bodyMedium)
            OutlinedTextField(
                value = apiBaseUrl,
                onValueChange = onApiBaseChange,
                label = { Text("API Base URL") },
                modifier = Modifier.fillMaxWidth()
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AssistChip(onClick = { onNavigate("home") }, label = { Text("Home") })
                AssistChip(onClick = { onNavigate("services") }, label = { Text("Services") })
                AssistChip(onClick = { onNavigate("branches") }, label = { Text("Branch") })
                AssistChip(onClick = { onNavigate("book") }, label = { Text("Book") })
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (auth?.role == "ADMIN") AssistChip(onClick = { onNavigate("admin") }, label = { Text("Admin") })
                if (auth == null) AssistChip(onClick = { onNavigate("login") }, label = { Text("Login") })
                if (auth != null) AssistChip(onClick = onLogout, label = { Text("Logout") })
            }
            if (auth != null) {
                Text("Signed in as ${auth.name} (${auth.role})", fontWeight = FontWeight.Medium)
            }
        }
    }
}

@Composable
private fun HomeScreen(onBookNow: () -> Unit, onLogin: () -> Unit) {
    LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Book from your phone", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                    Text("Clean, reglue, repaint, and payment proof handling in one place.")
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(onClick = onBookNow) { Text("Book Now") }
                        OutlinedButton(onClick = onLogin) { Text("Login") }
                    }
                }
            }
        }
    }
}

@Composable
private fun ServicesScreen(services: List<ServiceItem>) {
    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        items(services) { service ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(service.name, fontWeight = FontWeight.Bold)
                    Text(service.desc)
                    Text(service.price)
                }
            }
        }
    }
}

@Composable
private fun BranchesScreen(branches: List<BranchItem>) {
    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        items(branches) { branch ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(branch.name, fontWeight = FontWeight.Bold)
                    Text(branch.address)
                    Text(branch.phone)
                    val context = LocalContext.current
                    Button(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(branch.mapsUrl))
                            context.startActivity(intent)
                        }
                    ) { Text("Open in Maps") }
                }
            }
        }
    }
}

@Composable
private fun BookingScreen(
    apiBaseUrl: String,
    token: String,
    auth: AuthResult?,
    services: List<ServiceItem>,
    branch: BranchItem,
    onSubmitSuccess: () -> Unit
) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    var serviceType by remember { mutableStateOf(services.first().name) }
    var dropOffDate by remember { mutableStateOf("") }
    var paymentMethod by remember { mutableStateOf("GCASH") }
    var remarks by remember { mutableStateOf("") }
    var submitError by remember { mutableStateOf("") }
    var submitting by remember { mutableStateOf(false) }
    val pickedImages = remember { mutableStateListOf<Uri>() }
    val proofImage = remember { mutableStateOf<Uri?>(null) }

    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        pickedImages.clear()
        pickedImages.addAll(uris.take(3))
    }
    val proofPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        proofImage.value = uri
    }

    fun submit() {
        if (auth == null) {
            submitError = "Log in first."
            return
        }
        if (dropOffDate.isBlank()) {
            submitError = "Select a drop-off date."
            return
        }
        if (pickedImages.isEmpty()) {
            submitError = "Add 1 to 3 shoe photos."
            return
        }
        if (proofImage.value == null) {
            submitError = "Add your payment screenshot."
            return
        }

        scope.launch {
            submitting = true
            submitError = ""
            try {
                withContext(Dispatchers.IO) {
                    apiCreateBooking(
                        baseUrl = apiBaseUrl,
                        token = token,
                        serviceType = serviceType,
                        dropOffDate = dropOffDate,
                        paymentMethod = paymentMethod,
                        remarks = remarks,
                        imageUris = pickedImages.toList(),
                        paymentProofUri = proofImage.value!!,
                        context = context
                    )
                }
                onSubmitSuccess()
            } catch (t: Throwable) {
                submitError = t.message ?: "Booking failed"
            } finally {
                submitting = false
            }
        }
    }

    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Book Your Shoes", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(branch.address)
                }
            }
        }
        item {
            OutlinedTextField(
                value = serviceType,
                onValueChange = { serviceType = it },
                label = { Text("Service") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        item {
            OutlinedTextField(
                value = dropOffDate,
                onValueChange = { dropOffDate = it },
                label = { Text("Drop-off date (YYYY-MM-DD)") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Payment", fontWeight = FontWeight.Bold)
                    PaymentOption("GCASH", paymentMethod == "GCASH") { paymentMethod = "GCASH" }
                    PaymentOption("BPI", paymentMethod == "BPI") { paymentMethod = "BPI" }
                    Text("Open your mobile bank app, pay using the QR in the web version, then upload the screenshot below.")
                }
            }
        }
        item {
            Button(onClick = { imagePicker.launch("image/*") }, modifier = Modifier.fillMaxWidth()) {
                Text("Add shoe photos (${pickedImages.size}/3)")
            }
        }
        item {
            Button(onClick = { proofPicker.launch("image/*") }, modifier = Modifier.fillMaxWidth()) {
                Text(if (proofImage.value == null) "Add payment screenshot" else "Change payment screenshot")
            }
        }
        item {
            OutlinedTextField(
                value = remarks,
                onValueChange = { remarks = it },
                label = { Text("Remarks") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = ::submit,
                    enabled = !submitting,
                    colors = ButtonDefaults.buttonColors()
                ) {
                    Text(if (submitting) "Submitting..." else "Submit Booking")
                }
            }
        }
        if (submitError.isNotBlank()) {
            item { Text(submitError, color = MaterialTheme.colorScheme.error) }
        }
        item {
            if (pickedImages.isNotEmpty()) {
                Text("Selected shoe photos:")
                pickedImages.forEach { uri ->
                    AsyncImage(
                        model = uri,
                        contentDescription = null,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp)
                            .padding(top = 8.dp)
                            .clip(RoundedCornerShape(12.dp)),
                        contentScale = ContentScale.Crop
                    )
                }
            }
        }
    }
}

@Composable
private fun PaymentOption(label: String, selected: Boolean, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(selected = selected, onClick = onClick)
        Text(label)
    }
}

@Composable
private fun SuccessScreen(onBookAnother: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Booking Submitted", fontWeight = FontWeight.Bold)
            Text("Your request was sent successfully.")
            Button(onClick = onBookAnother) { Text("Book Another") }
        }
    }
}

@Composable
private fun LoginScreen(
    onLogin: (String, String) -> Unit,
    onRegister: (String, String, String) -> Unit
) {
    var isRegister by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text(if (isRegister) "Create account" else "Log in", fontWeight = FontWeight.Bold)
        if (isRegister) {
            OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full name") }, modifier = Modifier.fillMaxWidth())
        }
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") }, modifier = Modifier.fillMaxWidth())
        Button(onClick = {
            if (isRegister) onRegister(name, email, password) else onLogin(email, password)
        }) {
            Text(if (isRegister) "Register" else "Login")
        }
        OutlinedButton(onClick = { isRegister = !isRegister }) {
            Text(if (isRegister) "Switch to login" else "Switch to register")
        }
    }
}

@Composable
private fun AdminScreen(apiBaseUrl: String, token: String, auth: AuthResult?) {
    val scope = rememberCoroutineScope()
    var month by remember { mutableStateOf("2026-05") }
    var orders by remember { mutableStateOf(emptyList<AdminOrder>()) }
    var sales by remember { mutableStateOf<MonthlySales?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }

    fun loadOrders() {
        scope.launch {
            loading = true
            error = ""
            try {
                orders = withContext(Dispatchers.IO) { apiFetchAdminOrders(apiBaseUrl, token) }
            } catch (t: Throwable) {
                error = t.message ?: "Failed to load orders"
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
                sales = withContext(Dispatchers.IO) { apiFetchMonthlySales(apiBaseUrl, token, month) }
            } catch (t: Throwable) {
                error = t.message ?: "Failed to load sales"
            } finally {
                loading = false
            }
        }
    }

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Admin", fontWeight = FontWeight.Bold)
        if (auth?.role != "ADMIN") {
            Text("Admin access only.")
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = ::loadOrders) { Text("Load Orders") }
                Button(onClick = ::loadSales) { Text("Load Sales") }
            }
            OutlinedTextField(value = month, onValueChange = { month = it }, label = { Text("Month") }, modifier = Modifier.fillMaxWidth())
            if (loading) Text("Loading...")
            if (error.isNotBlank()) Text(error, color = MaterialTheme.colorScheme.error)
            sales?.let {
                Text("Month: ${it.month}")
                Text("Total Sales: ₱${it.totalSales}")
                Text("Completed Orders: ${it.completedOrders}")
            }
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(orders) { order ->
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Order #${order.id}", fontWeight = FontWeight.Bold)
                            Text("Client: ${order.clientName}")
                            Text("Service: ${order.serviceType ?: "N/A"}")
                            Text("Status: ${order.status}")
                        }
                    }
                }
            }
        }
    }
}

private fun apiLogin(baseUrl: String, email: String, password: String): AuthResult {
    val client = OkHttpClient()
    val body = JSONObject().apply {
        put("email", email)
        put("password", password)
    }
    val request = Request.Builder()
        .url("${baseUrl.trimEnd('/')}/auth/login")
        .post(body.toString().toRequestBody("application/json; charset=utf-8".toMediaType()))
        .build()
    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("Login failed: HTTP ${response.code}")
        val json = JSONObject(response.body?.string().orEmpty())
        return AuthResult(
            token = json.optString("token"),
            name = json.optString("name"),
            email = json.optString("email"),
            role = json.optString("role")
        )
    }
}

private fun apiRegister(baseUrl: String, name: String, email: String, password: String): AuthResult {
    val client = OkHttpClient()
    val body = JSONObject().apply {
        put("name", name)
        put("email", email)
        put("password", password)
    }
    val request = Request.Builder()
        .url("${baseUrl.trimEnd('/')}/auth/register")
        .post(body.toString().toRequestBody("application/json; charset=utf-8".toMediaType()))
        .build()
    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("Register failed: HTTP ${response.code}")
        val json = JSONObject(response.body?.string().orEmpty())
        return AuthResult(
            token = json.optString("token"),
            name = json.optString("name"),
            email = json.optString("email"),
            role = json.optString("role")
        )
    }
}

private fun apiCreateBooking(
    baseUrl: String,
    token: String,
    serviceType: String,
    dropOffDate: String,
    paymentMethod: String,
    remarks: String,
    imageUris: List<Uri>,
    paymentProofUri: Uri,
    context: android.content.Context
) {
    val client = OkHttpClient()
    val builder = MultipartBody.Builder().setType(MultipartBody.FORM)
    builder.addFormDataPart("dropOffDate", dropOffDate)
    builder.addFormDataPart("shoeType", serviceType)
    builder.addFormDataPart("paymentMethod", paymentMethod)
    builder.addFormDataPart("remarks", remarks)

    imageUris.forEachIndexed { index, uri ->
        val file = uriToTempFile(context, uri, "shoe_$index")
        builder.addFormDataPart(
            "images",
            file.name,
            file.asRequestBody("image/*".toMediaType())
        )
    }

    val proofFile = uriToTempFile(context, paymentProofUri, "payment_proof")
    builder.addFormDataPart(
        "paymentProof",
        proofFile.name,
        proofFile.asRequestBody("image/*".toMediaType())
    )

    val request = Request.Builder()
        .url("${baseUrl.trimEnd('/')}/client/orders")
        .addHeader("Authorization", "Bearer $token")
        .post(builder.build())
        .build()

    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) {
            throw IllegalStateException("Booking failed: HTTP ${response.code}")
        }
    }
}

private fun apiFetchAdminOrders(baseUrl: String, token: String): List<AdminOrder> {
    val client = OkHttpClient()
    val request = Request.Builder()
        .url("${baseUrl.trimEnd('/')}/admin/orders")
        .addHeader("Authorization", "Bearer $token")
        .get()
        .build()
    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("HTTP ${response.code}")
        val arr = JSONArray(response.body?.string().orEmpty())
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

private fun apiFetchMonthlySales(baseUrl: String, token: String, month: String): MonthlySales {
    val client = OkHttpClient()
    val request = Request.Builder()
        .url("${baseUrl.trimEnd('/')}/admin/orders/sales/monthly?month=$month")
        .addHeader("Authorization", "Bearer $token")
        .get()
        .build()
    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("HTTP ${response.code}")
        val json = JSONObject(response.body?.string().orEmpty())
        return MonthlySales(
            month = json.optString("month", month),
            totalSales = json.optDouble("totalSales", 0.0),
            completedOrders = json.optLong("completedOrders", 0L)
        )
    }
}

private fun uriToTempFile(context: android.content.Context, uri: Uri, prefix: String): File {
    val input = context.contentResolver.openInputStream(uri) ?: error("Cannot read selected file")
    val suffix = when (context.contentResolver.getType(uri)) {
        "image/png" -> ".png"
        "image/jpeg" -> ".jpg"
        else -> ".img"
    }
    val file = File.createTempFile(prefix, suffix, context.cacheDir)
    file.outputStream().use { output -> input.use { it.copyTo(output) } }
    return file
}
