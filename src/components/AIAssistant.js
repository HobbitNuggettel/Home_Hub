import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Mic, 
  Camera, 
  Brain, 
  Upload, 
  MessageSquare, 
  Zap,
  TrendingUp,
  ShoppingCart,
  ChefHat,
  Package,
  DollarSign,
  Sparkles,
  X,
  Send,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import AIExpenseService from '../services/AIExpenseService';
import AIInventoryService from '../services/AIInventoryService';
import AIRecipeService from '../services/AIRecipeService';
import { VoiceAI, VisionAI, AdvancedAIService } from '../services/AdvancedAIService';
import { useDevTools } from '../contexts/DevToolsContext';

export default function AIAssistant({ 
  inventory = [], 
  expenses = [], 
  recipes = [], 
  budgets = [],
  onUpdateData 
}) {
  const { isDevMode } = useDevTools();
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('chat'); // 'chat', 'voice', 'camera'
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [aiInsights, setAiInsights] = useState(null);
  const [testCount, setTestCount] = useState(0);
  
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const instanceId = useRef(`ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Initialize AI services
    const initAI = async () => {
      try {
        await AdvancedAIService.initializeAllServices();
        
        // Generate initial insights
        const insights = await generateComprehensiveInsights();
        setAiInsights(insights);
      } catch (error) {
        console.error('AI initialization failed:', error);
      }
    };
    
    initAI();
  }, []); // ✅ FIXED: Empty dependency array - runs only once

  const generateComprehensiveInsights = async () => {
    setIsProcessing(true);
    
    try {
      const [
        expenseInsights,
        inventoryPredictions,
        recipeSuggestions,
        budgetRecommendations
      ] = await Promise.all([
        AIExpenseService.generateSpendingInsights(expenses),
        AIInventoryService.predictInventoryNeeds(inventory),
        AIRecipeService.generateSmartRecipeRecommendations(inventory, recipes, expenses),
        AIExpenseService.generateBudgetRecommendations(expenses, budgets)
      ]);

      return {
        spending: expenseInsights,
        inventory: inventoryPredictions,
        recipes: recipeSuggestions,
        budget: budgetRecommendations,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate AI insights');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!recognitionRef.current) {
      recognitionRef.current = VoiceAI.initializeSpeechRecognition();
      
      if (!recognitionRef.current) {
        toast.error('Voice recognition not supported in this browser');
        return;
      }
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    
    recognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      
      // Process voice command
      await processAICommand(transcript, 'voice');
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition failed');
    };

    recognitionRef.current.start();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Determine image type based on user selection
      const imageType = await askImageType(); // Would show modal to ask
      
      const result = await AdvancedAIService.processMultiModalInput({
        type: 'image',
        data: { file, imageType }
      });

      if (imageType === 'receipt') {
        await handleReceiptResult(result);
      } else if (imageType === 'product') {
        await handleProductResult(result);
      }
      
    } catch (error) {
      toast.error('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const askImageType = async () => {
    // In real implementation, show a modal
    return 'receipt'; // Default for demo
  };

  const handleReceiptResult = async (result) => {
    if (result.items.length > 0) {
      const message = `Found ${result.items.length} items on receipt from ${result.store}. Total: $${result.total}`;
      
      addToChatHistory('assistant', message);
      toast.success('Receipt processed successfully!');
      
      // Auto-categorize and add expenses
      const newExpenses = result.items.map(item => {
        const prediction = AIExpenseService.categorizeExpense(item.name, item.price, result.store, expenses);
        
        return {
          id: Date.now() + Math.random(),
          description: item.name,
          amount: item.price,
          category: prediction.category,
          date: result.date || new Date().toISOString().split('T')[0],
          merchant: result.store,
          confidence: prediction.confidence
        };
      });
      
      if (onUpdateData) {
        onUpdateData('expenses', newExpenses);
      }
    }
  };

  const handleProductResult = async (result) => {
    if (result) {
      const message = `Recognized: ${result.suggestedName} (${result.suggestedCategory}) with ${(result.confidence * 100).toFixed(1)}% confidence`;
      addToChatHistory('assistant', message);
      
      // Suggest adding to inventory
      if (onUpdateData) {
        const newItem = {
          id: Date.now(),
          name: result.suggestedName,
          category: result.suggestedCategory,
          quantity: 1,
          addedDate: new Date().toISOString().split('T')[0]
        };
        
        onUpdateData('inventory', [newItem]);
      }
    }
  };

  const processAICommand = async (input, inputType = 'text') => {
    setIsProcessing(true);
    addToChatHistory('user', input);
    
    try {
      const context = {
        inventory,
        expenses,
        recipes,
        budgets
      };
      
      let result;
      if (inputType === 'voice') {
        result = await VoiceAI.processVoiceCommand(input, context);
      } else {
        result = await AdvancedAIService.processMultiModalInput({
          type: 'text',
          data: { query: input, context }
        });
      }
      
      addToChatHistory('assistant', result.response || result.message);
      
      // Execute actions based on AI response
      await executeAIAction(result);
      
    } catch (error) {
      console.error('AI processing failed:', error);
      addToChatHistory('assistant', 'Sorry, I encountered an error processing your request.');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeAIAction = async (result) => {
    switch (result.type) {
      case 'add_to_shopping_list':
        if (onUpdateData && result.items) {
          const newItems = result.items.map(item => ({
            id: Date.now() + Math.random(),
            name: item,
            quantity: 1,
            category: 'Other',
            priority: 'medium'
          }));
          onUpdateData('shopping', newItems);
        }
        break;
        
      case 'add_expense':
        if (onUpdateData && result.amount) {
          const prediction = AIExpenseService.categorizeExpense(result.description, result.amount, '', expenses);
          const newExpense = {
            id: Date.now(),
            description: result.description,
            amount: result.amount,
            category: prediction.category,
            date: new Date().toISOString().split('T')[0],
            confidence: prediction.confidence
          };
          onUpdateData('expenses', [newExpense]);
        }
        break;
        
      case 'recipe_suggestions':
        // Show recipe suggestions in chat
        if (result.data?.recipes) {
          const recipeList = result.data.recipes.map(r => r.name).join(', ');
          addToChatHistory('assistant', `Here are your available recipes: ${recipeList}`);
        }
        break;
    }
  };

  const addToChatHistory = (sender, message) => {
    setChatHistory(prev => [...prev, {
      id: Date.now() + Math.random(),
      sender,
      message,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    await processAICommand(inputText);
    setInputText('');
  };

  const renderQuickActions = () => (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <button
        onClick={() => processAICommand("What items are running low?")}
        className="flex items-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm"
      >
        <Package className="w-4 h-4 text-blue-600" />
        <span>Check Inventory</span>
      </button>
      
      <button
        onClick={() => processAICommand("How much did I spend this month?")}
        className="flex items-center gap-2 p-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm"
      >
        <DollarSign className="w-4 h-4 text-green-600" />
        <span>Spending Summary</span>
      </button>
      
      <button
        onClick={() => processAICommand("What can I cook tonight?")}
        className="flex items-center gap-2 p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm"
      >
        <ChefHat className="w-4 h-4 text-purple-600" />
        <span>Recipe Ideas</span>
      </button>
      
      <button
        onClick={() => processAICommand("Generate shopping list")}
        className="flex items-center gap-2 p-2 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm"
      >
        <ShoppingCart className="w-4 h-4 text-orange-600" />
        <span>Smart Shopping</span>
      </button>
    </div>
  );

  const renderInsightsSummary = () => {
    if (!aiInsights) return null;
    
    return (
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-sm">AI Insights</span>
        </div>
        
        <div className="text-xs space-y-1">
          {aiInsights.inventory.length > 0 && (
            <div className="text-red-600">
              🚨 {aiInsights.inventory.length} items need reordering soon
            </div>
          )}
          
          {aiInsights.recipes.length > 0 && (
            <div className="text-green-600">
              🍳 {aiInsights.recipes.length} recipe suggestions available
            </div>
          )}
          
          {aiInsights.spending.length > 0 && (
            <div className="text-blue-600">
              💡 {aiInsights.spending.length} spending optimization tips
            </div>
          )}
        </div>
      </div>
    );
  };

  // Debug functions for floating debug panel
  const toggleModal = () => {
    setIsOpen(!isOpen);
    console.log(`[${instanceId.current}] Modal toggled: ${!isOpen}`);
  };

  const forceClose = () => {
    setIsOpen(false);
    console.log(`[${instanceId.current}] Modal forced closed`);
  };

  const testStateUpdate = () => {
    setTestCount(prev => prev + 1);
    console.log(`[${instanceId.current}] Test count updated: ${testCount + 1}`);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
      >
        <Brain className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 rounded p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveMode('chat')}
          className={`flex-1 py-2 px-3 text-sm font-medium ${
            activeMode === 'chat' 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MessageSquare className="w-4 h-4 mx-auto" />
        </button>
        
        <button
          onClick={() => setActiveMode('voice')}
          className={`flex-1 py-2 px-3 text-sm font-medium ${
            activeMode === 'voice' 
              ? 'bg-green-50 text-green-600 border-b-2 border-green-600' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Mic className="w-4 h-4 mx-auto" />
        </button>
        
        <button
          onClick={() => setActiveMode('camera')}
          className={`flex-1 py-2 px-3 text-sm font-medium ${
            activeMode === 'camera' 
              ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Camera className="w-4 h-4 mx-auto" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeMode === 'chat' && (
          <>
            {/* Insights Summary */}
            <div className="p-3">
              {renderInsightsSummary()}
              {renderQuickActions()}
            </div>
            
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto px-3 space-y-2">
              {chatHistory.map(chat => (
                <div key={chat.id} className={`${chat.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[80%] p-2 rounded-lg text-sm ${
                    chat.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {chat.message}
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="text-left">
                  <div className="inline-block bg-gray-100 p-2 rounded-lg">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleTextSubmit} className="p-3 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask me anything about your home management..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isProcessing}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        )}

        {activeMode === 'voice' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              isListening ? 'bg-green-100 animate-pulse' : 'bg-gray-100'
            }`}>
              <Mic className={`w-8 h-8 ${isListening ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            
            <button
              onClick={handleVoiceInput}
              disabled={isProcessing}
              className={`px-6 py-3 rounded-lg font-medium ${
                isListening 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isListening ? 'Stop Listening' : 'Start Voice Command'}
            </button>
            
            <p className="text-xs text-gray-600 mt-3 text-center">
              Try saying: "Add milk to shopping list" or "How much did I spend on groceries?"
            </p>
          </div>
        )}

        {activeMode === 'camera' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-purple-600" />
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Upload Image'}
            </button>
            
            <div className="text-xs text-gray-600 mt-3 text-center space-y-1">
              <p>• Upload receipts for automatic expense entry</p>
              <p>• Scan products for inventory management</p>
              <p>• Take photos of items for recognition</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Debug Panel */}
      {isDevMode && (
        <div className="fixed top-4 right-4 bg-black text-white rounded-lg shadow-lg border border-gray-600 p-3 z-50 max-w-xs">
          <div className="text-xs space-y-2">
            <div className="font-bold text-green-400">Debug Panel</div>
            <div>isOpen: {isOpen ? 'TRUE' : 'FALSE'}</div>
            <div>testCount: {testCount}</div>

            <div className="space-y-1">
              <button
                onClick={toggleModal}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
              >
                Toggle Modal
              </button>
              <button
                onClick={() => setIsOpen(true)}
                className="block w-full bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
              >
                Force Open
              </button>
              <button
                onClick={forceClose}
                className="block w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
              >
                Force Close
              </button>
              <button
                onClick={testStateUpdate}
                className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs"
              >
                Test State
              </button>
              <button
                onClick={() => {
                  console.log(`[${instanceId.current}] Force refresh triggered`);
                  setTestCount(0);
                  setIsOpen(false);
                  setChatHistory([]);
                  setInputText('');
                  toast.success('AI Assistant reset');
                }}
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs"
              >
                Reset All
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('🧪 Testing Hybrid AI Services...');
                    const { default: HybridAIService } = await import('../services/HybridAIService');
                    const result = await HybridAIService.testAllServices();
                    console.log('✅ API Test Result:', result);
                    toast.success(`API Test Complete!\nHuggingFace: ${result.huggingface?.success ? '✅' : '❌'}\nGemini: ${result.gemini?.success ? '✅' : '❌'}`);
                  } catch (error) {
                    console.error('❌ API Test Error:', error);
                    toast.error('API Test Failed: ' + error.message);
                  }
                }}
                className="block w-full bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
              >
                🧪 Test API
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}