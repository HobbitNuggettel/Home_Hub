/**
 * Image Service Test Utility
 * Helps verify configuration and troubleshoot setup issues
 */

import { imageManagementService } from '../services/ImageManagementService.js';

export const testImageServices = async () => {
  console.log('🧪 Testing Image Services Configuration...\n');

  try {
    // Test 1: Service Status
    console.log('📊 1. Service Status Check:');
    const status = await imageManagementService.healthCheck();
    console.log(`   Overall Status: ${status.overall}`);
    
    Object.entries(status.services).forEach(([service, info]) => {
      const icon = info.status === 'healthy' ? '✅' : 
                  info.status === 'not_configured' ? '⚠️' : '❌';
      console.log(`   ${icon} ${service}: ${info.status}`);
      if (info.details && typeof info.details === 'string') {
        console.log(`      Details: ${info.details}`);
      }
    });

    // Test 2: Configuration Help
    console.log('\n📋 2. Configuration Help:');
    const help = imageManagementService.getConfigurationHelp();
    
    Object.entries(help).forEach(([service, config]) => {
      const statusIcon = config.configured ? '✅' : '❌';
      console.log(`   ${statusIcon} ${service.toUpperCase()}:`);
      console.log(`      Configured: ${config.configured ? 'Yes' : 'No'}`);
      console.log(`      Benefits: ${config.benefits}`);
      
      if (!config.configured) {
        console.log(`      Required Variables: ${config.required.join(', ')}`);
        console.log(`      Setup Steps:`);
        Object.entries(config.setup).forEach(([step, instruction]) => {
          console.log(`        ${instruction}`);
        });
        
        if (config.troubleshooting) {
          console.log(`      Troubleshooting:`);
          config.troubleshooting.forEach(tip => {
            console.log(`        • ${tip}`);
          });
        }
      }
      
      if (config.limitations) {
        console.log(`      Limitations: ${config.limitations}`);
      }
      console.log('');
    });

    // Test 3: Usage Statistics
    console.log('📈 3. Usage Statistics:');
    const usage = imageManagementService.getUsageStats();
    
    if (usage.imgur) {
      console.log(`   Imgur: ${usage.imgur.dailyUploads}/${usage.imgur.dailyLimit} uploads today`);
    }
    
    if (usage.cloudinary) {
      console.log(`   Cloudinary: ${usage.cloudinary.storage.percentage.toFixed(1)}% storage used`);
    }
    
    console.log(`   Base64: Always available (unlimited)`);

    // Test 4: Recommendations
    console.log('\n💡 4. Recommendations:');
    
    if (!help.imgur.configured && !help.cloudinary.configured) {
      console.log('   🚨 No external image services configured!');
      console.log('   💡 Quick Setup Options:');
      console.log('      Option A: Try Imgur again (1,250 uploads/day free)');
      console.log('      Option B: Set up Cloudinary (25GB/month free)');
      console.log('      Option C: Use base64 only (always works, limited to 500KB)');
      console.log('');
      console.log('   🔧 For now, all images will use base64 storage in Firestore.');
      console.log('   📱 This works fine for small images and is completely free!');
    } else if (help.imgur.configured && help.cloudinary.configured) {
      console.log('   🎉 All services configured! You have unlimited image storage.');
    } else if (help.imgur.configured) {
      console.log('   ✅ Imgur configured - 1,250 uploads/day free');
      console.log('   💡 Consider adding Cloudinary for larger images');
    } else if (help.cloudinary.configured) {
      console.log('   ✅ Cloudinary configured - 25GB/month free');
      console.log('   💡 Consider adding Imgur for daily uploads');
    }

    // Test 5: Environment Variables Check
    console.log('\n🔍 5. Environment Variables Check:');
    const envVars = {
      'REACT_APP_IMGUR_CLIENT_ID': process.env.REACT_APP_IMGUR_CLIENT_ID,
      'REACT_APP_CLOUDINARY_CLOUD_NAME': process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
      'REACT_APP_CLOUDINARY_UPLOAD_PRESET': process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
    };
    
    Object.entries(envVars).forEach(([varName, value]) => {
      const icon = value ? '✅' : '❌';
      const status = value ? 'Set' : 'Not set';
      console.log(`   ${icon} ${varName}: ${status}`);
      if (value) {
        console.log(`      Value: ${value.substring(0, 10)}...`);
      }
    });

    console.log('\n🎯 Test Complete! Check the console for detailed information.');
    return { success: true, status, help, usage };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};

// Auto-run test when imported (for development)
if (process.env.NODE_ENV === 'development') {
  // Delay to ensure services are initialized
  setTimeout(() => {
    testImageServices();
  }, 1000);
}

export default testImageServices;
