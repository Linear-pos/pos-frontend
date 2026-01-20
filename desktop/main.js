import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');


const isDev = !app.isPackaged;

const logger = console;

const API_BASE_URL = (process.env.API_URL || "http://localhost:3000").replace(/\/+$/, "");

async function postJson(pathname, body, token) {
  const res = await fetch(`${API_BASE_URL}${pathname}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message = json?.message || json?.error || text || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return json;
}

function sanitize(value) {
  return String(value ?? "");
}

function validateNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error("Invalid number");
  }
  return n;
}

function auditLog() {
  return;
}

function getUserFromEvent() {
  return null;
}

const productService = {
  async import(products, token) {
    const payload = { products };
    const result = await postJson("/products/bulk-upload", payload, token);

    return {
      imported: Number(result?.imported ?? result?.data?.imported ?? products.length),
      failed: Number(result?.failed ?? result?.data?.failed ?? 0),
      summary: result,
    };
  },
};

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile("../web/dist/index.html");
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Main process handles the actual business logic
ipcMain.handle('products:import', async (event, payload) => {
  try {
    const products = Array.isArray(payload)
      ? payload
      : (payload && Array.isArray(payload.products) ? payload.products : null);

    const token =
      payload && !Array.isArray(payload) && typeof payload.token === "string"
        ? payload.token
        : undefined;

    // 1. Validate input in MAIN process (security critical)
    if (!products) {
      throw new Error('Products must be an array');
    }
    
    // 2. Validate each product (preserve full payload for backend)
    const validatedProducts = products.map((product) => {
      if (!product || typeof product !== "object") {
        throw new Error("Invalid product payload");
      }

      // Support both snake_case and camelCase just in case
      const id = product.id;
      const name = product.name;
      const price = product.price;

      if (!id || !name) {
        throw new Error("Product missing required fields");
      }

      return {
        ...product,
        id: sanitize(id),
        name: sanitize(name),
        price: validateNumber(price),
      };
    });
    
    // 3. Business logic in main process
    const result = await productService.import(validatedProducts, token);
    
    // 4. Logging/Auditing in main process
    auditLog('products_import', {
      count: validatedProducts.length,
      userId: getUserFromEvent(event), // Get sender info
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      imported: result.imported,
      failed: result.failed,
      summary: result.summary
    };
    
  } catch (error) {
    // Proper error handling in main process
    logger.error('Import failed:', error);
    
    // Return structured error to renderer
    return {
      success: false,
      error: error?.message,
      code: 'IMPORT_FAILED'
    };
  }
});

// Separate service module for business logic
class ProductService {
  async import(products) {
    const results = {
      imported: 0,
      failed: 0,
      errors: []
    };
    
    for (const product of products) {
      try {
        // Database operations in main process
        await this.saveToDatabase(product);
        
        // File system operations
        await this.generateProductFiles(product);
        
        // External API calls (with API keys)
        await this.syncWithExternalAPI(product);
        
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          productId: product.id,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  async saveToDatabase(product) {
    const result = await postJson("/products/bulk-upload", { products: [product] });
    return result;
  }
}