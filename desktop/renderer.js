async function handleImport(products) {
  // UI feedback
  showLoading(true);
  
  try {
    // Call through the secure bridge
    const result = await window.electronAPI.products.import(products);
    
    if (result.success) {
      // Update UI based on result
      updateProductList(result.importedProducts);
      showNotification(`Imported ${result.imported} products`);
      
      if (result.failed > 0) {
        showErrors(result.errors);
      }
    } else {
      // Handle error in UI
      showError(`Import failed: ${result.error}`);
    }
  } catch (error) {
    // Network/communication errors
    showError('Failed to communicate with main process');
  } finally {
    showLoading(false);
  }
}

// Or with more granular control
async function validateAndImport(products) {
  // Step 1: Validate first
  const validation = await window.electronAPI.products.validate(products);
  
  if (!validation.valid) {
    showValidationErrors(validation.errors);
    return;
  }
  
  // Step 2: Import
  const result = await window.electronAPI.products.import(products);
  // ... handle result
}