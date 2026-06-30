// Default Mock Menu Items
const DEFAULT_MENU = [
  {
    id: "m1",
    name: "ผัดไทยกุ้งสด (Classic Pad Thai)",
    description: "ผัดไทยสูตรดั้งเดิม เส้นจันท์เหนียวนุ่ม ผัดกับซอสสูตรพิเศษและกุ้งแม่น้ำตัวโต",
    price: 150.00,
    category: "Mains",
    image_url: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m2",
    name: "แกงเขียวหวานไก่ (Green Curry Chicken)",
    description: "แกงเขียวหวานรสชาติเข้มข้น หอมเครื่องแกง ทานคู่กับมะเขือเปราะและข้าวสวยร้อนๆ",
    price: 180.00,
    category: "Mains",
    image_url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m3",
    name: "ต้มยำกุ้งน้ำข้น (Tom Yum Goong)",
    description: "ต้มยำกุ้งน้ำข้นรสจัดจ้าน ครบเครื่องสมุนไพร ข่า ตะไคร้ ใบมะกรูด และเห็ดฟาง",
    price: 220.00,
    category: "Mains",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m4",
    name: "ทอดมันกุ้ง (Thai Shrimp Cakes)",
    description: "ทอดมันกุ้งชุบเกล็ดขนมปังทอดจนเหลืองกรอบ เนื้อกุ้งเด้ง ทานคู่กับน้ำจิ้มบ๊วยเจี่ย",
    price: 120.00,
    category: "Appetizers",
    image_url: "https://images.unsplash.com/photo-1582450871972-ab5ca641643d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m5",
    name: "ข้าวเหนียวมะม่วง (Mango Sticky Rice)",
    description: "มะม่วงน้ำดอกไม้หวานฉ่ำ เสิร์ฟพร้อมข้าวเหนียวมูนราดน้ำกะทิสดเข้มข้น",
    price: 140.00,
    category: "Desserts",
    image_url: "https://images.unsplash.com/photo-1528279027-68f0d7fce9f1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m6",
    name: "ชาไทยเย็น (Thai Iced Tea)",
    description: "ชาไทยสีส้มเป็นเอกลักษณ์ รสชาติหอมหวานมัน เข้มข้นกลมกล่อม",
    price: 65.00,
    category: "Drinks",
    image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80"
  }
];

// App State
let supabaseClient = null;
let isMockMode = true;
let menuItems = [];
let cart = [];
let activeCategory = "all";

// Elements DOM
const elements = {
  btnLogo: document.getElementById('btn-logo'),
  btnOpenCart: document.getElementById('btn-open-cart'),
  btnOpenSettings: document.getElementById('btn-open-settings'),
  btnScrollMenu: document.getElementById('btn-scroll-menu'),
  btnConfigureDb: document.getElementById('btn-configure-db'),
  btnCloseCart: document.getElementById('btn-close-cart'),
  btnSubmitOrder: document.getElementById('btn-submit-order'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  btnSaveSettings: document.getElementById('btn-save-settings'),
  btnUseMock: document.getElementById('btn-use-mock'),
  btnPrintReceipt: document.getElementById('btn-print-receipt'),
  btnOrderMore: document.getElementById('btn-order-more'),
  
  cartCount: document.getElementById('cart-count'),
  dbStatusBanner: document.getElementById('db-status-banner'),
  dbStatusText: document.getElementById('db-status-text'),
  categoriesContainer: document.getElementById('categories-container'),
  menuGrid: document.getElementById('menu-grid'),
  
  cartBackdrop: document.getElementById('cart-backdrop'),
  cartDrawer: document.getElementById('cart-drawer'),
  cartContent: document.getElementById('cart-content'),
  checkoutFormContainer: document.getElementById('checkout-form-container'),
  checkoutForm: document.getElementById('checkout-form'),
  
  summarySubtotal: document.getElementById('summary-subtotal'),
  summaryVat: document.getElementById('summary-vat'),
  summaryTotal: document.getElementById('summary-total'),
  
  settingsBackdrop: document.getElementById('settings-backdrop'),
  inputSbUrl: document.getElementById('input-sb-url'),
  inputSbKey: document.getElementById('input-sb-key'),
  
  menuSection: document.getElementById('menu-section'),
  successScreen: document.getElementById('success-screen'),
  
  // Checkout Form Inputs
  inputCustomerName: document.getElementById('input-customer-name'),
  inputPhone: document.getElementById('input-phone'),
  inputTable: document.getElementById('input-table'),
  
  // Receipt Elements
  receiptId: document.getElementById('receipt-id'),
  receiptDate: document.getElementById('receipt-date'),
  receiptCustomerName: document.getElementById('receipt-customer-name'),
  receiptCustomerPhone: document.getElementById('receipt-customer-phone'),
  receiptTableNum: document.getElementById('receipt-table-num'),
  receiptItemsContainer: document.getElementById('receipt-items-container'),
  receiptSubtotal: document.getElementById('receipt-subtotal'),
  receiptVat: document.getElementById('receipt-vat'),
  receiptTotalAmount: document.getElementById('receipt-total-amount'),
  receiptBarcodeNumber: document.getElementById('receipt-barcode-number'),
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  initSupabase();
  setupEventListeners();
  await loadMenu();
  renderCart();
});

// Setup Supabase Client
function initSupabase() {
  const sbUrl = localStorage.getItem('sb_url');
  const sbKey = localStorage.getItem('sb_key');

  if (sbUrl && sbKey) {
    try {
      // Initialize Supabase via global window object from loaded CDN
      supabaseClient = window.supabase.createClient(sbUrl, sbKey);
      isMockMode = false;
      
      // Update UI Banner
      elements.dbStatusBanner.className = "db-status-banner";
      elements.dbStatusText.innerText = "เชื่อมต่อฐานข้อมูล Supabase Cloud เรียบร้อยแล้ว (ใช้งานจริง)";
      elements.btnConfigureDb.innerText = "แก้ไขการตั้งค่า";
      
      // Fill modal inputs
      elements.inputSbUrl.value = sbUrl;
      elements.inputSbKey.value = sbKey;
    } catch (error) {
      console.error("Failed to initialize Supabase:", error);
      fallbackToMock("ไม่สามารถเชื่อมต่อ Supabase ได้ กรุณาตรวจสอบค่าความถูกต้อง");
    }
  } else {
    fallbackToMock("โหมดจำลอง (ใช้งานผ่าน LocalStorage) ตั้งค่า Supabase เพื่อจัดเก็บข้อมูลจริง");
  }
}

function fallbackToMock(message) {
  supabaseClient = null;
  isMockMode = true;
  elements.dbStatusBanner.className = "db-status-banner mock";
  elements.dbStatusText.innerText = message;
  elements.btnConfigureDb.innerText = "ตั้งค่าเชื่อมต่อ";
}

// Load and Fetch Menu Items
async function loadMenu() {
  elements.menuGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
      <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--primary);"></i>
      <p style="margin-top: 12px;">กำลังดึงรายการอาหารจากฐานข้อมูล...</p>
    </div>
  `;

  if (!isMockMode && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('menu_items')
        .select('*')
        .order('name');
        
      if (error) throw error;

      if (data && data.length > 0) {
        menuItems = data;
      } else {
        // Table is empty, let's auto-seed default menu items for a premium developer experience
        console.log("Database table 'menu_items' is empty. Seeding default items...");
        await seedDatabase();
      }
    } catch (error) {
      console.error("Error loading menu from Supabase, falling back to mock menu:", error);
      menuItems = DEFAULT_MENU;
    }
  } else {
    // Check if we have customized menu in localStorage, else use default
    const localMenu = localStorage.getItem('local_menu');
    if (localMenu) {
      menuItems = JSON.parse(localMenu);
    } else {
      menuItems = DEFAULT_MENU;
      localStorage.setItem('local_menu', JSON.stringify(DEFAULT_MENU));
    }
  }

  renderMenu();
}

// Seed Default Menu Items into Supabase
async function seedDatabase() {
  if (isMockMode || !supabaseClient) return;

  try {
    const itemsToSeed = DEFAULT_MENU.map(item => {
      // Remove local m1, m2 ids so Supabase generates UUIDs
      const { id, ...rest } = item;
      return rest;
    });

    const { data, error } = await supabaseClient
      .from('menu_items')
      .insert(itemsToSeed)
      .select();

    if (error) throw error;
    
    console.log("Database seeded successfully!");
    menuItems = data;
  } catch (error) {
    console.error("Failed to seed database:", error);
    // Fall back to default menu items in memory
    menuItems = DEFAULT_MENU;
  }
}

// Render Menu Cards
function renderMenu() {
  elements.menuGrid.innerHTML = "";
  
  const filteredItems = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  if (filteredItems.length === 0) {
    elements.menuGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fa-solid fa-face-frown" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
        <p>ไม่พบรายการอาหารในหมวดหมู่นี้</p>
      </div>
    `;
    return;
  }

  filteredItems.forEach(item => {
    // Find if item is already in cart
    const cartItem = cart.find(c => c.menuItem.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const card = document.createElement('div');
    card.className = 'menu-card';
    card.dataset.id = item.id;
    
    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}" alt="${item.name}">
        <span class="card-badge">${translateCategory(item.category)}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${item.name}</h3>
        <p class="card-desc">${item.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
        <div class="card-footer">
          <div class="card-price">฿${parseFloat(item.price).toFixed(2)}</div>
          <div class="card-actions">
            ${quantity === 0 
              ? `<button class="btn-text btn-add-to-cart" onclick="handleAddToCart('${item.id}')">
                  <i class="fa-solid fa-plus"></i> เพิ่มลงตะกร้า
                 </button>`
              : `<div class="quantity-control">
                  <button class="quantity-btn" onclick="handleUpdateQty('${item.id}', -1)">-</button>
                  <span class="quantity-value">${quantity}</span>
                  <button class="quantity-btn" onclick="handleUpdateQty('${item.id}', 1)">+</button>
                 </div>`
            }
          </div>
        </div>
      </div>
    `;
    elements.menuGrid.appendChild(card);
  });
}

// Global functions attached to window for event execution from HTML string templates
window.handleAddToCart = (itemId) => {
  const item = menuItems.find(m => m.id === itemId);
  if (!item) return;
  
  cart.push({ menuItem: item, quantity: 1 });
  saveCartState();
  renderMenu();
  renderCart();
  showCart(true); // Open drawer automatically on first add
};

window.handleUpdateQty = (itemId, change) => {
  const index = cart.findIndex(c => c.menuItem.id === itemId);
  if (index === -1) return;

  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  
  saveCartState();
  renderMenu();
  renderCart();
};

// Render Cart Panel
function renderCart() {
  const cartContent = elements.cartContent;
  cartContent.innerHTML = "";
  
  // Update header count badge
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  elements.cartCount.innerText = totalItemsCount;
  
  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-basket-shopping"></i>
        <p>ตะกร้าสินค้าของคุณยังว่างเปล่า<br>เลือกเมนูอร่อยๆ ใส่ตะกร้าได้เลย!</p>
      </div>
    `;
    elements.checkoutFormContainer.style.display = "none";
    return;
  }

  // Draw cart items
  const listContainer = document.createElement('div');
  listContainer.className = 'cart-items-list';
  
  cart.forEach(item => {
    const itemTotal = item.menuItem.price * item.quantity;
    const itemRow = document.createElement('div');
    itemRow.className = 'cart-item';
    itemRow.innerHTML = `
      <img src="${item.menuItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}" class="cart-item-img" alt="${item.menuItem.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.menuItem.name}</div>
        <div class="cart-item-price">฿${parseFloat(item.menuItem.price).toFixed(2)}</div>
      </div>
      <div class="cart-item-actions">
        <div class="quantity-control">
          <button class="quantity-btn" onclick="handleUpdateQty('${item.menuItem.id}', -1)">-</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn" onclick="handleUpdateQty('${item.menuItem.id}', 1)">+</button>
        </div>
      </div>
    `;
    listContainer.appendChild(itemRow);
  });
  
  cartContent.appendChild(listContainer);
  
  // Calculate Totals
  const subtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const vat = subtotal * 0.07;
  const total = subtotal + vat;
  
  elements.summarySubtotal.innerText = `฿${subtotal.toFixed(2)}`;
  elements.summaryVat.innerText = `฿${vat.toFixed(2)}`;
  elements.summaryTotal.innerText = `฿${total.toFixed(2)}`;
  
  elements.checkoutFormContainer.style.display = "block";
}

// Checkout & Submit Order
async function submitOrder() {
  if (cart.length === 0) return;

  const customerName = elements.inputCustomerName.value.trim();
  const phone = elements.inputPhone.value.trim();
  const table = elements.inputTable.value.trim();

  if (!customerName || !phone || !table) {
    alert("กรุณากรอกข้อมูลผู้สั่งและหมายเลขโต๊ะให้ครบถ้วน");
    return;
  }

  // Show Loading Spinner state on checkout button
  const originalBtnContent = elements.btnSubmitOrder.innerHTML;
  elements.btnSubmitOrder.disabled = true;
  elements.btnSubmitOrder.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังส่งการสั่งซื้อ...`;

  const orderTotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0) * 1.07;
  const newOrderId = generateOrderId();
  const orderDate = new Date();

  let orderSuccess = false;
  let finalOrderId = newOrderId;

  if (!isMockMode && supabaseClient) {
    try {
      // 1. Create order record
      const { data: orderData, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          customer_name: customerName,
          phone: phone,
          table_number: table,
          total_amount: parseFloat(orderTotal.toFixed(2)),
          status: 'pending'
        })
        .select();

      if (orderError) throw orderError;

      if (orderData && orderData.length > 0) {
        const orderIdInDb = orderData[0].id;
        finalOrderId = orderIdInDb.substring(0, 8).toUpperCase(); // Shorten UUID for receipt code visual

        // 2. Create order items record
        const itemsToInsert = cart.map(item => ({
          order_id: orderIdInDb,
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          price: parseFloat(item.menuItem.price)
        }));

        const { error: itemsError } = await supabaseClient
          .from('order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
        orderSuccess = true;
      }
    } catch (error) {
      console.error("Supabase order submission failed. Falling back to local order:", error);
      alert("ไม่สามารถเชื่อมต่อฐานข้อมูลได้ ระบบจะบันทึกแบบออฟไลน์แทนเพื่อให้ทำงานเสร็จสิ้น");
      orderSuccess = saveMockOrderLocally(customerName, phone, table, orderTotal, orderDate, newOrderId);
    }
  } else {
    // Mock Mode order submission
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate networking delay
    orderSuccess = saveMockOrderLocally(customerName, phone, table, orderTotal, orderDate, newOrderId);
  }

  // Restore button state
  elements.btnSubmitOrder.disabled = false;
  elements.btnSubmitOrder.innerHTML = originalBtnContent;

  if (orderSuccess) {
    showCart(false);
    renderReceipt(finalOrderId, orderDate, customerName, phone, table);
    
    // Clear cart and update
    cart = [];
    saveCartState();
    renderMenu();
    renderCart();
    
    // Smooth transition UI
    elements.menuSection.style.display = "none";
    elements.successScreen.style.display = "flex";
    elements.successScreen.scrollIntoView({ behavior: 'smooth' });
  }
}

function saveMockOrderLocally(customerName, phone, table, totalAmount, date, orderId) {
  try {
    const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    const newOrder = {
      id: orderId,
      customer_name: customerName,
      phone: phone,
      table_number: table,
      total_amount: totalAmount,
      date: date.toISOString(),
      items: cart.map(c => ({
        name: c.menuItem.name,
        price: c.menuItem.price,
        quantity: c.quantity
      }))
    };
    orders.push(newOrder);
    localStorage.setItem('mock_orders', JSON.stringify(orders));
    return true;
  } catch (error) {
    console.error("Local order save failed:", error);
    return true; // Return true anyway for visual mock success
  }
}

// Generate Receipt UI In Light Mode
function renderReceipt(orderId, orderDate, customerName, phone, tableNum) {
  elements.receiptId.innerText = `REC-${orderId}`;
  elements.receiptDate.innerText = formatDate(orderDate);
  elements.receiptCustomerName.innerText = customerName;
  elements.receiptCustomerPhone.innerText = phone;
  elements.receiptTableNum.innerText = `Table ${tableNum}`;

  // Populate items
  const itemsContainer = elements.receiptItemsContainer;
  itemsContainer.innerHTML = "";

  let subtotal = 0;
  cart.forEach(item => {
    const itemTotal = item.menuItem.price * item.quantity;
    subtotal += itemTotal;

    const row = document.createElement('div');
    row.className = 'receipt-item-row';
    row.innerHTML = `
      <div class="receipt-item-desc">
        <div>${item.menuItem.name}</div>
        <div class="receipt-item-price-calc">${item.quantity} x ฿${parseFloat(item.menuItem.price).toFixed(2)}</div>
      </div>
      <div class="receipt-item-total">฿${itemTotal.toFixed(2)}</div>
    `;
    itemsContainer.appendChild(row);
  });

  const vat = subtotal * 0.07;
  const grandTotal = subtotal + vat;

  elements.receiptSubtotal.innerText = `฿${subtotal.toFixed(2)}`;
  elements.receiptVat.innerText = `฿${vat.toFixed(2)}`;
  elements.receiptTotalAmount.innerText = `฿${grandTotal.toFixed(2)}`;
  
  // Set barcode digits matching order timestamp
  const barcodeStr = orderDate.getFullYear().toString() + 
                     String(orderDate.getMonth() + 1).padStart(2, '0') + 
                     String(orderDate.getDate()).padStart(2, '0') + 
                     orderId.substring(0, 4);
  elements.receiptBarcodeNumber.innerText = barcodeStr;
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation Logo click resets
  elements.btnLogo.addEventListener('click', (e) => {
    e.preventDefault();
    resetToMain();
  });
  
  // Scroll to menu
  elements.btnScrollMenu.addEventListener('click', () => {
    elements.menuSection.scrollIntoView({ behavior: 'smooth' });
  });

  // Database Notice Banner Config click
  elements.btnConfigureDb.addEventListener('click', () => showSettings(true));
  elements.btnOpenSettings.addEventListener('click', () => showSettings(true));
  elements.btnOpenCart.addEventListener('click', () => showCart(true));
  
  // Close buttons
  elements.btnCloseCart.addEventListener('click', () => showCart(false));
  elements.cartBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.cartBackdrop) showCart(false);
  });
  elements.btnCloseSettings.addEventListener('click', () => showSettings(false));
  elements.settingsBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.settingsBackdrop) showSettings(false);
  });
  
  // Category tabs filter
  elements.categoriesContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.category-tab');
    if (!tab) return;
    
    // Toggle active state
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    activeCategory = tab.dataset.category;
    renderMenu();
  });
  
  // Submit Order Form
  elements.btnSubmitOrder.addEventListener('click', (e) => {
    e.preventDefault();
    if (elements.checkoutForm.checkValidity()) {
      submitOrder();
    } else {
      elements.checkoutForm.reportValidity();
    }
  });

  // DB Settings action buttons
  elements.btnSaveSettings.addEventListener('click', () => {
    const url = elements.inputSbUrl.value.trim();
    const key = elements.inputSbKey.value.trim();
    
    if (url && key) {
      localStorage.setItem('sb_url', url);
      localStorage.setItem('sb_key', key);
      showSettings(false);
      
      // Reload to connect clean with new config
      window.location.reload();
    } else {
      alert("กรุณากรอกทั้ง Project URL และ API Key ให้ครบถ้วน");
    }
  });

  elements.btnUseMock.addEventListener('click', () => {
    localStorage.removeItem('sb_url');
    localStorage.removeItem('sb_key');
    showSettings(false);
    window.location.reload();
  });

  // Print Receipt Action
  elements.btnPrintReceipt.addEventListener('click', () => {
    window.print();
  });

  // Order More / Back to main menu
  elements.btnOrderMore.addEventListener('click', () => {
    resetToMain();
  });
}

// Helpers & Utilities
function showCart(open) {
  if (open) {
    elements.cartBackdrop.classList.add('open');
    elements.cartDrawer.classList.add('open');
  } else {
    elements.cartBackdrop.classList.remove('open');
    elements.cartDrawer.classList.remove('open');
  }
}

function showSettings(open) {
  if (open) {
    elements.settingsBackdrop.classList.add('open');
  } else {
    elements.settingsBackdrop.classList.remove('open');
  }
}

function resetToMain() {
  elements.successScreen.style.display = "none";
  elements.menuSection.style.display = "block";
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveCartState() {
  sessionStorage.setItem('sb_cart', JSON.stringify(cart));
}

// Load cart state from session storage on start
try {
  const savedCart = sessionStorage.getItem('sb_cart');
  if (savedCart) cart = JSON.parse(savedCart);
} catch (e) {
  cart = [];
}

function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear() + 543; // Thai Buddhist Era year
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function translateCategory(cat) {
  const dictionary = {
    'Mains': 'จานหลัก',
    'Appetizers': 'ของทานเล่น',
    'Desserts': 'ของหวาน',
    'Drinks': 'เครื่องดื่ม'
  };
  return dictionary[cat] || cat;
}
