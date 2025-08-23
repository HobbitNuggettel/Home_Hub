# 🤖 AI Configuration Guide for Home Hub

This guide will help you set up all the AI features in your Home Hub application.

## 🔑 Required API Keys

### 1. **Hugging Face API Key** (Free Tier)

**What it provides:**
- Text generation (GPT-2)
- Sentiment analysis
- Text classification
- Text summarization
- Image classification

**How to get it:**
1. Go to [Hugging Face](https://huggingface.co/)
2. Create a free account
3. Go to Settings → Access Tokens
4. Create a new token with "read" permissions
5. Copy the token

**Free Tier Limits:**
- 30,000 requests per month
- Rate limit: 1 request per second
- All models available

**Environment Variable:**
```bash
REACT_APP_HUGGINGFACE_API_KEY=your_token_here
```

### 2. **Firebase Configuration** (Already Set Up)

Your Firebase project is already configured. The AI features will use your existing Firebase setup for:
- User authentication
- Chat storage
- Real-time conversations
- Data persistence

## ⚙️ Environment Configuration

Create a `.env.local` file in your project root with these variables:

```bash
# AI Services
REACT_APP_HUGGINGFACE_API_KEY=your_huggingface_token_here

# AI Configuration
REACT_APP_AI_CACHE_TTL=86400000
REACT_APP_AI_MAX_MEMORY_SIZE=100
REACT_APP_AI_ENABLE_COMPRESSION=true

# Feature Flags
REACT_APP_ENABLE_VOICE_COMMANDS=true
REACT_APP_ENABLE_AI_CACHING=true
REACT_APP_ENABLE_FIREBASE_CHAT=true
```

## 🚀 Quick Setup Steps

### Step 1: Get Hugging Face API Key
1. Visit [Hugging Face](https://huggingface.co/)
2. Sign up for free account
3. Generate access token
4. Copy token to clipboard

### Step 2: Configure Environment
1. Create `.env.local` file in project root
2. Add your Hugging Face API key
3. Restart your development server

### Step 3: Test AI Features
1. Open the AI Assistant (blue chat button)
2. Start a new conversation
3. Ask questions about home management
4. Test voice commands

## 🎯 AI Features Available

### **Text Generation**
- Smart responses to user queries
- Context-aware suggestions
- Home management advice

### **Sentiment Analysis**
- Understands user mood
- Provides empathetic responses
- Adapts tone based on context

### **Voice Commands**
- Speech-to-text input
- Hands-free operation
- Natural language processing

### **Intelligent Caching**
- Reduces API calls
- Improves response speed
- Saves on API costs

### **Real-time Chat**
- Persistent conversations
- Firebase storage
- Cross-device sync

## 💡 Usage Examples

### **Shopping & Budget**
```
User: "I need to buy groceries for $100"
AI: "I'll help you track that expense. Let me add it to your shopping list and budget tracker."
```

### **Recipe Planning**
```
User: "What can I cook with chicken and rice?"
AI: "Great question! Here are some recipe ideas using chicken and rice: stir-fry, casserole, or soup."
```

### **Inventory Management**
```
User: "Do I have enough cleaning supplies?"
AI: "Let me check your inventory. You have 2 bottles of cleaner and 1 pack of paper towels."
```

## 🔧 Advanced Configuration

### **Custom AI Models**
You can modify the models used in `src/services/HuggingFaceService.js`:

```javascript
this.models = {
  textGeneration: 'gpt2', // Change to other models
  sentimentAnalysis: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
  // Add custom models here
};
```

### **Cache Settings**
Adjust caching behavior in `src/services/AICachingService.js`:

```javascript
this.config = {
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  maxMemorySize: 100, // Max cache items
  enableCompression: true, // Enable response compression
};
```

### **Rate Limiting**
The service automatically handles rate limiting for free tier compliance:
- 1 second delay between requests
- Automatic retry logic
- Graceful fallbacks

## 🚨 Troubleshooting

### **API Key Issues**
```
Error: "Hugging Face API key not configured"
Solution: Check your .env.local file and restart the server
```

### **Rate Limit Errors**
```
Error: "Too many requests"
Solution: The service automatically handles this. Wait a moment and try again.
```

### **Speech Recognition Issues**
```
Error: "Speech recognition not supported"
Solution: Use Chrome or Edge browser. HTTPS is required for voice features.
```

### **Firebase Connection Issues**
```
Error: "Failed to connect to Firebase"
Solution: Check your Firebase configuration in src/firebase/config.js
```

## 📊 Performance Monitoring

### **Cache Statistics**
The AI Assistant shows real-time cache performance:
- Hit rate percentage
- Memory usage
- Compression savings

### **API Usage**
Monitor your Hugging Face API usage:
- Request count
- Response times
- Error rates

## 💰 Cost Optimization

### **Free Tier Strategy**
- Use caching to reduce API calls
- Implement smart fallbacks
- Monitor usage closely

### **Upgrade Considerations**
- Hugging Face Pro: $9/month for 100K requests
- Firebase Blaze: Pay-as-you-go for advanced features

## 🔒 Security Best Practices

### **API Key Protection**
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly

### **Data Privacy**
- All AI processing happens client-side
- No sensitive data sent to external services
- Firebase data is encrypted in transit

## 📱 Mobile Optimization

### **Responsive Design**
- AI Assistant works on all screen sizes
- Touch-friendly interface
- Voice commands optimized for mobile

### **Offline Support**
- Cached responses work offline
- Firebase offline persistence
- Graceful degradation

## 🎉 Next Steps

1. **Get your Hugging Face API key**
2. **Configure environment variables**
3. **Test the AI Assistant**
4. **Explore voice commands**
5. **Customize AI responses**

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify API key configuration
4. Check Firebase connection status

---

**Happy AI-powered home management! 🏠✨**
