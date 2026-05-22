package com.sia.mobile

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.Job
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

data class AuthResult(val token: String, val name: String, val email: String, val role: String)
data class ServiceItem(val name: String, val price: String, val desc: String, val details: List<String>)
data class BranchItem(val name: String, val address: String, val phone: String, val mapsUrl: String)
data class AdminOrder(val id: Long, val clientName: String, val serviceType: String?, val status: String, val quotedPrice: Double?)
data class MonthlySales(val month: String, val totalSales: Double, val completedOrders: Long)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { SiaApp() }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SiaApp() {
    var apiBaseUrl by remember { mutableStateOf(DEFAULT_API) }
    var token by remember { mutableStateOf("") }
    var auth by remember { mutableStateOf<AuthResult?>(null) }
    var page by remember { mutableStateOf("home") }
    var error by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var showLogin by remember { mutableStateOf(false) }
    var showNavMenu by rememberSaveable { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val homeListState = rememberLazyListState()
    var pendingScrollTarget by remember { mutableStateOf<Int?>(null) }

    val services = remember {
        listOf(
            ServiceItem("Standard Cleaning", "From \u20B1400", "Basic cleaning and dirt removal", listOf("Surface cleaning", "Dirt & dust removal", "Basic stain treatment", "Lace cleaning")),
            ServiceItem("Deep Cleaning", "From \u20B1600", "Intensive cleaning and stain treatment", listOf("Deep wash", "Stain removal", "Midsole cleaning", "Deodorizing")),
            ServiceItem("Reglue", "From \u20B1400", "Sole reattachment and repair", listOf("Sole repair", "Adhesive restoration", "Pressing", "Finish cleanup")),
            ServiceItem("Repaint", "\u20B1400", "Color restore and repaint", listOf("Color matching", "Paint application", "Seal finish"))
        )
    }
    val branches = remember {
        listOf(
            BranchItem("Revive Sneaker Care", "559 V Rama Ave, Cebu City, 6000 Cebu", "0954 159 1817", "https://www.google.com/maps?q=559+V+Rama+Ave,+Cebu+City,+6000+Cebu"),
            BranchItem("SM Megamall", "Lower Ground Floor, Building A, SM Megamall", "0905 205 5890", "https://www.google.com/maps?q=SM+Megamall")
        )
    }
    val reviews = remember {
        listOf(
            "Absolutely amazing service! My vintage Jordans looked brand new after their treatment.",
            "I was skeptical at first, but Revive completely transformed my dirty white sneakers.",
            "Professional, reliable, and the results speak for themselves."
        )
    }

    LaunchedEffect(pendingScrollTarget) {
        pendingScrollTarget?.let {
            homeListState.animateScrollToItem(it)
            pendingScrollTarget = null
        }
    }

    fun login(email: String, password: String) {
        scope.launch {
            loading = true
            error = ""
            try {
                val result = withContext(Dispatchers.IO) { apiLogin(apiBaseUrl, email, password) }
                auth = result
                token = result.token
                page = if (result.role == "ADMIN") "admin" else "home"
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
                    .background(ColorPalette.surface)
            ) {
                TopBar(
                    auth = auth,
                    onLogin = { showLogin = true },
                    onLogout = {
                        auth = null
                        token = ""
                        page = "home"
                    },
                    onAdmin = { page = "admin" },
                    onOpenMenu = { showNavMenu = true }
                )

                if (loading) {
                    Row(Modifier.padding(horizontal = 18.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Loading...")
                    }
                }
                if (error.isNotBlank()) {
                    Text(error, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(horizontal = 18.dp))
                }

                when (page) {
                    "home" -> WebStyleHome(
                        listState = homeListState,
                        services = services,
                        branches = branches,
                        reviews = reviews,
                        onBookNow = { page = "book" },
                        onLogin = { showLogin = true },
                        onOpenHome = { pendingScrollTarget = 0 },
                        onOpenServices = { pendingScrollTarget = 3 },
                        onOpenBranches = { pendingScrollTarget = 4 },
                        onOpenAbout = { pendingScrollTarget = 2 },
                        onOpenContact = { pendingScrollTarget = 7 }
                    )
                    "services" -> ServicesPage(services, onBookNow = { page = "book" })
                    "branches" -> BranchesPage(branches)
                    "book" -> BookingPage(
                        apiBaseUrl = apiBaseUrl,
                        token = token,
                        auth = auth,
                        services = services,
                        branch = branches.first(),
                        onSubmitSuccess = { page = "success" }
                    )
                    "success" -> SuccessPage(onBookAnother = { page = "book" })
                    "admin" -> AdminPage(apiBaseUrl = apiBaseUrl, token = token, auth = auth)
                }
            }
        }
    }

    if (showNavMenu) {
        ModalBottomSheet(
            onDismissRequest = { showNavMenu = false },
            dragHandle = null,
            containerColor = androidx.compose.ui.graphics.Color.White,
            tonalElevation = 0.dp,
            shape = RoundedCornerShape(topStart = 18.dp, topEnd = 18.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(horizontal = 18.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text("Menu", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = ColorPalette.text)
                Divider(color = ColorPalette.cream)
                NavMenuItem("Home") { pendingScrollTarget = 0; showNavMenu = false }
                NavMenuItem("Services") { pendingScrollTarget = 3; showNavMenu = false }
                NavMenuItem("Branches") { pendingScrollTarget = 4; showNavMenu = false }
                NavMenuItem("About Us") { pendingScrollTarget = 2; showNavMenu = false }
                NavMenuItem("Contact Us") { pendingScrollTarget = 7; showNavMenu = false }
                Divider(color = ColorPalette.cream)
                NavMenuItem(if (auth == null) "Log In" else "Log Out") {
                    if (auth == null) showLogin = true else {
                        auth = null
                        token = ""
                        page = "home"
                    }
                    showNavMenu = false
                }
                if (auth?.role == "ADMIN") {
                    NavMenuItem("Admin") { page = "admin"; showNavMenu = false }
                }
            }
        }
    }

    if (showLogin) {
        AuthSheet(
            onClose = { showLogin = false },
            onLogin = ::login,
            onRegister = { name, email, password ->
                scope.launch {
                    loading = true
                    error = ""
                    try {
                        val result = withContext(Dispatchers.IO) { apiRegister(apiBaseUrl, name, email, password) }
                        auth = result
                        token = result.token
                        page = "home"
                        showLogin = false
                    } catch (t: Throwable) {
                        error = t.message ?: "Registration failed"
                    } finally {
                        loading = false
                    }
                }
            }
        )
    }
}

object ColorPalette {
    val surface = androidx.compose.ui.graphics.Color(0xFFF9F7F4)
    val cream = androidx.compose.ui.graphics.Color(0xFFF0EBE4)
    val sand = androidx.compose.ui.graphics.Color(0xFF8B7355)
    val text = androidx.compose.ui.graphics.Color(0xFF3A2E1E)
    val muted = androidx.compose.ui.graphics.Color(0xFF777777)
    val dark = androidx.compose.ui.graphics.Color(0xFF0F1623)
}

@Composable
private fun TopBar(auth: AuthResult?, onLogin: () -> Unit, onLogout: () -> Unit, onAdmin: () -> Unit, onOpenMenu: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(androidx.compose.ui.graphics.Color.White)
            .padding(horizontal = 18.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(shape = RoundedCornerShape(2.dp), color = androidx.compose.ui.graphics.Color.White, modifier = Modifier.border(1.dp, ColorPalette.cream)) {
            Text("REVIVE", modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp), color = ColorPalette.sand, fontWeight = FontWeight.Bold)
        }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            TextButton(onClick = onOpenMenu) { Text("MENU", color = ColorPalette.text) }
            if (auth?.role == "ADMIN") {
                TextButton(onClick = onAdmin) { Text("ADMIN", color = ColorPalette.text) }
            }
        }
    }
}

@Composable
private fun WebStyleHome(
    listState: androidx.compose.foundation.lazy.LazyListState,
    services: List<ServiceItem>,
    branches: List<BranchItem>,
    reviews: List<String>,
    onBookNow: () -> Unit,
    onLogin: () -> Unit,
    onOpenHome: () -> Unit,
    onOpenServices: () -> Unit,
    onOpenBranches: () -> Unit,
    onOpenAbout: () -> Unit,
    onOpenContact: () -> Unit
) {
    LazyColumn(state = listState, verticalArrangement = Arrangement.spacedBy(0.dp)) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth().background(androidx.compose.ui.graphics.Color.White).padding(horizontal = 18.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(shape = RoundedCornerShape(2.dp), color = androidx.compose.ui.graphics.Color.White, modifier = Modifier.border(1.dp, ColorPalette.cream)) {
                    Text("REVIVE", modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp), color = ColorPalette.sand, fontWeight = FontWeight.Bold)
                }
                TextButton(onClick = onOpenServices) { Text("BOOK", color = ColorPalette.text) }
            }
        }
        item {
            HeroSection(onBookNow = onBookNow, onLogin = onLogin)
        }
        item {
            AboutSection()
        }
        item {
            ServicesSection(services = services, onBookNow = onBookNow, onOpenServices = onOpenServices)
        }
        item {
            BranchesSection(branches = branches, onOpenBranches = onOpenBranches)
        }
        item {
            ReviewsSection(reviews = reviews, onBookNow = onBookNow)
        }
        item {
            AuthoritySection()
        }
        item {
            FooterSection(onOpenServices = onOpenServices, onOpenBranches = onOpenBranches)
        }
    }
}

@Composable
private fun HeroSection(onBookNow: () -> Unit, onLogin: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(380.dp)
            .background(androidx.compose.ui.graphics.Color.Black)
    ) {
        androidx.compose.foundation.Image(
            painter = painterResource(id = R.drawable.branch_photo),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
        Box(modifier = Modifier.fillMaxSize().background(androidx.compose.ui.graphics.Color.Black.copy(alpha = 0.58f)))
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(18.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Spacer(Modifier.height(1.dp))
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Revitalize Your Sneakers, Restore Their Glory", color = androidx.compose.ui.graphics.Color.White, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("Specializing in the highest quality sneaker cleaning and restoration services. We treat your kicks like treasure.", color = androidx.compose.ui.graphics.Color.White)
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(onClick = onBookNow, colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.sand)) { Text("BOOK NOW ONLINE") }
                    OutlinedButton(onClick = onLogin) { Text("SEND SHOE") }
                }
            }
        }
    }
}

@Composable
private fun AboutSection() {
    Column(modifier = Modifier.fillMaxWidth().background(androidx.compose.ui.graphics.Color.White).padding(horizontal = 18.dp, vertical = 22.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("About Revive Sneaker Care", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
        Text("At Revive Sneaker Care, we're passionate about preserving the life and beauty of your favorite sneakers. Founded by sneaker enthusiasts, we understand the emotional and financial value of your collection.", color = ColorPalette.text)
        Text("Our team of skilled technicians uses industry-leading techniques and eco-friendly products to deliver exceptional results.", color = ColorPalette.text)
        Text("With multiple locations and convenient online booking, we make it easy to keep your sneakers looking fresh.", color = ColorPalette.text)
    }
}

@Composable
private fun ServicesSection(services: List<ServiceItem>, onBookNow: () -> Unit, onOpenServices: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().background(ColorPalette.surface).padding(horizontal = 18.dp, vertical = 22.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Our Services", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
        Text("Professional sneaker care services tailored to restore and maintain your footwear collection", color = ColorPalette.text)
        services.forEachIndexed { index, service ->
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White)) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (index == 0) {
                        androidx.compose.foundation.Image(
                            painter = painterResource(id = R.drawable.branch_photo),
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxWidth().height(180.dp)
                        )
                    }
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(service.name, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
                        Text(service.desc, color = ColorPalette.text)
                        service.details.forEach { detail ->
                            Text("• $detail", color = ColorPalette.text)
                        }
                        Text(service.price, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = onBookNow, colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.dark)) { Text("ADD TO CART") }
                            Button(onClick = onOpenServices, colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.sand)) { Text("BOOK NOW") }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun BranchesSection(branches: List<BranchItem>, onOpenBranches: () -> Unit) {
    val context = LocalContext.current
    Column(modifier = Modifier.fillMaxWidth().background(androidx.compose.ui.graphics.Color.White).padding(horizontal = 18.dp, vertical = 22.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Our Branches", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
        Text("Visit us at any of our convenient locations for professional sneaker care services", color = ColorPalette.text)
        branches.forEach { branch ->
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(branch.name, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
                    Text(branch.address, color = ColorPalette.text)
                    Text(branch.phone, color = ColorPalette.text)
                    Button(onClick = onOpenBranches, colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.sand)) { Text("GO TO LOCATION") }
                    androidx.compose.foundation.Image(
                        painter = painterResource(id = R.drawable.branch_photo),
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxWidth().height(170.dp).clip(RoundedCornerShape(10.dp))
                    )
                    Button(onClick = {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(branch.mapsUrl)))
                    }, colors = ButtonDefaults.buttonColors(containerColor = androidx.compose.ui.graphics.Color.White)) {
                        Text("Open in Maps", color = ColorPalette.text)
                    }
                }
            }
        }
    }
}

@Composable
private fun ReviewsSection(reviews: List<String>, onBookNow: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().background(ColorPalette.dark).padding(horizontal = 18.dp, vertical = 22.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("What Our Clients Say", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = androidx.compose.ui.graphics.Color.White)
        Text("Professional, friendly, and reliable-they always go above and beyond to make our sneakers shine.", color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.8f))
        reviews.forEachIndexed { index, review ->
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color(0xFF1A2232))) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("★★★★★", color = ColorPalette.sand)
                    Text(review, color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.9f))
                    Text(listOf("Michael Chen", "Sarah Johnson", "David Martinez")[index], color = ColorPalette.sand)
                }
            }
        }
        Button(onClick = onBookNow, colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.sand)) { Text("SCHEDULE A CLEANING") }
    }
}

@Composable
private fun AuthoritySection() {
    Column(modifier = Modifier.fillMaxWidth().background(ColorPalette.surface).padding(horizontal = 18.dp, vertical = 22.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("The Authority is here!", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
        Text("Our experienced team uses only the best products and techniques to ensure your sneakers receive the care they deserve.", color = ColorPalette.text)
        listOf(
            "Trusted Service" to "Years of experience in professional sneaker care",
            "Eco-Friendly" to "Premium, environmentally safe cleaning solutions",
            "Quality Guaranteed" to "100% satisfaction or your money back"
        ).forEach { (title, body) ->
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = ColorPalette.sand)) {
                Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("◉", color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.Bold)
                    Text(title, color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.Bold)
                    Text(body, color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.9f))
                }
            }
        }
    }
}

@Composable
private fun FooterSection(onOpenServices: () -> Unit, onOpenBranches: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().background(androidx.compose.ui.graphics.Color.Black).padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("REVIVE Sneaker Care", color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.Bold)
        Text("Professional sneaker cleaning and restoration services. Bringing your kicks back to life.", color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.65f))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            TextButton(onClick = onOpenServices) { Text("Services", color = androidx.compose.ui.graphics.Color.White) }
            TextButton(onClick = onOpenBranches) { Text("Branches", color = androidx.compose.ui.graphics.Color.White) }
        }
        Text("0954 159 1817", color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.65f))
        Text("info@revivesneakercare.com", color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.65f))
        Text("559 V Rama Ave, Cebu City, 6000 Cebu", color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.65f))
    }
}

@Composable
private fun ServicesPage(services: List<ServiceItem>, onBookNow: () -> Unit) {
    Column(Modifier.fillMaxSize().background(ColorPalette.surface).padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Our Services", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
        services.forEach { service ->
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White)) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    androidx.compose.foundation.Image(painter = painterResource(id = R.drawable.branch_photo), contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxWidth().height(180.dp))
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(service.name, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
                        Text(service.desc, color = ColorPalette.text)
                        service.details.forEach { Text("• $it", color = ColorPalette.text) }
                        Text(service.price, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = onBookNow, colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.dark)) { Text("ADD TO CART") }
                            Button(onClick = onBookNow, colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.sand)) { Text("BOOK NOW") }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun BranchesPage(branches: List<BranchItem>) {
    Column(Modifier.fillMaxSize().background(ColorPalette.surface).padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Our Branches", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
        branches.forEach { branch ->
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(branch.name, fontWeight = FontWeight.Bold, color = ColorPalette.sand)
                    Text(branch.address, color = ColorPalette.text)
                    Text(branch.phone, color = ColorPalette.text)
                }
            }
        }
    }
}

@Composable
private fun BookingPage(
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

    val imagePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetMultipleContents()) { uris ->
        pickedImages.clear()
        pickedImages.addAll(uris.take(3))
    }
    val proofPicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri -> proofImage.value = uri }

    fun submit() {
        if (auth == null) { submitError = "Log in first."; return }
        if (dropOffDate.isBlank()) { submitError = "Select a drop-off date."; return }
        if (pickedImages.isEmpty()) { submitError = "Add 1 to 3 shoe photos."; return }
        if (proofImage.value == null) { submitError = "Add your payment screenshot."; return }
        scope.launch {
            submitting = true
            submitError = ""
            try {
                withContext(Dispatchers.IO) {
                    apiCreateBooking(apiBaseUrl, token, serviceType, dropOffDate, paymentMethod, remarks, pickedImages.toList(), proofImage.value!!, context)
                }
                onSubmitSuccess()
            } catch (t: Throwable) {
                submitError = t.message ?: "Booking failed"
            } finally {
                submitting = false
            }
        }
    }

    LazyColumn(Modifier.fillMaxSize().background(ColorPalette.surface).padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = ColorPalette.cream)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Book Appointment", fontWeight = FontWeight.Bold, color = ColorPalette.sand)
                    Text(branch.address, color = ColorPalette.text)
                    Text("Payment via GCash or BPI. Upload your payment screenshot before submitting.", color = ColorPalette.text)
                }
            }
        }
        item { OutlinedTextField(value = serviceType, onValueChange = { serviceType = it }, label = { Text("Service") }, modifier = Modifier.fillMaxWidth()) }
        item { OutlinedTextField(value = dropOffDate, onValueChange = { dropOffDate = it }, label = { Text("Drop-off date (YYYY-MM-DD)") }, modifier = Modifier.fillMaxWidth()) }
        item {
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Payment Method", fontWeight = FontWeight.Bold, color = ColorPalette.text)
                    PaymentOption("GCASH", paymentMethod == "GCASH") { paymentMethod = "GCASH" }
                    PaymentOption("BPI", paymentMethod == "BPI") { paymentMethod = "BPI" }
                }
            }
        }
        item {
            Button(onClick = { imagePicker.launch("image/*") }, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.sand)) {
                Text("Add shoe photos (${pickedImages.size}/3)")
            }
        }
        item {
            Button(onClick = { proofPicker.launch("image/*") }, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.sand)) {
                Text(if (proofImage.value == null) "Add payment screenshot" else "Change payment screenshot")
            }
        }
        item { OutlinedTextField(value = remarks, onValueChange = { remarks = it }, label = { Text("Notes") }, modifier = Modifier.fillMaxWidth()) }
        item {
            Button(onClick = ::submit, enabled = !submitting, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.dark)) {
                Text(if (submitting) "Submitting..." else "Submit Booking")
            }
        }
        if (submitError.isNotBlank()) item { Text(submitError, color = MaterialTheme.colorScheme.error) }
        if (pickedImages.isNotEmpty()) {
            item { Text("Selected shoe photos", fontWeight = FontWeight.Bold, color = ColorPalette.text) }
            items(pickedImages) { uri ->
                AsyncImage(model = uri, contentDescription = null, modifier = Modifier.fillMaxWidth().height(150.dp).clip(RoundedCornerShape(14.dp)), contentScale = ContentScale.Crop)
            }
        }
    }
}

@Composable
private fun PaymentOption(label: String, selected: Boolean, onClick: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick).padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        RadioButton(selected = selected, onClick = onClick)
        Text(label)
    }
}

@Composable
private fun SuccessPage(onBookAnother: () -> Unit) {
    Column(Modifier.fillMaxSize().background(ColorPalette.surface).padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Booking Submitted", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.headlineSmall, color = ColorPalette.sand)
        Text("Your request was sent successfully.", color = ColorPalette.text)
        Button(onClick = onBookAnother, colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.sand)) { Text("Book Another") }
    }
}

@Composable
private fun AuthSheet(onClose: () -> Unit, onLogin: (String, String) -> Unit, onRegister: (String, String, String) -> Unit) {
    var isRegister by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    Surface(
        color = androidx.compose.ui.graphics.Color.Black.copy(alpha = 0.45f),
        modifier = Modifier.fillMaxSize()
    ) {
        Box(modifier = Modifier.fillMaxSize().clickable(onClick = onClose)) {
            Card(
                modifier = Modifier.align(Alignment.Center).padding(18.dp).clickable(enabled = false, onClick = {}),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White)
            ) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(if (isRegister) "Create your account" else "Welcome back", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = ColorPalette.text)
                    if (isRegister) OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full name") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = { if (isRegister) onRegister(name, email, password) else onLogin(email, password) }, colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.sand)) {
                        Text(if (isRegister) "Create account" else "Log in")
                    }
                    OutlinedButton(onClick = { isRegister = !isRegister }) { Text(if (isRegister) "Switch to login" else "Switch to register") }
                    TextButton(onClick = onClose) { Text("Close") }
                }
            }
        }
    }
}

@Composable
private fun AdminPage(apiBaseUrl: String, token: String, auth: AuthResult?) {
    val scope = rememberCoroutineScope()
    var month by remember { mutableStateOf("2026-05") }
    var orders by remember { mutableStateOf(emptyList<AdminOrder>()) }
    var sales by remember { mutableStateOf<MonthlySales?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    fun loadOrders() { scope.launch { loading = true; error = ""; try { orders = withContext(Dispatchers.IO) { apiFetchAdminOrders(apiBaseUrl, token) } } catch (t: Throwable) { error = t.message ?: "Failed to load orders" } finally { loading = false } } }
    fun loadSales() { scope.launch { loading = true; error = ""; try { sales = withContext(Dispatchers.IO) { apiFetchMonthlySales(apiBaseUrl, token, month) } } catch (t: Throwable) { error = t.message ?: "Failed to load sales" } finally { loading = false } } }
    Column(Modifier.fillMaxSize().background(ColorPalette.surface).padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Admin", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.headlineSmall, color = ColorPalette.text)
        if (auth?.role != "ADMIN") {
            Text("Admin access only.", color = ColorPalette.muted)
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = ::loadOrders, colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.dark)) { Text("Load Orders") }
                Button(onClick = ::loadSales, colors = ButtonDefaults.buttonColors(containerColor = ColorPalette.sand)) { Text("Load Sales") }
            }
            OutlinedTextField(value = month, onValueChange = { month = it }, label = { Text("Month") }, modifier = Modifier.fillMaxWidth())
            if (loading) Text("Loading...", color = ColorPalette.muted)
            if (error.isNotBlank()) Text(error, color = MaterialTheme.colorScheme.error)
            sales?.let {
                Text("Month: ${it.month}", color = ColorPalette.text)
                Text("Total Sales: ${it.totalSales}", color = ColorPalette.text)
                Text("Completed Orders: ${it.completedOrders}", color = ColorPalette.text)
            }
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(orders) { order ->
                    Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White)) {
                        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Order #${order.id}", fontWeight = FontWeight.Bold, color = ColorPalette.text)
                            Text("Client: ${order.clientName}", color = ColorPalette.muted)
                            Text("Service: ${order.serviceType ?: "N/A"}", color = ColorPalette.muted)
                            Text("Status: ${order.status}", color = ColorPalette.muted)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun NavMenuItem(label: String, onClick: () -> Unit) {
    TextButton(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = ButtonDefaults.textButtonColors(contentColor = ColorPalette.text)
    ) {
        Text(label, modifier = Modifier.fillMaxWidth())
    }
}
private fun apiLogin(baseUrl: String, email: String, password: String): AuthResult {
    val client = OkHttpClient()
    val body = JSONObject().apply { put("email", email); put("password", password) }
    val request = Request.Builder().url("${baseUrl.trimEnd('/')}/auth/login").post(body.toString().toRequestBody("application/json; charset=utf-8".toMediaType())).build()
    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("Login failed: HTTP ${response.code}")
        val json = JSONObject(response.body?.string().orEmpty())
        return AuthResult(json.optString("token"), json.optString("name"), json.optString("email"), json.optString("role"))
    }
}

private fun apiRegister(baseUrl: String, name: String, email: String, password: String): AuthResult {
    val client = OkHttpClient()
    val body = JSONObject().apply { put("name", name); put("email", email); put("password", password) }
    val request = Request.Builder().url("${baseUrl.trimEnd('/')}/auth/register").post(body.toString().toRequestBody("application/json; charset=utf-8".toMediaType())).build()
    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("Register failed: HTTP ${response.code}")
        val json = JSONObject(response.body?.string().orEmpty())
        return AuthResult(json.optString("token"), json.optString("name"), json.optString("email"), json.optString("role"))
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
        builder.addFormDataPart("images", file.name, file.asRequestBody("image/*".toMediaType()))
    }
    val proofFile = uriToTempFile(context, paymentProofUri, "payment_proof")
    builder.addFormDataPart("paymentProof", proofFile.name, proofFile.asRequestBody("image/*".toMediaType()))
    val request = Request.Builder().url("${baseUrl.trimEnd('/')}/client/orders").addHeader("Authorization", "Bearer $token").post(builder.build()).build()
    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("Booking failed: HTTP ${response.code}")
    }
}

private fun apiFetchAdminOrders(baseUrl: String, token: String): List<AdminOrder> {
    val client = OkHttpClient()
    val request = Request.Builder().url("${baseUrl.trimEnd('/')}/admin/orders").addHeader("Authorization", "Bearer $token").get().build()
    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("HTTP ${response.code}")
        val arr = JSONArray(response.body?.string().orEmpty())
        return (0 until arr.length()).map { idx ->
            val o = arr.getJSONObject(idx)
            AdminOrder(o.optLong("id"), o.optString("clientName", "Unknown"), o.optString("serviceType", null), o.optString("status", "UNKNOWN"), if (o.isNull("quotedPrice")) null else o.optDouble("quotedPrice"))
        }
    }
}

private fun apiFetchMonthlySales(baseUrl: String, token: String, month: String): MonthlySales {
    val client = OkHttpClient()
    val request = Request.Builder().url("${baseUrl.trimEnd('/')}/admin/orders/sales/monthly?month=$month").addHeader("Authorization", "Bearer $token").get().build()
    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) throw IllegalStateException("HTTP ${response.code}")
        val json = JSONObject(response.body?.string().orEmpty())
        return MonthlySales(json.optString("month", month), json.optDouble("totalSales", 0.0), json.optLong("completedOrders", 0L))
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
