// Configuração do Tailwind CSS
tailwind.config = {
    theme: {
        extend: {
            fontFamily: { sans: ['Inter', 'sans-serif'] },
            colors: {
                brand: {
                    50: '#fff5f0',
                    100: '#ffe8db',
                    500: '#ff4d00',
                    600: '#e64100',
                    700: '#cc3300'
                }
            }
        }
    }
};

// Canvas Polyfill for CanvasRenderingContext2D.roundRect for WebView compatibility
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (typeof r === 'number') r = [r, r, r, r];
        const [tl, tr, br, bl] = r || [0, 0, 0, 0];
        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        return this;
    };
}

const produtosData = [
    { id: 1, name: "Pizza Calabresa Especial", category: "Pizza", price: 49.90, desc: "Molho de tomate artesanal, muçarela, calabresa fatiada e cebola roxa.", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop", featured: true },
    { id: 2, name: "Smash Burguer Bacon Duplo", category: "Burguer", price: 34.90, desc: "2x carnes 90g, cheddar fatiado, bacon crocante e molho especial.", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop", featured: true },
    { id: 3, name: "Combo Sushi Master (24 Pçs)", category: "Sushi", price: 69.90, desc: "1 Temaki Salmão, 8 Hossomakis, 8 Uramakis e 7 Niguiris frescos.", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&auto=format&fit=crop", featured: true },
    { id: 4, name: "Coca-Cola Zero 2L", category: "Bebidas", price: 12.00, desc: "Garrafa PET de 2 litros trincando de gelada.", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop", featured: false },
    { id: 5, name: "Brownie de Chocolate Gourmet", category: "Doces", price: 18.90, desc: "Acompanha calda quente de chocolate belga.", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop", featured: false },
    { id: 6, name: "Poke de Salmão Saudável", category: "Saudável", price: 42.00, desc: "Salmão fresco em cubos, abacate, edamame, manga e arroz oriental.", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop", featured: true }
];

let cart = [];
let favorites = new Set();
let selectedCategory = "Tudo";
const taxaEntrega = 15.00;
let appliedDiscount = 0;
let selectedPaymentMethod = "pix";
let activeOrderId = "#PED-4829";

let userAddress = {
    street: "Alameda das Flores",
    number: "123",
    neighborhood: "Centro",
    city: "São Paulo",
    complement: "Apt 42"
};

let gpsCanvas, gpsCtx;
let motoProgress = 0;
let isMotoMoving = false;
let animationFrameId = null;

const waypoints = [
    { x: 50, y: 50 },
    { x: 180, y: 50 },
    { x: 180, y: 160 },
    { x: 310, y: 160 },
    { x: 310, y: 220 }
];

window.addEventListener('load', () => {
    const splashBar = document.getElementById('splash-bar');
    if (splashBar) {
        setTimeout(() => { splashBar.style.width = '100%'; }, 100);
    }

    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => { splash.style.display = 'none'; }, 500);
        }
    }, 2500);

    renderCategories();
    renderHomeCategoryGrid();
    renderHomeFeatured();
    renderMenuProducts();
    updateAddressDisplay();
    updateCartUI();
    setupGpsCanvas();
});

function navigate(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) targetScreen.classList.add('active');
    
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.scrollTop = 0;

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-brand-500');
        btn.classList.add('text-gray-400');
    });
    const activeBtn = document.getElementById('nav-' + screenId);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-400');
        activeBtn.classList.add('text-brand-500');
    }

    if(screenId === 'screen-tracking') {
        startMotoMovement();
    }
}

function renderCategories() {
    const categories = ["Tudo", "Pizza", "Burguer", "Sushi", "Bebidas", "Doces", "Saudável"];
    const container = document.getElementById('category-pills');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <button onclick="filterCategory('${cat}')" class="px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-brand-500 text-white shadow' : 'bg-gray-100 text-gray-600'}">
            ${cat}
        </button>
    `).join('');
}

function renderHomeCategoryGrid() {
    const categories = [
        { name: "Pizza", icon: "🍕" },
        { name: "Burguer", icon: "🍔" },
        { name: "Sushi", icon: "🍣" },
        { name: "Bebidas", icon: "🥤" },
        { name: "Doces", icon: "🍩" },
        { name: "Saudável", icon: "🥗" },
        { name: "Tudo", icon: "✨" }
    ];

    const grid = document.getElementById('home-category-grid');
    if (!grid) return;

    grid.innerHTML = categories.slice(0, 4).map(c => `
        <button onclick="filterCategory('${c.name}')" class="flex flex-col items-center p-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm active:bg-orange-50 transition">
            <span class="text-2xl mb-1">${c.icon}</span>
            <span class="text-[10px] font-bold text-gray-700">${c.name}</span>
        </button>
    `).join('');
}

function filterCategory(cat) {
    selectedCategory = cat;
    renderCategories();
    renderMenuProducts();
    navigate('screen-menu');
}

function filterHomeSearch(query) {
    if(!query.trim()) {
        renderHomeFeatured();
        return;
    }
    const filtered = produtosData.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase()));
    const container = document.getElementById('home-featured-list');
    if(!container) return;
    
    if(filtered.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 text-center py-4">Nenhum item encontrado.</p>`;
        return;
    }
    container.innerHTML = filtered.map(p => renderProductCardHTML(p)).join('');
}

function renderHomeFeatured() {
    const featured = produtosData.filter(p => p.featured);
    const container = document.getElementById('home-featured-list');
    if (container) container.innerHTML = featured.map(p => renderProductCardHTML(p)).join('');
}

function renderMenuProducts() {
    const container = document.getElementById('menu-product-list');
    if (!container) return;
    const filtered = selectedCategory === "Tudo" ? produtosData : produtosData.filter(p => p.category === selectedCategory);
    container.innerHTML = filtered.map(p => renderProductCardHTML(p)).join('');
}

function renderProductCardHTML(p) {
    const isFav = favorites.has(p.id);
    return `
        <div class="bg-white rounded-2xl p-3 flex gap-3 shadow-sm border border-gray-100 relative">
            <img src="${p.img}" class="w-20 h-20 rounded-xl object-cover shrink-0" alt="${p.name}">
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start gap-1">
                        <h4 class="font-bold text-xs text-gray-800 leading-tight">${p.name}</h4>
                        <button onclick="toggleFavorite(${p.id})" class="text-xs ${isFav ? 'text-red-500' : 'text-gray-300'}">
                            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
                        </button>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-0.5 line-clamp-2">${p.desc}</p>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <span class="font-black text-brand-500 text-xs">R$ ${p.price.toFixed(2).replace('.', ',')}</span>
                    <button onclick="addToCart(${p.id})" class="bg-gray-900 text-white font-black text-[10px] px-3 py-1.5 rounded-lg active:scale-95 transition">
                        ADICIONAR
                    </button>
                </div>
            </div>
        </div>
    `;
}

function toggleFavorite(id) {
    if(favorites.has(id)) {
        favorites.delete(id);
        showToast("Item removido dos favoritos.", "info");
    } else {
        favorites.add(id);
        showToast("Item adicionado aos favoritos!", "success");
    }
    renderMenuProducts();
    renderHomeFeatured();
}

function addToCart(id) {
    const prod = produtosData.find(p => p.id === id);
    if (!prod) return;
    const item = cart.find(c => c.id === id);

    if(item) {
        item.qty += 1;
    } else {
        cart.push({ ...prod, qty: 1 });
    }

    updateCartUI();
    showToast(`${prod.name} adicionado ao carrinho!`, "success");
}

function updateQuantity(id, delta) {
    const item = cart.find(c => c.id === id);
    if(!item) return;

    item.qty += delta;
    if(item.qty <= 0) {
        cart = cart.filter(c => c.id !== id);
    }
    updateCartUI();
}

function clearCart() {
    if(cart.length === 0) return;
    cart = [];
    appliedDiscount = 0;
    const input = document.getElementById('coupon-input');
    const feedback = document.getElementById('coupon-feedback');
    if (input) input.value = '';
    if (feedback) feedback.classList.add('hidden');
    updateCartUI();
    showToast("Carrinho limpo.", "info");
}

function applyCoupon() {
    const input = document.getElementById('coupon-input');
    const feedback = document.getElementById('coupon-feedback');
    if (!input || !feedback) return;

    const code = input.value.trim().toUpperCase();

    if(code === "FOME10") {
        appliedDiscount = 10.00;
        feedback.innerText = "Cupom de R$ 10,00 aplicado!";
        feedback.className = "text-[11px] font-bold text-emerald-600 mt-1.5";
        showToast("Cupom FOME10 Aplicado com Sucesso!", "success");
    } else {
        appliedDiscount = 0;
        feedback.innerText = "Cupom inválido. Use FOME10";
        feedback.className = "text-[11px] font-bold text-red-500 mt-1.5";
        showToast("Cupom inválido.", "error");
    }
    feedback.classList.remove('hidden');
    updateCartUI();
}

function applyPromoCoupon(code) {
    const input = document.getElementById('coupon-input');
    if (input) input.value = code;
    navigate('screen-cart');
    applyCoupon();
}

function updateCartUI() {
    const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(b => {
        if(totalItems > 0) {
            b.innerText = totalItems;
            b.classList.remove('hidden');
        } else {
            b.classList.add('hidden');
        }
    });

    const container = document.getElementById('cart-items-container');
    if (container) {
        if(cart.length === 0) {
            container.innerHTML = `
                <div class="text-center py-6 bg-white rounded-2xl border border-gray-100">
                    <i class="fa-solid fa-cart-flatbed text-3xl text-gray-300 mb-2"></i>
                    <p class="text-xs font-bold text-gray-400">Seu carrinho está vazio.</p>
                    <button onclick="navigate('screen-menu')" class="mt-2.5 bg-brand-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl">Escolha Algo Gostoso</button>
                </div>
            `;
        } else {
            container.innerHTML = cart.map(item => `
                <div class="bg-white rounded-2xl p-2.5 flex justify-between items-center shadow-sm border border-gray-100">
                    <div class="flex items-center gap-2.5">
                        <img src="${item.img}" class="w-11 h-11 rounded-xl object-cover shrink-0" alt="${item.name}">
                        <div>
                            <h4 class="font-bold text-xs text-gray-800">${item.name}</h4>
                            <span class="text-brand-500 font-black text-xs">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                        <button onclick="updateQuantity(${item.id}, -1)" class="w-5 h-5 bg-white rounded-lg text-xs font-bold text-gray-700 shadow-sm flex items-center justify-center">-</button>
                        <span class="text-xs font-black w-4 text-center">${item.qty}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" class="w-5 h-5 bg-brand-500 rounded-lg text-xs font-bold text-white shadow-sm flex items-center justify-center">+</button>
                    </div>
                </div>
            `).join('');
        }
    }

    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const currentFee = cart.length > 0 ? taxaEntrega : 0;
    const grandTotal = Math.max(0, (subtotal + currentFee) - appliedDiscount);

    const elemSubtotal = document.getElementById('cart-subtotal');
    const elemFee = document.getElementById('cart-fee');
    const elemDiscount = document.getElementById('cart-discount');
    const elemTotal = document.getElementById('cart-total');
    const elemPixTotal = document.getElementById('modal-pix-total');

    if (elemSubtotal) elemSubtotal.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (elemFee) elemFee.innerText = `R$ ${currentFee.toFixed(2).replace('.', ',')}`;
    if (elemDiscount) elemDiscount.innerText = `- R$ ${appliedDiscount.toFixed(2).replace('.', ',')}`;
    if (elemTotal) elemTotal.innerText = `R$ ${grandTotal.toFixed(2).replace('.', ',')}`;
    if (elemPixTotal) elemPixTotal.innerText = `R$ ${grandTotal.toFixed(2).replace('.', ',')}`;
}

function openAddressModal() {
    document.getElementById('modal-street').value = userAddress.street;
    document.getElementById('modal-number').value = userAddress.number;
    document.getElementById('modal-neighborhood').value = userAddress.neighborhood;
    document.getElementById('modal-city').value = userAddress.city;
    document.getElementById('modal-complement').value = userAddress.complement;

    const modal = document.getElementById('address-modal');
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => { modal.classList.remove('opacity-0'); }, 10);
    }
}

function closeAddressModal() {
    const modal = document.getElementById('address-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
    }
}

function saveAddress(e) {
    e.preventDefault();
    userAddress = {
        street: document.getElementById('modal-street').value,
        number: document.getElementById('modal-number').value,
        neighborhood: document.getElementById('modal-neighborhood').value,
        city: document.getElementById('modal-city').value,
        complement: document.getElementById('modal-complement').value
    };

    updateAddressDisplay();
    closeAddressModal();
    showToast("Endereço salvo com sucesso!", "success");
}

function updateAddressDisplay() {
    const formatted = `${userAddress.street}, ${userAddress.number} - ${userAddress.neighborhood}`;
    const homeDisp = document.getElementById('home-address-display');
    const cartSum = document.getElementById('cart-address-summary');
    const trackSum = document.getElementById('tracking-summary-address');

    if (homeDisp) homeDisp.innerText = formatted;
    if (cartSum) cartSum.innerText = formatted;
    if (trackSum) trackSum.innerText = formatted;
}

function selectPayment(method) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.className = "payment-btn border border-gray-200 bg-white text-gray-700 p-2.5 rounded-xl flex items-center gap-2 transition";
    });

    const activeBtn = document.getElementById(`pay-option-${method}`);
    if(activeBtn) {
        activeBtn.className = "payment-btn border-2 border-brand-500 bg-brand-50 text-brand-700 p-2.5 rounded-xl flex items-center gap-2 transition";
    }

    const cashContainer = document.getElementById('cash-change-container');
    if(method === 'cash') {
        if (cashContainer) cashContainer.classList.remove('hidden');
    } else {
        if (cashContainer) cashContainer.classList.add('hidden');
    }
}

function proceedToPaymentModal() {
    if(cart.length === 0) {
        showToast("Seu carrinho está vazio!", "error");
        return;
    }

    if(selectedPaymentMethod === 'pix') {
        const modal = document.getElementById('payment-modal');
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => { modal.classList.remove('opacity-0'); }, 10);
        }
    } else {
        verifyFakePayment();
    }
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
    }
}

function copyPixCode() {
    try {
        const input = document.getElementById('pix-code-input');
        if (input) {
            input.select();
            input.setSelectionRange(0, 99999);
            document.execCommand('copy');
            showToast("Código PIX copiado com sucesso!", "success");
        }
    } catch (e) {
        showToast("Erro ao copiar código PIX.", "error");
    }
}

function verifyFakePayment() {
    closePaymentModal();
    
    const loadingModal = document.getElementById('loading-payment-modal');
    if (loadingModal) loadingModal.classList.remove('hidden');

    setTimeout(() => {
        if (loadingModal) loadingModal.classList.add('hidden');
        
        activeOrderId = `#PED-${Math.floor(1000 + Math.random() * 9000)}`;
        const orderIdElem = document.getElementById('tracking-order-id');
        if (orderIdElem) orderIdElem.innerText = `Pedido ${activeOrderId}`;
        
        const paymentLabels = {
            pix: "PIX - Aprovado",
            credit: "Cartão de Crédito",
            debit: "Cartão de Débito",
            cash: "Dinheiro na Entrega"
        };
        const trackPayElem = document.getElementById('tracking-summary-payment');
        if (trackPayElem) trackPayElem.innerText = paymentLabels[selectedPaymentMethod] || "Aprovado";

        cart = [];
        updateCartUI();
        
        showToast("Pagamento Confirmado com Sucesso! 🛵", "success");
        
        motoProgress = 0;
        navigate('screen-tracking');
    }, 2200);
}

function setupGpsCanvas() {
    gpsCanvas = document.getElementById('gps-canvas');
    if (!gpsCanvas) return;
    gpsCtx = gpsCanvas.getContext('2d');

    function resize() {
        if (!gpsCanvas || !gpsCanvas.parentElement) return;
        gpsCanvas.width = gpsCanvas.parentElement.clientWidth;
        gpsCanvas.height = gpsCanvas.parentElement.clientHeight;
        drawGpsMap();
    }

    resize();
    window.addEventListener('resize', resize);
}

function drawGpsMap() {
    if(!gpsCtx || !gpsCanvas) return;

    const w = gpsCanvas.width;
    const h = gpsCanvas.height;

    gpsCtx.fillStyle = "#0f172a";
    gpsCtx.fillRect(0, 0, w, h);

    gpsCtx.fillStyle = "#1e293b";
    
    gpsCtx.beginPath();
    gpsCtx.roundRect(10, 10, 150, 25, 8);
    gpsCtx.fill();

    gpsCtx.beginPath();
    gpsCtx.roundRect(10, 75, 150, 160, 8);
    gpsCtx.fill();

    gpsCtx.beginPath();
    gpsCtx.roundRect(205, 10, 180, 130, 8);
    gpsCtx.fill();

    gpsCtx.beginPath();
    gpsCtx.roundRect(205, 185, 85, 60, 8);
    gpsCtx.fill();

    gpsCtx.strokeStyle = "#334155";
    gpsCtx.lineWidth = 22;
    gpsCtx.lineCap = "round";
    gpsCtx.lineJoin = "round";

    gpsCtx.beginPath();
    gpsCtx.moveTo(waypoints[0].x, waypoints[0].y);
    for(let i = 1; i < waypoints.length; i++) {
        gpsCtx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    gpsCtx.stroke();

    gpsCtx.strokeStyle = "#ff4d00";
    gpsCtx.lineWidth = 4;
    gpsCtx.setLineDash([6, 6]);
    gpsCtx.stroke();
    gpsCtx.setLineDash([]);

    drawPin(waypoints[0].x, waypoints[0].y, "🍔", "#f59e0b");
    drawPin(waypoints[waypoints.length - 1].x, waypoints[waypoints.length - 1].y, "🏠", "#10b981");

    const currentPos = getPositionOnPath(motoProgress);
    drawScooter(currentPos.x, currentPos.y, currentPos.angle);
}

function drawPin(x, y, emoji, color) {
    gpsCtx.save();
    gpsCtx.fillStyle = color;
    gpsCtx.beginPath();
    gpsCtx.arc(x, y, 11, 0, Math.PI * 2);
    gpsCtx.fill();

    gpsCtx.fillStyle = "#ffffff";
    gpsCtx.font = "10px Inter";
    gpsCtx.textAlign = "center";
    gpsCtx.textBaseline = "middle";
    gpsCtx.fillText(emoji, x, y);
    gpsCtx.restore();
}

function drawScooter(x, y, angle) {
    gpsCtx.save();
    gpsCtx.translate(x, y);
    gpsCtx.rotate(angle);

    const lightGradient = gpsCtx.createRadialGradient(15, 0, 2, 40, 0, 25);
    lightGradient.addColorStop(0, "rgba(254, 240, 138, 0.8)");
    lightGradient.addColorStop(1, "rgba(254, 240, 138, 0)");
    
    gpsCtx.fillStyle = lightGradient;
    gpsCtx.beginPath();
    gpsCtx.moveTo(5, 0);
    gpsCtx.lineTo(45, -18);
    gpsCtx.lineTo(45, 18);
    gpsCtx.closePath();
    gpsCtx.fill();

    gpsCtx.fillStyle = "#ff4d00";
    gpsCtx.beginPath();
    gpsCtx.arc(0, 0, 10, 0, Math.PI * 2);
    gpsCtx.fill();

    gpsCtx.strokeStyle = "#ffffff";
    gpsCtx.lineWidth = 2;
    gpsCtx.stroke();

    gpsCtx.fillStyle = "#ffffff";
    gpsCtx.font = "10px FontAwesome";
    gpsCtx.textAlign = "center";
    gpsCtx.textBaseline = "middle";
    gpsCtx.fillText("🛵", 0, 0);

    gpsCtx.restore();
}

function getPositionOnPath(progress) {
    let totalLength = 0;
    const segmentLengths = [];

    for(let i = 0; i < waypoints.length - 1; i++) {
        const dx = waypoints[i+1].x - waypoints[i].x;
        const dy = waypoints[i+1].y - waypoints[i].y;
        const len = Math.sqrt(dx*dx + dy*dy);
        segmentLengths.push(len);
        totalLength += len;
    }

    const targetDist = progress * totalLength;
    let accumulated = 0;

    for(let i = 0; i < segmentLengths.length; i++) {
        if(accumulated + segmentLengths[i] >= targetDist) {
            const segProgress = (targetDist - accumulated) / segmentLengths[i];
            const p1 = waypoints[i];
            const p2 = waypoints[i+1];
            const x = p1.x + (p2.x - p1.x) * segProgress;
            const y = p1.y + (p2.y - p1.y) * segProgress;
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            return { x, y, angle };
        }
        accumulated += segmentLengths[i];
    }

    const last = waypoints[waypoints.length - 1];
    const prev = waypoints[waypoints.length - 2];
    return { x: last.x, y: last.y, angle: Math.atan2(last.y - prev.y, last.x - prev.x) };
}

function startMotoMovement() {
    if(isMotoMoving) return;
    isMotoMoving = true;

    function animate() {
        if(motoProgress < 1) {
            motoProgress += 0.0015;
            if(motoProgress > 1) motoProgress = 1;

            updateTrackingStatus(motoProgress);
            drawGpsMap();
            animationFrameId = requestAnimationFrame(animate);
        } else {
            isMotoMoving = false;
            updateTrackingStatus(1);
            drawGpsMap();
        }
    }

    animate();
}

function centerMapOnScooter() {
    showToast("Mapa centralizado no entregador Marcos", "info");
    drawGpsMap();
}

function updateTrackingStatus(progress) {
    const statusText = document.getElementById('tracking-status-text');
    const timeText = document.getElementById('estimated-time-text');
    const step2 = document.getElementById('timeline-step-2');
    const step3 = document.getElementById('timeline-step-3');

    if(progress < 0.2) {
        if (statusText) statusText.innerText = "Restaurante está embalando seu pedido...";
        if (timeText) timeText.innerText = "25 - 35 minutos";
    } else if(progress >= 0.2 && progress < 0.95) {
        if (statusText) statusText.innerText = "Entregador a caminho do seu endereço!";
        if (timeText) timeText.innerText = `${Math.max(2, Math.round((1 - progress) * 20))} minutos`;
        if (step2) step2.classList.remove('opacity-40');
    } else {
        if (statusText) statusText.innerText = "Pedido Entregue! Bom apetite! 🛵🎉";
        if (timeText) timeText.innerText = "Entregue!";
        if (step3) {
            step3.classList.remove('opacity-40');
            const dot = step3.querySelector('.timeline-dot');
            if (dot) dot.className = "timeline-dot absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold";
        }
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast || !toastMsg || !toastIcon) return;

    toastMsg.innerText = message;

    if(type === 'success') {
        toastIcon.className = "fa-solid fa-circle-check text-emerald-400";
    } else if(type === 'error') {
        toastIcon.className = "fa-solid fa-circle-xmark text-red-400";
    } else {
        toastIcon.className = "fa-solid fa-circle-info text-brand-500";
    }

    toast.classList.remove('opacity-0', '-translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-4');
    }, 3000);
}