import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Save, X } from 'lucide-react';
import { barcodeApi } from '../../services/barcode.api';
import type { ProductBarcode, BarcodeType, CreateBarcodePayload, UpdateBarcodePayload } from '../../types/product';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from '../ui/dialog';
import { toast } from 'sonner';

interface BarcodeManagementProps {
  productId: string;
  productName: string;
  onBarcodeUpdated?: () => void;
  className?: string;
}

interface EditingBarcode extends ProductBarcode {
  isEditing: boolean;
}

export const BarcodeManagement: React.FC<BarcodeManagementProps> = ({
  productId,
  productName,
  onBarcodeUpdated,
  className = '',
}) => {
  const [barcodes, setBarcodes] = useState<EditingBarcode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingBarcode, setIsAddingBarcode] = useState(false);
  const [barcodeTypes, setBarcodeTypes] = useState<Partial<Record<BarcodeType, string>>>({});
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [deletingBarcodeId, setDeletingBarcodeId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  // Form state for new barcode
  const [newBarcode, setNewBarcode] = useState<CreateBarcodePayload>({
    barcode: '',
    barcode_type: 'CODE128',
    is_primary: false,
    quantity: undefined,
  });

  // Load barcodes for the product
  useEffect(() => {
    const loadBarcodes = async () => {
      try {
        setIsLoading(true);
        const response = await barcodeApi.getProductBarcodes(productId);
        setBarcodes(response.data.map(b => ({ ...b, isEditing: false })));
      } catch (error) {
        console.error('Failed to load barcodes:', error);
        toast.error('Failed to load barcodes');
      } finally {
        setIsLoading(false);
      }
    };

    loadBarcodes();
  }, [productId]);

  // Load barcode types
  useEffect(() => {
    const loadBarcodeTypes = async () => {
      try {
        setIsLoadingTypes(true);
        const response = await barcodeApi.getBarcodeTypes();
        setBarcodeTypes(response.data);
      } catch (error) {
        console.error('Failed to load barcode types:', error);
        toast.error('Failed to load barcode types');
      } finally {
        setIsLoadingTypes(false);
      }
    };

    loadBarcodeTypes();
  }, []);

  // Add new barcode
  const handleAddBarcode = async () => {
    if (!newBarcode.barcode.trim()) {
      toast.error('Barcode is required');
      return;
    }

    // Validate format
    if (!barcodeApi.validateBarcodeFormat(newBarcode.barcode, newBarcode.barcode_type || 'CODE128')) {
      toast.error(`Invalid ${newBarcode.barcode_type} barcode format`);
      return;
    }

    try {
      setIsAddingBarcode(true);
      const response = await barcodeApi.addBarcode(productId, newBarcode);
      setBarcodes(prev => [...prev.map(b => ({ ...b, is_primary: b.is_primary && newBarcode.is_primary ? false : b.is_primary })), { ...response.data, isEditing: false }]);
      setNewBarcode({
        barcode: '',
        barcode_type: 'CODE128',
        is_primary: false,
        quantity: undefined,
      });
      toast.success('Barcode added successfully');
      onBarcodeUpdated?.();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to add barcode';
      toast.error(message);
    } finally {
      setIsAddingBarcode(false);
    }
  };

  // Update barcode
  const handleUpdateBarcode = async (barcodeId: string, updates: UpdateBarcodePayload) => {
    try {
      const response = await barcodeApi.updateBarcode(barcodeId, updates);
      setBarcodes(prev => prev.map(b => 
        b.id === barcodeId 
          ? { ...response.data, isEditing: false }
          : { ...b, is_primary: updates.is_primary ? false : b.is_primary }
      ));
      toast.success('Barcode updated successfully');
      onBarcodeUpdated?.();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update barcode';
      toast.error(message);
    }
  };

  // Delete barcode
  const handleDeleteBarcode = async (barcodeId: string) => {
    try {
      setDeletingBarcodeId(barcodeId);
      await barcodeApi.removeBarcode(barcodeId);
      setBarcodes(prev => prev.filter(b => b.id !== barcodeId));
      toast.success('Barcode deleted successfully');
      onBarcodeUpdated?.();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete barcode';
      toast.error(message);
    } finally {
      setDeletingBarcodeId(null);
    }
  };

  // Set primary barcode
  const handleSetPrimary = async (barcodeId: string) => {
    try {
      setSettingPrimaryId(barcodeId);
      await barcodeApi.setPrimaryBarcode(barcodeId);
      setBarcodes(prev => prev.map(b => 
        ({ ...b, is_primary: b.id === barcodeId ? true : false })
      ));
      toast.success('Primary barcode updated successfully');
      onBarcodeUpdated?.();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to set primary barcode';
      toast.error(message);
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // Start editing barcode


  // Cancel editing
  const cancelEditing = (barcodeId: string) => {
    setBarcodes(prev => prev.map(b => 
      b.id === barcodeId ? { ...b, isEditing: false } : b
    ));
  };

  // Save editing
  const saveEditing = (barcode: EditingBarcode) => {
    const updates: UpdateBarcodePayload = {
      barcode: barcode.barcode,
      barcode_type: barcode.barcode_type,
      is_primary: barcode.is_primary,
      quantity: barcode.quantity,
    };
    handleUpdateBarcode(barcode.id, updates);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Barcode Management for {productName}</span>
            <Badge variant="outline">{barcodes.length} barcodes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Barcode */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Add New Barcode</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="barcode">Barcode Value</Label>
                <Input
                  id="barcode"
                  placeholder="Enter barcode or generate sample"
                  value={newBarcode.barcode}
                  onChange={(e) => setNewBarcode(prev => ({ ...prev, barcode: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="barcode_type">Barcode Type</Label>
                <Select
                  value={newBarcode.barcode_type}
                  onValueChange={(value: BarcodeType) => setNewBarcode(prev => ({ ...prev, barcode_type: value }))}
                  disabled={isLoadingTypes}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select barcode type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(barcodeTypes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity (for weighted items)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.001"
                  placeholder="e.g., 1.500"
                  value={newBarcode.quantity || ''}
                  onChange={(e) => setNewBarcode(prev => ({ ...prev, quantity: e.target.value ? parseFloat(e.target.value) : undefined }))}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    const supportedTypes = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC'] as const;
                    const type = supportedTypes.includes(newBarcode.barcode_type as any)
                      ? newBarcode.barcode_type as typeof supportedTypes[number]
                      : 'CODE128';
                    const generated = barcodeApi.generateBarcode(type);
                    setNewBarcode(prev => ({ ...prev, barcode: generated }));
                  }}
                >
                  Generate Sample
                </Button>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={newBarcode.is_primary}
                    onChange={(e) => setNewBarcode(prev => ({ ...prev, is_primary: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_primary" className="text-sm">Set as Primary</Label>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleAddBarcode} 
              disabled={isAddingBarcode || !newBarcode.barcode.trim()}
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAddingBarcode ? 'Adding...' : 'Add Barcode'}
            </Button>
          </div>

          {/* Existing Barcodes */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : barcodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No barcodes found for this product
            </div>
          ) : (
            <div className="space-y-4">
              {barcodes.map((barcode) => (
                <div key={barcode.id} className="p-4 border rounded-lg">
                  {barcode.isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Barcode Value</Label>
                          <Input
                            value={barcode.barcode}
                            onChange={(e) => setBarcodes(prev => prev.map(b => 
                              b.id === barcode.id ? { ...b, barcode: e.target.value } : b
                            ))}
                            className="font-mono"
                          />
                        </div>
                        <div>
                          <Label>Barcode Type</Label>
                          <Select
                            value={barcode.barcode_type}
                            onValueChange={(value: BarcodeType) => setBarcodes(prev => prev.map(b => 
                              b.id === barcode.id ? { ...b, barcode_type: value } : b
                            ))}
                            disabled={isLoadingTypes}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(barcodeTypes).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={barcode.quantity || ''}
                            onChange={(e) => setBarcodes(prev => prev.map(b => 
                              b.id === barcode.id ? { ...b, quantity: e.target.value ? parseFloat(e.target.value) : undefined } : b
                            ))}
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <input
                            type="checkbox"
                            checked={barcode.is_primary}
                            onChange={(e) => setBarcodes(prev => prev.map(b => 
                              b.id === barcode.id ? { ...b, is_primary: e.target.checked } : b
                            ))}
                            className="rounded"
                          />
                          <Label className="text-sm">Primary Barcode</Label>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={() => saveEditing(barcode)} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => cancelEditing(barcode.id)} size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-lg font-medium">{barcode.barcode}</span>
                          <Badge variant="outline">{barcode.barcode_type}</Badge>
                          {barcode.is_primary && (
                            <Badge><Star className="h-3 w-3 mr-1" />Primary</Badge>
                          )}
                        </div>
                        {barcode.quantity && (
                          <div className="text-sm text-gray-600 mt-1">
                            Quantity: {barcode.quantity}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!barcode.is_primary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetPrimary(barcode.id)}
                            disabled={settingPrimaryId === barcode.id}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Set Primary
                          </Button>
                        )}
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Barcode</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Barcode Value</Label>
                                <Input
                                  value={barcode.barcode}
                                  onChange={(e) => setBarcodes(prev => prev.map(b => 
                                    b.id === barcode.id ? { ...b, barcode: e.target.value } : b
                                  ))}
                                  className="font-mono"
                                />
                              </div>
                              <div>
                                <Label>Barcode Type</Label>
                                <Select
                                  value={barcode.barcode_type}
                                  onValueChange={(value: BarcodeType) => setBarcodes(prev => prev.map(b => 
                                    b.id === barcode.id ? { ...b, barcode_type: value } : b
                                  ))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(barcodeTypes).map(([key, label]) => (
                                      <SelectItem key={key} value={key}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" className="w-full mt-4">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Barcode
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Barcode</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete barcode "{barcode.barcode}"? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleDeleteBarcode(barcode.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={deletingBarcodeId === barcode.id}
                                    >
                                      {deletingBarcodeId === barcode.id ? 'Deleting...' : 'Delete'}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeManagement;