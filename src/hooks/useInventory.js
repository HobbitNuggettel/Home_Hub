import { useReducer, useCallback, useMemo } from 'react';

// Action types
const ACTIONS = {
  SET_ITEMS: 'SET_ITEMS',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  DELETE_MULTIPLE: 'DELETE_MULTIPLE',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_SELECTED_CATEGORY: 'SET_SELECTED_CATEGORY',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_SELECTED_ITEMS: 'SET_SELECTED_ITEMS',
  TOGGLE_ITEM_SELECTION: 'TOGGLE_ITEM_SELECTION',
  SELECT_ALL: 'SELECT_ALL',
  DESELECT_ALL: 'DESELECT_ALL',
  SET_EDITING_ITEM: 'SET_EDITING_ITEM',
  SET_SHOW_ADD_FORM: 'SET_SHOW_ADD_FORM',
  SET_SHOW_MULTI_ADD_FORM: 'SET_SHOW_MULTI_ADD_FORM',
  SET_SHOW_BARCODE_SCANNER: 'SET_SHOW_BARCODE_SCANNER',
  RESET_FILTERS: 'RESET_FILTERS'
};

// Initial state
const initialState = {
  items: [],
  categories: [],
  searchTerm: '',
  selectedCategory: 'all',
  viewMode: 'table',
  selectedItems: [],
  editingItem: null,
  showAddForm: false,
  showMultiAddForm: false,
  showBarcodeScanner: false
};

// Reducer function
function inventoryReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_ITEMS:
      return { ...state, items: action.payload };
    
    case ACTIONS.ADD_ITEM:
      return { 
        ...state, 
        items: [...state.items, { ...action.payload, id: Date.now().toString() }] 
      };
    
    case ACTIONS.UPDATE_ITEM:
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    
    case ACTIONS.DELETE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        selectedItems: state.selectedItems.filter(id => id !== action.payload)
      };
    
    case ACTIONS.DELETE_MULTIPLE:
      return {
        ...state,
        items: state.items.filter(item => !action.payload.includes(item.id)),
        selectedItems: []
      };
    
    case ACTIONS.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
    
    case ACTIONS.SET_SELECTED_CATEGORY:
      return { ...state, selectedCategory: action.payload };
    
    case ACTIONS.SET_VIEW_MODE:
      return { ...state, viewMode: action.payload };
    
    case ACTIONS.SET_SELECTED_ITEMS:
      return { ...state, selectedItems: action.payload };
    
    case ACTIONS.TOGGLE_ITEM_SELECTION:
      const itemId = action.payload;
      const isSelected = state.selectedItems.includes(itemId);
      const newSelectedItems = isSelected
        ? state.selectedItems.filter(id => id !== itemId)
        : [...state.selectedItems, itemId];
      return { ...state, selectedItems: newSelectedItems };
    
    case ACTIONS.SELECT_ALL:
      return { 
        ...state, 
        selectedItems: state.items.map(item => item.id) 
      };
    
    case ACTIONS.DESELECT_ALL:
      return { ...state, selectedItems: [] };
    
    case ACTIONS.SET_EDITING_ITEM:
      return { ...state, editingItem: action.payload };
    
    case ACTIONS.SET_SHOW_ADD_FORM:
      return { ...state, showAddForm: action.payload };
    
    case ACTIONS.SET_SHOW_MULTI_ADD_FORM:
      return { ...state, showMultiAddForm: action.payload };
    
    case ACTIONS.SET_SHOW_BARCODE_SCANNER:
      return { ...state, showBarcodeScanner: action.payload };
    
    case ACTIONS.RESET_FILTERS:
      return {
        ...state,
        searchTerm: '',
        selectedCategory: 'all',
        selectedItems: []
      };
    
    default:
      return state;
  }
}

// Custom hook
export function useInventory(initialItems = [], initialCategories = []) {
  const [state, dispatch] = useReducer(inventoryReducer, {
    ...initialState,
    items: initialItems,
    categories: initialCategories
  });

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    return state.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           item.location.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           item.notes.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase()));
      const matchesCategory = state.selectedCategory === 'all' || item.category === state.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.items, state.searchTerm, state.selectedCategory]);

  // Memoized statistics
  const statistics = useMemo(() => {
    const totalItems = state.items.length;
    const totalValue = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const categoriesCount = state.items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    const lowStockItems = state.items.filter(item => item.quantity <= 2);
    const expiredItems = state.items.filter(item => 
      item.expiryDate && new Date(item.expiryDate) < new Date()
    );

    return {
      totalItems,
      totalValue: totalValue.toFixed(2),
      categoriesCount,
      lowStockItems: lowStockItems.length,
      expiredItems: expiredItems.length
    };
  }, [state.items]);

  // Action creators
  const actions = {
    setItems: useCallback((items) => {
      dispatch({ type: ACTIONS.SET_ITEMS, payload: items });
    }, []),

    addItem: useCallback((item) => {
      dispatch({ type: ACTIONS.ADD_ITEM, payload: item });
    }, []),

    updateItem: useCallback((item) => {
      dispatch({ type: ACTIONS.UPDATE_ITEM, payload: item });
    }, []),

    deleteItem: useCallback((itemId) => {
      dispatch({ type: ACTIONS.DELETE_ITEM, payload: itemId });
    }, []),

    deleteMultiple: useCallback((itemIds) => {
      dispatch({ type: ACTIONS.DELETE_MULTIPLE, payload: itemIds });
    }, []),

    setSearchTerm: useCallback((term) => {
      dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: term });
    }, []),

    setSelectedCategory: useCallback((category) => {
      dispatch({ type: ACTIONS.SET_SELECTED_CATEGORY, payload: category });
    }, []),

    setViewMode: useCallback((mode) => {
      dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: mode });
    }, []),

    setSelectedItems: useCallback((items) => {
      dispatch({ type: ACTIONS.SET_SELECTED_ITEMS, payload: items });
    }, []),

    toggleItemSelection: useCallback((itemId) => {
      dispatch({ type: ACTIONS.TOGGLE_ITEM_SELECTION, payload: itemId });
    }, []),

    selectAll: useCallback(() => {
      dispatch({ type: ACTIONS.SELECT_ALL });
    }, []),

    deselectAll: useCallback(() => {
      dispatch({ type: ACTIONS.DESELECT_ALL });
    }, []),

    setEditingItem: useCallback((item) => {
      dispatch({ type: ACTIONS.SET_EDITING_ITEM, payload: item });
    }, []),

    setShowAddForm: useCallback((show) => {
      dispatch({ type: ACTIONS.SET_SHOW_ADD_FORM, payload: show });
    }, []),

    setShowMultiAddForm: useCallback((show) => {
      dispatch({ type: ACTIONS.SET_SHOW_MULTI_ADD_FORM, payload: show });
    }, []),

    setShowBarcodeScanner: useCallback((show) => {
      dispatch({ type: ACTIONS.SET_SHOW_BARCODE_SCANNER, payload: show });
    }, []),

    resetFilters: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_FILTERS });
    }, [])
  };

  return {
    ...state,
    filteredItems,
    statistics,
    actions
  };
}

export { ACTIONS };
