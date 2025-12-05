
import React, { useState, useRef, useEffect } from 'react';
import { Product, StockHistoryEntry } from '../types';
import { Search, Package, Plus, Filter, Tag, X, TrendingUp, History, DollarSign, Box, Star, Zap, ShieldCheck, Upload, Camera, RefreshCw, AlertCircle, Edit2, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductInventoryProps {
  products: Product[];
  setProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
}

const ProductInventory: React.FC<ProductInventoryProps> = ({ products, setProducts }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All'); // All, Low, Out
  const [tagFilter, setTagFilter] = useState('All');

  // Stock Adjustment State (for Detail View)
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'Restock' | 'Sale' | 'Adjustment' | 'Return'>('Adjustment');
  const [adjustNote, setAdjustNote] = useState('');

  // Edit Product State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  // Add Product State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: '',
    sku: '',
    price: 0,
    cost: 0,
    stock: 0,
    description: '',
    warranty: '',
    image: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailFileInputRef = useRef<HTMLInputElement>(null);

  // Reset edit state when selected product changes
  useEffect(() => {
    if (selectedProduct) {
        setEditForm(selectedProduct);
        setIsEditing(false);
    }
  }, [selectedProduct]);

  // --- Derived Data for Filters ---
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const allTags = ['All', ...Array.from(new Set(products.flatMap(p => p.tags || [])))];

  const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesTag = tagFilter === 'All' || (product.tags && product.tags.includes(tagFilter));
      
      let matchesStock = true;
      if (stockFilter === 'Low') matchesStock = product.stock > 0 && product.stock < 10;
      if (stockFilter === 'Out') matchesStock = product.stock === 0;

      return matchesSearch && matchesCategory && matchesTag && matchesStock;
  });

  // --- Handlers ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isDetail: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isDetail && selectedProduct && setProducts) {
             // Update existing product image immediately
             const updatedProduct = { ...selectedProduct, image: base64String };
             setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
             setSelectedProduct(updatedProduct);
             setEditForm(prev => ({ ...prev, image: base64String }));
        } else {
             // Update new product state
             setNewProduct(prev => ({ ...prev, image: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStockAdjustment = () => {
      if (!selectedProduct || !setProducts || adjustAmount === 0) return;

      const newStockLevel = selectedProduct.stock + adjustAmount;
      const historyEntry: StockHistoryEntry = {
          date: new Date().toISOString(),
          stockLevel: newStockLevel,
          change: adjustAmount,
          type: adjustType,
          note: adjustNote || 'Manual adjustment'
      };

      const updatedProduct = {
          ...selectedProduct,
          stock: newStockLevel,
          stockHistory: [...(selectedProduct.stockHistory || []), historyEntry]
      };

      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      setSelectedProduct(updatedProduct);
      
      // Reset form
      setAdjustAmount(0);
      setAdjustNote('');
      setAdjustType('Adjustment');
  };

  const handleSaveChanges = () => {
      if (!selectedProduct || !setProducts) return;
      
      const updatedProduct = { ...selectedProduct, ...editForm } as Product;
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      setSelectedProduct(updatedProduct);
      setIsEditing(false);
  };

  const getChartData = (history: StockHistoryEntry[] = []) => {
    return history.map(entry => ({
      date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      stock: entry.stockLevel
    }));
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku || !setProducts) return;

    const product: Product = {
        id: `PRD-${Math.floor(Math.random() * 10000)}`,
        name: newProduct.name,
        category: newProduct.category || 'General',
        sku: newProduct.sku,
        price: Number(newProduct.price) || 0,
        cost: Number(newProduct.cost) || 0,
        stock: Number(newProduct.stock) || 0,
        description: newProduct.description || '',
        warranty: newProduct.warranty || '',
        image: newProduct.image,
        tags: [],
        stockHistory: [
            {
                date: new Date().toISOString(),
                stockLevel: Number(newProduct.stock) || 0,
                change: Number(newProduct.stock) || 0,
                type: 'Restock',
                note: 'Initial stock'
            }
        ]
    };

    setProducts(prev => [...prev, product]);
    setIsAddModalOpen(false);
    setNewProduct({
        name: '', category: '', sku: '', price: 0, cost: 0, stock: 0, description: '', warranty: '', image: ''
    });
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Parts Inventory</h2>
          <p className="text-slate-500 mt-1">Manage equipment stock, price lists, and warranties.</p>
        </div>
        <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-blue-900/10 flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        {/* Filters Section */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col xl:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
             <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-300 rounded-lg">
                <Filter size={16} className="text-slate-400" />
                <span className="text-sm text-slate-500">Category:</span>
                <select 
                    className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-300 rounded-lg">
                <AlertCircle size={16} className="text-slate-400" />
                <span className="text-sm text-slate-500">Stock:</span>
                <select 
                    className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer"
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                >
                    <option value="All">All Levels</option>
                    <option value="Low">Low Stock (&lt;10)</option>
                    <option value="Out">Out of Stock</option>
                </select>
             </div>
             <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-300 rounded-lg">
                <Tag size={16} className="text-slate-400" />
                <span className="text-sm text-slate-500">Tags:</span>
                <select 
                    className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer"
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                >
                    {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
             </div>
             {(categoryFilter !== 'All' || stockFilter !== 'All' || tagFilter !== 'All') && (
                 <button 
                    onClick={() => { setCategoryFilter('All'); setStockFilter('All'); setTagFilter('All'); }}
                    className="text-sm text-red-500 hover:text-red-700 font-medium px-2"
                 >
                     Reset
                 </button>
             )}
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Warranty</th>
                <th className="px-6 py-4 text-right">Stock Level</th>
                <th className="px-6 py-4 text-right">Pricing (Price / Cost)</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <Package size={18} className="text-slate-400" />
                            )}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-800 flex items-center gap-2">
                                {product.name}
                                {product.tags?.includes('Important') && (
                                    <span title="Important Product" className="text-yellow-500">
                                        <Star size={14} fill="currentColor" />
                                    </span>
                                )}
                                {product.tags?.includes('Popular') && (
                                    <span title="Popular Product" className="text-green-500">
                                        <Zap size={14} fill="currentColor" />
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <Tag size={12} /> {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">{product.sku}</td>
                  <td className="px-6 py-4">
                    {product.warranty ? (
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                            <ShieldCheck size={14} className="text-slate-400" />
                            {product.warranty}
                        </div>
                    ) : (
                        <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${product.stock < 10 ? 'text-red-600' : 'text-slate-700'}`}>
                        {product.stock}
                    </span>
                    {product.stock < 10 && <span className="ml-2 text-xs text-red-500 font-medium">Low</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                        <span className="font-medium text-slate-800">${product.price.toFixed(2)}</span>
                        {product.cost && <span className="text-xs text-slate-400">Cost: ${product.cost.toFixed(2)}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                        className="text-slate-400 hover:text-blue-600 font-medium text-xs border border-slate-200 rounded px-2 py-1 hover:border-blue-300 transition-all"
                    >
                        View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                  <Package size={48} className="mx-auto mb-3 opacity-20" />
                  <p>No products found matching your filters.</p>
              </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800">Add New Product</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="flex gap-4">
                        <div 
                            className="w-24 h-24 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors flex-shrink-0 overflow-hidden relative group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {newProduct.image ? (
                                <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <Camera size={24} />
                                    <span className="text-[10px] mt-1">Add Image</span>
                                </>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="text-white" size={20} />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 12V Battery"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Sensors"
                                value={newProduct.category}
                                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. SEN-001"
                                value={newProduct.sku}
                                onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                            <input 
                                type="number" 
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cost ($)</label>
                            <input 
                                type="number" 
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newProduct.cost}
                                onChange={(e) => setNewProduct({...newProduct, cost: Number(e.target.value)})}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                            <input 
                                type="number" 
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newProduct.stock}
                                onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Info</label>
                         <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 1 Year Manufacturer"
                            value={newProduct.warranty}
                            onChange={(e) => setNewProduct({...newProduct, warranty: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea 
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Product details..."
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAddProduct}
                        disabled={!newProduct.name || !newProduct.sku}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Product
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-2xl font-bold text-slate-800">Product Details</h3>
                    
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={() => setIsEditing(false)} 
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveChanges} 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm"
                            >
                                <Edit2 size={16} /> Edit Product
                            </button>
                        )}
                        <div className="h-6 w-px bg-slate-300 mx-1"></div>
                        <button 
                            onClick={() => setSelectedProduct(null)} 
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left Column: Image & Stock Actions */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Large Image Container */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                                <div 
                                    className="w-full aspect-square bg-slate-50 rounded-lg border-2 border-dashed border-slate-100 flex items-center justify-center relative overflow-hidden group cursor-pointer"
                                    onClick={() => detailFileInputRef.current?.click()}
                                >
                                    {editForm.image ? (
                                        <img src={editForm.image} alt={editForm.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-center text-slate-300">
                                            <Package size={64} className="mx-auto mb-2 opacity-50" />
                                            <span className="text-sm font-medium">No Image Available</span>
                                        </div>
                                    )}
                                    
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                        <Camera size={32} className="mb-2" />
                                        <span className="font-bold text-sm">Update Photo</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={detailFileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, true)}
                                    />
                                </div>
                            </div>

                            {/* Inventory Management Card */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <RefreshCw size={16} className="text-blue-600" /> Stock Adjustment
                                </h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1.5 block font-medium">Quantity</label>
                                            <input 
                                                type="number" 
                                                value={adjustAmount}
                                                onChange={(e) => setAdjustAmount(Number(e.target.value))}
                                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1.5 block font-medium">Reason Code</label>
                                            <select 
                                                value={adjustType}
                                                onChange={(e) => setAdjustType(e.target.value as any)}
                                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="Restock">Restock (+)</option>
                                                <option value="Adjustment">Correction (+/-)</option>
                                                <option value="Sale">Manual Sale (-)</option>
                                                <option value="Return">Return (+)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1.5 block font-medium">Notes</label>
                                        <input 
                                            type="text" 
                                            value={adjustNote}
                                            onChange={(e) => setAdjustNote(e.target.value)}
                                            placeholder="e.g. Monthly Inventory Count"
                                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleStockAdjustment}
                                        disabled={adjustAmount === 0}
                                        className="w-full py-2.5 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-sm"
                                    >
                                        <RefreshCw size={14} /> Update Inventory
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details & Charts */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Header Info */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div className="flex-1 w-full">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs text-slate-500 uppercase font-bold mb-1">Product Name</label>
                                                        <input 
                                                            type="text"
                                                            className="text-xl font-bold text-slate-800 border border-slate-300 rounded p-2 focus:border-blue-500 outline-none w-full"
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500 uppercase font-bold mb-1">SKU</label>
                                                        <input 
                                                            type="text"
                                                            className="text-xl font-bold text-slate-600 border border-slate-300 rounded p-2 focus:border-blue-500 outline-none w-full font-mono"
                                                            value={editForm.sku}
                                                            onChange={(e) => setEditForm({...editForm, sku: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs text-slate-500 uppercase font-bold mb-1">Category</label>
                                                        <input 
                                                            type="text"
                                                            className="border border-slate-300 rounded p-2 w-full text-sm"
                                                            value={editForm.category}
                                                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500 uppercase font-bold mb-1">Warranty</label>
                                                        <input 
                                                            type="text"
                                                            className="border border-slate-300 rounded p-2 w-full text-sm"
                                                            value={editForm.warranty}
                                                            onChange={(e) => setEditForm({...editForm, warranty: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h2 className="text-3xl font-bold text-slate-800">{selectedProduct.name}</h2>
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-mono font-bold rounded-lg border border-slate-200">
                                                        {selectedProduct.sku}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-4 mt-3">
                                                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                                        <Tag size={14} className="text-blue-500" /> 
                                                        <span className="text-sm font-medium">{selectedProduct.category}</span>
                                                    </div>
                                                    {selectedProduct.warranty && (
                                                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                                            <ShieldCheck size={14} className="text-green-500" />
                                                            <span className="text-sm font-medium">Warranty: {selectedProduct.warranty}</span>
                                                        </div>
                                                    )}
                                                    {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                                                        <div className="flex gap-2">
                                                            {selectedProduct.tags.includes('Important') && (
                                                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold flex items-center gap-1">
                                                                    <Star size={10} fill="currentColor" /> Important
                                                                </span>
                                                            )}
                                                            {selectedProduct.tags.includes('Popular') && (
                                                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-bold flex items-center gap-1">
                                                                    <Zap size={10} fill="currentColor" /> Popular
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pricing Box */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[200px]">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-500">Unit Price</span>
                                                {isEditing ? (
                                                    <input 
                                                        type="number"
                                                        className="font-bold text-slate-800 bg-white border border-slate-300 rounded p-1 w-24 text-right"
                                                        value={editForm.price}
                                                        onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                                                    />
                                                ) : (
                                                    <span className="text-xl font-bold text-slate-800">${selectedProduct.price.toFixed(2)}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                                <span className="text-xs text-slate-400">Unit Cost</span>
                                                {isEditing ? (
                                                    <input 
                                                        type="number"
                                                        className="font-medium text-slate-600 bg-white border border-slate-300 rounded p-1 w-24 text-right text-sm"
                                                        value={editForm.cost}
                                                        onChange={(e) => setEditForm({...editForm, cost: Number(e.target.value)})}
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium text-slate-500">${(selectedProduct.cost || 0).toFixed(2)}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                                <span className="text-xs text-slate-400">In Stock</span>
                                                <span className={`text-lg font-bold ${selectedProduct.stock < 10 ? 'text-red-600' : 'text-blue-600'}`}>
                                                    {selectedProduct.stock}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Description</h4>
                                    {isEditing ? (
                                        <textarea 
                                            className="w-full border border-slate-300 rounded p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        />
                                    ) : (
                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedProduct.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Charts & History */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={20} className="text-blue-600" />
                                        <h4 className="font-bold text-slate-800">Inventory Trends</h4>
                                    </div>
                                </div>
                                {selectedProduct.stockHistory && selectedProduct.stockHistory.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={getChartData(selectedProduct.stockHistory)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="stock" 
                                                stroke="#2563eb" 
                                                strokeWidth={3} 
                                                dot={{ fill: '#ffffff', stroke: '#2563eb', strokeWidth: 2, r: 4 }} 
                                                activeDot={{ r: 6, fill: '#2563eb' }} 
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm bg-slate-50 rounded-lg">
                                        No stock history data available for this period.
                                    </div>
                                )}
                            </div>

                            {/* Recent Activity Log */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                                    <History size={16} className="text-slate-500" />
                                    <h4 className="font-bold text-slate-800 text-sm">Recent Activity Log</h4>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {selectedProduct.stockHistory && selectedProduct.stockHistory.length > 0 ? (
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium">Date</th>
                                                    <th className="px-4 py-2 font-medium">Action</th>
                                                    <th className="px-4 py-2 font-medium">Note</th>
                                                    <th className="px-4 py-2 font-medium text-right">Adjustment</th>
                                                    <th className="px-4 py-2 font-medium text-right">Resulting Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {[...selectedProduct.stockHistory].reverse().map((entry, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 text-slate-600">{new Date(entry.date).toLocaleDateString()}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                                entry.type === 'Restock' ? 'bg-green-100 text-green-700' :
                                                                entry.type === 'Sale' ? 'bg-blue-100 text-blue-700' :
                                                                entry.type === 'Adjustment' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {entry.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500 italic max-w-[200px] truncate" title={entry.note}>{entry.note || '-'}</td>
                                                        <td className={`px-4 py-3 text-right font-medium ${entry.change > 0 ? 'text-green-600' : entry.change < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                                            {entry.change > 0 ? '+' : ''}{entry.change}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-slate-800 font-medium">{entry.stockLevel}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-8 text-center text-slate-400 text-sm">No recent activity found.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductInventory;
