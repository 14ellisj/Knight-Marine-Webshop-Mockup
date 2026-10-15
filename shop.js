'use strict';

// Standalone concept data. Prices and product descriptions are illustrative.
// No APIs, analytics, external fonts, payment gateways or network requests.
const products = [
  { id: 'inverter', name: 'MultiPlus-II inverter / charger', brand: 'Victron Energy', category: 'power', price: 1149, image: 'inverter.svg', badge: 'A quieter onboard setup', description: 'Bring shore power, charging and onboard AC together.', detail: 'A starting point for an integrated onboard power system, combining inverter and charging functions in one unit.', points: ['Explore an alternative to running a generator for smaller loads.', 'Plan alongside your batteries, monitoring and shore power.', 'The correct voltage, rating and supporting protection need review.'] },
  { id: 'battery', name: '200Ah lithium leisure battery', brand: 'Marine power', category: 'power', price: 1295, image: 'battery.svg', badge: 'Build your independence', description: 'An example lithium upgrade for time away from shore.', detail: 'More usable energy can make a real difference to life at anchor. A lithium conversion needs a review of the complete charging and protection system.', points: ['A possible foundation for an onboard energy upgrade.', 'Battery management and charging compatibility need confirmation.', 'Space, securing arrangements and your existing loads matter.'] },
  { id: 'mppt', name: 'SmartSolar MPPT 100/30', brand: 'Victron Energy', category: 'solar', price: 169, image: 'controller.svg', badge: 'Solar essentials', description: 'Manage the energy coming from your solar panels.', detail: 'A solar charge controller sits between a suitable panel array and the battery system. The team would select the right model for your installation.', points: ['A useful part of a considered marine solar package.', 'Panel voltage, array output and battery chemistry need review.', 'Mounting, cabling and circuit protection are specified separately.'] },
  { id: 'plotter', name: 'GPSMAP 923xsv chartplotter', brand: 'Garmin', category: 'navigation', price: 1299, image: 'plotter.svg', badge: 'At the heart of your helm', description: 'Plan a clearer, more connected navigation setup.', detail: 'A chartplotter can bring key information together at the helm. The final specification depends on how you navigate and the equipment already onboard.', points: ['Consider screen position and visibility at your helm.', 'Charts, transducers and network accessories need confirmation.', 'Ask about integration, installation and commissioning.'] },
  { id: 'solar', name: 'Marine solar panel · 175W', brand: 'Marine solar', category: 'solar', price: 279, image: 'solar.svg', badge: 'Make the daylight count', description: 'A starting point for generating power while afloat.', detail: 'Solar can help support your everyday energy use. The best array depends on available mounting space, shading and your expected consumption.', points: ['Explore charging support while away from shore power.', 'A suitable controller and mounting solution are required.', 'Output varies with conditions, shading and installation.'] },
  { id: 'monitor', name: 'Cerbo GX system monitor', brand: 'Victron Energy', category: 'power', price: 249, image: 'monitor.svg', badge: '', description: 'Bring compatible power information into one place.', detail: 'Monitoring helps you understand what your power system is doing. It is most useful when planned with the rest of your onboard equipment.', points: ['Explore visibility of compatible equipment and energy use.', 'Sensors, connections and display options may be additional.', 'Remote features depend on the selected setup and connectivity.'] },
  { id: 'audio', name: 'Fusion marine stereo', brand: 'Fusion', category: 'audio', price: 349, image: 'audio.svg', badge: 'Enjoy the journey', description: 'Start planning better sound, wherever you anchor.', detail: 'An example marine stereo for a more enjoyable day onboard. A complete audio plan also considers speakers, zones and the installation environment.', points: ['Discuss your listening areas and preferred controls.', 'Speakers, amplifiers and wiring are not included in this example.', 'The exact model and helm integration need confirmation.'] },
  { id: 'care', name: 'Everyday boat care kit', brand: 'Knight Marine selection', category: 'care', price: 49, image: 'care.svg', badge: 'A little care, often', description: 'A simple starting point for a regular washdown.', detail: 'An illustrative selection of washdown essentials for routine care. The final choice should suit the surfaces and finishes on your boat.', points: ['Example kit: boat wash, a soft wash mitt and a drying cloth.', 'Check suitability for your specific surfaces before use.', 'For restoration or polishing, ask the team for tailored advice.'] }
];
const bundles = [
  { id: 'weekend', name: 'The weekend escape', label: 'More freedom at anchor', image: 'marina-solar-optimized.webp', items: ['battery', 'solar', 'mppt'], description: 'Start a conversation about solar and battery capacity for relaxed weekends away from shore power.', why: 'Solar charging and additional battery capacity can work together to support everyday onboard loads. This example is a starting point for a load and charging review.' },
  { id: 'extended', name: 'Stay a little longer', label: 'A more connected power system', image: 'lithium-battery-installation-optimized.webp', items: ['battery', 'inverter', 'solar', 'mppt', 'monitor'], description: 'Explore a broader power upgrade, with charging, storage, inverter capability and monitoring.', why: 'A longer stay onboard calls for a complete energy plan. These example components bring the main areas of that conversation together.' },
  { id: 'helm', name: 'A happier helm', label: 'Navigation meets entertainment', image: 'garmin-navigation-display-optimized.webp', items: ['plotter', 'audio'], description: 'Bring your navigation and entertainment plans into one conversation about the way you use your boat.', why: 'Thinking about the helm as a whole helps plan the screen position, controls, network and audio layout before work begins.' }
];
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const money = value => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 }).format(value);
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const productById = id => products.find(product => product.id === id);
const totalFor = ids => ids.reduce((sum, id) => sum + productById(id).price, 0);
let category = 'all';
let cart = [];
let toastTimer;
let enquiryText = '';
let advisor = { step: 0, goal: '', use: '', support: '' };

try {
  const saved = JSON.parse(localStorage.getItem('knight-marine-demo-basket') || '[]');
  if (Array.isArray(saved)) {
    const merged = new Map();
    saved.forEach(item => {
      if (item && productById(item.id) && Number.isInteger(item.qty) && item.qty > 0) {
        merged.set(item.id, Math.min(99, (merged.get(item.id) || 0) + item.qty));
      }
    });
    cart = [...merged].map(([id, qty]) => ({ id, qty }));
  }
} catch (_) { /* Some browsers disable storage for local files. The basket still works in memory. */ }

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2800);
}
function saveCart() {
  try { localStorage.setItem('knight-marine-demo-basket', JSON.stringify(cart)); } catch (_) {}
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  $('.basket-count').textContent = count;
  $('.basket-trigger').setAttribute('aria-label', `Open basket, ${count} ${count === 1 ? 'item' : 'items'}`);
}
function addItems(ids) {
  let added = 0;
  ids.forEach(id => {
    if (!productById(id)) return;
    const item = cart.find(entry => entry.id === id);
    if (item && item.qty < 99) { item.qty += 1; added += 1; }
    else if (!item) { cart.push({ id, qty: 1 }); added += 1; }
  });
  saveCart();
  toast(added ? `${added === 1 ? productById(ids[0]).name : `${added} items`} added to your basket` : 'The maximum quantity is already in your basket.');
}
function openDialog(id) {
  const dialog = $(id);
  $$('dialog[open]').forEach(open => open.close());
  dialog.showModal();
}
$$('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
}));

function renderProducts() {
  const query = $('#product-search').value.trim().toLowerCase();
  let visible = products.filter(product => (category === 'all' || product.category === category) && `${product.name} ${product.brand} ${product.description}`.toLowerCase().includes(query));
  const sort = $('#sort-products').value;
  if (sort === 'price-low') visible.sort((a, b) => a.price - b.price);
  if (sort === 'price-high') visible.sort((a, b) => b.price - a.price);
  if (sort === 'name') visible.sort((a, b) => a.name.localeCompare(b.name));
  $('#result-count').textContent = `${visible.length} ${visible.length === 1 ? 'product' : 'products'}`;
  $('#clear-filters').hidden = category === 'all' && !query;
  $('#product-grid').innerHTML = visible.length ? visible.map(product => `
    <article class="product-card">
      <button class="product-visual" data-detail="${product.id}" aria-label="View ${escapeHTML(product.name)}">
        ${product.badge ? `<span class="product-badge ${['mppt', 'plotter'].includes(product.id) ? 'blue' : ''}">${product.badge}</span>` : ''}
        <img src="assets/${product.image}" width="300" height="240" alt="Illustration of ${escapeHTML(product.name)}" loading="lazy">
      </button>
      <div class="product-info"><p class="product-brand">${product.brand}</p><h3 class="product-name"><button data-detail="${product.id}">${product.name}</button></h3><p class="product-description">${product.description}</p><div class="product-bottom"><span class="product-price">${money(product.price)}</span><button class="add-button" data-add="${product.id}" aria-label="Add ${escapeHTML(product.name)} to basket">Add <span aria-hidden="true">+</span></button></div></div>
    </article>`).join('') : '<div class="empty-results"><h3>No equipment found.</h3><p>Try a different search or explore all equipment.</p><button class="button dark" data-reset-filters>Show all equipment</button></div>';
}
function resetFilters() {
  category = 'all'; $('#product-search').value = ''; $('#sort-products').value = 'featured';
  updateCategories(); renderProducts();
}
function updateCategories() {
  $$('.category').forEach(button => {
    const active = button.dataset.category === category;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
$$('.category').forEach(button => button.addEventListener('click', () => { category = button.dataset.category; updateCategories(); renderProducts(); }));
$('#product-search').addEventListener('input', renderProducts);
$('#sort-products').addEventListener('change', renderProducts);
$('#clear-filters').addEventListener('click', resetFilters);
$('.search-trigger').addEventListener('click', () => { $('#shop').scrollIntoView(); $('#product-search').focus({ preventScroll: true }); });

function showProduct(id) {
  const product = productById(id);
  if (!product) return;
  $('#product-detail').innerHTML = `<div class="product-detail-layout"><div class="detail-image"><img src="assets/${product.image}" alt="Concept illustration of ${escapeHTML(product.name)}"><span class="illustration-label">Illustrative product image</span></div><div class="detail-copy"><p class="eyebrow">${product.brand}</p><h2 id="product-dialog-title">${product.name}</h2><p>${product.detail}</p><ul class="detail-points">${product.points.map(point => `<li>${point}</li>`).join('')}</ul><div class="detail-price">${money(product.price)}<small>Example price</small></div><button class="button primary full" data-add="${product.id}">Add to basket <span aria-hidden="true">+</span></button><p class="detail-check">Concept catalogue. Exact model, specification, availability and compatibility would be checked before purchase.</p></div></div>`;
  openDialog('#product-dialog');
}
function renderBundles() {
  $('#bundle-grid').innerHTML = bundles.map(bundle => `<article class="bundle-card"><div class="bundle-image"><img src="assets/${bundle.image}" alt="${bundle.id === 'helm' ? 'Garmin display installed at the helm' : bundle.id === 'extended' ? 'Marine lithium battery installation' : 'Solar equipment and boats at the marina'}" loading="lazy"><span class="bundle-label">${bundle.label}</span></div><div class="bundle-body"><h3>${bundle.name}</h3><p>${bundle.description}</p><div class="bundle-includes"><strong>${bundle.items.length} example components</strong>${bundle.items.map(id => ({ battery: 'Lithium battery', solar: 'Solar panel', mppt: 'MPPT controller', inverter: 'Inverter / charger', monitor: 'System monitoring', plotter: 'Chartplotter', audio: 'Marine stereo' })[id]).join(' · ')}</div><div class="bundle-bottom"><div><small>Equipment example</small><strong>${money(totalFor(bundle.items))}</strong></div><button data-bundle="${bundle.id}">Explore bundle ↗</button></div></div></article>`).join('');
}
function showBundle(id) {
  const bundle = bundles.find(item => item.id === id);
  if (!bundle) return;
  $('#product-detail').innerHTML = `<div class="product-detail-layout"><div class="detail-image"><img src="assets/${bundle.image}" alt="${bundle.label}" style="height:100%;max-height:none;object-fit:cover;border-radius:15px"></div><div class="detail-copy"><p class="eyebrow">${bundle.label}</p><h2 id="product-dialog-title">${bundle.name}</h2><p>${bundle.why}</p><ul class="recommendation-list">${bundle.items.map(productId => { const product = productById(productId); return `<li>${product.name}<span>${money(product.price)}</span></li>`; }).join('')}</ul><div class="detail-price">${money(totalFor(bundle.items))}<small>Example equipment total</small></div><button class="button primary full" data-add-bundle="${bundle.id}">Add ${bundle.items.length} items to basket <span aria-hidden="true">+</span></button><p class="detail-check">This is not a confirmed installation specification. Supporting components, fitting and delivery are extra and would need review. No bundle discount is assumed.</p></div></div>`;
  openDialog('#product-dialog');
}

function renderBasket(focusKey) {
  const content = $('#basket-content');
  if (!cart.length) {
    content.innerHTML = '<div class="cart-empty"><span aria-hidden="true">↗</span><h3>Your next upgrade<br>starts here.</h3><p>Add equipment or explore a bundle.<br>We can help you work out the details.</p><button class="button primary" data-continue-shopping>Explore the shop →</button></div>';
    return;
  }
  content.innerHTML = `<div class="basket-items">${cart.map(item => { const product = productById(item.id); return `<article class="basket-item"><div class="basket-item-image"><img src="assets/${product.image}" alt=""></div><div><p class="item-brand">${product.brand}</p><h3>${product.name}</h3><div class="quantity-row"><div class="quantity-control"><button data-quantity="${product.id}" data-change="-1" aria-label="Reduce ${escapeHTML(product.name)} quantity" ${item.qty === 1 ? 'disabled' : ''}>−</button><span aria-label="Quantity ${item.qty}">${item.qty}</span><button data-quantity="${product.id}" data-change="1" aria-label="Increase ${escapeHTML(product.name)} quantity" ${item.qty === 99 ? 'disabled' : ''}>+</button></div><button class="remove-item" data-remove="${product.id}" aria-label="Remove ${escapeHTML(product.name)}">Remove</button></div></div><span class="basket-item-price">${money(product.price * item.qty)}</span></article>`; }).join('')}</div><div class="basket-summary"><div class="basket-total"><span>Equipment total</span><strong>${money(cart.reduce((sum, item) => sum + productById(item.id).price * item.qty, 0))}</strong></div><p>Illustrative prices. Delivery, fitting and any additional components are not calculated in this preview.</p><div class="basket-advice"><span aria-hidden="true">✦</span><p><strong>Want a second pair of eyes?</strong>Include your boat details and ask the team to review your setup.</p></div><button class="button primary full" data-checkout>Proceed to demo checkout <span aria-hidden="true">→</span></button><button class="button light full basket-review" data-basket-enquiry>Ask the team to review my basket ↗</button><p class="basket-followup">Local preview only. No order or payment will be processed.</p></div>`;
  if (focusKey) {
    const target = $(`[data-quantity="${focusKey.id}"][data-change="${focusKey.change}"]`, content);
    if (target && !target.disabled) target.focus();
    else $(`[data-remove="${focusKey.id}"]`, content)?.focus();
  }
}
function showBasket() { renderBasket(); openDialog('#basket-dialog'); }
$('.basket-trigger').addEventListener('click', showBasket);
$('.footer-basket').addEventListener('click', showBasket);

function showCheckout() {
  if (!cart.length) return;
  const items = cart.map(item => ({ ...item }));
  const subtotal = items.reduce((sum, item) => sum + productById(item.id).price * item.qty, 0);
  $('#checkout-content').innerHTML = `<p class="eyebrow">Demo checkout · 1 of 2</p><h2 id="checkout-title">One step closer<br>to the water.</h2><p class="enquiry-lead">Try the buying journey with sample details. This local preview does not send information, take payment or place an order.</p><form id="checkout-form" class="enquiry-form"><button class="text-button sample-details" type="button" id="sample-details">Use sample details</button><div class="form-row"><label>Your name<input name="name" id="checkout-name" placeholder="Alex Taylor" maxlength="100" autocomplete="off" required></label><label>Email address<input type="email" name="email" id="checkout-email" placeholder="alex@example.com" maxlength="150" autocomplete="off" required></label></div><label>How would you like your equipment?<select name="fulfilment" id="fulfilment"><option value="collect">Collect at Universal Marina · Free</option><option value="delivery">UK mainland delivery · Example £9.95</option></select></label><div id="delivery-fields" class="delivery-fields" hidden><label>Delivery address<input name="address" id="checkout-address" placeholder="Street address and town" maxlength="200" autocomplete="off"></label><label>Postcode<input name="postcode" id="checkout-postcode" placeholder="Postcode" maxlength="16" autocomplete="off"></label></div><div class="checkout-note"><strong>Demo payment</strong><p>No card information is needed. The next step shows an example order review.</p></div><div class="checkout-totals"><span>Equipment</span><strong>${money(subtotal)}</strong><span>Collection / delivery</span><strong id="checkout-shipping">Free</strong></div><button class="button primary full" type="submit">Review demo order →</button><p class="form-note">Example prices and delivery charge. Tax treatment and delivery availability would be confirmed in the finished shop.</p></form>`;
  $('#sample-details').addEventListener('click', () => {
    $('#checkout-name').value = 'Alex Taylor'; $('#checkout-email').value = 'alex@example.com';
    $('#checkout-address').value = 'Example address, Southampton'; $('#checkout-postcode').value = 'SO31 7ZN';
  });
  $('#fulfilment').addEventListener('change', event => {
    const deliver = event.target.value === 'delivery';
    $('#delivery-fields').hidden = !deliver;
    $('#checkout-address').required = deliver; $('#checkout-postcode').required = deliver;
    $('#checkout-shipping').textContent = deliver ? money(9.95) : 'Free';
  });
  $('#checkout-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const delivery = data.get('fulfilment') === 'delivery';
    const shipping = delivery ? 9.95 : 0;
    const total = subtotal + shipping;
    $('#checkout-content').innerHTML = `<p class="eyebrow">Demo checkout · 2 of 2</p><h2 id="checkout-title" tabindex="-1">Review your setup.</h2><p class="enquiry-lead">A final look at your example order before completing the demo.</p><div class="order-items">${items.map(item => `<div><span>${item.qty} × ${productById(item.id).name}</span><strong>${money(productById(item.id).price * item.qty)}</strong></div>`).join('')}</div><div class="order-contact"><strong>${escapeHTML(data.get('name'))}</strong><p>${escapeHTML(data.get('email'))}</p><p>${delivery ? `Example delivery to ${escapeHTML(data.get('address'))}, ${escapeHTML(data.get('postcode'))}` : 'Collection from Universal Marina, Southampton'}</p></div><div class="checkout-totals"><span>Equipment</span><strong>${money(subtotal)}</strong><span>${delivery ? 'Example delivery' : 'Collection'}</span><strong>${shipping ? money(shipping) : 'Free'}</strong><span class="grand-total">Demo total</span><strong class="grand-total">${money(total)}</strong></div><div class="checkout-note"><strong>Demo payment only</strong><p>No charge will be made and no order will be sent. This completes the preview journey.</p></div><button class="button primary full" id="place-demo-order">Place demo order · ${money(total)} →</button><button class="text-button checkout-back" id="checkout-back">← Back to details</button>`;
    $('#checkout-title').focus();
    $('#checkout-back').addEventListener('click', showCheckout);
    $('#place-demo-order').addEventListener('click', () => {
      cart = []; saveCart();
      $('#checkout-content').innerHTML = `<div class="success-mark" aria-hidden="true">✓</div><p class="eyebrow">Demo complete · KM-DEMO-001</p><h2 id="checkout-title" tabindex="-1">Ready for your<br>next adventure.</h2><p class="enquiry-lead">You’ve reached the end of the example checkout. In the finished shop, this is where order confirmation and next steps would appear.</p><div class="checkout-note"><strong>No real order has been placed.</strong><p>No payment was taken and no message was sent. The demo basket has been cleared so you can try another setup.</p></div><button class="button primary full" id="finish-checkout">Back to the shop →</button>`;
      $('#checkout-title').focus();
      $('#finish-checkout').addEventListener('click', () => { $('#checkout-dialog').close(); $('#shop').scrollIntoView(); });
    });
  });
  if (!$('#checkout-dialog').open) openDialog('#checkout-dialog');
}
$('#checkout-dialog').addEventListener('close', () => $('#checkout-content').replaceChildren());

const goalOptions = [
  ['power', '↯', 'Onboard power', 'Solar, batteries and more freedom at anchor'],
  ['helm', '⌁', 'Navigation & audio', 'A more useful, enjoyable helm'],
  ['care', '✧', 'Looking after the boat', 'Everyday care or advice on bigger jobs']
];
const useOptions = {
  power: [['weekend', '01', 'Weekends away', 'A starting point for solar and battery capacity'], ['extended', '02', 'Longer stays onboard', 'Explore a broader energy system'], ['charging', '03', 'Add solar to my current setup', 'Start with panels and charging advice']],
  helm: [['navigation', '01', 'Improve navigation', 'A starting point for a chartplotter upgrade'], ['audio', '02', 'Better sound onboard', 'Explore a marine stereo setup'], ['helm', '03', 'Bring both together', 'Plan navigation and entertainment at once']],
  care: [['care', '01', 'Keep on top of regular cleaning', 'Explore everyday washdown essentials'], ['restoration', '02', 'Polishing, restoration or a bigger job', 'Get advice on the right service first']]
};
const supportOptions = [['fitted', '01', 'Help with supply & fitting', 'Review the equipment and installation together'], ['review', '02', 'Advice before I decide', 'Check the plan with the team first'], ['supply', '03', 'Equipment for an existing plan', 'I have an installer or specification in mind']];
function optionHTML(option) { return `<button class="advisor-option" data-answer="${option[0]}"><span aria-hidden="true">${option[1]}</span><span><strong>${option[2]}</strong><small>${option[3]}</small></span><span class="option-arrow" aria-hidden="true">→</span></button>`; }
function getRecommendation() {
  const match = bundles.find(bundle => bundle.id === advisor.use);
  if (match) return { name: match.name, items: match.items, text: match.why };
  const recommendations = {
    charging: { name: 'Start with solar.', items: ['solar', 'mppt'], text: 'A panel and controller give us a starting point for a solar discussion. The team would review your batteries, mounting space and charging needs.' },
    navigation: { name: 'A clearer view ahead.', items: ['plotter'], text: 'Start with a conversation about a chartplotter upgrade. The final plan needs to account for your charts, helm layout and existing network.' },
    audio: { name: 'Bring better sound onboard.', items: ['audio'], text: 'A marine stereo is a starting point. We would also discuss speakers, listening areas, wiring and any helm integration you want.' },
    care: { name: 'A little care, often.', items: ['care'], text: 'An everyday care kit is a simple place to begin. Check the products against your boat’s surfaces and follow their individual care instructions.' },
    restoration: { name: 'Start with a conversation.', items: [], text: 'Restoration needs a closer look at the surface and its condition. Tell the team about the job before choosing products or a service.' }
  };
  return recommendations[advisor.use];
}
function renderAdvisor(moveFocus = false) {
  $('#advisor-progress').textContent = advisor.step < 3 ? `0${advisor.step + 1} / 03` : 'Your starting point';
  $('#progress-bar').style.width = `${Math.min(100, (advisor.step + 1) / 3 * 100)}%`;
  const content = $('#advisor-content');
  if (advisor.step < 3) {
    const titles = ['What would you like to improve?', advisor.goal === 'power' ? 'How do you use your boat?' : advisor.goal === 'helm' ? 'What matters most at the helm?' : 'What kind of care do you need?', 'How can the team help?'];
    const hints = ['Choose the area you have in mind.', 'We’ll use this to suggest a sensible starting point.', 'We’ll include this in your enquiry preview.'];
    const options = advisor.step === 0 ? goalOptions : advisor.step === 1 ? useOptions[advisor.goal] : supportOptions;
    content.innerHTML = `<h3 tabindex="-1">${titles[advisor.step]}</h3><p class="advisor-help">${hints[advisor.step]}</p><div class="advisor-options">${options.map(optionHTML).join('')}</div>${advisor.step ? '<button class="advisor-back" data-advisor-back>← Back</button>' : ''}`;
  } else {
    const result = getRecommendation();
    const support = advisor.support === 'fitted' ? 'Ask the team to scope fitting, commissioning and all supporting parts.' : advisor.support === 'review' ? 'Ask the team to check compatibility before you decide.' : 'Have your installer confirm the exact models, ratings and supporting parts.';
    content.innerHTML = `<span class="recommendation-tag">A starting point for your boat</span><h3 tabindex="-1">${result.name}</h3><p class="recommendation-copy">${result.text}</p>${result.items.length ? `<ul class="recommendation-list">${result.items.map(id => `<li>${productById(id).name}<span>${money(productById(id).price)}</span></li>`).join('')}</ul>` : ''}<p class="recommendation-note">${support} ${result.items.length ? 'This example is not a complete installation specification.' : ''}</p><div class="advisor-result-actions">${result.items.length ? `<button class="button primary" data-add-recommendation>Add example · ${money(totalFor(result.items))} +</button>` : ''}<button class="button ${result.items.length ? 'light' : 'primary'}" data-advisor-enquiry>Discuss this setup ↗</button></div><button class="text-button advisor-restart" data-advisor-reset>Start again</button>`;
  }
  if (moveFocus) $('h3', content).focus({ preventScroll: true });
}
$('#advisor-content').addEventListener('click', event => {
  const answer = event.target.closest('[data-answer]');
  if (answer) {
    advisor[['goal', 'use', 'support'][advisor.step]] = answer.dataset.answer;
    advisor.step += 1; renderAdvisor(true);
  }
  if (event.target.closest('[data-advisor-back]')) { advisor.step -= 1; renderAdvisor(true); }
  if (event.target.closest('[data-advisor-reset]')) { advisor = { step: 0, goal: '', use: '', support: '' }; renderAdvisor(true); }
  if (event.target.closest('[data-add-recommendation]')) addItems(getRecommendation().items);
  if (event.target.closest('[data-advisor-enquiry]')) showEnquiry('advisor');
});

function showEnquiry(source = 'advice') {
  const result = source === 'advisor' ? getRecommendation() : null;
  const supportValue = source === 'advisor' ? advisor.support : 'review';
  $('#enquiry-content').innerHTML = `<p class="eyebrow">A conversation about your boat</p><h2 id="enquiry-title">Let’s work out<br>the details.</h2><p class="enquiry-lead">${source === 'basket' ? 'Add a little context to your equipment list.' : result ? `Discuss “${result.name}” with the team.` : 'Tell the team what you would like to improve.'} This demo creates a local enquiry preview for you to review or save.</p><form class="enquiry-form" id="enquiry-form"><div class="form-row"><label>Your name <span>Optional</span><input name="name" placeholder="e.g. Alex" autocomplete="off" maxlength="100"></label><label>Email address <span>Optional</span><input type="email" name="email" placeholder="you@example.com" autocomplete="off" maxlength="150"></label></div><label>Your boat <span>Model, length and year, if known</span><input name="boat" placeholder="e.g. 34ft sailing yacht" autocomplete="off" maxlength="180"></label><label>How can we help?<select name="support"><option value="review" ${supportValue === 'review' ? 'selected' : ''}>Advice and compatibility review</option><option value="fitted" ${supportValue === 'fitted' ? 'selected' : ''}>Equipment and professional fitting</option><option value="supply" ${supportValue === 'supply' ? 'selected' : ''}>Equipment for an existing plan</option></select></label><label>A little more about your plans<textarea name="message" rows="3" maxlength="2000" placeholder="What is already onboard? What would you like to improve?"></textarea></label><p class="form-note">Nothing is sent. Contact details are used only in this preview and are not saved by the mockup.</p><button class="button primary full" type="submit">Create enquiry preview <span aria-hidden="true">→</span></button></form>`;
  $('#enquiry-form').addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const supportLabel = { review: 'Advice and compatibility review', fitted: 'Equipment and professional fitting', supply: 'Equipment for an existing plan' }[values.get('support')];
    const selectedItems = source === 'basket' ? cart.map(item => ({ ...item })) : result ? result.items.map(id => ({ id, qty: 1 })) : [];
    const total = selectedItems.reduce((sum, item) => sum + productById(item.id).price * item.qty, 0);
    enquiryText = `KNIGHT MARINE — ENQUIRY PREVIEW\nLocal design concept. Not sent.\n\nName: ${values.get('name') || 'Not provided'}\nEmail: ${values.get('email') || 'Not provided'}\nBoat: ${values.get('boat') || 'To be confirmed'}\nSupport: ${supportLabel}\n${result ? `Suggested starting point: ${result.name}\n` : ''}\n${selectedItems.length ? `EXAMPLE EQUIPMENT\n${selectedItems.map(item => `${item.qty} × ${productById(item.id).name} — ${money(productById(item.id).price * item.qty)}`).join('\n')}\n\nIllustrative equipment total: ${money(total)}\nDelivery, fitting and additional components are not included.\n\n` : ''}PLANS / QUESTIONS\n${values.get('message') || 'Please help me discuss the next steps for my boat.'}\n\nExact models, specifications and compatibility would need confirmation. No order or payment has been made.`;
    $('#enquiry-content').innerHTML = '<div class="success-mark" aria-hidden="true">✓</div><p class="eyebrow">Ready to review</p><h2 id="enquiry-title" tabindex="-1">Your enquiry preview.</h2><p class="enquiry-lead">Here’s how the request could look. You can save a text copy locally. Nothing has been sent to Knight Marine.</p><pre class="enquiry-output" id="enquiry-output"></pre><div class="actions"><button class="button primary" id="download-enquiry">Save enquiry (.txt) ↓</button><button class="button light" id="close-enquiry">Keep exploring</button></div>';
    $('#enquiry-output').textContent = enquiryText;
    $('#enquiry-title').focus();
    $('#download-enquiry').addEventListener('click', () => {
      const blob = new Blob([enquiryText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'Knight-Marine-Enquiry-Preview.txt';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    $('#close-enquiry').addEventListener('click', () => $('#enquiry-dialog').close());
  });
  openDialog('#enquiry-dialog');
}
$('#enquiry-dialog').addEventListener('close', () => { enquiryText = ''; $('#enquiry-content').replaceChildren(); });

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.detail) showProduct(button.dataset.detail);
  if (button.dataset.add) addItems([button.dataset.add]);
  if (button.dataset.bundle) showBundle(button.dataset.bundle);
  if (button.dataset.addBundle) addItems(bundles.find(bundle => bundle.id === button.dataset.addBundle).items);
  if (button.hasAttribute('data-reset-filters')) resetFilters();
  if (button.hasAttribute('data-continue-shopping')) { $('#basket-dialog').close(); $('#shop').scrollIntoView(); }
  if (button.dataset.quantity) {
    const item = cart.find(entry => entry.id === button.dataset.quantity);
    if (item) item.qty = Math.min(99, Math.max(1, item.qty + Number(button.dataset.change)));
    saveCart(); renderBasket({ id: button.dataset.quantity, change: button.dataset.change });
  }
  if (button.dataset.remove) {
    cart = cart.filter(item => item.id !== button.dataset.remove); saveCart(); renderBasket();
    $('#basket-dialog').focus();
  }
  if (button.hasAttribute('data-basket-enquiry')) showEnquiry('basket');
  if (button.hasAttribute('data-checkout')) showCheckout();
  if (button.hasAttribute('data-open-advice')) showEnquiry('advice');
});
const menuButton = $('.menu-toggle');
function closeMenu() { $('#navigation-links').classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
menuButton.addEventListener('click', () => {
  const open = $('#navigation-links').classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
$$('#navigation-links a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.navigation')) closeMenu(); });
$('#year').textContent = new Date().getFullYear();
renderProducts(); renderBundles(); renderAdvisor(); saveCart();
