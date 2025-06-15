(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(o){if(o.ep)return;o.ep=!0;const a=t(o);fetch(o.href,a)}})();class b{constructor(){this.routes=[],this.currentUrl="",window.addEventListener("hashchange",()=>{console.log("Hash changed to:",window.location.hash),this._loadRouteWithTransition()})}addRoute(e,t,i={}){return this.routes.push({url:e,callback:t,requiresAuth:i.requiresAuth||!1,guestOnly:i.guestOnly||!1}),this}setFallback(e){return this.fallbackCallback=e,this}_loadRouteWithTransition(){document.startViewTransition?document.startViewTransition(()=>{this._loadRoute()}):(this._applyFallbackTransition(),this._loadRoute())}_applyFallbackTransition(){const e=document.getElementById("mainContent");e&&(e.style.opacity="0",e.style.transition="opacity 0.3s ease",setTimeout(()=>{e.style.opacity="1"},300))}_loadRoute(){const t=window.location.hash.slice(1)||"/";this.currentUrl=t;const i=localStorage.getItem("token")!==null;console.log("Loading route:",t,"Auth:",i);const o=this.routes.find(a=>a.url===t);if(o){if(o.requiresAuth&&!i&&t!=="/masuk"){console.log("Halaman memerlukan login. Mengalihkan ke halaman login..."),this.navigateTo("/masuk");return}if(o.guestOnly&&i&&t!=="/"){console.log("Halaman hanya untuk tamu. Mengalihkan ke beranda..."),this.navigateTo("/");return}try{o.callback()}catch(a){console.error("Error in route callback:",a)}}else this.fallbackCallback&&(console.log("Route tidak ditemukan, menggunakan fallback"),this.fallbackCallback())}navigateTo(e){if(console.log("Navigating to:",e),(window.location.hash.slice(1)||"/")===e){console.log("Already on this URL, skipping navigation");return}window.location.hash=e}init(){console.log("Router initialized"),this._loadRouteWithTransition(),this._addViewTransitionStyles()}_addViewTransitionStyles(){if(!document.getElementById("viewTransitionStyles")){const e=document.createElement("style");e.id="viewTransitionStyles",e.textContent=`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes slide-from-right {
          from { transform: translateX(90px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-to-left {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-90px); opacity: 0; }
        }
        
        ::view-transition-old(root) {
          animation: 300ms fade-out ease, 400ms slide-to-left ease;
        }
        
        ::view-transition-new(root) {
          animation: 300ms fade-in ease, 400ms slide-from-right ease;
        }
      `,document.head.appendChild(e)}}}window.Router=b;const y=new b;window.router=y;document.addEventListener("DOMContentLoaded",()=>{console.log("Setting up navigation link handlers"),document.body.addEventListener("click",n=>{const e=n.target.closest("a");if(!e)return;const t=e.getAttribute("href");if(t&&t.startsWith("#/")){n.preventDefault(),console.log("Navigation link clicked:",t);const i=t.substring(1);y.navigateTo(i)}})});class P{constructor(){this.stream=null,this.capturedImageDataUrl=null}async startCamera(e){try{return console.log("Starting camera..."),this.stopCamera(),this.stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720},facingMode:"environment"}}),e.srcObject=this.stream,console.log("Camera started successfully"),!0}catch(t){return console.error("Error starting camera:",t),!1}}captureImage(e,t){try{return console.log("Capturing image..."),t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0,t.width,t.height),this.capturedImageDataUrl=t.toDataURL("image/jpeg",.8),this.stopCamera(),console.log("Image captured successfully"),this.capturedImageDataUrl}catch(i){return console.error("Error capturing image:",i),null}}stopCamera(){this.stream&&(console.log("Stopping camera..."),this.stream.getTracks().forEach(e=>{e.stop()}),this.stream=null,console.log("Camera stopped"))}async getCapturedImageBlob(){if(!this.capturedImageDataUrl)return console.error("No captured image available"),null;try{const t=await(await fetch(this.capturedImageDataUrl)).blob();return console.log("Image blob created:",t.size,"bytes"),t}catch(e){return console.error("Error creating image blob:",e),null}}async getImageBlobFromCanvas(e){return new Promise((t,i)=>{e.toBlob(o=>{o?(console.log("Canvas blob created:",o.size,"bytes"),t(o)):i(new Error("Failed to create blob from canvas"))},"image/jpeg",.8)})}}const C=new P;window.cameraHelper=C;class B{constructor(){this.dbName="PetaBicaraDB",this.dbVersion=1,this.db=null,this.stores={favorites:"favorites",offlineStories:"offlineStories",settings:"settings"}}async init(){return new Promise((e,t)=>{console.log("Initializing IndexedDB...");const i=indexedDB.open(this.dbName,this.dbVersion);i.onerror=()=>{console.error("IndexedDB initialization failed:",i.error),t(i.error)},i.onsuccess=()=>{this.db=i.result,console.log("IndexedDB initialized successfully"),e(this.db)},i.onupgradeneeded=o=>{console.log("Upgrading IndexedDB schema...");const a=o.target.result;a.objectStoreNames.contains(this.stores.favorites)||(a.createObjectStore(this.stores.favorites,{keyPath:"id"}).createIndex("createdAt","createdAt",{unique:!1}),console.log("Favorites store created")),a.objectStoreNames.contains(this.stores.offlineStories)||(a.createObjectStore(this.stores.offlineStories,{keyPath:"id",autoIncrement:!0}).createIndex("timestamp","timestamp",{unique:!1}),console.log("Offline stories store created")),a.objectStoreNames.contains(this.stores.settings)||(a.createObjectStore(this.stores.settings,{keyPath:"key"}),console.log("Settings store created"))}})}async performTransaction(e,t,i){return this.db||await this.init(),new Promise((o,a)=>{const r=this.db.transaction([e],t),s=r.objectStore(e);r.oncomplete=()=>{console.log(`Transaction completed for ${e}`)},r.onerror=()=>{console.error(`Transaction failed for ${e}:`,r.error),a(r.error)};try{const l=i(s);l?(l.onsuccess=()=>o(l.result),l.onerror=()=>a(l.error)):o()}catch(l){a(l)}})}async addToFavorites(e){console.log("Adding story to favorites:",e.id);const t={id:e.id,name:e.name,description:e.description,photoUrl:e.photoUrl,createdAt:e.createdAt,lat:e.lat,lon:e.lon,addedToFavoritesAt:new Date().toISOString()};return this.performTransaction(this.stores.favorites,"readwrite",i=>i.add(t))}async removeFromFavorites(e){return console.log("Removing story from favorites:",e),this.performTransaction(this.stores.favorites,"readwrite",t=>t.delete(e))}async getAllFavorites(){return console.log("Getting all favorite stories"),this.performTransaction(this.stores.favorites,"readonly",e=>e.getAll())}async isFavorite(e){return this.performTransaction(this.stores.favorites,"readonly",t=>t.get(e)).then(t=>!!t)}async getFavoritesCount(){return this.performTransaction(this.stores.favorites,"readonly",e=>e.count())}async saveOfflineStory(e){console.log("Saving story for offline submission");const t={description:e.description,photoBlob:e.photoBlob,lat:e.lat,lon:e.lon,token:localStorage.getItem("token"),timestamp:new Date().toISOString(),synced:!1};return this.performTransaction(this.stores.offlineStories,"readwrite",i=>i.add(t))}async getUnsyncedStories(){return console.log("Getting unsynced offline stories"),this.performTransaction(this.stores.offlineStories,"readonly",e=>e.getAll()).then(e=>e.filter(t=>!t.synced))}async markStorySynced(e){return console.log("Marking story as synced:",e),this.performTransaction(this.stores.offlineStories,"readwrite",async t=>{const i=await new Promise((o,a)=>{const r=t.get(e);r.onsuccess=()=>o(r.result),r.onerror=()=>a(r.error)});if(i)return i.synced=!0,t.put(i)})}async removeOfflineStory(e){return console.log("Removing offline story:",e),this.performTransaction(this.stores.offlineStories,"readwrite",t=>t.delete(e))}async saveSetting(e,t){console.log("Saving setting:",e);const i={key:e,value:t,updatedAt:new Date().toISOString()};return this.performTransaction(this.stores.settings,"readwrite",o=>o.put(i))}async getSetting(e){return this.performTransaction(this.stores.settings,"readonly",t=>t.get(e)).then(t=>t?t.value:null)}async clearAllData(){console.log("Clearing all IndexedDB data");const t=Object.values(this.stores).map(i=>this.performTransaction(i,"readwrite",o=>o.clear()));return Promise.all(t)}async getDatabaseInfo(){this.db||await this.init();const e={name:this.dbName,version:this.dbVersion,stores:{}};for(const[t,i]of Object.entries(this.stores))try{const o=await this.performTransaction(i,"readonly",a=>a.count());e.stores[t]={name:i,count:o}}catch(o){console.error(`Error getting info for store ${i}:`,o),e.stores[t]={name:i,count:0,error:o.message}}return e}async exportFavorites(){const e=await this.getAllFavorites();return{exportDate:new Date().toISOString(),version:this.dbVersion,favorites:e}}async importFavorites(e){if(!e.favorites||!Array.isArray(e.favorites))throw new Error("Invalid favorites data format");console.log(`Importing ${e.favorites.length} favorites`);const t=e.favorites.map(i=>this.addToFavorites(i).catch(o=>{console.warn(`Failed to import favorite ${i.id}:`,o)}));return Promise.allSettled(t)}}const x=new B;document.addEventListener("DOMContentLoaded",()=>{x.init().catch(n=>{console.error("Failed to initialize IndexedDB:",n)})});window.indexedDBHelper=x;class N{constructor(){this.vapidPublicKey="BEl62iUYgUivxIkv69yViEuiBIa40HI6DLldHta0mnPj1xhwMmpNg4HSHTnlZdHnPfU36tMEKRz72hT2RofJhkQ",this.basePath="/Submission-Intermediate",this.isSupported="serviceWorker"in navigator&&"PushManager"in window,this.registration=null,this.subscription=null,console.log("Push notifications supported:",this.isSupported)}async init(){if(!this.isSupported)return console.warn("Push notifications are not supported"),!1;try{return this.registration=await navigator.serviceWorker.ready,console.log("Service worker ready for push notifications"),this.subscription=await this.registration.pushManager.getSubscription(),this.subscription&&(console.log("Existing push subscription found"),await this.sendSubscriptionToServer(this.subscription)),!0}catch(e){return console.error("Error initializing push notifications:",e),!1}}async requestPermission(){if(!this.isSupported)throw new Error("Push notifications are not supported");let e=Notification.permission;if(e==="default"&&(e=await Notification.requestPermission()),console.log("Notification permission:",e),e!=="granted")throw new Error("Notification permission denied");return e==="granted"}async subscribe(){try{if(!await this.requestPermission())throw new Error("Permission not granted");if(!this.registration&&!await this.init())throw new Error("Failed to initialize service worker");const t=this.urlBase64ToUint8Array(this.vapidPublicKey);return this.subscription=await this.registration.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:t}),console.log("Push subscription successful:",this.subscription),await this.sendSubscriptionToServer(this.subscription),await this.saveSubscriptionLocally(this.subscription),await this.showServiceWorkerNotification("Notifikasi Aktif!","Kamu akan mendapat notifikasi untuk cerita baru dan update terbaru."),this.subscription}catch(e){throw console.error("Error subscribing to push notifications:",e),e}}async unsubscribe(){try{return this.subscription||this.registration&&(this.subscription=await this.registration.pushManager.getSubscription()),this.subscription&&await this.subscription.unsubscribe()?(console.log("Push notification unsubscribed successfully"),await this.removeSubscriptionFromServer(this.subscription),await this.removeSubscriptionLocally(),this.subscription=null,!0):!1}catch(e){throw console.error("Error unsubscribing from push notifications:",e),e}}async isSubscribed(){try{return this.registration||await this.init(),this.subscription=await this.registration.pushManager.getSubscription(),!!this.subscription}catch(e){return console.error("Error checking subscription status:",e),!1}}async showServiceWorkerNotification(e,t,i={}){if(!this.registration)return console.warn("Service Worker not registered"),!1;try{const a={...{body:t,icon:`${this.basePath}/icons/icon-192x192.png`,badge:`${this.basePath}/icons/icon-72x72.png`,vibrate:[100,50,100],data:{dateOfArrival:Date.now(),primaryKey:Math.random(),url:`${this.basePath}/`},actions:[{action:"open",title:"Buka App",icon:`${this.basePath}/icons/icon-72x72.png`},{action:"close",title:"Tutup"}],requireInteraction:!1,silent:!1,tag:"peta-bicara-notification"},...i};return await this.registration.showNotification(e,a),console.log("Service Worker notification shown successfully"),!0}catch(o){return console.error("Error showing Service Worker notification:",o),!1}}showBasicNotification(e,t,i=null){if(!this.isSupported)return console.warn("Notifications not supported"),!1;if(Notification.permission!=="granted")return console.warn("Notification permission not granted"),!1;try{const o=i||`${this.basePath}/icons/icon-192x192.png`,a=new Notification(e,{body:t,icon:o,badge:`${this.basePath}/icons/icon-72x72.png`,vibrate:[100,50,100],data:{dateOfArrival:Date.now(),primaryKey:Math.random(),url:`${this.basePath}/`},silent:!1,tag:"peta-bicara-basic"});return a.addEventListener("click",()=>{window.focus(),a.close(),window.router?window.router.navigateTo("/"):window.location.href=`${this.basePath}/`}),a.addEventListener("error",r=>{console.error("Notification error:",r)}),setTimeout(()=>{a.close()},8e3),console.log("Basic notification shown successfully"),!0}catch(o){return console.error("Error showing basic notification:",o),!1}}showLocalNotification(e,t,i){return this.showBasicNotification(e,t,i)}async sendSubscriptionToServer(e){try{console.log("Sending subscription to server...");const t={endpoint:e.endpoint,keys:{p256dh:p(e.getKey("p256dh")),auth:p(e.getKey("auth"))},timestamp:new Date().toISOString(),userAgent:navigator.userAgent,basePath:this.basePath};return console.log("Subscription data:",t),t}catch(t){console.error("Error sending subscription to server:",t)}}async removeSubscriptionFromServer(e){try{console.log("Removing subscription from server...");const t={endpoint:e.endpoint,timestamp:new Date().toISOString()};console.log("Removing subscription:",t)}catch(t){console.error("Error removing subscription from server:",t)}}async saveSubscriptionLocally(e){try{window.indexedDBHelper?(await window.indexedDBHelper.saveSetting("pushSubscription",{endpoint:e.endpoint,keys:{p256dh:p(e.getKey("p256dh")),auth:p(e.getKey("auth"))},subscribedAt:new Date().toISOString(),basePath:this.basePath}),console.log("Push subscription saved locally")):(console.warn("IndexedDB helper not available, using localStorage fallback"),localStorage.setItem("pwa-push-subscription",JSON.stringify({endpoint:e.endpoint,subscribedAt:new Date().toISOString(),basePath:this.basePath})))}catch(t){console.error("Error saving subscription locally:",t)}}async removeSubscriptionLocally(){try{window.indexedDBHelper?(await window.indexedDBHelper.saveSetting("pushSubscription",null),console.log("Push subscription removed locally")):localStorage.removeItem("pwa-push-subscription")}catch(e){console.error("Error removing subscription locally:",e)}}async getSubscriptionInfo(){try{const e=await this.isSubscribed(),t=window.indexedDBHelper?await window.indexedDBHelper.getSetting("pushSubscription"):JSON.parse(localStorage.getItem("pwa-push-subscription")||"null");return{isSubscribed:e,hasPermission:Notification.permission==="granted",isSupported:this.isSupported,subscription:this.subscription,localSubscription:t,basePath:this.basePath}}catch(e){return console.error("Error getting subscription info:",e),{isSubscribed:!1,hasPermission:!1,isSupported:this.isSupported,subscription:null,localSubscription:null,basePath:this.basePath}}}urlBase64ToUint8Array(e){const t="=".repeat((4-e.length%4)%4),i=(e+t).replace(/-/g,"+").replace(/_/g,"/"),o=window.atob(i),a=new Uint8Array(o.length);for(let r=0;r<o.length;++r)a[r]=o.charCodeAt(r);return a}async testNotification(){try{if(console.log("Testing notification..."),Notification.permission!=="granted")throw new Error("Izin notifikasi belum diberikan");return this.registration&&(console.log("Showing test notification via Service Worker..."),await this.showServiceWorkerNotification("🧪 Test Notifikasi",`Ini adalah test notifikasi dari Peta Bicara!
Notifikasi melalui Service Worker berfungsi dengan baik!`,{tag:"test-notification",data:{test:!0,url:`${this.basePath}/`}}))?!0:(console.log("Showing test notification via basic notification..."),this.showBasicNotification("🧪 Test Notifikasi",`Ini adalah test notifikasi dari Peta Bicara!
Notifikasi dasar berfungsi dengan baik!`))}catch(e){return console.error("Error testing push notification:",e),!1}}}function p(n){const e=new Uint8Array(n);let t="";return e.forEach(i=>t+=String.fromCharCode(i)),window.btoa(t)}const u=new N;document.addEventListener("DOMContentLoaded",async()=>{console.log("Initializing push notifications...");try{await u.init(),(window.indexedDBHelper?await window.indexedDBHelper.getSetting("pushSubscription"):JSON.parse(localStorage.getItem("pwa-push-subscription")||"null"))&&Notification.permission==="granted"&&(await u.isSubscribed()||(console.log("Re-subscribing to push notifications..."),await u.subscribe()))}catch(n){console.error("Failed to initialize push notifications:",n)}});window.pushNotificationHelper=u;class H{constructor(){this.swPath="/Submission-Intermediate/sw.js",this.registration=null,this.deferredPrompt=null,this.isStandalone=window.matchMedia("(display-mode: standalone)").matches}async init(){if(!this.isServiceWorkerSupported()){console.log("Service Worker not supported");return}try{await this.register(),this.setupInstallPrompt(),this.setupUpdateCheck(),this.handleAppInstalled(),console.log("Service Worker registration complete")}catch(e){console.error("Service Worker registration failed:",e)}}isServiceWorkerSupported(){return"serviceWorker"in navigator}async register(){try{return this.registration=await navigator.serviceWorker.register(this.swPath,{scope:"/Submission-Intermediate/"}),console.log("Service Worker registered:",this.registration),this.registration.addEventListener("updatefound",()=>{console.log("Service Worker update found");const e=this.registration.installing;e.addEventListener("statechange",()=>{e.state==="installed"&&navigator.serviceWorker.controller&&this.showUpdateNotification()})}),navigator.serviceWorker.addEventListener("controllerchange",()=>{console.log("Service Worker controller changed"),window.location.reload()}),this.registration}catch(e){throw console.error("Service Worker registration error:",e),e}}setupInstallPrompt(){window.addEventListener("beforeinstallprompt",e=>{console.log("beforeinstallprompt event fired"),e.preventDefault(),this.deferredPrompt=e,this.showInstallPromotion(),console.log("Install prompt platforms:",e.platforms)})}showInstallPromotion(){const e=localStorage.getItem("pwa-install-dismissed"),t=e?new Date(e):null;if((t?(new Date-t)/(1e3*60*60*24):1/0)<7){console.log("Install prompt recently dismissed");return}const o=document.createElement("div");o.id="installBanner",o.className="install-banner",o.innerHTML=`
      <div class="install-banner-content">
        <div class="install-banner-icon">
          <i class="fas fa-download"></i>
        </div>
        <div class="install-banner-text">
          <h3>Install Peta Bicara</h3>
          <p>Pasang aplikasi untuk pengalaman terbaik!</p>
        </div>
        <div class="install-banner-actions">
          <button class="btn btn-primary" id="installBtn">
            <i class="fas fa-plus-circle"></i> Install
          </button>
          <button class="btn btn-secondary" id="dismissBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;const a=document.createElement("style");a.textContent=`
      .install-banner {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 1rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        max-width: 90%;
        width: 400px;
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from { 
          transform: translateX(-50%) translateY(100%);
          opacity: 0;
        }
        to { 
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }

      .install-banner-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .install-banner-icon {
        font-size: 2rem;
        color: #2196F3;
      }

      .install-banner-text h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
        color: #333;
      }

      .install-banner-text p {
        margin: 0;
        font-size: 0.9rem;
        color: #666;
      }

      .install-banner-actions {
        display: flex;
        gap: 0.5rem;
        margin-left: auto;
      }

      .install-banner .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      }

      .install-banner .btn-primary {
        background: #2196F3;
        color: white;
      }

      .install-banner .btn-primary:hover {
        background: #1976D2;
        transform: scale(1.05);
      }

      .install-banner .btn-secondary {
        background: #f0f0f0;
        color: #666;
        padding: 0.5rem 0.75rem;
      }

      .install-banner .btn-secondary:hover {
        background: #e0e0e0;
      }

      @media (max-width: 480px) {
        .install-banner {
          width: calc(100% - 40px);
          bottom: 10px;
        }
        
        .install-banner-content {
          flex-wrap: wrap;
        }
        
        .install-banner-actions {
          width: 100%;
          justify-content: space-between;
          margin-top: 1rem;
        }
      }
    `,document.head.appendChild(a),document.body.appendChild(o),document.getElementById("installBtn").addEventListener("click",()=>{this.promptInstall()}),document.getElementById("dismissBtn").addEventListener("click",()=>{this.dismissInstallBanner()}),setTimeout(()=>{document.getElementById("installBanner")&&this.dismissInstallBanner(!1)},1e4)}async promptInstall(){if(!this.deferredPrompt){console.log("No deferred prompt available"),this.showManualInstallInstructions();return}try{this.deferredPrompt.prompt();const{outcome:e}=await this.deferredPrompt.userChoice;console.log(`User response to install prompt: ${e}`),window.gtag&&window.gtag("event","pwa_install_prompt",{event_category:"PWA",event_label:e}),this.deferredPrompt=null;const t=document.getElementById("installBanner");t&&t.remove()}catch(e){console.error("Error prompting install:",e),this.showManualInstallInstructions()}}showManualInstallInstructions(){const e=/iPad|iPhone|iPod/.test(navigator.userAgent),t=/Android/.test(navigator.userAgent);let i="";e?i=`
        <h4>Install di iOS:</h4>
        <ol>
          <li>Tap tombol Share <i class="fas fa-share"></i></li>
          <li>Pilih "Add to Home Screen"</li>
          <li>Tap "Add"</li>
        </ol>
      `:t?i=`
        <h4>Install di Android:</h4>
        <ol>
          <li>Tap menu <i class="fas fa-ellipsis-v"></i> di browser</li>
          <li>Pilih "Add to Home screen" atau "Install app"</li>
          <li>Tap "Install"</li>
        </ol>
      `:i=`
        <h4>Install di Desktop:</h4>
        <ol>
          <li>Klik icon install <i class="fas fa-plus"></i> di address bar</li>
          <li>Atau gunakan menu browser → "Install Peta Bicara"</li>
          <li>Klik "Install"</li>
        </ol>
      `;const o=document.createElement("div");o.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `,o.innerHTML=`
      <div style="
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 400px;
        width: 100%;
        text-align: center;
      ">
        <h3 style="margin: 0 0 1rem 0; color: #333;">
          <i class="fas fa-mobile-alt" style="color: #2196F3;"></i>
          Install Peta Bicara
        </h3>
        ${i}
        <button onclick="this.closest('div').parentElement.remove()" style="
          background: #2196F3;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 1rem;
          font-size: 1rem;
        ">
          OK, Mengerti
        </button>
      </div>
    `,document.body.appendChild(o)}dismissInstallBanner(e=!0){const t=document.getElementById("installBanner");t&&(t.style.animation="slideDown 0.3s ease",setTimeout(()=>t.remove(),300)),e&&localStorage.setItem("pwa-install-dismissed",new Date().toISOString())}handleAppInstalled(){window.addEventListener("appinstalled",()=>{console.log("PWA was installed"),window.gtag&&window.gtag("event","pwa_installed",{event_category:"PWA",event_label:"success"}),localStorage.removeItem("pwa-install-dismissed"),window.pushNotificationHelper&&window.pushNotificationHelper.showBasicNotification("Peta Bicara Terpasang!","Aplikasi berhasil dipasang. Kamu bisa membukanya dari homescreen.","/Submission-Intermediate/icons/icon-192x192.png")})}setupUpdateCheck(){setInterval(()=>{this.registration&&this.registration.update()},60*60*1e3),document.addEventListener("visibilitychange",()=>{!document.hidden&&this.registration&&this.registration.update()})}showUpdateNotification(){const e=document.createElement("div");e.className="update-notification",e.innerHTML=`
      <div class="update-content">
        <i class="fas fa-sync-alt"></i>
        <span>Update tersedia! Klik untuk memperbarui.</span>
      </div>
    `;const t=document.createElement("style");t.textContent=`
      .update-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        cursor: pointer;
        z-index: 1001;
        animation: slideDown 0.3s ease;
      }

      @keyframes slideDown {
        from { 
          transform: translateX(-50%) translateY(-100%);
          opacity: 0;
        }
        to { 
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }

      .update-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .update-notification:hover {
        background: #45a049;
        transform: translateX(-50%) scale(1.05);
      }
    `,document.head.appendChild(t),document.body.appendChild(e),e.addEventListener("click",()=>{this.registration&&this.registration.waiting&&this.registration.waiting.postMessage({type:"SKIP_WAITING"}),e.remove()}),setTimeout(()=>{e.parentNode&&e.remove()},1e4)}isAppInstalled(){return this.isStandalone||window.navigator.standalone||document.referrer.includes("android-app://")}async getStatus(){const e=await navigator.serviceWorker.getRegistration();return{isSupported:this.isServiceWorkerSupported(),isRegistered:!!e,isInstalled:this.isAppInstalled(),hasUpdate:(e==null?void 0:e.waiting)!=null,registration:e}}}document.addEventListener("DOMContentLoaded",()=>{const n=new H;n.init(),window.swRegister=n});(function(){const n={logAPIRequests:!0,logModelEvents:!0,logPresenterEvents:!0,logViewEvents:!0,init:function(){console.log("Debug tools initialized"),this.monitorToken(),window.addEventListener("error",e=>{console.error("Uncaught error:",e.error)}),this.interceptFetch()},monitorToken:function(){console.log("Token status:",localStorage.getItem("token")?"Found":"Not found");const e=localStorage.setItem;localStorage.setItem=function(i,o){i==="token"&&console.log(`Token ${o?"set":"removed"}`),e.apply(this,arguments)};const t=localStorage.removeItem;localStorage.removeItem=function(i){i==="token"&&console.log("Token removed"),t.apply(this,arguments)}},interceptFetch:function(){const e=window.fetch;window.fetch=async function(...t){const i=t[0];if(typeof i=="string"&&i.includes("story-api.dicoding.dev")){console.log("API Request:",i,t[1]&&t[1].method||"GET");try{const o=await e.apply(this,t),a=o.clone();return console.log("API Response Status:",o.status,o.statusText),a.json().then(r=>{console.log("API Response:",r),r.error&&console.error("API Error:",r.message)}).catch(r=>{}),o}catch(o){throw console.error("API Request Failed:",o),o}}return e.apply(this,t)}}};n.init(),window.appDebug=n})();class F{constructor(){this.dbHelper=window.indexedDBHelper,this.isReady=!1}async init(){this.dbHelper?(await this.dbHelper.init(),this.isReady=!0,console.log("FavoritesHelper initialized")):console.error("IndexedDB helper not found")}async addToFavorites(e){this.isReady||await this.init();try{return await this.dbHelper.addToFavorites(e),this.showToast("✅ Cerita ditambahkan ke favorit!"),this.updateFavoriteButton(e.id,!0),this.updateNavigationCount(),!0}catch(t){return console.error("Error adding to favorites:",t),this.showToast("❌ Gagal menambahkan ke favorit"),!1}}async removeFromFavorites(e){this.isReady||await this.init();try{return await this.dbHelper.removeFromFavorites(e),this.showToast("🗑️ Cerita dihapus dari favorit"),this.updateFavoriteButton(e,!1),this.updateNavigationCount(),!0}catch(t){return console.error("Error removing from favorites:",t),this.showToast("❌ Gagal menghapus dari favorit"),!1}}async toggleFavorite(e){return await this.isFavorite(e.id)?await this.removeFromFavorites(e.id):await this.addToFavorites(e)}async isFavorite(e){this.isReady||await this.init();try{return await this.dbHelper.isFavorite(e)}catch(t){return console.error("Error checking favorite status:",t),!1}}async getAllFavorites(){this.isReady||await this.init();try{return await this.dbHelper.getAllFavorites()}catch(e){return console.error("Error getting favorites:",e),[]}}addFavoriteButtonToStoryCard(e,t){if(e.querySelector(".favorite-btn"))return;const i=document.createElement("button");i.className="favorite-btn",i.setAttribute("data-story-id",t.id),i.setAttribute("aria-label","Tambah ke favorit"),i.innerHTML='<i class="far fa-heart"></i>';const o=e.querySelector(".story-footer");if(o)o.appendChild(i);else{const a=document.createElement("div");a.className="story-footer",a.appendChild(i),e.appendChild(a)}i.addEventListener("click",async a=>{a.preventDefault(),a.stopPropagation(),i.disabled=!0,i.innerHTML,i.innerHTML='<i class="fas fa-spinner fa-spin"></i>',await this.toggleFavorite(t),i.disabled=!1}),this.updateFavoriteButtonStatus(i,t.id)}async updateFavoriteButtonStatus(e,t){const i=await this.isFavorite(t);this.updateFavoriteButton(t,i)}updateFavoriteButton(e,t){const i=document.querySelector(`.favorite-btn[data-story-id="${e}"]`);i&&(t?(i.innerHTML='<i class="fas fa-heart"></i>',i.classList.add("favorited"),i.setAttribute("aria-label","Hapus dari favorit"),i.style.color="#e91e63"):(i.innerHTML='<i class="far fa-heart"></i>',i.classList.remove("favorited"),i.setAttribute("aria-label","Tambah ke favorit"),i.style.color="#999"))}async updateNavigationCount(){try{const e=await this.dbHelper.getFavoritesCount(),t=document.getElementById("navFavoritesCount");t&&(t.textContent=e,t.style.display=e>0?"inline":"none")}catch(e){console.error("Error updating navigation count:",e)}}addFavoritesToNavigation(){const e=document.querySelector(".nav-menu");if(!e||e.querySelector('a[href="#/favorit"]'))return;const t=document.getElementById("authNavItem");if(!t)return;const i=document.createElement("li");i.className="auth-required-nav",i.style.display="none",i.innerHTML=`
      <a href="#/favorit">
        <i class="fas fa-heart" aria-hidden="true"></i> 
        Favorit
        <span class="favorites-count" id="navFavoritesCount" style="background: #e91e63; color: white; border-radius: 10px; padding: 2px 6px; font-size: 0.75rem; margin-left: 0.5rem; display: none;">0</span>
      </a>
    `,t.parentNode.insertBefore(i,t),console.log("Favorites navigation added")}updateNavigationVisibility(){const e=localStorage.getItem("token")!==null;document.querySelectorAll(".auth-required-nav").forEach(i=>{i.style.display=e?"block":"none"}),e&&this.updateNavigationCount()}showToast(e,t=3e3){const i=document.querySelector(".favorites-toast");i&&i.remove();const o=document.createElement("div");if(o.className="favorites-toast",o.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    `,o.textContent=e,!document.getElementById("toastAnimation")){const a=document.createElement("style");a.id="toastAnimation",a.textContent=`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .favorites-toast {
          animation: slideIn 0.3s ease;
        }
      `,document.head.appendChild(a)}document.body.appendChild(o),setTimeout(()=>{o.parentNode&&(o.style.animation="slideIn 0.3s ease reverse",setTimeout(()=>o.remove(),300))},t)}async exportFavorites(){try{const e=await this.getAllFavorites(),t={exportDate:new Date().toISOString(),version:"1.0.0",totalFavorites:e.length,favorites:e},i=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),o=URL.createObjectURL(i),a=document.createElement("a");a.href=o,a.download=`peta-bicara-favorites-${new Date().toISOString().split("T")[0]}.json`,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(o),this.showToast(`📦 ${e.length} favorit berhasil di-export!`)}catch(e){console.error("Error exporting favorites:",e),this.showToast("❌ Gagal export favorit")}}async clearAllFavorites(){if(!confirm("Apakah Anda yakin ingin menghapus semua favorit? Tindakan ini tidak dapat dibatalkan."))return!1;try{const e=await this.getAllFavorites();for(const t of e)await this.dbHelper.removeFromFavorites(t.id);return this.showToast(`🗑️ ${e.length} favorit berhasil dihapus`),this.updateNavigationCount(),!0}catch(e){return console.error("Error clearing favorites:",e),this.showToast("❌ Gagal menghapus favorit"),!1}}}const c=new F;document.addEventListener("DOMContentLoaded",()=>{c.addFavoritesToNavigation(),window.addEventListener("authChanged",()=>{c.updateNavigationVisibility()}),window.addEventListener("storage",n=>{n.key==="token"&&c.updateNavigationVisibility()}),c.updateNavigationVisibility(),console.log("FavoritesHelper ready")});window.favoritesHelper=c;class M{constructor(){this.pushHelper=null,this.isReady=!1,this.retryCount=0,this.maxRetries=5}async init(){if(console.log("NotificationUIHelper: Initializing..."),await this.waitForPushHelper(),this.pushHelper)try{return await this.pushHelper.init(),this.isReady=!0,console.log("NotificationUIHelper: Successfully initialized"),!0}catch(e){return console.error("NotificationUIHelper: Init error:",e),!1}else return console.warn("NotificationUIHelper: Push helper not available after retries"),!1}async waitForPushHelper(){return new Promise(e=>{const t=()=>{window.pushNotificationHelper?(this.pushHelper=window.pushNotificationHelper,console.log("NotificationUIHelper: Push helper found"),e(!0)):this.retryCount<this.maxRetries?(this.retryCount++,console.log(`NotificationUIHelper: Waiting for push helper (${this.retryCount}/${this.maxRetries})`),setTimeout(t,1e3)):(console.warn("NotificationUIHelper: Push helper not found after retries"),e(!1))};t()})}createNotificationSettingsUI(e){if(!e){console.error("NotificationUIHelper: Container not provided");return}console.log("NotificationUIHelper: Creating settings UI");const t=`
      <div class="notification-settings-card">
        <div class="settings-header">
          <h3><i class="fas fa-bell"></i> Push Notifikasi</h3>
          <p>Dapatkan notifikasi untuk cerita baru dan update terbaru</p>
        </div>
        
        <div class="notification-status" id="notificationStatus">
          <div class="status-indicator info" id="statusIndicator">
            <i class="fas fa-circle"></i>
            <span id="statusText">Mengecek status...</span>
          </div>
        </div>
        
        <div class="notification-controls">
          <div class="control-group">
            <label class="toggle-switch">
              <input type="checkbox" id="notificationToggle" aria-label="Toggle push notifications">
              <span class="toggle-slider"></span>
            </label>
            <div class="control-info">
              <strong>Push Notifikasi</strong>
              <small>Terima notifikasi bahkan saat aplikasi ditutup</small>
            </div>
          </div>
        </div>
        
        <div class="notification-actions" id="notificationActions">
          <button class="btn btn-test" id="testNotificationBtn" style="display: none;">
            <i class="fas fa-vial"></i>
            Test Notifikasi
          </button>
          <button class="btn btn-info" id="permissionInfoBtn">
            <i class="fas fa-info-circle"></i>
            Info Izin
          </button>
          <button class="btn btn-secondary" id="debugBtn">
            <i class="fas fa-bug"></i>
            Debug
          </button>
        </div>
        
        <div class="notification-info" id="notificationInfo" style="display: none;">
          <div class="info-content">
            <i class="fas fa-lightbulb"></i>
            <div>
              <strong>Tips:</strong>
              <p>Notifikasi akan muncul bahkan ketika browser atau aplikasi ditutup. Pastikan izin notifikasi telah diberikan di pengaturan browser.</p>
            </div>
          </div>
        </div>

        <div class="debug-info" id="debugInfo" style="display: none;">
          <h4>Debug Information:</h4>
          <div id="debugContent">Loading...</div>
        </div>
      </div>
    `;e.innerHTML=t,this.addNotificationStyles(),this.setupNotificationEvents(),this.updateNotificationStatus()}addNotificationStyles(){if(document.getElementById("notificationUIStyles"))return;const e=document.createElement("style");e.id="notificationUIStyles",e.textContent=`
      .notification-settings-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 1rem;
        border: 1px solid #e0e0e0;
      }

      .settings-header h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.25rem;
      }

      .settings-header p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }

      .notification-status {
        margin: 1.5rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #6c757d;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
      }

      .status-indicator.success {
        color: #28a745;
      }

      .status-indicator.warning {
        color: #ffc107;
      }

      .status-indicator.error {
        color: #dc3545;
      }

      .status-indicator.info {
        color: #17a2b8;
      }

      .notification-status.success {
        border-left-color: #28a745;
        background: #f8fff9;
      }

      .notification-status.warning {
        border-left-color: #ffc107;
        background: #fffcf0;
      }

      .notification-status.error {
        border-left-color: #dc3545;
        background: #fff5f5;
      }

      .notification-status.info {
        border-left-color: #17a2b8;
        background: #f0faff;
      }

      .notification-controls {
        margin: 1.5rem 0;
      }

      .control-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
        flex-shrink: 0;
      }

      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 34px;
      }

      .toggle-slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }

      input:checked + .toggle-slider {
        background-color: #2196F3;
      }

      input:checked + .toggle-slider:before {
        transform: translateX(26px);
      }

      .control-info {
        flex-grow: 1;
      }

      .control-info strong {
        display: block;
        color: #333;
        margin-bottom: 0.25rem;
      }

      .control-info small {
        color: #666;
        font-size: 0.85rem;
      }

      .notification-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .notification-actions .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-weight: 500;
      }

      .btn-test {
        background: #17a2b8;
        color: white;
      }

      .btn-test:hover {
        background: #138496;
      }

      .btn-info {
        background: #6c757d;
        color: white;
      }

      .btn-info:hover {
        background: #5a6268;
      }

      .btn-secondary {
        background: #fd7e14;
        color: white;
      }

      .btn-secondary:hover {
        background: #e76500;
      }

      .notification-info {
        margin-top: 1.5rem;
        padding: 1rem;
        background: #e3f2fd;
        border-radius: 8px;
        border-left: 4px solid #2196F3;
      }

      .info-content {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
      }

      .info-content i {
        color: #2196F3;
        font-size: 1.25rem;
        flex-shrink: 0;
        margin-top: 0.25rem;
      }

      .info-content strong {
        color: #1565c0;
        display: block;
        margin-bottom: 0.5rem;
      }

      .info-content p {
        margin: 0;
        color: #0d47a1;
        line-height: 1.5;
        font-size: 0.9rem;
      }

      .debug-info {
        margin-top: 1.5rem;
        padding: 1rem;
        background: #fff3cd;
        border-radius: 8px;
        border-left: 4px solid #ffc107;
      }

      .debug-info h4 {
        margin: 0 0 1rem 0;
        color: #856404;
      }

      #debugContent {
        font-family: monospace;
        font-size: 0.8rem;
        background: #fff;
        padding: 1rem;
        border-radius: 4px;
        white-space: pre-wrap;
        max-height: 200px;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .control-group {
          flex-direction: column;
          text-align: center;
          gap: 0.75rem;
        }

        .notification-actions {
          flex-direction: column;
        }

        .notification-actions .btn {
          width: 100%;
          justify-content: center;
        }
      }
    `,document.head.appendChild(e)}setupNotificationEvents(){console.log("NotificationUIHelper: Setting up events");const e=document.getElementById("notificationToggle"),t=document.getElementById("testNotificationBtn"),i=document.getElementById("permissionInfoBtn"),o=document.getElementById("debugBtn");e?(console.log("NotificationUIHelper: Toggle found, adding listener"),e.addEventListener("change",async a=>{console.log("NotificationUIHelper: Toggle changed to:",a.target.checked);const r=a.target.checked;e.disabled=!0;try{this.updateStatusText("Memproses...","info"),r?(console.log("NotificationUIHelper: Attempting to enable notifications"),await this.enableNotifications()):(console.log("NotificationUIHelper: Attempting to disable notifications"),await this.disableNotifications())}catch(s){console.error("NotificationUIHelper: Toggle error:",s),a.target.checked=!r,this.showNotificationMessage(s.message,"error")}finally{e.disabled=!1}})):console.error("NotificationUIHelper: Toggle not found!"),t&&t.addEventListener("click",()=>this.testNotification()),i&&i.addEventListener("click",()=>this.showPermissionInfo()),o&&o.addEventListener("click",()=>this.toggleDebugInfo())}async enableNotifications(){if(console.log("NotificationUIHelper: Enabling notifications"),!this.isReady&&(console.log("NotificationUIHelper: Not ready, initializing..."),!await this.init()))throw new Error("Tidak dapat menginisialisasi push notification service");try{if(this.updateStatusText("Meminta izin notifikasi...","info"),Notification.permission==="denied")throw new Error("Izin notifikasi ditolak. Silakan aktifkan di pengaturan browser.");if(Notification.permission==="default"&&await Notification.requestPermission()!=="granted")throw new Error("Izin notifikasi tidak diberikan");if(this.updateStatusText("Mendaftarkan service worker...","info"),await this.pushHelper.subscribe())this.showNotificationMessage("✅ Push notifikasi berhasil diaktifkan!","success"),this.updateNotificationStatus();else throw new Error("Gagal membuat subscription")}catch(e){throw console.error("NotificationUIHelper: Enable error:",e),new Error("Gagal mengaktifkan notifikasi: "+e.message)}}async disableNotifications(){console.log("NotificationUIHelper: Disabling notifications"),this.isReady||await this.init();try{if(this.updateStatusText("Menonaktifkan notifikasi...","info"),await this.pushHelper.unsubscribe())this.showNotificationMessage("Push notifikasi berhasil dinonaktifkan","info"),this.updateNotificationStatus();else throw new Error("Gagal membatalkan subscription")}catch(e){throw console.error("NotificationUIHelper: Disable error:",e),new Error("Gagal menonaktifkan notifikasi: "+e.message)}}async testNotification(){console.log("NotificationUIHelper: Testing notification");try{if(Notification.permission==="granted")new Notification("🧪 Test Notifikasi",{body:"Ini adalah test notifikasi dari Peta Bicara!",icon:"/icons/icon-192x192.png",badge:"/icons/icon-72x72.png"}),this.showNotificationMessage("🧪 Test notifikasi berhasil dikirim!","success");else throw new Error("Izin notifikasi belum diberikan");this.pushHelper&&this.isReady&&(await this.pushHelper.testNotification()||console.warn("Push helper test failed, but basic notification worked"))}catch(e){console.error("NotificationUIHelper: Test error:",e),this.showNotificationMessage("Error: "+e.message,"error")}}async updateNotificationStatus(){console.log("NotificationUIHelper: Updating status");const e=document.getElementById("notificationToggle"),t=document.getElementById("testNotificationBtn"),i=document.getElementById("notificationInfo");try{if(!("Notification"in window)){this.updateStatusText("Browser tidak mendukung notifikasi","error"),e&&(e.disabled=!0);return}if(!("serviceWorker"in navigator)){this.updateStatusText("Browser tidak mendukung service worker","error"),e&&(e.disabled=!0);return}if(window.location.protocol!=="https:"&&window.location.hostname!=="localhost"){this.updateStatusText("HTTPS diperlukan untuk push notification","error"),e&&(e.disabled=!0);return}const o=Notification.permission;if(console.log("NotificationUIHelper: Permission status:",o),o==="denied"){this.updateStatusText("Izin notifikasi ditolak","error"),e&&(e.checked=!1),t&&(t.style.display="none");return}if(o==="default"){this.updateStatusText("Izin notifikasi belum diminta","warning"),e&&(e.checked=!1),t&&(t.style.display="none");return}if(this.pushHelper&&this.isReady){const a=await this.pushHelper.getSubscriptionInfo();console.log("NotificationUIHelper: Subscription info:",a),a.isSubscribed?(this.updateStatusText("Push notifikasi aktif dan siap","success"),e&&(e.checked=!0),t&&(t.style.display="inline-flex"),i&&(i.style.display="block")):(this.updateStatusText("Push notifikasi tidak aktif","warning"),e&&(e.checked=!1),t&&(t.style.display="none"))}else this.updateStatusText("Push service tidak tersedia","warning"),e&&(e.checked=!1),t&&(t.style.display="none")}catch(o){console.error("NotificationUIHelper: Status check error:",o),this.updateStatusText("Gagal mengecek status notifikasi","error")}}updateStatusText(e,t){console.log(`NotificationUIHelper: Status - ${t}: ${e}`);const i=document.getElementById("statusIndicator"),o=document.getElementById("statusText"),a=document.getElementById("notificationStatus");o&&(o.textContent=e),i&&(i.className=`status-indicator ${t}`),a&&(a.className=`notification-status ${t}`)}async toggleDebugInfo(){const e=document.getElementById("debugInfo"),t=document.getElementById("debugContent");if(e.style.display==="none"){e.style.display="block";const i={timestamp:new Date().toISOString(),browser:navigator.userAgent,protocol:window.location.protocol,hostname:window.location.hostname,notificationSupport:"Notification"in window,serviceWorkerSupport:"serviceWorker"in navigator,pushManagerSupport:"PushManager"in window,notificationPermission:Notification.permission,pushHelperAvailable:!!this.pushHelper,pushHelperReady:this.isReady,serviceWorkerRegistered:null,pushSubscription:null};try{const o=await navigator.serviceWorker.getRegistration();if(i.serviceWorkerRegistered=!!o,o){const a=await o.pushManager.getSubscription();i.pushSubscription=!!a}}catch(o){i.error=o.message}t.textContent=JSON.stringify(i,null,2)}else e.style.display="none"}showPermissionInfo(){const e=location.protocol==="https:",t=this.getBrowserName();let i=`
      <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 400px; margin: 20px auto;">
        <h4 style="margin: 0 0 1rem 0; color: #333;"><i class="fas fa-info-circle" style="color: #2196F3;"></i> Informasi Push Notifikasi</h4>
        
        <div style="margin-bottom: 1rem;">
          <strong>Status Saat Ini:</strong>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            <li>HTTPS: ${e?"✅ Aman":"❌ Diperlukan"}</li>
            <li>Browser: ${t}</li>
            <li>Izin: ${Notification.permission}</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <strong>Cara Mengaktifkan:</strong>
          <ol style="margin: 0.5rem 0; padding-left: 1.5rem; font-size: 0.9rem;">
            <li>Klik toggle "Push Notifikasi"</li>
            <li>Izinkan notifikasi saat browser bertanya</li>
            <li>Test dengan tombol "Test Notifikasi"</li>
          </ol>
        </div>
        
        <button onclick="this.parentElement.parentElement.remove()" style="background: #2196F3; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; width: 100%;">
          Tutup
        </button>
      </div>
    `;const o=document.createElement("div");o.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `,o.innerHTML=i,document.body.appendChild(o),o.addEventListener("click",a=>{a.target===o&&o.remove()})}getBrowserName(){const e=navigator.userAgent;return e.includes("Chrome")?"Chrome":e.includes("Firefox")?"Firefox":e.includes("Safari")?"Safari":e.includes("Edge")?"Edge":"Unknown"}showNotificationMessage(e,t="info"){console.log(`NotificationUIHelper: Message - ${t}: ${e}`);const i=document.querySelector(".notification-message");i&&i.remove();const o=document.createElement("div");o.className="notification-message",o.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease;
      max-width: 300px;
    `;const a={success:"#28a745",error:"#dc3545",warning:"#ffc107",info:"#17a2b8"};o.style.background=a[t]||a.info,o.textContent=e,document.body.appendChild(o),setTimeout(()=>{o.parentNode&&(o.style.animation="slideOutRight 0.3s ease",setTimeout(()=>o.remove(),300))},4e3)}}const k=new M;document.addEventListener("DOMContentLoaded",()=>{setTimeout(async()=>{console.log("NotificationUIHelper: Starting initialization"),await k.init(),console.log("NotificationUIHelper: Ready for use")},2e3)});if(!document.getElementById("slideAnimations")){const n=document.createElement("style");n.id="slideAnimations",n.textContent=`
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `,document.head.appendChild(n)}window.notificationUIHelper=k;class _{constructor(){this.baseUrl="https://story-api.dicoding.dev/v1"}async register(e,t,i){try{console.log("Registering user:",e,t);const a=await(await fetch(`${this.baseUrl}/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e,email:t,password:i})})).json();if(console.log("Register response:",a),a.error)throw new Error(a.message);return a}catch(o){throw console.error("Registration error:",o),new Error(`Failed to register: ${o.message}`)}}async login(e,t){try{console.log("Login attempt for:",e);const o=await(await fetch(`${this.baseUrl}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:t})})).json();if(console.log("Login response:",o),o.error)throw new Error(o.message);return localStorage.setItem("token",o.loginResult.token),localStorage.setItem("user",JSON.stringify(o.loginResult)),o}catch(i){throw console.error("Login error:",i),new Error(`Failed to login: ${i.message}`)}}async getAllStories(){try{const e=localStorage.getItem("token");if(console.log("Getting stories with token:",e?"Token exists":"No token"),!e)throw new Error("Token tidak ditemukan. Silakan login terlebih dahulu.");const i=await(await fetch(`${this.baseUrl}/stories?location=1`,{headers:{Authorization:`Bearer ${e}`}})).json();if(console.log("Stories response:",i),i.error)throw new Error(i.message);return i.listStory}catch(e){return console.error("Error fetching stories:",e),e.message.includes("Token tidak ditemukan")&&window.router&&window.router.navigateTo("/masuk"),[]}}async addNewStory(e,t,i,o){try{const a=localStorage.getItem("token");if(console.log("Adding new story with token:",a?"Token exists":"No token"),!a)throw new Error("Token tidak ditemukan. Silakan login terlebih dahulu.");const r=new FormData;r.append("description",e),r.append("photo",t,"photo.jpg"),i!==null&&o!==null&&(r.append("lat",i),r.append("lon",o)),console.log("Sending request to add story");const l=await(await fetch(`${this.baseUrl}/stories`,{method:"POST",headers:{Authorization:`Bearer ${a}`},body:r})).json();if(console.log("Add story response:",l),l.error)throw new Error(l.message);return l}catch(a){throw console.error("Error adding story:",a),new Error(`Failed to add story: ${a.message}`)}}isAuthenticated(){return!!localStorage.getItem("token")}logout(){localStorage.removeItem("token"),localStorage.removeItem("user")}getCurrentUser(){const e=localStorage.getItem("user");return e?JSON.parse(e):null}}const D=new _;window.apiService=D;class z{constructor(e){this.apiService=e,console.log("StoryModel initialized with apiService")}async getAllStories(){try{console.log("StoryModel.getAllStories: Requesting stories from API");const e=await this.apiService.getAllStories();return!e||!Array.isArray(e)?(console.warn("StoryModel: Invalid stories data received from API"),[]):(console.log(`StoryModel: Successfully retrieved ${e.length} stories`),e)}catch(e){throw console.error("StoryModel: Error getting stories:",e),new Error(`Failed to load stories: ${e.message}`)}}async addNewStory(e,t,i,o){try{if(console.log("StoryModel.addNewStory: Adding new story"),!e||!t)throw new Error("Description and photo are required");return await this.apiService.addNewStory(e,t,i,o)}catch(a){throw console.error("StoryModel: Error adding story:",a),new Error(`Failed to add story: ${a.message}`)}}}window.StoryModel=z;class S{constructor(){this.render()}render(){const e=document.querySelector("footer");if(e&&(e.innerHTML=`
      <div class="container">
        <div class="footer-content compact">
          <div class="footer-brand">
            <h2><i class="fas fa-map-marked-alt"></i> PetaBicara</h2>
            <p>Berbagi cerita berdasarkan lokasi di Indonesia</p>
          </div>
          
          <div class="footer-links-container">
            <div class="footer-links">
              <h3>Navigasi</h3>
              <ul>
                <li><a href="#/">Beranda</a></li>
                <li><a href="#/tambah">Tambah Cerita</a></li>
                <li><a href="#/peta">Peta Cerita</a></li>
              </ul>
            </div>
            
            <div class="footer-contact">
              <h3>Kontak</h3>
              <p><i class="fas fa-envelope"></i> taufan759@gmail.com</p>
              <p><i class="fas fa-map-pin"></i> Kota Tegal, Indonesia</p>
            </div>
          </div>
        </div>
        
        <div class="footer-copyright">
          <p>&copy; ${new Date().getFullYear()} PetaBicara - Berbagi cerita, berbagi lokasi</p>
        </div>
      </div>
    `,!document.getElementById("compactFooterStyles"))){const t=document.createElement("style");t.id="compactFooterStyles",t.textContent=`
        .app-footer {
          background-color: #1e3a5f;
          padding: 2rem 0 1rem;  /* Reduced padding */
        }
        
        .footer-content.compact {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          margin-bottom: 1rem;  /* Reduced margin */
        }
        
        .footer-brand {
          flex: 1;
          min-width: 250px;
        }
        
        .footer-links-container {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }
        
        .footer-brand h2 {
          font-size: 1.25rem;  /* Smaller font */
          margin-bottom: 0.5rem;
        }
        
        .footer-brand p {
          font-size: 0.875rem;  /* Smaller font */
        }
        
        .footer-links h3, 
        .footer-contact h3 {
          font-size: 1rem;  /* Smaller font */
          margin-bottom: 0.75rem;
        }
        
        .footer-links ul {
          padding-left: 0;
        }
        
        .footer-links li {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;  /* Smaller font */
        }
        
        .footer-contact p {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;  /* Smaller font */
        }
        
        .footer-copyright {
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          font-size: 0.875rem;  /* Smaller font */
        }
      `,document.head.appendChild(t)}}}new S;window.Footer=S;class I{constructor(){this._bindEvents()}_bindEvents(){document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("navToggle"),t=document.querySelector(".nav-menu");document.getElementById("authNavItem"),e&&t&&e.addEventListener("click",()=>{t.classList.toggle("active");const i=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",!i),e.innerHTML=i?'<i class="fas fa-bars" aria-hidden="true"></i>':'<i class="fas fa-times" aria-hidden="true"></i>'}),document.addEventListener("click",i=>{t&&t.classList.contains("active")&&!i.target.closest(".nav-menu")&&!i.target.closest("#navToggle")&&(t.classList.remove("active"),e&&(e.setAttribute("aria-expanded","false"),e.innerHTML='<i class="fas fa-bars" aria-hidden="true"></i>'))}),this.updateAuthNavItem(),window.addEventListener("hashchange",()=>{this.updateActiveLink()}),this.updateActiveLink()})}updateAuthNavItem(){const e=document.getElementById("authNavItem");if(e)if(localStorage.getItem("token")!==null){e.innerHTML=`
          <a href="#" id="logoutButton">
            <i class="fas fa-sign-out-alt" aria-hidden="true"></i> Logout
          </a>
        `;const i=document.getElementById("logoutButton");i&&i.addEventListener("click",o=>{o.preventDefault(),localStorage.removeItem("token"),localStorage.removeItem("userId"),localStorage.removeItem("name"),window.location.hash="#/masuk",this.updateAuthNavItem()})}else e.innerHTML=`
          <a href="#/masuk">
            <i class="fas fa-sign-in-alt" aria-hidden="true"></i> Masuk
          </a>
        `}updateActiveLink(){const e=window.location.hash||"#/";document.querySelectorAll(".nav-menu a").forEach(i=>{i.getAttribute("href")===e?(i.classList.add("active"),i.setAttribute("aria-current","page")):(i.classList.remove("active"),i.removeAttribute("aria-current"))})}}new I;window.Navbar=I;class E extends HTMLElement{constructor(){super()}set story(e){this._story=e,this.render()}formatDate(e){const t={year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"};return new Date(e).toLocaleDateString("id-ID",t)}render(){const{name:e,photoUrl:t,description:i,createdAt:o,lat:a,lon:r}=this._story;this.innerHTML=`
      <article class="story-card fadeIn">
        <img 
          src="${t}" 
          alt="Cerita dari ${e}" 
          class="story-image"
          loading="lazy"
        >
        <div class="story-content">
          <h3 class="story-title">${e}</h3>
          <p class="story-description">${i}</p>
          <div class="story-info">
            <div class="story-date">
              <i class="fas fa-calendar-alt" aria-hidden="true"></i>
              <time datetime="${new Date(o).toISOString()}">${this.formatDate(o)}</time>
            </div>
            ${a&&r?`
              <div class="story-location" data-lat="${a}" data-lon="${r}">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                <span>Lihat di peta</span>
              </div>
            `:""}
          </div>
        </div>
      </article>
    `;const s=this.querySelector(".story-location");s&&s.addEventListener("click",l=>{l.preventDefault();const g=parseFloat(s.dataset.lat),d=parseFloat(s.dataset.lon),m=new CustomEvent("story-location-click",{detail:{lat:g,lon:d,name:e,description:i},bubbles:!0});this.dispatchEvent(m)})}}customElements.define("story-card",E);window.StoryCard=E;class R{constructor(){this._container=document.querySelector("#mainContent"),this._map=null,this._marker=null,this._position={lat:null,lon:null},this._cameraActive=!1,this._canvas=document.createElement("canvas"),this._presenter=null,this._setupNavigationListener()}setPresenter(e){this._presenter=e}_setupNavigationListener(){window.addEventListener("hashchange",()=>{this._cameraActive&&(console.log("Navigation detected, stopping camera"),this._stopCameraAndCleanup())}),window.addEventListener("beforeunload",()=>{this._cameraActive&&(console.log("Page unload detected, stopping camera"),this._stopCameraAndCleanup())})}_stopCameraAndCleanup(){console.log("Stopping camera and cleaning up resources"),cameraHelper.stopCamera(),this._cameraActive=!1;const e=document.getElementById("cameraFeed");e&&(e.srcObject=null)}render(){console.log("Rendering add story page"),this._container.innerHTML=`
      <div class="container">
        <div class="add-story-container">
          <h2><span class="text-primary">Tambah</span> <span class="text-secondary">Cerita Baru</span></h2>
          <form id="addStoryForm">
            <div id="messageContainer"></div>
            
            <div class="form-group">
              <label for="description">Cerita Anda</label>
              <textarea id="description" name="description" required placeholder="Ceritakan pengalaman atau cerita menarik Anda..."></textarea>
            </div>
            
            <div class="camera-section">
              <h3>Ambil Gambar</h3>
              <div class="camera-preview">
                <video id="cameraFeed" autoplay playsinline></video>
                <img id="capturedImage" alt="Gambar yang diambil">
              </div>
              <div class="camera-controls">
                <button type="button" id="startCameraBtn" class="btn">
                  <i class="fas fa-video" aria-hidden="true"></i> Mulai Kamera
                </button>
                <button type="button" id="captureBtn" class="btn" disabled>
                  <i class="fas fa-camera" aria-hidden="true"></i> Ambil Gambar
                </button>
                <button type="button" id="retakeBtn" class="btn" disabled>
                  <i class="fas fa-redo" aria-hidden="true"></i> Ambil Ulang
                </button>
              </div>
            </div>
            
            <div class="location-section">
              <h3>Pilih Lokasi</h3>
              <div id="pickLocationMap"></div>
              <div class="location-info">
                <p>Latitude: <span id="latValue">Belum dipilih</span></p>
                <p>Longitude: <span id="lonValue">Belum dipilih</span></p>
              </div>
              <p class="hint">Klik pada peta untuk menentukan lokasi cerita Anda.</p>
            </div>
            
            <div class="submit-section">
              <button type="submit" id="submitBtn" class="submit-btn">
                <i class="fas fa-paper-plane" aria-hidden="true"></i> Kirim Cerita
              </button>
            </div>
          </form>
          
          <div class="loading-indicator" id="loadingIndicator">
            <i class="fas fa-spinner" aria-hidden="true"></i>
            <span>Mengirim cerita...</span>
          </div>
        </div>
      </div>
    `,setTimeout(()=>{this._initMap(),this._initCameraButtons(),this._initFormSubmit(),console.log("Add story page components initialized")},100)}_initMap(){if(console.log("Initializing map"),!document.getElementById("pickLocationMap")){console.error("Map container not found");return}try{this._map=L.map("pickLocationMap").setView([-2.5489,118.0149],5),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this._map),this._map.on("click",t=>{this._updateMarker(t.latlng.lat,t.latlng.lng)}),console.log("Map initialized successfully")}catch(t){console.error("Error initializing map:",t)}}_updateMarker(e,t){console.log("Updating marker position:",e,t),this._position.lat=e,this._position.lon=t,document.getElementById("latValue").textContent=e.toFixed(6),document.getElementById("lonValue").textContent=t.toFixed(6),this._marker&&this._map.removeLayer(this._marker),this._marker=L.marker([e,t]).addTo(this._map),this._marker.bindPopup("Lokasi cerita Anda").openPopup()}_initCameraButtons(){console.log("Initializing camera buttons");const e=document.getElementById("startCameraBtn"),t=document.getElementById("captureBtn"),i=document.getElementById("retakeBtn"),o=document.getElementById("cameraFeed"),a=document.getElementById("capturedImage");if(!e||!t||!i||!o||!a){console.error("Camera elements not found");return}o.style.display="none",a.style.display="none",e.addEventListener("click",async()=>{console.log("Start camera button clicked"),this._cameraActive||(e.disabled=!0,o.style.display="block",a.style.display="none",await cameraHelper.startCamera(o)?(console.log("Camera started successfully"),this._cameraActive=!0,t.disabled=!1,i.disabled=!0):(console.error("Failed to start camera"),e.disabled=!1,o.style.display="none",this.showMessage("Gagal memulai kamera. Pastikan kamera diizinkan.","error")))}),t.addEventListener("click",()=>{if(console.log("Capture button clicked"),this._cameraActive){const r=cameraHelper.captureImage(o,this._canvas);r?(console.log("Image captured successfully"),a.src=r,o.style.display="none",a.style.display="block",t.disabled=!0,i.disabled=!1,this._cameraActive=!1):(console.error("Failed to capture image"),this.showMessage("Gagal mengambil gambar. Coba lagi.","error"))}}),i.addEventListener("click",async()=>{console.log("Retake button clicked"),a.style.display="none",o.style.display="block",i.disabled=!0,await cameraHelper.startCamera(o)?(console.log("Camera restarted successfully"),this._cameraActive=!0,t.disabled=!1):(console.error("Failed to restart camera"),e.disabled=!1,o.style.display="none",this.showMessage("Gagal memulai kamera. Pastikan kamera diizinkan.","error"))})}_initFormSubmit(){console.log("Initializing form submission");const e=document.getElementById("addStoryForm");if(!e){console.error("AddStoryForm not found!");return}e.addEventListener("submit",async t=>{t.preventDefault(),console.log("Form submitted");const i=document.getElementById("description").value.trim(),o=document.getElementById("capturedImage"),a={description:i,hasImage:o.src&&o.src!=="about:blank"&&o.style.display!=="none",position:{...this._position}};this._presenter?this._presenter.submitStory(a):(console.error("Presenter not set"),this.showMessage("Terjadi kesalahan: presenter belum terdaftar","error"))})}validateForm(){const e=document.getElementById("description").value.trim(),t=document.getElementById("capturedImage"),{lat:i,lon:o}=this._position;let a=!1,r="";return e?!t.src||t.src==="about:blank"||t.style.display==="none"?(r="Gambar Anda belum diambil!",a=!0):(i===null||o===null)&&(r="Pilih lokasi pada peta!",a=!0):(r="Cerita tidak boleh kosong.",a=!0),a?(this.showMessage(r,"error"),!1):!0}async getStoryData(){const e=document.getElementById("description").value.trim(),t=await cameraHelper.getCapturedImageBlob(),{lat:i,lon:o}=this._position;return{description:e,photoBlob:t,lat:i,lon:o}}showMessage(e,t="success"){console.log(`Showing ${t} message:`,e);const i=document.getElementById("messageContainer");i&&(i.innerHTML=`<div class="message ${t}"><p>${e}</p></div>`,setTimeout(()=>{i.innerHTML=""},3e3))}showLoading(){const e=document.getElementById("loadingIndicator");e&&(e.style.display="flex")}hideLoading(){const e=document.getElementById("loadingIndicator");e&&(e.style.display="none")}showSuccess(e){this.showMessage(e,"success"),this.resetForm()}resetForm(){const e=document.getElementById("description"),t=document.getElementById("capturedImage");e&&(e.value=""),t&&(t.style.display="none",t.src=""),this._marker&&(this._map.removeLayer(this._marker),this._marker=null),this._position={lat:null,lon:null};const i=document.getElementById("latValue"),o=document.getElementById("lonValue");i&&o&&(i.textContent="Belum dipilih",o.textContent="Belum dipilih"),this._cameraActive&&this._stopCameraAndCleanup()}showError(e){this.showMessage(e,"error")}destroy(){console.log("Destroying add story view"),this._cameraActive&&this._stopCameraAndCleanup(),this._map&&(this._map.remove(),this._map=null)}scheduleNavigation(e,t=1e3){setTimeout(e,t)}navigateToRoute(e){window.router&&window.router.navigateTo(e)}}window.AddStoryView=R;console.log("AddStoryView exported to window");class V{constructor(){this.container=document.querySelector("#mainContent"),this.presenter=null,this.map=null,this.markers=[],this.storiesContainer=null,this.loadingIndicator=null}setPresenter(e){this.presenter=e,console.log("HomeView: Presenter set successfully")}render(){console.log("HomeView render called"),document.title="PetaBicara - Cerita Bermakna",this.container.innerHTML="",this.container.innerHTML=`
      <section class="hero-section">
        <div class="container">
          <h2 class="main-title">Peta Bicara, Cerita Bermakna</h2>
          <p class="main-description">
            Dengarkan kisah-kisah yang lahir dari berbagai penjuru Indonesia dan negara lainnya. 
            Setiap titik di peta menyimpan sepotong harapan, kenangan, dan suara hati yang tak ingin dilupakan. 
            "Karena setiap tempat punya cerita dan setiap cerita layak untuk didengar."
          </p>
        </div>
      </section>

      <section class="stories-section">
        <div class="container">
          <h2 class="section-title">Cerita Terbaru</h2>
          <div class="stories-grid" id="storiesContainer">
            <div class="loading-indicator" id="loadingIndicator">
              <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
              <span>Memuat cerita...</span>
            </div>
          </div>
        </div>
      </section>

      <section class="how-it-works">
        <div class="container">
          <h2 class="section-title">Cara Kerjanya</h2>
          <div class="steps-container">
            <div class="step-card">
              <div class="step-icon">
                <i class="fas fa-user-plus"></i>
              </div>
              <h3>1. Daftar Akun</h3>
              <p>Buat akun gratis untuk mulai berbagi cerita Anda</p>
            </div>
            <div class="step-card">
              <div class="step-icon">
                <i class="fas fa-map-pin"></i>
              </div>
              <h3>2. Pilih Lokasi</h3>
              <p>Tandai lokasi cerita Anda di peta interaktif</p>
            </div>
            <div class="step-card">
              <div class="step-icon">
                <i class="fas fa-book-open"></i>
              </div>
              <h3>3. Bagikan Cerita</h3>
              <p>Tulis dan unggah cerita Anda dengan foto</p>
            </div>
          </div>
        </div>
      </section>

      <section class="testimonials">
        <div class="container">
          <h2 class="section-title">Kata Pengguna</h2>
          <div class="testimonial-carousel">
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>"PetaBicara membantu saya menemukan tempat-tempat tersembunyi yang tidak pernah saya ketahui sebelumnya!"</p>
              </div>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <i class="fas fa-user-circle"></i>
                </div>
                <div class="author-info">
                  <h4>Muhammad Taufan Akbar</h4>
                  <p>Petualang</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,this._addStyles(),this.storiesContainer=document.getElementById("storiesContainer"),this.loadingIndicator=document.getElementById("loadingIndicator"),this.storiesContainer||console.error("storiesContainer element not found"),this.loadingIndicator||console.error("loadingIndicator element not found"),this.showLoading(),setTimeout(()=>{this.presenter?(console.log("HomeView: Requesting stories from presenter"),this.presenter.loadStories()):(console.error("Presenter not set in HomeView"),this.renderError("Error: Unable to load stories. Presenter not initialized."))},100)}renderStories(e){if(console.log("HomeView.renderStories called with",e?e.length:0,"stories"),this.hideLoading(),!e||e.length===0){this.renderEmptyState();return}this.storiesContainer?(this.storiesContainer.innerHTML="",e.forEach(t=>{const i=document.createElement("div");i.className="story-card",i.innerHTML=`
          <div class="story-image">
            <img src="${t.photoUrl}" alt="Cerita dari ${t.name}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
          </div>
          <div class="story-content">
            <h3>${t.name}</h3>
            <p>${t.description?t.description.substring(0,80)+(t.description.length>80?"...":""):"Tidak ada deskripsi"}</p>
            <div class="story-meta">
              <div class="author">
                <i class="fas fa-user"></i> ${t.name}
              </div>
              <div class="date">
                <i class="fas fa-calendar"></i> ${this._formatDate(t.createdAt)}
              </div>
            </div>
          </div>
        `,this.storiesContainer.appendChild(i)})):console.error("storiesContainer is not defined")}renderEmptyState(){console.log("HomeView.renderEmptyState called"),this.storiesContainer&&(this.storiesContainer.innerHTML=`
        <div class="empty-state">
          <i class="fas fa-book-open fa-3x" aria-hidden="true"></i>
          <h3>Belum ada cerita</h3>
          <p>Jadilah yang pertama berbagi cerita menarik!</p>
          <a href="#/tambah" class="btn btn-primary">
            <i class="fas fa-plus" aria-hidden="true"></i> Tambah Cerita
          </a>
        </div>
      `)}renderError(e){if(console.log("HomeView.renderError called with message:",e),this.hideLoading(),this.storiesContainer){this.storiesContainer.innerHTML=`
        <div class="error-message">
          <p>Error: ${e||"Unable to load stories"}</p>
          <button id="retryButton" class="btn btn-primary">Coba Lagi</button>
        </div>
      `;const t=document.getElementById("retryButton");t&&t.addEventListener("click",()=>{console.log("Retry button clicked"),this.showLoading(),this.presenter&&this.presenter.loadStories()})}}_formatDate(e){if(!e)return"Tanggal tidak tersedia";try{const t={day:"numeric",month:"long",year:"numeric"};return new Date(e).toLocaleDateString("id-ID",t)}catch(t){return console.error("Error formatting date:",t),e}}showLoading(){if(console.log("HomeView.showLoading called"),this.loadingIndicator&&(this.loadingIndicator.style.display="flex"),this.storiesContainer){const e=this.storiesContainer.querySelector(".error-message");e&&e.remove()}}hideLoading(){console.log("HomeView.hideLoading called"),this.loadingIndicator&&(this.loadingIndicator.style.display="none")}_addStyles(){if(!document.getElementById("homeViewStyles")){const e=document.createElement("style");e.id="homeViewStyles",e.textContent=`
        /* Hero Section */
        .hero-section {
          padding: 3rem 0;
          text-align: center;
          background-color: #f8f9fa;
          border-radius: 10px;
          margin-bottom: 2rem;
        }
        
        .main-title {
          font-size: 2rem;
          color: var(--color-primary, #4299e1);
          margin-bottom: 1rem;
        }
        
        .main-description {
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
          color: #4a5568;
        }
        
        /* Stories Grid */
        .stories-section {
          margin-bottom: 3rem;
        }
        
        .stories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .story-card {
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        
        .story-card:hover {
          transform: translateY(-5px);
        }
        
        .story-image {
          height: 200px;
          overflow: hidden;
        }
        
        .story-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .story-content {
          padding: 1.5rem;
        }
        
        .story-content h3 {
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
        }
        
        .story-content p {
          color: #4a5568;
          margin-bottom: 1rem;
        }
        
        .story-meta {
          display: flex;
          justify-content: space-between;
          color: #718096;
          font-size: 0.875rem;
        }
        
        /* How It Works */
        .how-it-works {
          padding: 3rem 0;
          background-color: #f8f9fa;
          margin-bottom: 3rem;
        }
        
        .section-title {
          text-align: center;
          margin-bottom: 2rem;
          color: var(--color-primary, #4299e1);
          position: relative;
          font-size: 1.75rem;
        }
        
        .section-title::after {
          content: '';
          display: block;
          width: 50px;
          height: 3px;
          background: var(--color-accent, #f56565);
          margin: 0.5rem auto 0;
        }
        
        .steps-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .step-card {
          text-align: center;
          padding: 2rem;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        
        .step-card:hover {
          transform: translateY(-5px);
        }
        
        .step-icon {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(66, 153, 225, 0.1);
          color: var(--color-primary, #4299e1);
          border-radius: 50%;
          font-size: 1.5rem;
          margin: 0 auto 1rem;
        }
        
        /* Map Section */
        .map-section {
          margin-bottom: 3rem;
        }
        
        .story-map {
          height: 500px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        /* Testimonials */
        .testimonials {
          padding: 3rem 0;
          background-color: #f8f9fa;
          margin-bottom: 3rem;
        }
        
        .testimonial-carousel {
          max-width: 700px;
          margin: 0 auto;
        }
        
        .testimonial-card {
          background-color: white;
          border-radius: 10px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .testimonial-content {
          font-style: italic;
          margin-bottom: 1.5rem;
          color: #4a5568;
        }
        
        .testimonial-author {
          display: flex;
          align-items: center;
        }
        
        .author-avatar {
          font-size: 2.5rem;
          color: #a0aec0;
          margin-right: 1rem;
        }
        
        .author-info h4 {
          margin: 0;
          color: #2d3748;
        }
        
        .author-info p {
          margin: 0;
          color: #718096;
          font-size: 0.875rem;
        }
        
        /* Loading Indicator */
        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          grid-column: 1 / -1;
        }
        
        .loading-indicator i {
          font-size: 2rem;
          color: var(--color-primary, #4299e1);
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 3rem;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          grid-column: 1 / -1;
        }
        
        /* Error Message */
        .error-message {
          text-align: center;
          padding: 2rem;
          background-color: #fff3f3;
          border-radius: 10px;
          border: 1px solid #ffcccc;
          margin: 1rem 0;
          grid-column: 1 / -1;
        }
        
        .error-message p {
          color: #e53e3e;
          margin-bottom: 1rem;
        }
        
        /* Map Popup */
        .map-popup {
          max-width: 250px;
        }
        
        .map-popup h3 {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .map-popup img {
          border-radius: 5px;
          margin-top: 0.5rem;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .main-title {
            font-size: 1.5rem;
          }
          
          .stories-grid {
            grid-template-columns: 1fr;
          }
          
          .story-map {
            height: 300px;
          }
          
          .step-icon {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }
        }
      `,document.head.appendChild(e)}}}window.HomeView=V;console.log("HomeView exported to window");class ${constructor(){this.container=document.querySelector("#mainContent"),this.presenter=null}setPresenter(e){this.presenter=e}render(){this.container.innerHTML=`
          <section class="auth-section">
            <div class="container">
              <div class="auth-card improved">
                <div class="auth-header">
                  <h2 class="auth-title">Masuk ke Akun Anda</h2>
                  <p class="auth-subtitle">Bagikan cerita dan jelajahi peta interaktif</p>
                </div>
                
                <form id="loginForm">
                  <div class="form-group">
                    <label for="email">Email</label>
                    <div class="input-icon-wrapper">
                      <i class="fas fa-envelope input-icon"></i>
                      <input type="email" id="email" name="email" required placeholder="Masukkan email Anda">
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-icon-wrapper">
                      <i class="fas fa-lock input-icon"></i>
                      <input type="password" id="password" name="password" required placeholder="Masukkan password Anda">
                    </div>
                  </div>
                  
                  <div class="form-actions">
                    <button type="submit" id="loginButton" class="btn btn-primary btn-block">
                      <span class="button-text">Masuk</span>
                      <div class="loader-container">
                        <div class="loader"></div>
                      </div>
                    </button>
                  </div>
                </form>
                
                <div class="auth-footer">
                  <p>Belum punya akun? <a href="#/daftar" class="auth-link">Daftar Sekarang</a></p>
                </div>
              </div>
            </div>
          </section>
          <div id="alertContainer"></div>
        `,document.getElementById("improvedAuthStyles")||this._addAuthStyles(),this._initListeners()}_addAuthStyles(){const e=document.createElement("style");e.id="improvedAuthStyles",e.textContent=`
            .auth-section {
              padding: 3rem 1rem;
            }
            
            .auth-card.improved {
              max-width: 450px;
              margin: 0 auto;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
              padding: 2rem;
            }
            
            .auth-header {
              text-align: center;
              margin-bottom: 2rem;
            }
            
            .auth-title {
              font-size: 1.75rem;
              color: var(--color-primary);
              margin-bottom: 0.5rem;
            }
            
            .auth-subtitle {
              color: #6c757d;
            }
            
            .input-icon-wrapper {
              position: relative;
            }
            
            .input-icon {
              position: absolute;
              left: 1rem;
              top: 50%;
              transform: translateY(-50%);
              color: #adb5bd;
            }
            
            .input-icon-wrapper input {
              padding-left: 2.5rem;
            }
            
            .btn-block {
              display: block;
              width: 100%;
              padding: 0.75rem;
              font-size: 1rem;
              font-weight: 500;
            }
            
            .auth-link {
              color: var(--color-primary);
              font-weight: 500;
              text-decoration: none;
            }
            
            .auth-link:hover {
              text-decoration: underline;
            }
            
            .alert {
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              z-index: 1000;
              border-radius: 4px;
              padding: 0.75rem 1.25rem;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              animation: slideIn 0.3s ease-out;
            }
            
            .alert-success {
              background-color: #28a745;
              color: white;
            }
            
            .alert-danger {
              background-color: #dc3545;
              color: white;
            }
            
            @keyframes slideIn {
              0% { transform: translate(-50%, -20px); opacity: 0; }
              100% { transform: translate(-50%, 0); opacity: 1; }
            }
            
            .loader-container {
                display: none;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            .loader {
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid #ffffff;
                border-radius: 50%;
                width: 16px;
                height: 16px;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .btn-loading .button-text {
                visibility: hidden;
            }
            
            .btn-loading .loader-container {
                display: block;
            }
            
            .btn-loading {
                position: relative;
                pointer-events: none;
                opacity: 0.8;
            }
        `,document.head.appendChild(e)}_initListeners(){const e=document.querySelector("#loginForm");if(e){console.log("Found login form, attaching event listener");const t=e.cloneNode(!0);e.parentNode.replaceChild(t,e),t.addEventListener("submit",async i=>{if(i.preventDefault(),console.log("Login form submitted"),this.presenter){const o=document.querySelector("#email").value,a=document.querySelector("#password").value;this.presenter.onLoginSubmit(o,a)}else console.error("Login presenter not set"),this.showAlert("Terjadi kesalahan sistem")})}else console.error("Login form tidak ditemukan");setTimeout(()=>{const t=document.querySelector('a[href="#/daftar"]');t&&t.addEventListener("click",i=>{i.preventDefault(),this.presenter&&this.presenter.navigateToRegister()})},100)}validateForm(e,t){return!e||!t?(this.showAlert("Email dan password wajib diisi!"),!1):!0}showLoading(e){const t=document.getElementById("loginButton");e?(t.classList.add("btn-loading"),t.disabled=!0):(t.classList.remove("btn-loading"),t.disabled=!1)}showAlert(e){const t=document.getElementById("alertContainer");if(!t)return;const i=document.querySelector(".alert");i&&i.remove();const o=document.createElement("div");o.className="alert alert-danger",o.style.cssText="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background-color: #f44336; color: white; padding: 12px 24px; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 1050; max-width: 90%;",o.innerHTML=`<i class="fas fa-exclamation-circle"></i> ${e}`,t.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transition="opacity 0.5s ease",setTimeout(()=>o.remove(),500)},3e3)}showSuccess(e){this.showLoading(!1);const t=document.getElementById("alertContainer");if(!t)return;const i=document.querySelector(".alert");i&&i.remove();const o=document.createElement("div");o.className="alert alert-success",o.style.cssText="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background-color: #4CAF50; color: white; padding: 12px 24px; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 1050; max-width: 90%;",o.innerHTML=`<i class="fas fa-check-circle"></i> ${e}`,t.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transition="opacity 0.5s ease",setTimeout(()=>o.remove(),500)},2e3)}scheduleNavigation(e,t=1e3){setTimeout(e,t)}dispatchAuthChange(){window.dispatchEvent(new Event("authChanged"))}}window.LoginView=$;console.log("LoginView exported to window");class U{constructor(){this.container=document.querySelector("#mainContent"),this.presenter=null}setPresenter(e){this.presenter=e}render(){this.container.innerHTML=`
            <section class="auth-section">
                <div class="container">
                <div class="auth-card improved">
            <div class="auth-header">
                    <h2 class="auth-title">Daftar Akun Baru</h2>
                    <p class="auth-subtitle">Bagikan cerita dan jelajahi peta interaktif</p>
                    </div>

                        <form id="registerForm">
                            <div class="form-group">
                                <label for="name">Nama</label>
                                <div class="input-icon-wrapper">
                                <i class="fas fa-user input-icon"></i>
                                <input type="text" id="name" name="name" required placeholder="Masukkan nama Anda">
                            </div>
                            </div>

                            <div class="form-group">
                                <label for="email">Email</label>
                                <div class="input-icon-wrapper">
                  <i class="fas fa-envelope input-icon"></i>
                                <input type="email" id="email" name="email" required placeholder="Masukkan email Anda">
                            </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="password">Password</label>
                                <div class="input-icon-wrapper">
                  <i class="fas fa-lock input-icon"></i>
                                <input type="password" id="password" name="password" required minlength="6" placeholder="Minimal 8 karakter">
                            </div>
                            </div>
                            <div class="form-actions">
                                <button type="submit" id="registerButton" class="btn btn-primary">
                                    <span class="button-text">Daftar</span>
                                    <div class="loader-container">
                                        <div class="loader"></div>
                                    </div>
                                </button>
                            </div>
                        </form>
                        <div class="auth-footer">
                            <p>Sudah punya akun? <a href="#/masuk" data-link>Masuk di Sini</a></p>
                        </div>
                    </div>
                </div>
            </section>
            <div id="alertContainer"></div>
        `,document.getElementById("loaderStyles")||this._addLoaderStyles(),this._initListeners()}_addLoaderStyles(){const e=document.createElement("style");e.id="loaderStyles",e.textContent=`
            .loader-container {
                display: none;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            .loader {
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid #ffffff;
                border-radius: 50%;
                width: 16px;
                height: 16px;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .btn-loading .button-text {
                visibility: hidden;
            }
            
            .btn-loading .loader-container {
                display: block;
            }
            
            .btn-loading {
                position: relative;
                pointer-events: none;
                opacity: 0.8;
            }
        `,document.head.appendChild(e)}_initListeners(){const e=document.querySelector("#registerForm");if(e){console.log("Found register form, attaching event listener");const t=e.cloneNode(!0);e.parentNode.replaceChild(t,e),t.addEventListener("submit",async i=>{if(i.preventDefault(),console.log("Register form submitted"),this.presenter){const o=document.querySelector("#name").value,a=document.querySelector("#email").value,r=document.querySelector("#password").value;this.presenter.onRegisterSubmit(o,a,r)}else console.error("Register presenter not set"),this.showAlert("Terjadi kesalahan sistem")})}else console.error("Register form tidak ditemukan");setTimeout(()=>{const t=document.querySelector('a[href="#/masuk"]');t&&t.addEventListener("click",i=>{i.preventDefault(),this.presenter&&this.presenter.navigateToLogin()})},100)}validateForm(e,t,i){return!e||!t||!i?(this.showAlert("Semua field wajib diisi!"),!1):i.length<6?(this.showAlert("Password minimal 6 karakter!"),!1):!0}showLoading(e){const t=document.getElementById("registerButton");e?(t.classList.add("btn-loading"),t.disabled=!0):(t.classList.remove("btn-loading"),t.disabled=!1)}showAlert(e){const t=document.getElementById("alertContainer");if(!t)return;const i=document.querySelector(".alert");i&&i.remove();const o=document.createElement("div");o.className="alert alert-danger",o.style.cssText="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background-color: #f44336; color: white; padding: 12px 24px; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 1050; max-width: 90%;",o.innerHTML=`<i class="fas fa-exclamation-circle"></i> ${e}`,t.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transition="opacity 0.5s ease",setTimeout(()=>o.remove(),500)},3e3)}showSuccess(e){this.showLoading(!1);const t=document.getElementById("alertContainer");if(!t)return;const i=document.querySelector(".alert");i&&i.remove();const o=document.createElement("div");o.className="alert alert-success",o.style.cssText="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background-color: #4CAF50; color: white; padding: 12px 24px; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 1050; max-width: 90%;",o.innerHTML=`<i class="fas fa-check-circle"></i> ${e}`,t.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transition="opacity 0.5s ease",setTimeout(()=>o.remove(),500)},2e3)}scheduleNavigation(e,t=1e3){setTimeout(e,t)}}window.RegisterView=U;console.log("RegisterView exported to window");class q{constructor(){this._container=document.querySelector("#mainContent"),this._map=null,this._markers=[],this._presenter=null}setPresenter(e){this._presenter=e}render(){console.log("Rendering map page"),this._container.innerHTML="",this._container.innerHTML=`
      <section class="map-section view-transition" style="margin-top: 100px;">
        <div class="container">
          <h2 class="section-title">Peta Cerita</h2>
          <div id="storyMap" style="height: 500px;"></div>
        </div>
      </section>
    `,setTimeout(()=>{this._initMap()},100)}_initMap(){console.log("Initializing map");try{this._map=L.map("storyMap").setView([-2.5489,118.0149],5),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this._map),this._presenter?this._presenter.loadStoriesForMap():console.error("MapView: Presenter not set")}catch(e){console.error("Error initializing map:",e)}}displayStories(e){if(console.log("MapView: Displaying stories on map"),!this._map){console.error("Map not initialized");return}this._clearMarkers(),e.filter(t=>t.lat&&t.lon).forEach(t=>{const i=L.marker([t.lat,t.lon]).addTo(this._map).bindPopup(`
          <h3>${t.name}</h3>
          <p>${t.description}</p>
          <img src="${t.photoUrl}" alt="${t.name}" style="width:100%;max-width:200px;">
        `);this._markers.push(i)})}_clearMarkers(){this._markers.forEach(e=>{this._map&&this._map.removeLayer(e)}),this._markers=[]}showError(e){console.error("Map error:",e);const t=document.getElementById("storyMap");if(t){t.innerHTML=`
        <div class="error-container">
          <p>Error: ${e}</p>
          <button id="retryMapBtn" class="btn btn-primary">Coba Lagi</button>
        </div>
      `;const i=document.getElementById("retryMapBtn");i&&this._presenter&&i.addEventListener("click",()=>{this.render()})}}destroy(){this._map&&(this._map.remove(),this._map=null)}}window.MapView=q;console.log("MapView exported to window");class O{constructor(){this.container=document.querySelector("#mainContent"),this.presenter=null}setPresenter(e){this.presenter=e}render(){console.log("FavoritesView render called"),this.container.innerHTML=`
      <section class="favorites-page">
        <div class="container">
          <header class="page-header">
            <h1><i class="fas fa-heart"></i> Cerita Favorit Saya</h1>
            <p>Koleksi cerita-cerita yang telah Anda simpan</p>
          </header>

          <div class="favorites-stats" id="favoritesStats">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-heart"></i>
              </div>
              <div class="stat-info">
                <span class="stat-number" id="favoritesCount">0</span>
                <span class="stat-label">Cerita Tersimpan</span>
              </div>
            </div>
          </div>

          <div class="favorites-actions">
            <button class="btn btn-secondary" id="exportBtn">
              <i class="fas fa-download"></i>
              Export Data
            </button>
            <button class="btn btn-danger" id="clearAllBtn">
              <i class="fas fa-trash"></i>
              Hapus Semua
            </button>
          </div>

          <div class="favorites-content">
            <div id="favoritesContainer" class="favorites-grid">
              <div class="loading-container" id="loadingIndicator">
                <div class="loading-spinner"></div>
                <p>Memuat favorit...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,this._addFavoritesStyles(),this._setupEventListeners(),this.showLoading()}_addFavoritesStyles(){if(document.getElementById("favoritesPageStyles"))return;const e=document.createElement("style");e.id="favoritesPageStyles",e.textContent=`
      .favorites-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem 0;
      }

      .page-header {
        text-align: center;
        color: white;
        margin-bottom: 2rem;
      }

      .page-header h1 {
        font-size: 2.5rem;
        margin: 0 0 0.5rem 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
      }

      .page-header i {
        color: #ff6b6b;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }

      .page-header p {
        font-size: 1.1rem;
        opacity: 0.9;
        margin: 0;
      }

      .favorites-stats {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 1.5rem 2rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        min-width: 200px;
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .stat-number {
        font-size: 2rem;
        font-weight: 700;
        color: #333;
        line-height: 1;
      }

      .stat-label {
        color: #666;
        font-size: 0.9rem;
        margin-top: 0.25rem;
      }

      .favorites-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .favorites-actions .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .btn-secondary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }

      .btn-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      .btn-danger {
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
      }

      .btn-danger:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
      }

      .favorites-content {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        min-height: 400px;
      }

      .favorites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .favorite-story-card {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        position: relative;
      }

      .favorite-story-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      }

      .story-image-container {
        position: relative;
        height: 200px;
        overflow: hidden;
      }

      .story-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .favorite-story-card:hover .story-image {
        transform: scale(1.05);
      }

      .favorite-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        z-index: 2;
        box-shadow: 0 2px 10px rgba(255, 107, 107, 0.3);
      }

      .story-content {
        padding: 1.5rem;
      }

      .story-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #333;
        margin: 0 0 0.5rem 0;
        line-height: 1.3;
      }

      .story-description {
        color: #666;
        line-height: 1.5;
        margin: 0 0 1rem 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .story-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        color: #999;
        margin-bottom: 1rem;
      }

      .story-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: space-between;
      }

      .story-actions .btn {
        flex: 1;
        padding: 0.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
      }

      .btn-view-map {
        background: #28a745;
        color: white;
      }

      .btn-view-map:hover {
        background: #218838;
      }

      .btn-remove {
        background: #dc3545;
        color: white;
      }

      .btn-remove:hover {
        background: #c82333;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #666;
        grid-column: 1 / -1;
      }

      .empty-state i {
        font-size: 4rem;
        color: #ddd;
        margin-bottom: 1rem;
        display: block;
      }

      .empty-state h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.5rem;
      }

      .empty-state p {
        margin-bottom: 2rem;
        font-size: 1.1rem;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
        line-height: 1.6;
      }

      .empty-state .btn {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 25px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .empty-state .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        grid-column: 1 / -1;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .favorites-page {
          padding: 1rem 0;
        }

        .page-header h1 {
          font-size: 2rem;
          flex-direction: column;
          gap: 0.5rem;
        }

        .favorites-actions {
          flex-direction: column;
          align-items: center;
        }

        .favorites-actions .btn {
          width: 100%;
          max-width: 200px;
        }

        .favorites-content {
          padding: 1rem;
        }

        .favorites-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .story-actions {
          flex-direction: column;
        }
      }
    `,document.head.appendChild(e)}_setupEventListeners(){const e=document.getElementById("exportBtn"),t=document.getElementById("clearAllBtn");e&&e.addEventListener("click",()=>{this.presenter&&this.presenter.exportFavorites()}),t&&t.addEventListener("click",()=>{this.presenter&&this.presenter.clearAllFavorites()})}renderFavorites(e){console.log("FavoritesView: Rendering favorites",e.length),this.hideLoading(),this.updateFavoritesCount(e.length);const t=document.getElementById("favoritesContainer");if(e.length===0){t.innerHTML=`
        <div class="empty-state">
          <i class="fas fa-heart-broken"></i>
          <h3>Belum Ada Favorit</h3>
          <p>Mulai menambahkan cerita ke favorit dengan menekan tombol hati pada cerita yang Anda sukai.</p>
          <a href="#/" class="btn">
            <i class="fas fa-home"></i>
            Jelajahi Cerita
          </a>
        </div>
      `;return}t.innerHTML=e.map(i=>this._createFavoriteCard(i)).join(""),this._setupCardEventListeners()}_createFavoriteCard(e){const t=this._formatDate(e.createdAt),i=this._formatDate(e.addedToFavoritesAt);return`
      <article class="favorite-story-card" data-story-id="${e.id}">
        <div class="story-image-container">
          <img class="story-image" src="${e.photoUrl}" alt="${e.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
          <div class="favorite-badge">
            <i class="fas fa-heart"></i>
          </div>
        </div>
        <div class="story-content">
          <h3 class="story-title">${e.name}</h3>
          <div class="story-description">${e.description}</div>
          <div class="story-meta">
            <span><i class="fas fa-calendar"></i> ${t}</span>
            <span><i class="fas fa-heart"></i> ${i}</span>
          </div>
          <div class="story-actions">
            ${e.lat&&e.lon?`
              <button class="btn btn-view-map" data-lat="${e.lat}" data-lon="${e.lon}">
                <i class="fas fa-map-pin"></i>
                Lihat di Peta
              </button>
            `:""}
            <button class="btn btn-remove" data-story-id="${e.id}">
              <i class="fas fa-trash"></i>
              Hapus
            </button>
          </div>
        </div>
      </article>
    `}_setupCardEventListeners(){document.querySelectorAll(".btn-remove").forEach(e=>{e.addEventListener("click",t=>{const i=t.target.closest(".btn-remove").getAttribute("data-story-id");this.presenter&&confirm("Apakah Anda yakin ingin menghapus cerita ini dari favorit?")&&this.presenter.removeFavorite(i)})}),document.querySelectorAll(".btn-view-map").forEach(e=>{e.addEventListener("click",t=>{const i=t.target.closest(".btn-view-map").getAttribute("data-lat"),o=t.target.closest(".btn-view-map").getAttribute("data-lon");window.router&&i&&o&&window.router.navigateTo(`/peta?lat=${i}&lon=${o}`)})})}updateFavoritesCount(e){const t=document.getElementById("favoritesCount");t&&(t.textContent=e)}showLoading(){const e=document.getElementById("loadingIndicator");e&&(e.style.display="flex")}hideLoading(){const e=document.getElementById("loadingIndicator");e&&(e.style.display="none")}showError(e){this.hideLoading();const t=document.getElementById("favoritesContainer");t.innerHTML=`
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Terjadi Kesalahan</h3>
        <p>${e}</p>
        <button class="btn" onclick="window.location.reload()">
          <i class="fas fa-redo"></i>
          Coba Lagi
        </button>
      </div>
    `}showSuccess(e){this._showToast(e,"success")}_showToast(e,t="info"){const i=document.querySelector(".favorites-toast");i&&i.remove();const o=document.createElement("div");o.className="favorites-toast",o.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease;
    `;const a={success:"#28a745",error:"#dc3545",info:"#17a2b8"};o.style.background=a[t]||a.info,o.textContent=e,document.body.appendChild(o),setTimeout(()=>{o.parentNode&&(o.style.animation="slideOutRight 0.3s ease",setTimeout(()=>o.remove(),300))},3e3)}_formatDate(e){if(!e)return"Tanggal tidak tersedia";try{return new Date(e).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}catch{return e}}reloadFavorites(){this.showLoading(),this.presenter&&this.presenter.loadFavorites()}}window.FavoritesView=O;console.log("FavoritesView exported to window");class j{constructor(){this.container=document.querySelector("#mainContent"),this.presenter=null}setPresenter(e){this.presenter=e}render(){console.log("SettingsView render called"),this.container.innerHTML=`
      <section class="settings-page">
        <div class="container">
          <header class="page-header">
            <h1><i class="fas fa-cog"></i> Pengaturan</h1>
            <p>Kelola preferensi dan notifikasi aplikasi</p>
          </header>

          <div class="settings-content">
            <!-- Push Notification Section -->
            <div class="settings-section">
              <h2><i class="fas fa-bell"></i> Push Notifikasi</h2>
              <div id="notificationSettings">
                <!-- Will be populated by notification UI helper -->
              </div>
            </div>

            <!-- Data Management Section -->
            <div class="settings-section">
              <h2><i class="fas fa-database"></i> Data Lokal</h2>
              <div class="data-management">
                <div class="data-stats" id="dataStats">
                  <div class="loading-spinner"></div>
                  <span>Memuat data statistik...</span>
                </div>
                
                <div class="data-actions">
                  <button class="btn btn-secondary" id="exportFavoritesBtn">
                    <i class="fas fa-download"></i>
                    Export Favorit
                  </button>
                  <button class="btn btn-danger" id="clearDataBtn">
                    <i class="fas fa-trash"></i>
                    Hapus Semua Data
                  </button>
                </div>
              </div>
            </div>

            <!-- App Info Section -->
            <div class="settings-section">
              <h2><i class="fas fa-info-circle"></i> Informasi Aplikasi</h2>
              <div class="app-info">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Versi:</span>
                    <span class="value">1.2.0</span>
                  </div>
                  <div class="info-item">
                    <span class="label">PWA Status:</span>
                    <span class="value" id="pwaStatus">Checking...</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Service Worker:</span>
                    <span class="value" id="swStatus">Checking...</span>
                  </div>
                  <div class="info-item">
                    <span class="label">IndexedDB:</span>
                    <span class="value" id="dbStatus">Checking...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,this._addSettingsStyles(),this._setupEvents(),this._initializeFeatures()}_addSettingsStyles(){if(document.getElementById("settingsPageStyles"))return;const e=document.createElement("style");e.id="settingsPageStyles",e.textContent=`
      .settings-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 2rem 0;
      }

      .settings-page .page-header {
        text-align: center;
        color: white;
        margin-bottom: 2rem;
      }

      .settings-page .page-header h1 {
        font-size: 2.5rem;
        margin: 0 0 0.5rem 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
      }

      .settings-page .page-header p {
        font-size: 1.1rem;
        opacity: 0.9;
        margin: 0;
      }

      .settings-content {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .settings-section {
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #eee;
      }

      .settings-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .settings-section h2 {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0 0 1.5rem 0;
        color: #333;
        font-size: 1.5rem;
      }

      .settings-section h2 i {
        color: #f5576c;
      }

      .data-management {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .data-stats {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 12px;
        text-align: center;
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 0.5rem;
      }

      .data-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .data-actions .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .btn-secondary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }

      .btn-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      .btn-danger {
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
      }

      .btn-danger:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
      }

      .app-info {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 12px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: white;
        border-radius: 8px;
        border-left: 4px solid #f5576c;
      }

      .info-item .label {
        font-weight: 500;
        color: #333;
      }

      .info-item .value {
        color: #666;
        font-family: monospace;
      }

      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #f5576c;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .settings-page {
          padding: 1rem 0;
        }

        .settings-page .page-header h1 {
          font-size: 2rem;
          flex-direction: column;
          gap: 0.5rem;
        }

        .settings-content {
          padding: 1.5rem;
        }

        .data-actions {
          flex-direction: column;
          align-items: center;
        }

        .data-actions .btn {
          width: 100%;
          max-width: 250px;
          justify-content: center;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }
      }
    `,document.head.appendChild(e)}_setupEvents(){const e=document.getElementById("exportFavoritesBtn"),t=document.getElementById("clearDataBtn");e&&e.addEventListener("click",()=>{this.presenter&&this.presenter.exportFavorites()}),t&&t.addEventListener("click",()=>{this.presenter&&this.presenter.clearAllData()})}_initializeFeatures(){this._initNotificationSettings(),this._loadDataStats(),this._loadAppStatus()}_initNotificationSettings(){const e=document.getElementById("notificationSettings");e&&window.notificationUIHelper?window.notificationUIHelper.createNotificationSettingsUI(e):e.innerHTML=`
        <div class="notification-placeholder">
          <p><i class="fas fa-info-circle"></i> Push notification features sedang dimuat...</p>
        </div>
      `}async _loadDataStats(){var t,i,o;const e=document.getElementById("dataStats");try{if(window.indexedDBHelper){const a=await window.indexedDBHelper.getDatabaseInfo();e.innerHTML=`
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Favorit:</span>
              <span class="stat-value">${((t=a.stores.favorites)==null?void 0:t.count)||0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Offline Stories:</span>
              <span class="stat-value">${((i=a.stores.offlineStories)==null?void 0:i.count)||0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Settings:</span>
              <span class="stat-value">${((o=a.stores.settings)==null?void 0:o.count)||0}</span>
            </div>
          </div>
        `}else throw new Error("IndexedDB helper not available")}catch(a){console.error("Error loading data stats:",a),e.innerHTML=`
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <span>Gagal memuat statistik data</span>
        </div>
      `}}async _loadAppStatus(){const e=document.getElementById("pwaStatus");if(window.swRegister){const o=await window.swRegister.getStatus();e.textContent=o.isInstalled?"Installed":"Not Installed"}else e.textContent="Unknown";const t=document.getElementById("swStatus");if("serviceWorker"in navigator){const o=await navigator.serviceWorker.getRegistration();t.textContent=o?"Active":"Inactive"}else t.textContent="Not Supported";const i=document.getElementById("dbStatus");window.indexedDBHelper?i.textContent="Connected":i.textContent="Not Available"}showSuccess(e){this._showToast(e,"success")}showError(e){this._showToast(e,"error")}_showToast(e,t="info"){const i=document.querySelector(".settings-toast");i&&i.remove();const o=document.createElement("div");o.className="settings-toast",o.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease;
    `;const a={success:"#28a745",error:"#dc3545",info:"#17a2b8"};o.style.background=a[t]||a.info,o.textContent=e,document.body.appendChild(o),setTimeout(()=>{o.parentNode&&(o.style.animation="slideOutRight 0.3s ease",setTimeout(()=>o.remove(),300))},3e3)}}window.SettingsView=j;console.log("SettingsView exported to window");class W{constructor(){this.mainContent=document.getElementById("mainContent"),this.presenter=null}setPresenter(e){this.presenter=e}renderHomePage(){this.clearContent();const e=new window.HomeView;return e.render(),e}renderAddStoryPage(){this.clearContent();const e=new window.AddStoryView;return e.render(),e}renderMapPage(){this.clearContent();const e=new window.MapView;return e.render(),e}renderLoginPage(){this.clearContent();const e=new window.LoginView;return e.render(),e}renderRegisterPage(){this.clearContent();const e=new window.RegisterView;return e.render(),e}renderFavoritesPage(){this.clearContent();const e=new window.FavoritesView;return e.render(),e}renderSettingsPage(){this.clearContent();const e=new window.SettingsView;return e.render(),e}clearContent(){this.mainContent.innerHTML=""}showLoading(){this.mainContent.innerHTML=`
      <div class="loading-container">
        <div class="loading-spinner" aria-label="Memuat konten"></div>
        <p>Memuat...</p>
      </div>
    `}showError(e){this.mainContent.innerHTML=`
      <div class="error-container">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        <h2>Terjadi Kesalahan</h2>
        <p>${e}</p>
        <button class="btn btn-primary" id="retryButton">
          <i class="fas fa-redo" aria-hidden="true"></i>
          Coba Lagi
        </button>
      </div>
    `,document.getElementById("retryButton").addEventListener("click",()=>{this.presenter?this.presenter.reloadPage():window.location.reload()})}setupNavigation(){const e=document.getElementById("navToggle"),t=document.querySelector(".nav-menu");e&&t&&e.addEventListener("click",()=>{const i=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",!i),t.classList.toggle("active")}),document.querySelectorAll(".nav-menu a").forEach(i=>{i.addEventListener("click",()=>{t&&t.classList.contains("active")&&(t.classList.remove("active"),e&&e.setAttribute("aria-expanded","false"))})})}updateAuthNavItem(e){const t=document.getElementById("authNavItem");t&&(e?(t.innerHTML='<a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt" aria-hidden="true"></i> Keluar</a>',document.getElementById("logoutBtn").addEventListener("click",i=>{i.preventDefault(),this.presenter&&this.presenter.logout()})):t.innerHTML='<a href="#/masuk"><i class="fas fa-sign-in-alt" aria-hidden="true"></i> Masuk</a>'),this._updateSettingsNavigation(e)}_updateSettingsNavigation(e){const t=document.querySelector(".nav-menu");if(!t)return;let i=t.querySelector('a[href="#/pengaturan"]');if(e&&!i){const o=document.getElementById("authNavItem");if(o){const a=document.createElement("li");a.className="auth-required-nav",a.innerHTML=`
          <a href="#/pengaturan">
            <i class="fas fa-cog" aria-hidden="true"></i> 
            Pengaturan
          </a>
        `,o.parentNode.insertBefore(a,o)}}else if(!e&&i){const o=i.closest(".auth-required-nav");o&&o.remove()}}setupSkipLink(){const e=document.querySelector("#mainContent"),t=document.querySelector(".skip-link");e&&t&&t.addEventListener("click",function(i){i.preventDefault(),t.blur(),e.focus(),e.scrollIntoView()})}setupAuthChangeListener(e){window.addEventListener("storage",t=>{(t.key==="token"||t.key==="user")&&e()}),window.addEventListener("authChanged",e)}dispatchAuthChange(){window.dispatchEvent(new Event("authChanged"))}reloadPage(){window.location.reload()}applyViewTransition(){const e=document.getElementById("mainContent");e&&(document.startViewTransition?(e.classList.add("view-transition"),document.startViewTransition(()=>{console.log("View transition started")})):(e.classList.add("page-transitioning"),setTimeout(()=>{e.classList.remove("page-transitioning")},300)))}}window.AppView=W;console.log("AppView exported to window");class K{constructor({view:e,model:t}){this.view=e,this.model=t,this.view.setPresenter(this),console.log("HomePresenter initialized with view and model")}init(){console.log("HomePresenter.init called"),this.loadStories()}async loadStories(){console.log("HomePresenter.loadStories called"),this.view.showLoading();try{console.log("HomePresenter: Requesting stories from model");const e=await this.model.getAllStories();console.log("HomePresenter: Stories loaded successfully, count:",e?e.length:0),e&&Array.isArray(e)?this.view.renderStories(e):(console.warn("HomePresenter: No stories returned or invalid format"),this.view.renderStories([]))}catch(e){console.error("HomePresenter: Error loading stories:",e);const t=e.message||"Failed to load stories";this.view.renderError(t),(t.includes("token")||t.includes("authentication"))&&(console.log("HomePresenter: Authentication issue detected, checking token"),this._checkAuth())}}_checkAuth(){this.model.isAuthenticated()||(console.log("HomePresenter: No token found, redirecting to login"),this.view.scheduleNavigation(()=>{this.view.navigateToRoute("/masuk")},1500))}}window.HomePresenter=K;console.log("HomePresenter exported to window");class G{constructor({view:e,model:t}){this.view=e,this.model=t,this.view.setPresenter(this),console.log("AddStoryPresenter created")}init(){console.log("AddStoryPresenter initialized")}async submitStory(e){if(!this.view.validateForm())return!1;this.view.showLoading();try{const{description:t,photoBlob:i,lat:o,lon:a}=await this.view.getStoryData();console.log("AddStoryPresenter.submitStory called with:",{description:t,lat:o,lon:a});const r=await this.model.addNewStory(t,i,o,a);return console.log("Story added successfully:",r),this.view.showSuccess("Cerita berhasil ditambahkan!"),this.view.scheduleNavigation(()=>{this.navigateToHome()},1500),!0}catch(t){return console.error("Add story error:",t),this.view.showError(t.message||"Gagal menambahkan cerita"),this.view.hideLoading(),!1}}navigateToHome(){this.view.navigateToRoute("/")}}window.AddStoryPresenter=G;console.log("AddStoryPresenter exported to window");class X{constructor({view:e,apiService:t,router:i}){console.log("LoginPresenter constructor called"),this.view=e,this.apiService=t,this.router=i,this.view.setPresenter(this)}init(){console.log("LoginPresenter initialized")}async handleLogin(e,t){try{this.view.showLoading();const i=await this.apiService.login(e,t);i&&!i.error&&(console.log("Login successful"),window.appView?window.appView.dispatchAuthChange():window.dispatchEvent(new Event("authChanged")),this.router.navigateTo("/"))}catch(i){console.error("Login error:",i),this.view.showError(i.message)}}async onLoginSubmit(e,t){if(!this.view.validateForm(e,t))return!1;try{this.view.showLoading(!0),console.log("Attempting login with:",e);const i=await this.apiService.login(e,t);return console.log("Login successful:",i),this.view.dispatchAuthChange(),this.view.showSuccess("✅ Berhasil login"),this.view.scheduleNavigation(()=>{this.navigateToHome()},1e3),!0}catch(i){return console.error("Login error:",i),this.view.showAlert(i.message||"Terjadi kesalahan saat login"),this.view.showLoading(!1),!1}}navigateToHome(){this.router.navigateTo("/")}navigateToRegister(){this.router.navigateTo("/daftar")}}window.LoginPresenter=X;console.log("LoginPresenter exported to window");class J{constructor({view:e,apiService:t,router:i}){console.log("RegisterPresenter constructor called"),this.view=e,this.apiService=t,this.router=i,this.view.setPresenter(this)}init(){console.log("RegisterPresenter initialized")}async onRegisterSubmit(e,t,i){if(this.view.validateForm(e,t,i))try{console.log("Register submit handler called"),this.view.showLoading(!0);const o=await this.apiService.register(e,t,i);return console.log("Register success:",o),this.view.showSuccess("✅ Pendaftaran berhasil! Silakan login."),this.view.scheduleNavigation(()=>{this.navigateToLogin()},1e3),!0}catch(o){return console.error("Register error in presenter:",o),this.view.showAlert(o.message||"Terjadi kesalahan saat mendaftar"),this.view.showLoading(!1),!1}}navigateToLogin(){this.router.navigateTo("/masuk")}}window.RegisterPresenter=J;console.log("RegisterPresenter exported to window");class Y{constructor({view:e,model:t}){this.view=e,this.model=t,this.view.setPresenter(this),console.log("MapPresenter created")}init(){console.log("MapPresenter initialized")}async loadStoriesForMap(){console.log("MapPresenter: Loading stories for map");try{const e=await this.model.getAllStories();console.log(`MapPresenter: Successfully retrieved ${e.length} stories`),this.view.displayStories(e)}catch(e){console.error("MapPresenter: Error loading stories:",e),this.view.showError(e.message||"Failed to load stories")}}}window.MapPresenter=Y;console.log("MapPresenter exported to window");class Q{constructor({view:e}){this.view=e,this.favoritesHelper=window.favoritesHelper,this.view.setPresenter(this),console.log("FavoritesPresenter initialized")}async init(){if(console.log("FavoritesPresenter.init called"),!this.favoritesHelper){console.error("FavoritesHelper not found"),this.view.showError("Fitur favorit tidak tersedia");return}await this.loadFavorites()}async loadFavorites(){console.log("FavoritesPresenter: Loading favorites");try{this.view.showLoading();const e=await this.favoritesHelper.getAllFavorites();console.log(`FavoritesPresenter: Loaded ${e.length} favorites`),e.length>0&&e.sort((t,i)=>{const o=new Date(t.addedToFavoritesAt||t.createdAt);return new Date(i.addedToFavoritesAt||i.createdAt)-o}),this.view.renderFavorites(e)}catch(e){console.error("FavoritesPresenter: Error loading favorites:",e),this.view.showError("Gagal memuat daftar favorit: "+e.message)}}async removeFavorite(e){console.log("FavoritesPresenter: Removing favorite",e);try{if(await this.favoritesHelper.removeFromFavorites(e)){this.view.showSuccess("Cerita berhasil dihapus dari favorit");const i=document.querySelector(`.favorite-story-card[data-story-id="${e}"]`);i&&(i.style.animation="fadeOut 0.3s ease",setTimeout(()=>{i.remove(),this.updateFavoritesCount()},300)),document.querySelectorAll(".favorite-story-card").length<=1&&setTimeout(()=>{this.loadFavorites()},400)}}catch(t){console.error("FavoritesPresenter: Error removing favorite:",t),this.view.showError("Gagal menghapus favorit: "+t.message)}}async exportFavorites(){console.log("FavoritesPresenter: Exporting favorites");try{await this.favoritesHelper.exportFavorites()!==!1&&this.view.showSuccess("Data favorit berhasil di-export!")}catch(e){console.error("FavoritesPresenter: Error exporting favorites:",e),this.view.showError("Gagal export favorit: "+e.message)}}async clearAllFavorites(){console.log("FavoritesPresenter: Clearing all favorites");try{const e=await this.favoritesHelper.getAllFavorites();if(e.length===0){this.view.showSuccess("Tidak ada favorit untuk dihapus");return}if(!confirm(`Apakah Anda yakin ingin menghapus semua ${e.length} favorit? Tindakan ini tidak dapat dibatalkan.`))return;await this.favoritesHelper.clearAllFavorites()&&(this.view.showSuccess(`${e.length} favorit berhasil dihapus`),await this.loadFavorites())}catch(e){console.error("FavoritesPresenter: Error clearing favorites:",e),this.view.showError("Gagal menghapus semua favorit: "+e.message)}}async updateFavoritesCount(){try{const e=await this.favoritesHelper.getAllFavorites();this.view.updateFavoritesCount(e.length)}catch(e){console.error("Error updating favorites count:",e)}}navigateToHome(){window.router&&window.router.navigateTo("/")}navigateToMap(e,t){window.router&&e&&t&&window.router.navigateTo(`/peta?lat=${e}&lon=${t}`)}}window.FavoritesPresenter=Q;console.log("FavoritesPresenter exported to window");class Z{constructor({view:e}){this.view=e,this.favoritesHelper=window.favoritesHelper,this.indexedDBHelper=window.indexedDBHelper,this.view.setPresenter(this),console.log("SettingsPresenter initialized")}async init(){console.log("SettingsPresenter.init called")}async exportFavorites(){console.log("SettingsPresenter: Exporting favorites");try{if(this.favoritesHelper)await this.favoritesHelper.exportFavorites(),this.view.showSuccess("Data favorit berhasil di-export!");else throw new Error("Favorites helper not available")}catch(e){console.error("SettingsPresenter: Error exporting favorites:",e),this.view.showError("Gagal export favorit: "+e.message)}}async clearAllData(){if(console.log("SettingsPresenter: Clearing all data"),!!confirm("Apakah Anda yakin ingin menghapus semua data lokal? Tindakan ini tidak dapat dibatalkan."))try{this.indexedDBHelper&&await this.indexedDBHelper.clearAllData();const e=localStorage.getItem("token"),t=localStorage.getItem("user");if(localStorage.clear(),e&&localStorage.setItem("token",e),t&&localStorage.setItem("user",t),"caches"in window){const i=await caches.keys();await Promise.all(i.map(o=>caches.delete(o)))}this.view.showSuccess("Semua data lokal berhasil dihapus!"),setTimeout(()=>{this.view._loadDataStats()},1e3)}catch(e){console.error("SettingsPresenter: Error clearing data:",e),this.view.showError("Gagal menghapus data: "+e.message)}}navigateToHome(){window.router&&window.router.navigateTo("/")}navigateToFavorites(){window.router&&window.router.navigateTo("/favorit")}}window.SettingsPresenter=Z;console.log("SettingsPresenter exported to window");class ee{constructor({view:e,storyModel:t,authModel:i,router:o}){this.view=e,this.storyModel=t,this.authModel=i,this.router=o,this.view.setPresenter(this),console.log("AppPresenter initialized")}_initRouter(){this.router.routes=[],this.router.addRoute("/",()=>{console.log("Navigating to home page"),this.navigateToHome()}).addRoute("/tambah",()=>{console.log("Navigating to add story page"),this.navigateToAddStory()},{requiresAuth:!0}).addRoute("/peta",()=>{console.log("Navigating to map page"),this.navigateToMap()}).addRoute("/favorit",()=>{console.log("Navigating to favorites page"),this.navigateToFavorites()},{requiresAuth:!0}).addRoute("/pengaturan",()=>{console.log("Navigating to settings page"),this.navigateToSettings()},{requiresAuth:!0}).addRoute("/masuk",()=>{console.log("Rendering login page"),this.navigateToLogin()},{guestOnly:!0}).addRoute("/daftar",()=>{console.log("Rendering register page"),this.navigateToRegister()},{guestOnly:!0}).setFallback(()=>{console.error("Halaman tidak ditemukan"),this.router.navigateTo("/")})}navigateToHome(){this.view.applyViewTransition();const e=this.view.renderHomePage();new window.HomePresenter({view:e,model:this.storyModel}).init()}navigateToAddStory(){this.view.applyViewTransition();const e=this.view.renderAddStoryPage();new window.AddStoryPresenter({view:e,model:this.storyModel}).init()}navigateToMap(){this.view.applyViewTransition();const e=this.view.renderMapPage();new window.MapPresenter({view:e,model:this.storyModel}).init()}navigateToFavorites(){this.view.applyViewTransition();const e=this.view.renderFavoritesPage();new window.FavoritesPresenter({view:e}).init()}navigateToSettings(){this.view.applyViewTransition();const e=this.view.renderSettingsPage();new window.SettingsPresenter({view:e}).init()}navigateToLogin(){this.view.applyViewTransition();const e=this.view.renderLoginPage();new window.LoginPresenter({view:e,apiService:this.authModel,router:this.router}).init()}navigateToRegister(){this.view.applyViewTransition();const e=this.view.renderRegisterPage();new window.RegisterPresenter({view:e,apiService:this.authModel,router:this.router}).init()}_setupEventListeners(){this.view.setupNavigation(),this.view.setupSkipLink(),this.updateAuthNavigation(),this.view.setupAuthChangeListener(()=>{console.log("Auth status changed"),this.updateAuthNavigation(),this.updateFeaturesVisibility()})}updateAuthNavigation(){const e=this.isAuthenticated();this.view.updateAuthNavItem(e)}updateFeaturesVisibility(){window.favoritesHelper&&window.favoritesHelper.updateNavigationVisibility(),window.notificationUIHelper&&window.notificationUIHelper.updateNotificationStatus()}isAuthenticated(){return this.authModel.isAuthenticated()}logout(){console.log("Logging out"),this.authModel.logout(),this.view.dispatchAuthChange(),this.router.navigateTo("/masuk")}reloadPage(){this.view.reloadPage()}start(){this._initRouter(),this._setupEventListeners(),this._initializeFeatures(),this.router._loadRoute()}_initializeFeatures(){window.favoritesHelper&&window.favoritesHelper.updateNavigationVisibility(),this._setupStoryCardEnhancements(),console.log("Additional features initialized")}_setupStoryCardEnhancements(){new MutationObserver(t=>{let i=!1;t.forEach(o=>{o.addedNodes.forEach(a=>{var r,s;a.nodeType===Node.ELEMENT_NODE&&((r=a.classList)!=null&&r.contains("story-card")||(s=a.querySelector)!=null&&s.call(a,".story-card"))&&(i=!0)})}),i&&setTimeout(()=>{this._enhanceStoryCards()},500)}).observe(document.body,{childList:!0,subtree:!0}),setTimeout(()=>{this._enhanceStoryCards()},1e3)}_enhanceStoryCards(){if(!window.favoritesHelper)return;document.querySelectorAll(".story-card:not([data-enhanced])").forEach((t,i)=>{try{const o=this._extractStoryDataFromCard(t,i);o&&o.id&&(window.favoritesHelper.addFavoriteButtonToStoryCard(t,o),t.setAttribute("data-enhanced","true"),t.setAttribute("data-story-id",o.id))}catch(o){console.error("Error enhancing story card:",o)}})}_extractStoryDataFromCard(e,t){var h,f,v,w;const i=e.querySelector(".story-title, h3"),o=e.querySelector(".story-description, p"),a=e.querySelector(".story-image, img"),r=e.querySelector(".author-name, .story-author"),s=e.querySelector(".story-date, time"),l=((h=i==null?void 0:i.textContent)==null?void 0:h.trim())||`Cerita ${t+1}`,g=((f=o==null?void 0:o.textContent)==null?void 0:f.trim())||"",d=(a==null?void 0:a.src)||"",m=((v=r==null?void 0:r.textContent)==null?void 0:v.trim())||"Anonim",A=((w=s==null?void 0:s.textContent)==null?void 0:w.trim())||new Date().toISOString();return{id:this._generateStoryId(l,d,t),name:l,description:g,photoUrl:d,createdAt:A,author:m}}_generateStoryId(e,t,i){const o=`${e}-${t}-${i}`;let a=0;for(let r=0;r<o.length;r++){const s=o.charCodeAt(r);a=(a<<5)-a+s,a=a&a}return`story-${Math.abs(a)}`}}window.AppPresenter=ee;console.log("AppPresenter exported to window");console.log("🏗️ Initializing PetaBicara App...");document.addEventListener("DOMContentLoaded",async()=>{console.log("📄 DOM loaded, starting app initialization..."),await te();const n={async init(){console.log("🚀 App initializing...");try{const e=["StoryModel","AppView","AppPresenter","Router","apiService"];for(const s of e)if(!window[s])throw new Error(`${s} not loaded`);console.log("✅ All core dependencies verified");const t=new window.StoryModel(window.apiService),i=window.apiService,o=new window.AppView;window.router||(window.router=new window.Router);const a=new window.AppPresenter({view:o,storyModel:t,authModel:i,router:window.router});if(window.addEventListener("hashchange",()=>{console.log("🧭 Page navigation detected, checking camera..."),window.cameraHelper&&window.cameraHelper.stream&&(console.log("📹 Stopping active camera stream"),window.cameraHelper.stopCamera())}),window.swRegister&&window.swRegister.register().then(s=>{s&&console.log("✅ Service Worker registered successfully")}),window.indexedDBHelper)try{await window.indexedDBHelper.init(),console.log("✅ IndexedDB initialized successfully")}catch(s){console.warn("⚠️ IndexedDB initialization failed:",s)}console.log("🎯 Starting app presenter..."),a.start(),console.log("🎉 App initialization complete!");const r=document.querySelector(".loading-container");r&&(r.style.display="none")}catch(e){console.error("💥 Failed to initialize app:",e),T(`Gagal memulai aplikasi: ${e.message}`)}}};console.log("🎬 Starting app initialization..."),await n.init()});function te(){return new Promise(n=>{let e=0;const t=50,i=()=>{e++;const a=["AppView","AppPresenter","StoryModel","Router","HomeView","AddStoryView","LoginView","RegisterView","MapView","FavoritesView","SettingsView"].filter(r=>!window[r]);a.length===0&&window.apiService?(console.log("✅ All dependencies loaded successfully"),n()):e>=t?(console.error("⏰ Timeout waiting for dependencies. Missing:",a),console.error("🔧 This usually means files are not properly exported to window object"),T(`
          Timeout loading required modules. Missing: ${a.join(", ")}.
          <br><br>
          <strong>Troubleshooting:</strong>
          <ul style="text-align: left; margin: 1rem 0;">
            <li>Ensure all class files export to window object</li>
            <li>Check browser console for import errors</li>
            <li>Verify all files exist in correct paths</li>
          </ul>
        `),n()):(console.log(`⏳ Waiting for dependencies... (${e}/${t})`),console.log("🔍 Missing classes:",a),setTimeout(i,100))};i()})}function T(n){const e=document.getElementById("mainContent");e&&(e.innerHTML=`
      <div class="error-container" style="
        text-align: center; 
        padding: 2rem; 
        color: #d32f2f;
        background: #ffebee;
        border-radius: 8px;
        margin: 2rem;
        border: 1px solid #ffcdd2;
      ">
        <i class="fas fa-exclamation-triangle" style="
          font-size: 3rem; 
          margin-bottom: 1rem;
          color: #f44336;
        "></i>
        <h2 style="margin: 0 0 1rem 0; color: #d32f2f;">Terjadi Kesalahan</h2>
        <div style="margin-bottom: 2rem; line-height: 1.6;">${n}</div>
        
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.location.reload()" style="
            background: #2196F3;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          ">
            <i class="fas fa-redo"></i> Muat Ulang Halaman
          </button>
          
          <button onclick="console.clear(); window.location.hash = ''" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          ">
            <i class="fas fa-home"></i> Reset ke Beranda
          </button>
        </div>
        
        <details style="margin-top: 2rem; text-align: left;">
          <summary style="cursor: pointer; font-weight: bold;">🔧 Detail Teknis</summary>
          <div style="
            background: #f5f5f5; 
            padding: 1rem; 
            border-radius: 4px; 
            margin-top: 1rem;
            font-family: monospace;
            font-size: 0.9rem;
          ">
            <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
            <p><strong>URL:</strong> ${window.location.href}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
        </details>
      </div>
    `)}console.log("📝 App.js loaded and ready");console.log("🚀 Loading PetaBicara App...");console.log("📁 Loading utilities...");console.log("📡 Loading API service...");console.log("🗄️ Loading models...");console.log("🧩 Loading components...");console.log("📺 Loading views...");console.log("🎭 Loading presenters...");console.log("🏗️ Loading main app...");console.log("✅ All PetaBicara App dependencies loaded successfully!");setTimeout(()=>{console.log("🔍 Verifying all classes are loaded...");const e=["Router","StoryModel","AppView","AppPresenter","HomeView","HomePresenter","AddStoryView","AddStoryPresenter","LoginView","LoginPresenter","RegisterView","RegisterPresenter","MapView","MapPresenter","FavoritesView","FavoritesPresenter","SettingsView","SettingsPresenter"].filter(t=>!window[t]);if(e.length>0){console.error("❌ Missing classes:",e),console.error("🔧 Please ensure all files are properly exported to window object");const t=document.getElementById("mainContent");t&&(t.innerHTML=`
        <div style="
          text-align: center; 
          padding: 3rem; 
          background: #ffebee; 
          border-radius: 8px; 
          margin: 2rem;
          color: #d32f2f;
        ">
          <h2>🔧 Loading Error</h2>
          <p>Missing required classes: <strong>${e.join(", ")}</strong></p>
          <p>Please check the browser console for more details.</p>
          <button onclick="window.location.reload()" style="
            background: #2196F3;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
          ">
            🔄 Reload Page
          </button>
        </div>
      `)}else console.log("✅ All required classes loaded successfully!"),console.log("🎉 PetaBicara App ready!")},1e3);
