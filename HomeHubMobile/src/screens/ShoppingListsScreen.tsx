import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  addedBy: string;
  addedAt: string;
}

interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  items: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isShared: boolean;
  color: string;
}

const ShoppingListsScreen: React.FC = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('pcs');
  const [newItemCategory, setNewItemCategory] = useState('General');

  const categories = [
    'General',
    'Produce',
    'Dairy',
    'Meat',
    'Bakery',
    'Pantry',
    'Frozen',
    'Beverages',
    'Health & Beauty',
    'Household',
  ];

  const units = ['pcs', 'kg', 'lbs', 'g', 'oz', 'l', 'ml', 'gal', 'qt', 'pt'];

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280',
  ];

  useEffect(() => {
    loadShoppingLists();
  }, []);

  const loadShoppingLists = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setLists([
        {
          id: '1',
          name: 'Weekly Groceries',
          description: 'Main grocery shopping for the week',
          color: '#3B82F6',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          createdBy: 'John Doe',
          isShared: true,
          items: [
            {
              id: '1',
              name: 'Milk',
              quantity: 2,
              unit: 'l',
              category: 'Dairy',
              completed: false,
              priority: 'high',
              addedBy: 'John Doe',
              addedAt: '2024-01-15',
            },
            {
              id: '2',
              name: 'Bread',
              quantity: 1,
              unit: 'loaf',
              category: 'Bakery',
              completed: true,
              priority: 'medium',
              addedBy: 'Jane Smith',
              addedAt: '2024-01-16',
            },
            {
              id: '3',
              name: 'Apples',
              quantity: 3,
              unit: 'kg',
              category: 'Produce',
              completed: false,
              priority: 'low',
              addedBy: 'John Doe',
              addedAt: '2024-01-17',
            },
          ],
        },
        {
          id: '2',
          name: 'Party Supplies',
          description: 'Items needed for the weekend party',
          color: '#10B981',
          createdAt: '2024-01-18',
          updatedAt: '2024-01-19',
          createdBy: 'Jane Smith',
          isShared: true,
          items: [
            {
              id: '4',
              name: 'Chips',
              quantity: 5,
              unit: 'bags',
              category: 'Pantry',
              completed: false,
              priority: 'high',
              addedBy: 'Jane Smith',
              addedAt: '2024-01-18',
            },
            {
              id: '5',
              name: 'Soda',
              quantity: 12,
              unit: 'cans',
              category: 'Beverages',
              completed: false,
              priority: 'high',
              addedBy: 'Bob Johnson',
              addedAt: '2024-01-19',
            },
          ],
        },
      ]);
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShoppingLists();
    setRefreshing(false);
  };

  const handleCreateList = () => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    const newList: ShoppingList = {
      id: Date.now().toString(),
      name: newListName,
      description: newListDescription,
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: 'Current User',
      isShared: false,
      items: [],
    };

    setLists([newList, ...lists]);
    setNewListName('');
    setNewListDescription('');
    setShowCreateModal(false);
    Alert.alert('Success', 'Shopping list created successfully');
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (!selectedList) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: parseInt(newItemQuantity) || 1,
      unit: newItemUnit,
      category: newItemCategory,
      completed: false,
      priority: 'medium',
      addedBy: 'Current User',
      addedAt: new Date().toISOString().split('T')[0],
    };

    const updatedList = {
      ...selectedList,
      items: [...selectedList.items, newItem],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setLists(lists.map(list => list.id === selectedList.id ? updatedList : list));
    setSelectedList(updatedList);
    setNewItemName('');
    setNewItemQuantity('1');
    setNewItemUnit('pcs');
    setNewItemCategory('General');
  };

  const handleToggleItem = (listId: string, itemId: string) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
      return list;
    });
    setLists(updatedLists);
    if (selectedList && selectedList.id === listId) {
      setSelectedList(updatedLists.find(list => list.id === listId) || null);
    }
  };

  const handleDeleteItem = (listId: string, itemId: string, itemName: string) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedLists = lists.map(list => {
              if (list.id === listId) {
                return {
                  ...list,
                  items: list.items.filter(item => item.id !== itemId),
                  updatedAt: new Date().toISOString().split('T')[0],
                };
              }
              return list;
            });
            setLists(updatedLists);
            if (selectedList && selectedList.id === listId) {
              setSelectedList(updatedLists.find(list => list.id === listId) || null);
            }
          },
        },
      ]
    );
  };

  const handleDeleteList = (listId: string, listName: string) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${listName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setLists(lists.filter(list => list.id !== listId));
            if (selectedList && selectedList.id === listId) {
              setShowListModal(false);
              setSelectedList(null);
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getCompletedCount = (items: ShoppingItem[]) => {
    return items.filter(item => item.completed).length;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading shopping lists...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Shopping Lists</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Lists */}
        {lists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Shopping Lists</Text>
            <Text style={styles.emptyText}>
              Create your first shopping list to get started
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyButtonText}>Create List</Text>
            </TouchableOpacity>
          </View>
        ) : (
          lists.map((list) => (
            <TouchableOpacity
              key={list.id}
              style={styles.listCard}
              onPress={() => {
                setSelectedList(list);
                setShowListModal(true);
              }}
            >
              <View style={styles.listHeader}>
                <View style={[styles.listColor, { backgroundColor: list.color }]} />
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{list.name}</Text>
                  {list.description && (
                    <Text style={styles.listDescription}>{list.description}</Text>
                  )}
                  <Text style={styles.listMeta}>
                    {getCompletedCount(list.items)}/{list.items.length} items completed
                  </Text>
                </View>
                <View style={styles.listActions}>
                  {list.isShared && (
                    <Ionicons name="people-outline" size={20} color="#6B7280" />
                  )}
                  <Ionicons name="chevron-forward-outline" size={20} color="#6B7280" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Create List Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create List</Text>
            <TouchableOpacity onPress={handleCreateList}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="List name"
              value={newListName}
              onChangeText={setNewListName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newListDescription}
              onChangeText={setNewListDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </Modal>

      {/* List Details Modal */}
      <Modal
        visible={showListModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedList && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowListModal(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedList.name}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteList(selectedList.id, selectedList.name)}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {/* Add Item Form */}
              <View style={styles.addItemForm}>
                <Text style={styles.addItemTitle}>Add Item</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Item name"
                  value={newItemName}
                  onChangeText={setNewItemName}
                />
                <View style={styles.addItemRow}>
                  <TextInput
                    style={[styles.input, styles.quantityInput]}
                    placeholder="Qty"
                    value={newItemQuantity}
                    onChangeText={setNewItemQuantity}
                    keyboardType="numeric"
                  />
                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Unit:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {units.map((unit) => (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.pickerOption,
                            newItemUnit === unit && styles.pickerOptionSelected,
                          ]}
                          onPress={() => setNewItemUnit(unit)}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              newItemUnit === unit && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {unit}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Category:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.pickerOption,
                          newItemCategory === category && styles.pickerOptionSelected,
                        ]}
                        onPress={() => setNewItemCategory(category)}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            newItemCategory === category && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
                  <Text style={styles.addItemButtonText}>Add Item</Text>
                </TouchableOpacity>
              </View>

              {/* Items List */}
              <View style={styles.itemsList}>
                <Text style={styles.itemsTitle}>
                  Items ({selectedList.items.length})
                </Text>
                {selectedList.items.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <TouchableOpacity
                      style={styles.itemCheckbox}
                      onPress={() => handleToggleItem(selectedList.id, item.id)}
                    >
                      <Ionicons
                        name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                        size={24}
                        color={item.completed ? '#10B981' : '#6B7280'}
                      />
                    </TouchableOpacity>
                    <View style={styles.itemInfo}>
                      <Text
                        style={[
                          styles.itemName,
                          item.completed && styles.itemNameCompleted,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.itemDetails}>
                        {item.quantity} {item.unit} • {item.category}
                      </Text>
                      {item.notes && (
                        <Text style={styles.itemNotes}>{item.notes}</Text>
                      )}
                    </View>
                    <View style={styles.itemActions}>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: getPriorityColor(item.priority) },
                        ]}
                      />
                      <TouchableOpacity
                        onPress={() => handleDeleteItem(selectedList.id, item.id, item.name)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  listColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  listMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addItemForm: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityInput: {
    flex: 1,
    marginRight: 12,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  pickerOptionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF',
  },
  addItemButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addItemButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  itemsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemCheckbox: {
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  itemDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemNotes: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});

export default ShoppingListsScreen;




